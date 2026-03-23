const userModel = require("../models/userModel");
const { createUser } = require("./authController");
const { organizationRoleQuery } = require("../utils/organization");

//GET Donor LIST
const getDonorsListController = async (req, res) => {
  try {
    const donorData = await userModel
      .find({ role: "donor" })
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      Toatlcount: donorData.length,
      message: "Donor List Fetched Successfully",
      donorData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Donor List API",
      error,
    });
  }
};
//GET HOSPITAL LIST
const getHospitalListController = async (req, res) => {
  try {
    const hospitalData = await userModel
      .find({ role: "hospital" })
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      Toatlcount: hospitalData.length,
      message: "HOSPITAL List Fetched Successfully",
      hospitalData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Hospital List API",
      error,
    });
  }
};
//GET ORG LIST
const getOrgListController = async (req, res) => {
  try {
    const orgData = await userModel
      .find({ role: organizationRoleQuery })
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      Toatlcount: orgData.length,
      message: "ORG List Fetched Successfully",
      orgData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In ORG List API",
      error,
    });
  }
};
// =======================================

//DELETE Donor
const deleteDonorController = async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    return res.status(200).send({
      success: true,
      message: " Record Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while deleting ",
      error,
    });
  }
};

const createHospitalController = async (req, res) => {
  try {
    const result = await createUser({
      ...req.body,
      role: "hospital",
    });

    if (!result.success) {
      return res.status(result.statusCode).send({
        success: false,
        message: result.message,
      });
    }

    return res.status(result.statusCode).send({
      success: true,
      message: "Hospital account created successfully",
      hospital: {
        _id: result.user._id,
        role: result.user.role,
        hospitalName: result.user.hospitalName,
        email: result.user.email,
        phone: result.user.phone,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while creating hospital account",
      error,
    });
  }
};

const createOrgController = async (req, res) => {
  try {
    const result = await createUser({
      ...req.body,
      role: "organization",
    });

    if (!result.success) {
      return res.status(result.statusCode).send({
        success: false,
        message: result.message,
      });
    }

    return res.status(result.statusCode).send({
      success: true,
      message: "Organization account created successfully",
      organization: {
        _id: result.user._id,
        role: result.user.role,
        organizationName:
          result.user.organizationName || result.user.organisationName,
        email: result.user.email,
        phone: result.user.phone,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while creating organization account",
      error,
    });
  }
};

//EXPORT
module.exports = {
  getDonorsListController,
  getHospitalListController,
  getOrgListController,
  deleteDonorController,
  createHospitalController,
  createOrgController,
};
