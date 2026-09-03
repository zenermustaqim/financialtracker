const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function createUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB");

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD are required"
      );
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      console.log("User already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    await User.create({
      name: "Zener",
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    console.log("User created successfully");

    process.exit(0);
  } catch (error) {
    console.error("Failed to create user:");
    console.error(error.message);

    process.exit(1);
  }
}

createUser();