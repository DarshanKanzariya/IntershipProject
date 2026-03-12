const mongoose = require("mongoose");
const { isOrganizationRole } = require("../utils/organization");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, "role is required"],
      enum: ["admin", "organization", "organisation", "donor", "hospital"],
    },
    name: {
      type: String,
      required: function () {
        if (this.role === "donor" || this.role === "admin") {
          return true;
        }
        return false;
      },
    },
    bloodGroup: {
      type: String,
      enum: ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"],
      required: function () {
        return this.role === "donor";
      },
    },
    organizationName: {
      type: String,
      required: function () {
        if (isOrganizationRole(this.role)) {
          return true;
        }
        return false;
      },
    },
    organisationName: {
      type: String,
    },
    hospitalName: {
      type: String,
      required: function () {
        if (this.role === "hospital") {
          return true;
        }
        return false;
      },
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is requied"],
    },
    phone: {
      type: String,
      required: [true, "phone numbe is required"],
    },
  },
  { timestamps: true },
);

userSchema.pre("save", function (next) {
  if (isOrganizationRole(this.role)) {
    this.role = "organization";
    this.organizationName = this.organizationName || this.organisationName;
    this.organisationName = this.organizationName || this.organisationName;
  }
  next();
});

module.exports = mongoose.model("users", userSchema);
