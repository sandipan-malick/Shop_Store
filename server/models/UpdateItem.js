const mongoose = require("mongoose");

const UpdateItemSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true
    },
    productPrice: {
      type: Number,
      required: true
    },
    sellPrice: {
      type: Number,
      required: true
    },
    quantityChanged: {
      type: Number,
      required: true
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    // 👇 extra fields to store human-readable IST date and time
    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" })
    },
    time: {
      type: String,
      default: () =>
        new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour12: true })
    }
  },
  {
    timestamps: true // still keeps createdAt & updatedAt in UTC
  }
);

module.exports = mongoose.model("UpdateItem", UpdateItemSchema);
