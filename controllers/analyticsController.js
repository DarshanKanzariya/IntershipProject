const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");
const mongoose = require("mongoose");
const { isOrganizationRole, normalizeRole } = require("../utils/organization");

const bloodGroups = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];

const getAggregateTotal = async (match) => {
  const total = await inventoryModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: "$quantity" },
      },
    },
  ]);

  return total[0]?.total || 0;
};

const getOrganisationAnalytics = async (match = {}) => {
  return Promise.all(
    bloodGroups.map(async (bloodGroup) => {
      const totalIn = await getAggregateTotal({
        ...match,
        bloodGroup,
        inventoryType: "in",
      });

      const totalOut = await getAggregateTotal({
        ...match,
        bloodGroup,
        inventoryType: "out",
      });

      return {
        bloodGroup,
        totalIn,
        totalOut,
        availabeBlood: totalIn - totalOut,
      };
    })
  );
};

const getHospitalAnalytics = async (match = {}) => {
  return Promise.all(
    bloodGroups.map(async (bloodGroup) => {
      const totalReceived = await getAggregateTotal({
        ...match,
        bloodGroup,
        inventoryType: "out",
      });

      return {
        bloodGroup,
        totalReceived,
      };
    })
  );
};

const getUserDisplayName = (user) =>
  user.name || user.hospitalName || user.organizationName || user.organisationName || "-";

const getAdminUserAnalytics = async () => {
  const [users, donorStats, organisationStats, hospitalStats] = await Promise.all([
    userModel
      .find({})
      .select("role name hospitalName organizationName organisationName email phone createdAt")
      .sort({ createdAt: -1 }),
    inventoryModel.aggregate([
      { $match: { donor: { $exists: true, $ne: null }, inventoryType: "in" } },
      {
        $group: {
          _id: "$donor",
          donationCount: { $sum: 1 },
          totalDonated: { $sum: "$quantity" },
        },
      },
    ]),
    inventoryModel.aggregate([
      { $match: { organisation: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$organisation",
          totalIn: {
            $sum: {
              $cond: [{ $eq: ["$inventoryType", "in"] }, "$quantity", 0],
            },
          },
          totalOut: {
            $sum: {
              $cond: [{ $eq: ["$inventoryType", "out"] }, "$quantity", 0],
            },
          },
          recordCount: { $sum: 1 },
        },
      },
    ]),
    inventoryModel.aggregate([
      { $match: { hospital: { $exists: true, $ne: null }, inventoryType: "out" } },
      {
        $group: {
          _id: "$hospital",
          requestCount: { $sum: 1 },
          totalReceived: { $sum: "$quantity" },
        },
      },
    ]),
  ]);

  const donorStatsMap = new Map(
    donorStats.map((item) => [String(item._id), item])
  );
  const organisationStatsMap = new Map(
    organisationStats.map((item) => [String(item._id), item])
  );
  const hospitalStatsMap = new Map(
    hospitalStats.map((item) => [String(item._id), item])
  );

  return users.map((user) => {
    const normalizedRole = normalizeRole(user.role);
    const baseAnalytics = {
      userId: user._id,
      name: getUserDisplayName(user),
      role: normalizedRole,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      metrics: {},
    };

    if (normalizedRole === "donor") {
      const donorMetric = donorStatsMap.get(String(user._id));
      baseAnalytics.metrics = {
        donationCount: donorMetric?.donationCount || 0,
        totalDonated: donorMetric?.totalDonated || 0,
      };
      return baseAnalytics;
    }

    if (normalizedRole === "organization") {
      const organisationMetric = organisationStatsMap.get(String(user._id));
      const totalIn = organisationMetric?.totalIn || 0;
      const totalOut = organisationMetric?.totalOut || 0;

      baseAnalytics.metrics = {
        recordCount: organisationMetric?.recordCount || 0,
        totalIn,
        totalOut,
        availableBlood: totalIn - totalOut,
      };
      return baseAnalytics;
    }

    if (normalizedRole === "hospital") {
      const hospitalMetric = hospitalStatsMap.get(String(user._id));
      baseAnalytics.metrics = {
        requestCount: hospitalMetric?.requestCount || 0,
        totalReceived: hospitalMetric?.totalReceived || 0,
      };
      return baseAnalytics;
    }

    baseAnalytics.metrics = {
      accountCount: 1,
    };

    return baseAnalytics;
  });
};

//GET BLOOD DATA
const bloodGroupDetailsContoller = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;

    if (!userId) {
      return res.status(400).send({
        success: false,
        message: "User not found for analytics",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const objectId = new mongoose.Types.ObjectId(userId);
    const response = {
      success: true,
      message: "Blood Group Data Fetch Successfully",
      role: user.role,
    };

    if (isOrganizationRole(user.role)) {
      response.organisationAnalytics = await getOrganisationAnalytics({
        organisation: objectId,
      });
    } else if (user.role === "hospital") {
      response.hospitalAnalytics = await getHospitalAnalytics({
        hospital: objectId,
      });
    } else if (user.role === "admin") {
      response.organisationAnalytics = await getOrganisationAnalytics();
      response.hospitalAnalytics = await getHospitalAnalytics();
      response.userAnalytics = await getAdminUserAnalytics();
    } else {
      return res.status(403).send({
        success: false,
        message: "Analytics not available for this role",
      });
    }

    return res.status(200).send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Bloodgroup Data Analytics API",
      error,
    });
  }
};

module.exports = { bloodGroupDetailsContoller };
