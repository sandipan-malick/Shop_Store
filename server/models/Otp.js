const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpires: {
    type: Date,
    required: true,
  },
  failedAttempts: {
    type: Number,
    default: 0,
  },
  bannedUntil: {
    type: Date,
  }
}, {
  timestamps: true
});

// TTL index to auto-delete document after `otpExpires`
otpSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);
