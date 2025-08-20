// Core Modules
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
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

// Middleware
app.use(cors({
  origin: 'https://shop-store-data.netlify.app', // your frontend URL
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/item', itemRoutes);

// Protected routes
app.get('/dashboard', authMiddleware, (req, res) => res.send(`Welcome to Dashboard, ${req.user.username}`));
app.get('/item', authMiddleware, (req, res) => res.send(`Welcome to Item, ${req.user.username}`));
app.get('/history', authMiddleware, (req, res) => res.send(`Welcome to History, ${req.user.username}`));
app.get('/add-history', authMiddleware, (req, res) => res.send(`Welcome to Add History, ${req.user.username}`));

// Login fallback
app.get('/login', (req, res) => res.send('Please login first.'));

const PORT = process.env.PORT || 5080;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
