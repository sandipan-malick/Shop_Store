const User = require("../models/User");
const Otp = require("../models/Otp");
const ResetRequest = require("../models/ResetRequest");
const sendEmail = require("../utils/sendMail");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
//  1. Check Email Already Exists
exports.checkEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ error: "Email already registered" });
    }
    return res.json({ message: "Email is available" });
  } catch (err) {
    console.error("Check email error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

//  2. Send OTP to Email
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    let existingOtp = await Otp.findOne({ email });

    const now = new Date();

    // Ban check
    if (existingOtp && existingOtp.bannedUntil && existingOtp.bannedUntil > now) {
      return res.status(403).json({ error: "Too many failed attempts. Try again later." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    if (existingOtp) {
      existingOtp.otp = otp;
      existingOtp.otpExpires = otpExpires;
      existingOtp.failedAttempts = 0;
      existingOtp.bannedUntil = null;
      await existingOtp.save();
    } else {
      await Otp.create({ email, otp, otpExpires });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Registration",
      html: `<p>Your OTP is: <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

//  3. Verify OTP and Register User
exports.verifyOTP = async (req, res) => {
  try {
    const { otp, username, email, password } = req.body;

    // Validate required fields
    if (!otp || !username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check OTP from DB
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Save user
    const user = await User.create({ username, email, password });

    // Delete OTP from DB (optional)
    await Otp.deleteOne({ email });

    res.status(201).json({ message: 'User registered successfully' });
    await sendEmail(
      email,
      "🎉 Registration Successful",
      `Hi ${username},\n\nYour registration was successful!\n\nThanks for joining us.\n\n- Team ABC App`
    );

    // Optionally delete the OTP
    await Otp.deleteOne({ email });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ message: 'Server error during verification' });
  }
};

//  4. Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Optional: send login success email before sending the response
    await sendEmail(
      email,
      "🎉 Login Successful",
      `Hi ${user.username},\n\nYour login was successful!\n\nThanks for joining us.\n\n- Team ABC App`
    );

    // Set the cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only use HTTPS in prod
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Send final response once
    res.json({ message: "Login successful", token });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// Forget Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    //  Step 1: Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "❌ Email not registered" });
    }

    //  Step 2: Generate new OTP
    const generatedOtp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });

    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    //  Step 3: Check if OTP record already exists
    let existingOtp = await Otp.findOne({ email });

    if (existingOtp) {
      // Ban check
      if (existingOtp.bannedUntil && existingOtp.bannedUntil > new Date()) {
        return res.status(403).json({ message: "You are temporarily banned. Try again later." });
      }

      // If previous OTP expired, allow new one
      if (existingOtp.otpExpires < new Date()) {
        existingOtp.otp = generatedOtp;
        existingOtp.otpExpires = otpExpires;
        existingOtp.failedAttempts = 0;
        existingOtp.bannedUntil = null;
        await existingOtp.save();
        console.log(" OTP updated:", generatedOtp);
      } else {
        return res.status(429).json({ message: "OTP already sent. Wait before requesting a new one." });
      }
    } else {
      // Create new OTP record
      await Otp.create({
        email,
        otp: generatedOtp,
        otpExpires,
        failedAttempts: 0,
      });
      console.log(" OTP created:", generatedOtp);
    }

    //  Step 4: Send Email
    await sendEmail(
      email,
      "🔐 Reset Your Password - OTP",
      `Your OTP for password reset is: ${generatedOtp} This OTP is valid for 5 minutes.`
    );

    return res.status(200).json({ message: " OTP sent to your email" });
  } catch (err) {
    console.error(" Forgot Password Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.verifyForgetOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    console.log(otp);
    const record = await Otp.findOne({ otp });
    console.log(record);
    console.log(record.email);

    // 🔐 Step 1: Check if record exists
    if (!record) {
      return res.status(400).json({ message: "OTP not found. Try again." });
    }

    // 🔐 Step 2: Ban check
    if (record.bannedUntil && record.bannedUntil > new Date()) {
      return res.status(403).json({ message: "You are temporarily banned due to repeated failed attempts. Try later." });
    }

    // 🔐 Step 3: Expiry check
    if (record.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    // 🔐 Step 4: Match OTP (Safe comparison)
    if (record.otp !== String(otp).trim()) {
      record.failedAttempts += 1;

      if (record.failedAttempts >= 5) {
        record.bannedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await record.save();
        return res.status(403).json({ message: "Too many failed attempts. You are temporarily banned." });
      }

      await record.save();
      return res.status(400).json({ message: "Incorrect OTP. Try again." });
    }

    //  OTP correct

    await Otp.deleteOne({ otp }); // remove OTP after success

    res.status(200).json({ message: "OTP verified successfully" });
    await ResetRequest.create({ email: record.email });
    console.log(record.email);
  } catch (err) {
    console.error("Error in verifyForgetOtp:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required." });
    }

    // ✅ Step 1: Check if ResetRequest entry exists
    const resetEntry = await ResetRequest.findOne({ email });

    if (!resetEntry) {
      return res.status(403).json({ message: "Unauthorized request. Please verify OTP first." });
    }

    // ✅ Step 2: Update password
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist." });
    }

    user.password = newPassword;
    await user.save();

    // ✅ Step 3: Delete ResetRequest entry
    await ResetRequest.deleteOne({ email });

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error while resetting password." });
  }
};
