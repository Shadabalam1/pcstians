// backend/controllers/authController.js
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new Admin (Sirf setup ke liye)
// @route   POST /api/auth/register
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check karein ki admin pehle se toh nahi hai
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    // Password ko hash (encrypt) karein
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Naya admin create karein
    const newAdmin = new Admin({
      name,
      email,
      passwordHash
    });

    await newAdmin.save();

    res.status(201).json({ success: true, message: 'Admin registered successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Login Admin
// @route   POST /api/auth/login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Admin ko email se dhundhein
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 2. Password match karein
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 3. JWT Token generate karein
    const token = jwt.sign(
      { id: admin._id, email: admin.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } // Token 7 din tak valid rahega
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};