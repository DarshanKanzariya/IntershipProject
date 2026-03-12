const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  isOrganizationRole,
  normalizeRole,
  getOrganizationName,
} = require("../utils/organization");

const buildUserResponse = (user) => ({
  _id: user._id,
  role: normalizeRole(user.role),
  name: user.name,
  bloodGroup: user.bloodGroup,
  hospitalName: user.hospitalName,
  organizationName: getOrganizationName(user),
  organisationName: getOrganizationName(user),
  email: user.email,
  phone: user.phone,
});

const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(200).send({
        message: "User Already Exists",
        success: false,
      });
    }

    // 🔥 STEP 1: HASH PASSWORD FIRST
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // 🔥 STEP 2: THEN BUILD USER OBJECT
    const userData = {
      role: normalizeRole(req.body.role),
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
    };

    if (req.body.role === "admin" || req.body.role === "donor") {
      userData.name = req.body.name;
    }

    if (req.body.role === "donor") {
      userData.bloodGroup = req.body.bloodGroup;
    }

    if (req.body.role === "hospital") {
      userData.hospitalName = req.body.hospitalName;
    }

    if (isOrganizationRole(req.body.role)) {
      userData.organizationName =
        req.body.organizationName || req.body.organisationName;
      userData.organisationName = userData.organizationName;
    }

    const User = new userModel(userData);
    await User.save();

    return res.status(201).send({
      message: "User Registered Successfully",
      success: true,
      User,
    });

  } catch (error) {
    console.log("REGISTER ERROR", error);
    res.status(500).send({
      success: false,
      message: "Error in Registering User",
      error: error.message,
    });
  }
};


//login call back
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({
        message: "User Not Found",
        success: false,
      });
    }
    //check role
    if (normalizeRole(user.role) !== normalizeRole(req.body.role)) {
      return res.status(401).send({
        message: "Role not matched",
        success: false,
      });
    }
    //check password
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        message: "Invalid Email or Password",
        success: false,
      });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.status(200).send({
      message: "Login Successful",
      success: true,
      user: buildUserResponse(user),
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in Login",
      success: false,
      error,
    });
  }
};

//GET Current User
const currentUserController = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.userId || req.body.userId)
      .select("-password");
    return res.status(200).send({
      message: "Current User Fetched Successfully",
      success: true,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in Fetching Current User",
      success: false,
      error,
    });
  }
};

const updateProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId || req.body.userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "Email already exists",
      });
    }

    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    if (user.role === "donor" || user.role === "admin") {
      user.name = req.body.name || user.name;
    }

    if (user.role === "donor") {
      user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
    }

    if (user.role === "hospital") {
      user.hospitalName = req.body.hospitalName || user.hospitalName;
    }

    if (isOrganizationRole(user.role)) {
      user.role = "organization";
      user.organizationName =
        req.body.organizationName ||
        req.body.organisationName ||
        user.organizationName ||
        user.organisationName;
      user.organisationName = user.organizationName;
    }

    if (req.body.password) {
      if (!req.body.oldPassword) {
        return res.status(400).send({
          success: false,
          message: "Old password is required",
        });
      }

      if (!req.body.confirmPassword) {
        return res.status(400).send({
          success: false,
          message: "Confirm password is required",
        });
      }

      if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).send({
          success: false,
          message: "New password and confirm password do not match",
        });
      }

      const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).send({
          success: false,
          message: "Old password is incorrect",
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();

    return res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in updating profile",
      error,
    });
  }
};

module.exports = {
  registerController,
  loginController,
  currentUserController,
  updateProfileController,
};
