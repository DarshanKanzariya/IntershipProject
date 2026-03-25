const express = require("express");
const authMiddelware = require("../middlewares/authMiddelware");
const { askAssistantController } = require("../controllers/aiController");

const router = express.Router();

router.post("/assistant", authMiddelware, askAssistantController);

module.exports = router;
