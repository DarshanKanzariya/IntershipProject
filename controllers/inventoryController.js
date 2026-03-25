const mongoose = require("mongoose");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");
const {
  isOrganizationRole,
  organizationRoleQuery,
  getOrganizationName,
} = require("../utils/organization");

const BLOOD_UNIT_PRICE = 6;
const ADMIN_COMMISSION_RATE = 0.08;
const CSV_ESCAPE_REGEX = /"/g;

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are not configured");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const getRequestFinancials = (quantity) => {
  const numericQuantity = Number(quantity) || 0;
  const totalAmount = numericQuantity * BLOOD_UNIT_PRICE;
  const commissionAmount = Number(
    (totalAmount * ADMIN_COMMISSION_RATE).toFixed(2)
  );

  return {
    unitPrice: BLOOD_UNIT_PRICE,
    totalAmount,
    commissionAmount,
  };
};

const formatCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return `"${String(value).replace(CSV_ESCAPE_REGEX, '""')}"`;
};

const buildTransactionHistoryFilters = async (userId, query = {}) => {
  const user = await userModel.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const filters = { inventoryType: "out" };
  const normalizedRole = isOrganizationRole(user.role)
    ? "organization"
    : user.role;

  if (normalizedRole === "organization") {
    filters.organisation = userId;
  } else if (normalizedRole === "hospital") {
    filters.hospital = userId;
  } else {
    const error = new Error(
      "Transaction history is only available for hospitals and organizations"
    );
    error.statusCode = 403;
    throw error;
  }

  if (query.status && query.status !== "all") {
    filters.requestStatus = query.status;
  }

  if (query.paymentMethod && query.paymentMethod !== "all") {
    filters.paymentMethod = query.paymentMethod;
  }

  if (query.bloodGroup && query.bloodGroup !== "all") {
    filters.bloodGroup = query.bloodGroup;
  }

  return { user, normalizedRole, filters };
};

const findTransactionHistory = async (filters) =>
  inventoryModel
    .find(filters)
    .populate("organisation")
    .populate("hospital")
    .populate("createdBy")
    .sort({ createdAt: -1 });

const createRazorpayOrderController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (!user || user.role !== "hospital") {
      return res.status(403).send({
        success: false,
        message: "Only hospitals can create payment orders",
      });
    }

    const quantity = Number(req.body.quantity);

    if (!quantity || quantity <= 0) {
      return res.status(400).send({
        success: false,
        message: "A valid quantity is required",
      });
    }

    const { unitPrice, totalAmount, commissionAmount } = getRequestFinancials(
      quantity
    );

    const razorpay = getRazorpayClient();
    const shortHospitalId = String(user._id).slice(-6);
    const shortTimestamp = Date.now().toString().slice(-8);
    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `bf_${shortHospitalId}_${shortTimestamp}`,
      notes: {
        hospitalId: String(user._id),
        quantity: String(quantity),
        bloodGroup: req.body.bloodGroup || "",
        organisationId: req.body.organisation || "",
      },
    });

    return res.status(201).send({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID,
      financials: {
        unitPrice,
        totalAmount,
        commissionAmount,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message:
        error.message === "Razorpay keys are not configured"
          ? "Razorpay is not configured on the server"
          : error?.error?.description ||
            error?.description ||
            error?.message ||
            "Unable to create Razorpay order",
    });
  }
};

// CREATE INVENTORY
const createInventoryController = async (req, res) => {
  try {
    const { email, inventoryType } = req.body;
    const requesterId = req.userId || req.body.userId;
    const requester = requesterId ? await userModel.findById(requesterId) : null;
    const organisationId =
      requester?.role === "hospital"
        ? req.body.organisation
        : req.userId || req.body.userId || req.body.organisation;
    //validation
    const user = await userModel.findOne({ email });
    if (!user) {
      throw new Error("User Not Found");
    }
    if (!organisationId) {
      throw new Error("Organisation not found");
    }
    if (requester?.role === "hospital" && inventoryType !== "out") {
      throw new Error("Hospital can only create OUT inventory");
    }
    const organisationAccount = await userModel.findById(organisationId);
    if (!organisationAccount || !isOrganizationRole(organisationAccount.role)) {
      throw new Error("Selected organisation is invalid");
    }
    if (inventoryType === "in" && user.role !== "donor") {
      throw new Error("Not a donor account");
    }
    if (inventoryType === "out" && user.role !== "hospital") {
      throw new Error("Not a hospital");
    }

    if (req.body.inventoryType == "out") {
      const requestedBloodGroup = req.body.bloodGroup;
      const requestedQuantityOfBlood = req.body.quantity;
      const organisation = new mongoose.Types.ObjectId(organisationId);
      //calculate Blood Quanitity
      const totalInOfRequestedBlood = await inventoryModel.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "in",
            bloodGroup: requestedBloodGroup,
          },
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" },
          },
        },
      ]);
      // console.log("Total In", totalInOfRequestedBlood);
      const totalIn = totalInOfRequestedBlood[0]?.total || 0;
      //calculate OUT Blood Quanitity

      const totalOutOfRequestedBloodGroup = await inventoryModel.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "out",
            bloodGroup: requestedBloodGroup,
            requestStatus: { $in: ["accepted", "completed"] },
          },
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" },
          },
        },
      ]);
      const totalOut = totalOutOfRequestedBloodGroup[0]?.total || 0;

      //in & Out Calc
      const availableQuanityOfBloodGroup = totalIn - totalOut;
      //quantity validation
      if (availableQuanityOfBloodGroup < requestedQuantityOfBlood) {
        return res.status(500).send({
          success: false,
          message: `Only ${availableQuanityOfBloodGroup}ML of ${requestedBloodGroup.toUpperCase()} is available`,
        });
      }
      const { unitPrice, totalAmount, commissionAmount } = getRequestFinancials(
        requestedQuantityOfBlood
      );

      if (!req.body.paymentMethod) {
        return res.status(400).send({
          success: false,
          message: "Payment method is required for hospital requests",
        });
      }

      if (req.body.paymentMethod === "cash") {
        req.body.paymentStatus = "completed";
      } else if (req.body.paymentMethod === "razorpay") {
        const {
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        } = req.body;

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
          return res.status(400).send({
            success: false,
            message: "Verified Razorpay payment details are required",
          });
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
          return res.status(500).send({
            success: false,
            message: "Razorpay is not configured on the server",
          });
        }

        const expectedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest("hex");

        if (expectedSignature !== razorpaySignature) {
          return res.status(400).send({
            success: false,
            message: "Razorpay payment verification failed",
          });
        }

        req.body.paymentStatus = "completed";
        req.body.transactionId = razorpayPaymentId;
      } else {
        return res.status(400).send({
          success: false,
          message: "Unsupported payment method",
        });
      }

      req.body.hospital = user?._id;
      req.body.requestStatus = "pending";
      req.body.unitPrice = unitPrice;
      req.body.totalAmount = totalAmount;
      req.body.commissionAmount = commissionAmount;
    } else {
      req.body.donor = user?._id;
      req.body.requestStatus = "completed";
    }
    req.body.organisation = organisationId;
    req.body.createdBy = requesterId;

    //save record
    const inventory = new inventoryModel(req.body);
    await inventory.save();
    return res.status(201).send({
      success: true,
      message: "New Blood Reocrd Added",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Errro In Create Inventory API",
      error,
    });
  }
};

// GET ALL BLOOD RECORS
const getInventoryController = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;
    const inventory = await inventoryModel
      .find({
        organisation: userId,
      })
      .populate("donor")
      .populate("hospital")
      .populate("createdBy")
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      messaage: "get all records successfully",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Get All Inventory",
      error,
    });
  }
};
// GET Hospital BLOOD RECORS
const getInventoryHospitalController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find(req.body.filters)
      .populate("donor")
      .populate("hospital")
      .populate("organisation")
      .populate("createdBy")
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      messaage: "get hospital comsumer records successfully",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Get consumer Inventory",
      error,
    });
  }
};

// GET BLOOD RECORD OF 3
const getRecentInventoryController = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    let filters = {};

    if (isOrganizationRole(user.role)) {
      filters.organisation = userId;
    } else if (user.role === "hospital") {
      filters.hospital = userId;
    } else if (user.role !== "admin") {
      return res.status(403).send({
        success: false,
        message: "Recent inventory is not available for this role",
      });
    }

    const inventory = await inventoryModel
      .find(filters)
      .populate("organisation")
      .populate("hospital")
      .populate("donor")
      .populate("createdBy")
      .limit(3)
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "recent Invenotry Data",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Recent Inventory API",
      error,
    });
  }
};

const getTransactionHistoryController = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;
    const { normalizedRole, filters } = await buildTransactionHistoryFilters(
      userId,
      req.query
    );
    const transactions = await findTransactionHistory(filters);

    return res.status(200).send({
      success: true,
      message: "Transaction history fetched successfully",
      role: normalizedRole,
      transactions,
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).send({
      success: false,
      message: error.message || "Error in transaction history API",
      error,
    });
  }
};

const exportTransactionHistoryController = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;
    const { normalizedRole, filters } = await buildTransactionHistoryFilters(
      userId,
      req.query
    );
    const transactions = await findTransactionHistory(filters);

    const headers = [
      "Date",
      "Blood Group",
      "Quantity (ML)",
      "Status",
      "Payment Method",
      "Payment Status",
      "Amount",
      "Transaction ID",
      "Email",
      "Organization",
      "Hospital",
    ];

    const rows = transactions.map((record) =>
      [
        record.createdAt ? new Date(record.createdAt).toISOString() : "",
        record.bloodGroup,
        record.quantity,
        record.requestStatus,
        record.paymentMethod || "",
        record.paymentStatus || "",
        record.totalAmount || 0,
        record.transactionId || "",
        record.email || "",
        getOrganizationName(record.organisation) || "",
        record.hospital?.hospitalName || "",
      ]
        .map(formatCsvValue)
        .join(",")
    );

    const csvContent = [headers.map(formatCsvValue).join(","), ...rows].join("\n");
    const filename = `${normalizedRole}-transaction-history-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).send({
      success: false,
      message: error.message || "Error in exporting transaction history",
      error,
    });
  }
};

// GET DONOR REOCRDS
const getDonorsController = async (req, res) => {
  try {
    const donors = await userModel.find({ role: "donor" }).sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Donor Record Fetched Successfully",
      donors,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Donor records",
      error,
    });
  }
};

const getHospitalController = async (req, res) => {
  try {
    const hospitals = await userModel
      .find({ role: "hospital" })
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "Hospitals Data Fetched Successfully",
      hospitals,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In get Hospital API",
      error,
    });
  }
};

// GET ORG PROFILES
const getOrgnaisationController = async (req, res) => {
  try {
    const organisations = await userModel
      .find({ role: organizationRoleQuery })
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "Org Data Fetched Successfully",
      organisations,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In ORG API",
      error,
    });
  }
};
// GET ORG for Hospital
const getOrgnaisationForHospitalController = async (req, res) => {
  try {
    const organisations = await userModel
      .find({ role: organizationRoleQuery })
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "Hospital Org Data Fetched Successfully",
      organisations,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Hospital ORG API",
      error,
    });
  }
};

const getOrganisationInventorySummaryController = async (req, res) => {
  try {
    const { organisationId } = req.params;

    const organisation = await userModel.findById(organisationId);

    if (!organisation || !isOrganizationRole(organisation.role)) {
      return res.status(404).send({
        success: false,
        message: "Organisation not found",
      });
    }

    const organisationObjectId = new mongoose.Types.ObjectId(organisationId);
    const bloodGroups = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];

    const inventory = await Promise.all(
      bloodGroups.map(async (bloodGroup) => {
        const totalIn = await inventoryModel.aggregate([
          {
            $match: {
              organisation: organisationObjectId,
              inventoryType: "in",
              bloodGroup,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$quantity" },
            },
          },
        ]);

        const totalOut = await inventoryModel.aggregate([
          {
            $match: {
              organisation: organisationObjectId,
              inventoryType: "out",
              bloodGroup,
              requestStatus: { $in: ["accepted", "completed"] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$quantity" },
            },
          },
        ]);

        return {
          bloodGroup,
          availableQuantity: (totalIn[0]?.total || 0) - (totalOut[0]?.total || 0),
        };
      })
    );

    return res.status(200).send({
      success: true,
      message: "Organisation inventory fetched successfully",
      organisation: {
        _id: organisation._id,
        organizationName: getOrganizationName(organisation),
        organisationName: getOrganizationName(organisation),
      },
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in organisation inventory summary",
      error,
    });
  }
};

const getOrganisationRequestController = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;
    const organisation = await userModel.findById(userId);

    if (!organisation || !isOrganizationRole(organisation.role)) {
      return res.status(403).send({
        success: false,
        message: "Only organizations can view requests",
      });
    }

    const requests = await inventoryModel
      .find({
        organisation: userId,
        inventoryType: "out",
      })
      .populate("hospital")
      .populate("createdBy")
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Organization requests fetched successfully",
      requests,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in fetching organization requests",
      error,
    });
  }
};

const updateRequestStatusController = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;
    const organisation = await userModel.findById(userId);

    if (!organisation || !isOrganizationRole(organisation.role)) {
      return res.status(403).send({
        success: false,
        message: "Only organizations can update request status",
      });
    }

    const { requestId } = req.params;
    const { status } = req.body;

    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).send({
        success: false,
        message: "Invalid request status",
      });
    }

    const request = await inventoryModel.findOne({
      _id: requestId,
      organisation: userId,
      inventoryType: "out",
    });

    if (!request) {
      return res.status(404).send({
        success: false,
        message: "Request not found",
      });
    }

    if (request.requestStatus !== "pending") {
      return res.status(400).send({
        success: false,
        message: `Request already ${request.requestStatus}`,
      });
    }

    if (status === "accepted") {
      const organisationObjectId = new mongoose.Types.ObjectId(String(userId));
      const bloodGroup = request.bloodGroup;

      const totalIn = await inventoryModel.aggregate([
        {
          $match: {
            organisation: organisationObjectId,
            inventoryType: "in",
            bloodGroup,
          },
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" },
          },
        },
      ]);

      const totalOut = await inventoryModel.aggregate([
        {
          $match: {
            organisation: organisationObjectId,
            inventoryType: "out",
            bloodGroup,
            requestStatus: { $in: ["accepted", "completed"] },
          },
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" },
          },
        },
      ]);

      const availableQuantity = (totalIn[0]?.total || 0) - (totalOut[0]?.total || 0);

      if (availableQuantity < request.quantity) {
        return res.status(400).send({
          success: false,
          message: `Only ${availableQuantity}ML of ${bloodGroup} is available`,
        });
      }
    }

    request.requestStatus = status;
    await request.save();

    return res.status(200).send({
      success: true,
      message: `Request ${status} successfully`,
      request,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in updating request status",
      error,
    });
  }
};

module.exports = {
  createRazorpayOrderController,
  createInventoryController,
  getInventoryController,
  getDonorsController,
  getHospitalController,
  getOrgnaisationController,
  getOrgnaisationForHospitalController,
  getOrganisationInventorySummaryController,
  getOrganisationRequestController,
  updateRequestStatusController,
  getInventoryHospitalController,
  getRecentInventoryController,
  getTransactionHistoryController,
  exportTransactionHistoryController,
};
