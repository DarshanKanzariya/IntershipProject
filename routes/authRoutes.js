const express = require("express");
const {
  registerController,
  loginController,
  currentUserController,
  updateProfileController,
} = require("../controllers/authController");
const authMiddelware = require("../middlewares/authMiddelware");

const router = express.Router();

//routes
//REGISTER || POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

//GET CURRENT USER || GET
router.get("/current-user", authMiddelware, currentUserController);

//UPDATE PROFILE || PUT
router.put("/update-profile", authMiddelware, updateProfileController);

module.exports = router;
