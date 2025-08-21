const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Get token from cookies or Authorization header
  const authHeader = req.get("Authorization");
  const token = authHeader?.replace("Bearer ", "") || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, username }
    next();
  } catch (err) {
    console.error("Invalid token:", err.message);
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
