const User = require("../models/User");
const Otp = require("../models/Otp");
const ResetRequest = require("../models/ResetRequest");
const sendEmail = require("../utils/sendMail");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");

// 1️⃣ Check Email
exports.checkEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) return res.status(409).json({ error: "Email already registered" });
    return res.json({ message: "Email is available" });
  } catch (err) {
    console.error("Check email error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 2️⃣ Send OTP
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    let existingOtp = await Otp.findOne({ email });
    const now = new Date();

    if (existingOtp?.bannedUntil && existingOtp.bannedUntil > now)
      return res.status(403).json({ error: "Too many failed attempts. Try again later." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    if (existingOtp) {
      existingOtp.otp = otp;
      existingOtp.otpExpires = otpExpires;
      existingOtp.failedAttempts = 0;
      existingOtp.bannedUntil = null;
      await existingOtp.save();
    } else {
      await Otp.create({ email, otp, otpExpires });
    }

    await sendEmail(email, "Your OTP for Registration", `<p>Your OTP is: <b>${otp}</b>. Expires in 5 mins.</p>`);
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
    if (!otp || !username || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    await Otp.deleteOne({ email });

    await sendEmail(email, "🎉 Registration Successful", `Hi ${username}, your registration was successful!`);
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
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    });

    await sendEmail(email, "🎉 Login Successful", `Hi ${user.username}, your login was successful!`);
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 5️⃣ Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not registered" });

    const generatedOtp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    let existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      if (existingOtp.bannedUntil && existingOtp.bannedUntil > new Date())
        return res.status(403).json({ message: "You are temporarily banned. Try again later." });

      existingOtp.otp = generatedOtp;
      existingOtp.otpExpires = otpExpires;
      existingOtp.failedAttempts = 0;
      existingOtp.bannedUntil = null;
      await existingOtp.save();
    } else {
      await Otp.create({ email, otp: generatedOtp, otpExpires, failedAttempts: 0 });
    }

    await sendEmail(email, "🔐 Reset Your Password - OTP", `Your OTP is: ${generatedOtp}. Valid for 5 mins.`);
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 6️⃣ Verify Forget OTP
exports.verifyForgetOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const record = await Otp.findOne({ otp });
    if (!record) return res.status(400).json({ message: "OTP not found" });

    if (record.bannedUntil && record.bannedUntil > new Date())
      return res.status(403).json({ message: "Temporarily banned" });

    if (record.otpExpires < new Date())
      return res.status(400).json({ message: "OTP expired" });

    if (record.otp !== String(otp).trim()) {
      record.failedAttempts += 1;
      if (record.failedAttempts >= 5) {
        record.bannedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await record.save();
        return res.status(403).json({ message: "Too many failed attempts" });
      }
      await record.save();
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    await Otp.deleteOne({ otp });
    await ResetRequest.create({ email: record.email });
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("verifyForgetOtp Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 7️⃣ Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ message: "Email & new password required" });

    const resetEntry = await ResetRequest.findOne({ email });
    if (!resetEntry) return res.status(403).json({ message: "Unauthorized request" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await ResetRequest.deleteOne({ email });
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
