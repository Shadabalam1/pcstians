// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

exports.protect = async (req, res, next) => {
  let token;

  // Header se token nikalein (Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // "Bearer " hata kar sirf token lenge
      token = req.headers.authorization.split(' ')[1];

      // Token ko verify karein
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Admin ko dhundhein (password hash ko chhod kar)
      req.admin = await Admin.findById(decoded.id).select('-passwordHash');
      
      next(); // Agar sab sahi hai, toh aage badhein
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed or invalid' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
