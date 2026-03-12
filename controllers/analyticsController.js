const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");
const mongoose = require("mongoose");
const { isOrganizationRole } = require("../utils/organization");

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
