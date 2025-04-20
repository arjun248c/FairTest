const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate users using JWT
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is valid, but user not found' });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Middleware to check if user is an admin
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, admin privileges required' });
  }
};

/**
 * Middleware to check if user is an examiner
 */
const examiner = (req, res, next) => {
  if (req.user && (req.user.role === 'examiner' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, examiner privileges required' });
  }
};

module.exports = { auth, admin, examiner };
