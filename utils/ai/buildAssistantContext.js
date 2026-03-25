const inventoryModel = require("../../models/inventoryModel");
const userModel = require("../../models/userModel");
const donationScheduleModel = require("../../models/donationScheduleModel");
const campScheduleModel = require("../../models/campScheduleModel");
const { isOrganizationRole, normalizeRole, getOrganizationName } = require("../organization");

const BLOOD_GROUPS = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];
const DEFAULT_LIMIT = 8;

const formatDate = (value) => {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
};

const getUserDisplayName = (user) =>
  user?.name ||
  user?.hospitalName ||
  user?.organizationName ||
  user?.organisationName ||
  "";

const summarizeTransaction = (record) => ({
  date: formatDate(record.createdAt),
  bloodGroup: record.bloodGroup,
  quantityMl: record.quantity,
  status: record.requestStatus,
  paymentMethod: record.paymentMethod || "",
  paymentStatus: record.paymentStatus || "",
  totalAmountRs: record.totalAmount || 0,
  transactionId: record.transactionId || "",
  organizationName: getOrganizationName(record.organisation) || "",
  hospitalName: record.hospital?.hospitalName || "",
});

const buildInventorySummary = async (organisationId) => {
  const rows = await Promise.all(
    BLOOD_GROUPS.map(async (bloodGroup) => {
      const [totals] = await inventoryModel.aggregate([
        {
          $match: {
            organisation: organisationId,
            bloodGroup,
          },
        },
        {
          $group: {
            _id: null,
            totalIn: {
              $sum: {
                $cond: [{ $eq: ["$inventoryType", "in"] }, "$quantity", 0],
              },
            },
            totalOut: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$inventoryType", "out"] },
                      { $in: ["$requestStatus", ["accepted", "completed"]] },
                    ],
                  },
                  "$quantity",
                  0,
                ],
              },
            },
          },
        },
      ]);

      return {
        bloodGroup,
        totalIn: totals?.totalIn || 0,
        totalOut: totals?.totalOut || 0,
        available: (totals?.totalIn || 0) - (totals?.totalOut || 0),
      };
    })
  );

  return rows;
};

const buildHospitalMetrics = async (hospitalId) => {
  const [summary] = await inventoryModel.aggregate([
    {
      $match: {
        hospital: hospitalId,
        inventoryType: "out",
      },
    },
    {
      $group: {
        _id: null,
        requestCount: { $sum: 1 },
        approvedRequestCount: {
          $sum: {
            $cond: [{ $in: ["$requestStatus", ["accepted", "completed"]] }, 1, 0],
          },
        },
        declinedRequestCount: {
          $sum: {
            $cond: [{ $eq: ["$requestStatus", "declined"] }, 1, 0],
          },
        },
        totalReceivedMl: {
          $sum: {
            $cond: [
              { $in: ["$requestStatus", ["accepted", "completed"]] },
              "$quantity",
              0,
            ],
          },
        },
        totalSpentRs: {
          $sum: {
            $cond: [
              { $in: ["$requestStatus", ["accepted", "completed"]] },
              "$totalAmount",
              0,
            ],
          },
        },
      },
    },
  ]);

  return (
    summary || {
      requestCount: 0,
      approvedRequestCount: 0,
      declinedRequestCount: 0,
      totalReceivedMl: 0,
      totalSpentRs: 0,
    }
  );
};

const buildAdminMetrics = async () => {
  const [donors, hospitals, organizations, admins, commissionSummary, recentTransactions] =
    await Promise.all([
      userModel.countDocuments({ role: "donor" }),
      userModel.countDocuments({ role: "hospital" }),
      userModel.countDocuments({ role: { $in: ["organization", "organisation"] } }),
      userModel.countDocuments({ role: "admin" }),
      inventoryModel.aggregate([
        {
          $match: {
            inventoryType: "out",
            requestStatus: { $in: ["accepted", "completed"] },
          },
        },
        {
          $group: {
            _id: null,
            transactionCount: { $sum: 1 },
            totalRevenueRs: { $sum: "$totalAmount" },
            totalCommissionRs: { $sum: "$commissionAmount" },
          },
        },
      ]),
      inventoryModel
        .find({ inventoryType: "out" })
        .populate("organisation")
        .populate("hospital")
        .sort({ createdAt: -1 })
        .limit(DEFAULT_LIMIT)
        .lean(),
    ]);

  return {
    userCounts: {
      donors,
      hospitals,
      organizations,
      admins,
    },
    commissionSummary: commissionSummary[0] || {
      transactionCount: 0,
      totalRevenueRs: 0,
      totalCommissionRs: 0,
    },
    recentTransactions: recentTransactions.map(summarizeTransaction),
  };
};

const buildAssistantContext = async (user) => {
  const normalizedRole = normalizeRole(user.role);
  const baseProfile = {
    id: String(user._id),
    role: normalizedRole,
    name: getUserDisplayName(user),
    email: user.email,
    bloodGroup: user.bloodGroup || "",
    hospitalName: user.hospitalName || "",
    organizationName: getOrganizationName(user) || "",
  };

  if (normalizedRole === "hospital") {
    const [recentTransactions, visibleOrganizations, metrics] = await Promise.all([
      inventoryModel
        .find({ hospital: user._id, inventoryType: "out" })
        .populate("organisation")
        .populate("hospital")
        .sort({ createdAt: -1 })
        .limit(DEFAULT_LIMIT)
        .lean(),
      userModel
        .find({ role: { $in: ["organization", "organisation"] } })
        .select("organizationName organisationName email phone")
        .sort({ createdAt: -1 })
        .limit(DEFAULT_LIMIT)
        .lean(),
      buildHospitalMetrics(user._id),
    ]);

    return {
      role: normalizedRole,
      profile: baseProfile,
      metrics,
      recentTransactions: recentTransactions.map(summarizeTransaction),
      visibleOrganizations: visibleOrganizations.map((record) => ({
        organizationName: getOrganizationName(record),
        email: record.email,
        phone: record.phone,
      })),
    };
  }

  if (normalizedRole === "organization") {
    const [inventorySummary, recentInventory, recentRequests, recentTransactions, donationSchedules, camps] =
      await Promise.all([
        buildInventorySummary(user._id),
        inventoryModel
          .find({ organisation: user._id })
          .populate("donor")
          .sort({ createdAt: -1 })
          .limit(DEFAULT_LIMIT)
          .lean(),
        inventoryModel
          .find({ organisation: user._id, inventoryType: "out" })
          .populate("hospital")
          .sort({ createdAt: -1 })
          .limit(DEFAULT_LIMIT)
          .lean(),
        inventoryModel
          .find({ organisation: user._id, inventoryType: "out" })
          .populate("organisation")
          .populate("hospital")
          .sort({ createdAt: -1 })
          .limit(DEFAULT_LIMIT)
          .lean(),
        donationScheduleModel
          .find({ organisation: user._id })
          .populate("donor")
          .sort({ scheduleDate: 1 })
          .limit(DEFAULT_LIMIT)
          .lean(),
        campScheduleModel
          .find({ createdBy: user._id })
          .sort({ campDate: 1 })
          .limit(DEFAULT_LIMIT)
          .lean(),
      ]);

    return {
      role: normalizedRole,
      profile: baseProfile,
      inventorySummary,
      recentInventory: recentInventory.map((record) => ({
        date: formatDate(record.createdAt),
        bloodGroup: record.bloodGroup,
        inventoryType: record.inventoryType,
        quantity: record.quantity,
        donorName: record.donor?.name || "",
        donorEmail: record.email || "",
      })),
      recentHospitalRequests: recentRequests.map((record) => ({
        date: formatDate(record.createdAt),
        hospitalName: record.hospital?.hospitalName || "",
        bloodGroup: record.bloodGroup,
        quantity: record.quantity,
        status: record.requestStatus,
        paymentMethod: record.paymentMethod || "",
        totalAmount: record.totalAmount || 0,
      })),
      recentTransactions: recentTransactions.map(summarizeTransaction),
      donationSchedules: donationSchedules.map((record) => ({
        donorName: record.donor?.name || "",
        donorEmail: record.donor?.email || "",
        bloodGroup: record.bloodGroup,
        quantity: record.quantity,
        scheduleDate: formatDate(record.scheduleDate),
        status: record.status,
      })),
      camps: camps.map((record) => ({
        title: record.title,
        location: record.location,
        description: record.description || "",
        campDate: formatDate(record.campDate),
        participantCount: record.participants?.length || 0,
      })),
    };
  }

  if (normalizedRole === "admin") {
    const adminMetrics = await buildAdminMetrics();

    return {
      role: normalizedRole,
      profile: baseProfile,
      ...adminMetrics,
    };
  }

  if (normalizedRole === "donor") {
    const [donationHistory, donationSchedules, camps] = await Promise.all([
      inventoryModel
        .find({ donor: user._id, inventoryType: "in" })
        .populate("organisation")
        .sort({ createdAt: -1 })
        .limit(DEFAULT_LIMIT)
        .lean(),
      donationScheduleModel
        .find({ donor: user._id })
        .populate("organisation")
        .sort({ scheduleDate: 1 })
        .limit(DEFAULT_LIMIT)
        .lean(),
      campScheduleModel.find({}).populate("createdBy").sort({ campDate: 1 }).limit(DEFAULT_LIMIT).lean(),
    ]);

    return {
      role: normalizedRole,
      profile: baseProfile,
      donationHistory: donationHistory.map((record) => ({
        date: formatDate(record.createdAt),
        bloodGroup: record.bloodGroup,
        quantity: record.quantity,
        organizationName: getOrganizationName(record.organisation),
      })),
      donationSchedules: donationSchedules.map((record) => ({
        organizationName: getOrganizationName(record.organisation),
        bloodGroup: record.bloodGroup,
        quantity: record.quantity,
        scheduleDate: formatDate(record.scheduleDate),
        status: record.status,
      })),
      camps: camps.map((record) => ({
        title: record.title,
        location: record.location,
        campDate: formatDate(record.campDate),
        hostName: getUserDisplayName(record.createdBy),
        participantCount: record.participants?.length || 0,
      })),
    };
  }

  return {
    role: normalizedRole,
    profile: baseProfile,
  };
};

module.exports = buildAssistantContext;
