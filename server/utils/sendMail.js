const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"ABC App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  // Add a try-catch for safer error handling
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}`, error);
    throw error; // Let the calling function handle it
  }
};

module.exports = sendEmail;
