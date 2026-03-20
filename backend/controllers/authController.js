const User = require("../models/User");
const Tenant = require("../models/Tenant");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

// Generate JWT Token
const generateToken = (userId, tenantId) => {
  return jwt.sign({ userId, tenantId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register new user and tenant
exports.register = async (req, res) => {
  try {
    const {
      organizationName,
      subdomain,
      firstName,
      lastName,
      email,
      password,
    } = req.body;

    // Check if subdomain already exists
    const existingTenant = await Tenant.findOne({ subdomain });
    if (existingTenant) {
      return res.status(400).json({
        success: false,
        message: "Subdomain already taken",
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
      role: "owner",
      emailVerified: true, // Auto-verify for now
    });

    // Generate token
    const token = generateToken(user._id, tenant._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
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
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
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
        message: "Organization not found",
      });
    }

    // Find user with password field
    const user = await User.findOne({
      tenantId: tenant._id,
      email,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, tenant._id);

    res.json({
      success: true,
      message: "Login successful",
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
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate("tenantId", "name subdomain");

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

// @desc    Upload avatar
// @route   POST /api/auth/upload-avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, "..", user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Save new avatar path
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarPath;
    await user.save();

    res.json({
      success: true,
      data: {
        avatar: avatarPath,
      },
      message: "Avatar uploaded successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error uploading avatar",
      error: error.message,
    });
  }
};

// @desc    Remove avatar
// @route   DELETE /api/auth/avatar
// @access  Private
exports.removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete avatar file if exists
    if (user.avatar) {
      const avatarPath = path.join(__dirname, "..", user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    user.avatar = null;
    await user.save();

    res.json({
      success: true,
      message: "Avatar removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing avatar",
      error: error.message,
    });
  }
};

// @desc    Get organization details
// @route   GET /api/auth/organization
// @access  Private
exports.getOrganization = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    res.json({
      success: true,
      data: {
        _id: tenant._id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        plan: tenant.plan,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching organization",
      error: error.message,
    });
  }
};
