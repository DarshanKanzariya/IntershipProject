const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "recipient is required"],
    },
    title: {
      type: String,
      required: [true, "title is required"],
    },
    message: {
      type: String,
      required: [true, "message is required"],
    },
    type: {
      type: String,
      enum: ["donation-schedule", "camp-schedule"],
      required: [true, "type is required"],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
