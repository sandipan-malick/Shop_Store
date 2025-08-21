const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from cookies (primary) or Authorization header
    const authHeader = req.get('Authorization');
    const token = req.cookies?.token || authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = decoded; // decoded can be { userId } from your login JWT

    next();
  } catch (err) {
    console.error('Invalid token:', err.message);

    // Clear cookie (must match cookie options exactly)
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
    });

    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
