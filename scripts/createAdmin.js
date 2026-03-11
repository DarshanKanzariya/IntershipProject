const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const userModel = require("../models/userModel");

dotenv.config();

const args = process.argv.slice(2);

const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  if (index === -1 || index === args.length - 1) {
    return null;
  }
  return args[index + 1];
};

const positionalArgs = args.filter((arg, index) => {
  if (arg.startsWith("--")) {
    return false;
  }
  if (index > 0 && args[index - 1].startsWith("--")) {
    return false;
  }
  return true;
});

const name = getArgValue("--name") || positionalArgs[0];
const email = getArgValue("--email") || positionalArgs[1];
const password = getArgValue("--password") || positionalArgs[2];
const phone = getArgValue("--phone") || positionalArgs[3] || "0000000000";

const createAdmin = async () => {
  try {
    if (!name || !email || !password) {
      console.log(
        "Usage: node scripts/createAdmin.js --name \"Admin Name\" --email \"admin@example.com\" --password \"yourPassword\" [--phone \"9876543210\"]"
      );
      process.exit(1);
    }

    await connectDB();

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      console.log("Admin creation failed: email already exists");
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await userModel.create({
      role: "admin",
      name,
      email,
      password: hashedPassword,
      phone,
    });

    console.log(`Admin created successfully: ${admin.email}`);
    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

createAdmin();
