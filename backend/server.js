const Transaction = require("./models/Transaction");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const allowedOrigins = [
  "https://zenermustaqim.github.io",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Financial Tracker API is running",
    database: "MongoDB",
  });
});

app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get transactions",
      error: error.message,
    });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const transaction = new Transaction({
      description: req.body.description,
      amount: req.body.amount,
      type: req.body.type,
      category: req.body.category,
      date: req.body.date,
      paymentMethod: req.body.paymentMethod,
      notes: req.body.notes,
    });

    const savedTransaction = await transaction.save();

    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create transaction",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log("Connecting to MongoDB...");

await mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  family:4,
});

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();