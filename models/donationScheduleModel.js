const mongoose = require("mongoose");

const donationScheduleSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "donor is required"],
    },
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "organisation is required"],
    },
    bloodGroup: {
      type: String,
      enum: ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"],
      required: [true, "blood group is required"],
    },
    quantity: {
      type: Number,
      required: [true, "quantity is required"],
    },
    scheduleDate: {
      type: Date,
      required: [true, "schedule date is required"],
    },
    status: {
      type: String,
      enum: ["scheduled", "donated", "not-donated"],
      default: "scheduled",
    },
    inventoryRecorded: {
      type: Boolean,
      default: false,
    },
    inventoryEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DonationSchedule", donationScheduleSchema);
