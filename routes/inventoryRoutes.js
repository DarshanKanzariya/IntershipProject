const express = require("express");
const authMiddelware = require("../middlewares/authMiddelware");
const {
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
} = require("../controllers/inventoryController");

const router = express.Router();

//routes
router.post(
  "/create-razorpay-order",
  authMiddelware,
  createRazorpayOrderController
);

// ADD INVENTORY || POST
router.post("/create-inventory", authMiddelware, createInventoryController);

//GET ALL BLOOD RECORDS
router.get("/get-inventory", authMiddelware, getInventoryController);
//GET RECENT BLOOD RECORDS
router.get(
  "/get-recent-inventory",
  authMiddelware,
  getRecentInventoryController
);

//GET HOSPITAL BLOOD RECORDS
router.post(
  "/get-inventory-hospital",
  authMiddelware,
  getInventoryHospitalController
);

//GET Donor RECORDS
router.get("/get-donors", authMiddelware, getDonorsController);

//GET HOSPITAL RECORDS
router.get("/get-hospitals", authMiddelware, getHospitalController);

//GET orgnaisation RECORDS
router.get("/get-orgnaisation", authMiddelware, getOrgnaisationController);

//GET orgnaisation RECORDS
router.get(
  "/get-orgnaisation-for-hospital",
  authMiddelware,
  getOrgnaisationForHospitalController
);

router.get(
  "/organisation-inventory/:organisationId",
  authMiddelware,
  getOrganisationInventorySummaryController
);
router.get(
  "/organisation-requests",
  authMiddelware,
  getOrganisationRequestController
);
router.put(
  "/organisation-requests/:requestId",
  authMiddelware,
  updateRequestStatusController
);

module.exports = router;
