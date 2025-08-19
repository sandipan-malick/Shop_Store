// models/ResetRequest.js
const mongoose = require("mongoose");

const resetRequestSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600,
  },
});

module.exports = mongoose.model("ResetRequest", resetRequestSchema);
