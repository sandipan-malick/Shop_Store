// Core Modules
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');

// Import Routes
const userRoutes = require('./routes/userRoutes1234');
const itemRoutes = require('./routes/itemRoutes');
const authMiddleware = require('./middleware/authMiddleware');

// Load environment variables FIRST
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB with better error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds timeout
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.log('Please check your MONGODB_URI and whitelist IP in MongoDB Atlas');
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://shop-store-data.netlify.app',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Debug: Check if MONGODB_URI is loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'Missing');

// Session middleware with MongoDB storage - FIXED
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'fallback-secret-key-for-development',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI, // This must be defined
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // 1 day in seconds
  }),
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

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    database: dbStatus,
    mongodb_uri: process.env.MONGODB_URI ? 'configured' : 'missing'
  });
});

// Test endpoint to check session
app.get('/test-session', (req, res) => {
  req.session.test = 'Session is working!';
  res.json({ message: 'Session test', session: req.session });
});

// Protected routes
app.get('/dashboard', authMiddleware, (req, res) => res.send(`Welcome to Dashboard, ${req.user.username}`));
app.get('/item', authMiddleware, (req, res) => res.send(`Welcome to Item, ${req.user.username}`));
app.get('/history', authMiddleware, (req, res) => res.send(`Welcome to History, ${req.user.username}`));
app.get('/add-history', authMiddleware, (req, res) => res.send(`Welcome to Add History, ${req.user.username}`));

// Login fallback
app.get('/login', (req, res) => res.send('Please login first.'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5080;
// Bind to 0.0.0.0 for Render deployment
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});