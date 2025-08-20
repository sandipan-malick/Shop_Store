// controllers/authController.js

const User = require("../models/User");
const Otp = require("../models/Otp");
const ResetRequest = require("../models/ResetRequest");
const sendEmail = require("../utils/sendMail");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");

/**
 * NOTE:
 * - Ensure your Otp model has fields: email, otp, otpExpires, failedAttempts (Number, default 0), bannedUntil (Date|null)
 * - Ensure your ResetRequest model has fields: email, createdAt, expiresAt (Date)
 *   (If not, add `expiresAt` to schema; controller uses it for secure expiration.)
 */

// 1️⃣ Check Email (for registration)
exports.checkEmail = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user = await User.findOne({ email });
    if (user) return res.status(409).json({ error: "Email already registered" });
    return res.json({ message: "Email is available" });
  } catch (err) {
    console.error("Check email error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 2️⃣ Send OTP (for registration)
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ error: "Email is required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    // Check ban window
    let existingOtp = await Otp.findOne({ email });
    const now = new Date();
    if (existingOtp?.bannedUntil && existingOtp.bannedUntil > now) {
      return res.status(403).json({ error: "Too many failed attempts. Try again later." });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    if (existingOtp) {
      existingOtp.otp = otp;
      existingOtp.otpExpires = otpExpires;
      existingOtp.failedAttempts = 0;
      existingOtp.bannedUntil = null;
      await existingOtp.save();
    } else {
      await Otp.create({ email, otp, otpExpires, failedAttempts: 0, bannedUntil: null });
    }

    await sendEmail(email, "Your OTP for Registration", `Your OTP is: ${otp}. It expires in 5 minutes.`);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// 3️⃣ Verify OTP & Register User
exports.verifyOTP = async (req, res) => {
  try {
    const { otp, username, email, password } = req.body;
    if (!otp || !username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const otpRecord = await Otp.findOne({ email });
    if (
      !otpRecord ||
      otpRecord.otp !== String(otp).trim() ||
      otpRecord.otpExpires < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });

    // Clean up OTP
    await Otp.deleteOne({ email });

    // Notify
    sendEmail(email, "🎉 Registration Successful", `Hi ${username}, your registration was successful!`).catch(
      (e) => console.error("Registration email error:", e)
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ message: "Server error during verification" });
  }
};

// 4️⃣ Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(402).json({ error: "Invalid credentials" });

    // Assumes User schema defines user.comparePassword = (plain) => bcrypt.compare(plain, this.password)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(403).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Non-blocking notification email
    sendEmail(
      email,
      "🎉 Login Successful",
      `Hi ${user.username},\n\nYour login was successful!\n\nThanks for joining us.\n\n- Team ABC App`
    ).catch((e) => console.error("Login email error:", e));

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 5️⃣ Forgot Password -> send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not registered" });

    const generatedOtp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    let existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      if (existingOtp.bannedUntil && existingOtp.bannedUntil > new Date()) {
        return res.status(403).json({ message: "You are temporarily banned. Try again later." });
      }
      existingOtp.otp = generatedOtp;
      existingOtp.otpExpires = otpExpires;
      existingOtp.failedAttempts = 0;
      existingOtp.bannedUntil = null;
      await existingOtp.save();
    } else {
      await Otp.create({ email, otp: generatedOtp, otpExpires, failedAttempts: 0, bannedUntil: null });
    }

    await sendEmail(email, "🔐 Reset Your Password - OTP", `Your OTP is: ${generatedOtp}. Valid for 5 minutes.`);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 6️⃣ Verify Forget OTP (requires email + otp)
exports.verifyForgetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const record = await Otp.findOne({ email });
    if (!record) return res.status(400).json({ message: "OTP not found" });

    if (record.bannedUntil && record.bannedUntil > new Date()) {
      return res.status(403).json({ message: "Temporarily banned" });
    }

    if (record.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== String(otp).trim()) {
      record.failedAttempts = (record.failedAttempts || 0) + 1;

      if (record.failedAttempts >= 5) {
        record.bannedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await record.save();
        return res.status(403).json({ message: "Too many failed attempts" });
      }

      await record.save();
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // OTP success: clean OTP and create time-bound reset request
    await Otp.deleteOne({ email });

    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins window to reset
    await ResetRequest.findOneAndUpdate(
      { email },
      { email, createdAt: new Date(), expiresAt: resetExpiry },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("verifyForgetOtp Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 7️⃣ Reset Password (requires a valid ResetRequest that hasn't expired)
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ message: "Email & new password required" });

    const resetEntry = await ResetRequest.findOne({ email });
    if (!resetEntry) return res.status(403).json({ message: "Unauthorized request" });

    if (resetEntry.expiresAt && resetEntry.expiresAt < new Date()) {
      await ResetRequest.deleteOne({ email });
      return res.status(400).json({ message: "Reset request expired" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await ResetRequest.deleteOne({ email });

    sendEmail(email, "✅ Password Changed", `Hi, your password was changed successfully.`).catch((e) =>
      console.error("Password change email error:", e)
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
