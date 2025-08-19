// Core Modules
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const cors = require('cors');

// Import Routes
const userRoutes = require('./routes/userRoutes1234');
const itemRoutes = require('./routes/itemRoutes');
const authMiddleware = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(cors({
  origin: 'https://shop-store-1-z2v0.onrender.com',

  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/item', itemRoutes);
// Protected Dashboard Route
app.get('/dashboard', authMiddleware, (req, res) => {
  res.send(`Welcome to the Dashboard, ${req.user.username}!`);
});
app.get('/item', authMiddleware, (req, res) => {
  res.send(`Welcome to the Item Page, ${req.user.username}!`);
});
app.get('/history', authMiddleware, (req, res) => {
  res.send(`Welcome to the History Page, ${req.user.username}!`);
});
app.get('/add-history', authMiddleware, (req, res) => {
  res.send(`Welcome to the Add History Page, ${req.user.username}!`);
});
// Login Page Route
app.get('/login', (req, res) => {
  res.send('Please login first.');
});

// Start server
const PORT = process.env.PORT || 5080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
