// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });

    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

const ownerOnly = (req, res, next) => {
  if (req.user?.role !== 'owner') return res.status(403).json({ message: 'Owner access only' });
  next();
};

module.exports = { protect, ownerOnly };