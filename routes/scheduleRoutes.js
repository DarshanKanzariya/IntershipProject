const express = require("express");
const authMiddelware = require("../middlewares/authMiddelware");
const {
  createDonationScheduleController,
  getDonationSchedulesController,
  updateDonationScheduleStatusController,
  createCampScheduleController,
  getCampSchedulesController,
  participateInCampController,
  getNotificationsController,
  markNotificationAsReadController,
} = require("../controllers/scheduleController");

const router = express.Router();

router.post(
  "/donation",
  authMiddelware,
  createDonationScheduleController
);
router.get("/donation", authMiddelware, getDonationSchedulesController);
router.put(
  "/donation/:id/status",
  authMiddelware,
  updateDonationScheduleStatusController
);

router.post("/camp", authMiddelware, createCampScheduleController);
router.get("/camp", authMiddelware, getCampSchedulesController);
router.post("/camp/:id/participate", authMiddelware, participateInCampController);

router.get("/notifications", authMiddelware, getNotificationsController);
router.put(
  "/notifications/:id/read",
  authMiddelware,
  markNotificationAsReadController
);

module.exports = router;
