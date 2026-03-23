const express = require("express");
const {
  registerController,
  loginController,
  roleLoginController,
  currentUserController,
  updateProfileController,
  getUserByEmailController,
} = require("../controllers/authController");
const authMiddelware = require("../middlewares/authMiddelware");

const router = express.Router();

//routes
//REGISTER || POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);
router.post("/donor-login", roleLoginController("donor"));
router.post("/hospital-login", roleLoginController("hospital"));
router.post("/organization-login", roleLoginController("organization"));
router.post("/admin-login", roleLoginController("admin"));

//GET CURRENT USER || GET
router.get("/current-user", authMiddelware, currentUserController);
router.get("/user-by-email", authMiddelware, getUserByEmailController);

//UPDATE PROFILE || PUT
router.put("/update-profile", authMiddelware, updateProfileController);

module.exports = router;
