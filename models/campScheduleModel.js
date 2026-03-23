const mongoose = require("mongoose");

const campScheduleSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "created by is required"],
    },
    hostRole: {
      type: String,
      enum: ["hospital", "organisation"],
      required: [true, "host role is required"],
    },
    title: {
      type: String,
      required: [true, "title is required"],
    },
    description: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      required: [true, "location is required"],
    },
    campDate: {
      type: Date,
      required: [true, "camp date is required"],
    },
    participants: [
      {
        donor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
          required: true,
        },
        donorName: {
          type: String,
          required: true,
        },
        donorEmail: {
          type: String,
          required: true,
        },
        bloodGroup: {
          type: String,
          enum: ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"],
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CampSchedule", campScheduleSchema);
