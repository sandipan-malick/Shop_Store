const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema(
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
    // 👇 Extra IST Date & Time fields
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
    timestamps: true // keeps createdAt & updatedAt (in UTC)
  }
);

module.exports = mongoose.model("HistoryPage", HistorySchema);
