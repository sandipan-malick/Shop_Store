// routes/userRoutes.js
const express = require("express");
const router = express.Router();

// Controllers
const {
  checkEmail,
  sendOtp,
  verifyOTP,
  login,
  forgotPassword,
  verifyForgetOtp,
  resetPassword
} = require("../controllers/userController");

// Middleware
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Check if email is already registered
router.post("/check-email", checkEmail);

// ✅ Send OTP for registration
router.post("/send-otp", sendOtp);

// ✅ Verify OTP & register user
router.post("/verify-otp", verifyOTP);

// ✅ Login
router.post("/login", login);

// ✅ Forgot Password - Send OTP
router.post("/forgot-password", forgotPassword);

// ✅ Forgot Password - Verify OTP
router.post("/verify-forget-otp", verifyForgetOtp);

// ✅ Reset Password
router.post("/reset-password", resetPassword);

module.exports = router;
