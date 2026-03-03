const User = require('../models/User');
const Tenant = require('../models/Tenant');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId, tenantId) => {
  return jwt.sign(
    { userId, tenantId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Register new user and tenant
exports.register = async (req, res) => {
  try {
    const { organizationName, subdomain, firstName, lastName, email, password } = req.body;

    // Check if subdomain already exists
    const existingTenant = await Tenant.findOne({ subdomain });
    if (existingTenant) {
      return res.status(400).json({
        success: false,
        message: 'Subdomain already taken'
      });
    }

    // Create tenant
    const tenant = await Tenant.create({
      name: organizationName,
      subdomain,
    });

    // Create user (owner)
    const user = await User.create({
      tenantId: tenant._id,
      email,
      password,
      firstName,
      lastName,
      role: 'owner',
      emailVerified: true, // Auto-verify for now
    });

    // Generate token
    const token = generateToken(user._id, tenant._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tenant: {
          id: tenant._id,
          name: tenant.name,
          subdomain: tenant.subdomain,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password, subdomain } = req.body;

    // Find tenant
    const tenant = await Tenant.findOne({ subdomain });
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Find user with password field
    const user = await User.findOne({ 
      tenantId: tenant._id, 
      email 
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, tenant._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tenant: {
          id: tenant._id,
          name: tenant.name,
          subdomain: tenant.subdomain,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('tenantId', 'name subdomain');

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message,
    });
  }
};