const donationScheduleModel = require("../models/donationScheduleModel");
const campScheduleModel = require("../models/campScheduleModel");
const notificationModel = require("../models/notificationModel");
const userModel = require("../models/userModel");
const inventoryModel = require("../models/inventoryModel");
const mongoose = require("mongoose");
const {
  isOrganizationRole,
  getOrganizationName,
} = require("../utils/organization");

const createNotification = async (recipient, title, message, type) => {
  await notificationModel.create({
    recipient,
    title,
    message,
    type,
  });
};

const ensureDonationInventoryRecorded = async (schedule, createdBy) => {
  if (
    schedule.status !== "donated" ||
    (schedule.inventoryRecorded && schedule.inventoryEntry)
  ) {
    return schedule;
  }

  const inventory = await inventoryModel.create({
    inventoryType: "in",
    bloodGroup: schedule.bloodGroup,
    quantity: schedule.quantity,
    email: schedule.donor.email,
    organisation: schedule.organisation._id,
    donor: schedule.donor._id,
    createdBy,
  });

  schedule.inventoryRecorded = true;
  schedule.inventoryEntry = inventory._id;
  await schedule.save();

  return schedule;
};

const createDonationScheduleController = async (req, res) => {
  try {
    const donor = await userModel.findById(req.userId);

    if (!donor || donor.role !== "donor") {
      return res.status(403).send({
        success: false,
        message: "Only donors can schedule donations",
      });
    }

    if (!req.body.organisation) {
      return res.status(400).send({
        success: false,
        message: "Please select an organisation",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.body.organisation)) {
      return res.status(400).send({
        success: false,
        message: "Selected organisation is invalid",
      });
    }

    const organisation = await userModel.findById(req.body.organisation);
    if (!organisation || !isOrganizationRole(organisation.role)) {
      return res.status(404).send({
        success: false,
        message: "Organisation not found",
      });
    }

    if (!donor.bloodGroup) {
      return res.status(400).send({
        success: false,
        message: "Please update your donor blood group in profile",
      });
    }

    if (req.body.bloodGroup !== donor.bloodGroup) {
      return res.status(400).send({
        success: false,
        message: "Donation schedule blood group must match your profile blood group",
      });
    }

    const schedule = await donationScheduleModel.create({
      donor: donor._id,
      organisation: organisation._id,
      bloodGroup: donor.bloodGroup,
      quantity: req.body.quantity,
      scheduleDate: req.body.scheduleDate,
    });

    await createNotification(
      donor._id,
      "Donation Scheduled",
      `Your donation is scheduled with ${getOrganizationName(organisation)}.`,
      "donation-schedule"
    );

    await createNotification(
      organisation._id,
      "New Donation Schedule",
      `${donor.name} scheduled a donation for ${req.body.bloodGroup}.`,
      "donation-schedule"
    );

    return res.status(201).send({
      success: true,
      message: "Donation scheduled successfully",
      schedule,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in scheduling donation",
      error,
    });
  }
};

const getDonationSchedulesController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    let filters = {};

    if (user.role === "donor") {
      filters.donor = user._id;
    } else if (isOrganizationRole(user.role)) {
      filters.organisation = user._id;
    } else {
      return res.status(403).send({
        success: false,
        message: "Donation schedules not available for this role",
      });
    }

    const schedules = await donationScheduleModel
      .find(filters)
      .populate("donor")
      .populate("organisation")
      .sort({ scheduleDate: 1 });

    await Promise.all(
      schedules.map((schedule) =>
        ensureDonationInventoryRecorded(
          schedule,
          schedule.organisation?._id || schedule.organisation
        )
      )
    );

    return res.status(200).send({
      success: true,
      schedules,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in fetching donation schedules",
      error,
    });
  }
};

const updateDonationScheduleStatusController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (!user || !isOrganizationRole(user.role)) {
      return res.status(403).send({
        success: false,
        message: "Only organisations can update donation schedules",
      });
    }

    if (!["donated", "not-donated"].includes(req.body.status)) {
      return res.status(400).send({
        success: false,
        message: "Invalid donation status",
      });
    }

    const schedule = await donationScheduleModel
      .findOne({
        _id: req.params.id,
        organisation: user._id,
      })
      .populate("donor")
      .populate("organisation");

    if (!schedule) {
      return res.status(404).send({
        success: false,
        message: "Donation schedule not found",
      });
    }

    if (schedule.status !== "scheduled" && schedule.status !== req.body.status) {
      return res.status(400).send({
        success: false,
        message: "This donation schedule has already been updated",
      });
    }

    schedule.status = req.body.status;

    await ensureDonationInventoryRecorded(schedule, user._id);

    if (req.body.status !== "donated") {
      await schedule.save();
    }

    await createNotification(
      schedule.donor._id,
      "Donation Status Updated",
      `${getOrganizationName(schedule.organisation)} marked your donation as ${req.body.status}.`,
      "donation-schedule"
    );

    return res.status(200).send({
      success: true,
      message: "Donation schedule status updated",
      schedule,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in updating donation schedule status",
      error,
    });
  }
};

const createCampScheduleController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (!user || !["hospital"].includes(user.role) && !isOrganizationRole(user.role)) {
      return res.status(403).send({
        success: false,
        message: "Only hospitals and organisations can create camps",
      });
    }

    const existingCamp = await campScheduleModel.findOne({
      createdBy: user._id,
      title: req.body.title?.trim(),
      description: req.body.description?.trim() || "",
      location: req.body.location?.trim(),
      campDate: req.body.campDate,
    });

    if (existingCamp) {
      return res.status(200).send({
        success: true,
        message: "Donation camp already scheduled",
        camp: existingCamp,
      });
    }

    const camp = await campScheduleModel.create({
      createdBy: user._id,
      hostRole: user.role,
      title: req.body.title?.trim(),
      description: req.body.description?.trim() || "",
      location: req.body.location?.trim(),
      campDate: req.body.campDate,
    });

    const donors = await userModel.find({ role: "donor" }).select("_id");
    await Promise.all(
      donors.map((donor) =>
        createNotification(
          donor._id,
          "New Donation Camp",
          `${req.body.title} is scheduled at ${req.body.location}.`,
          "camp-schedule"
        )
      )
    );

    return res.status(201).send({
      success: true,
      message: "Donation camp scheduled successfully",
      camp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in scheduling donation camp",
      error,
    });
  }
};

const getCampSchedulesController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const filters =
      user.role === "hospital" || isOrganizationRole(user.role)
        ? { createdBy: user._id }
        : {};

    const camps = await campScheduleModel
      .find(filters)
      .populate("createdBy")
      .sort({ campDate: 1 });

    return res.status(200).send({
      success: true,
      camps,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in fetching camp schedules",
      error,
    });
  }
};

const getNotificationsController = async (req, res) => {
  try {
    const notifications = await notificationModel
      .find({ recipient: req.userId })
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      notifications,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in fetching notifications",
      error,
    });
  }
};

const markNotificationAsReadController = async (req, res) => {
  try {
    const notification = await notificationModel.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).send({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Notification updated",
      notification,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in updating notification",
      error,
    });
  }
};

module.exports = {
  createDonationScheduleController,
  getDonationSchedulesController,
  updateDonationScheduleStatusController,
  createCampScheduleController,
  getCampSchedulesController,
  getNotificationsController,
  markNotificationAsReadController,
};
