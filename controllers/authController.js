const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
      role: req.body.role,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
    };

    if (req.body.role === "admin" || req.body.role === "donor") {
      userData.name = req.body.name;
    } 

    if (req.body.role === "hospital") {
      userData.hospitalName = req.body.hospitalName;
    }

    if (req.body.role === "organisation") {
      userData.organisationName = req.body.organisationName;
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
    if (user.role !== req.body.role) {
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
      user,
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
      user: user,
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

module.exports = { registerController, loginController, currentUserController };
