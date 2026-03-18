const User = require("../models/User");
const Invitation = require("../models/Invitation");
const crypto = require("crypto");
const Tenant = require('../models/Tenant');
const { sendInvitationEmail } = require('../utils/emailService');



// @desc    Get all users in tenant
// @route   GET /api/users
// @access  Private
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      tenantId: req.user.tenantId,
      isActive: true,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// @desc    Get pending invitations for tenant
// @route   GET /api/users/invitations/pending
// @access  Private
exports.getPendingInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      tenantId: req.user.tenantId,
      status: "pending",
    })
      .populate("invitedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching invitations",
      error: error.message,
    });
  }
};


// @desc    Invite a new user
// @route   POST /api/users/invite
// @access  Private (Owner/Admin)
exports.inviteUser = async (req, res) => {
  try {
    const { email, role } = req.body;

    // Check if user has permission to invite
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only owners and admins can invite users',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      tenantId: req.user.tenantId,
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists in your organization',
      });
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      tenantId: req.user.tenantId,
      email,
      status: 'pending',
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'Invitation already sent to this email',
      });
    }

    // Get tenant information
    const tenant = await Tenant.findById(req.user.tenantId);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const invitation = await Invitation.create({
      tenantId: req.user.tenantId,
      email,
      role,
      invitedBy: req.user._id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // ✅ SEND EMAIL
    try {
      await sendInvitationEmail({
        toEmail: email,
        inviterName: `${req.user.firstName} ${req.user.lastName}`,
        organizationName: tenant.name,
        role: role,
        inviteToken: token,
        subdomain: tenant.subdomain,
      });

      res.status(201).json({
        success: true,
        data: invitation,
        message: 'Invitation sent successfully via email',
      });
    } catch (emailError) {
      // Delete invitation if email fails
      await Invitation.findByIdAndDelete(invitation._id);
      
      throw new Error(`Failed to send email: ${emailError.message}`);
    }
  } catch (error) {
    console.error('Error in inviteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating invitation',
      error: error.message,
    });
  }
};
// @desc    Get invitation by token
// @route   GET /api/users/invitation/:token
// @access  Public
exports.getInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    console.log(
      "getInvitation called with token:",
      token.substring(0, 10) + "...",
    );

    const invitation = await Invitation.findOne({ token })
      .populate("tenantId", "name subdomain")
      .populate("invitedBy", "firstName lastName email");

    if (!invitation) {
      console.log("Invitation not found");
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    console.log("Invitation found:", {
      email: invitation.email,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      now: new Date(),
      expired: new Date() > invitation.expiresAt,
    });

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      console.log("Invitation is expired");
      invitation.status = "expired";
      await invitation.save();

      return res.status(400).json({
        success: false,
        message: "Invitation has expired",
      });
    }

    // Check if already accepted
    if (invitation.status === "accepted") {
      console.log("Invitation already accepted");
      return res.status(400).json({
        success: false,
        message: "Invitation already accepted",
      });
    }

    res.json({
      success: true,
      data: invitation,
    });
  } catch (error) {
    console.error("Error in getInvitation:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching invitation",
      error: error.message,
    });
  }
};

// @desc    Accept invitation and create account
// @route   POST /api/users/invitation/accept
// @access  Public
exports.acceptInvitation = async (req, res) => {
  try {
    const { token, firstName, lastName, password } = req.body;

    console.log("acceptInvitation called with token:", token);

    // Find invitation
    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      console.log("Invitation not found for token:", token);
      return res.status(404).json({
        success: false,
        message: "Invalid invitation",
      });
    }

    console.log("Found invitation:", invitation);

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      console.log("Invitation expired");
      return res.status(400).json({
        success: false,
        message: "Invitation has expired",
      });
    }

    // Check if already accepted
    if (invitation.status === "accepted") {
      console.log("Invitation already accepted");
      return res.status(400).json({
        success: false,
        message: "Invitation already accepted",
      });
    }

    console.log("Creating user with data:", {
      tenantId: invitation.tenantId,
      email: invitation.email,
      firstName,
      lastName,
      role: invitation.role,
    });

    // Create user
    const user = await User.create({
      tenantId: invitation.tenantId,
      email: invitation.email,
      firstName,
      lastName,
      password,
      role: invitation.role,
    });

    console.log("User created successfully:", user._id);

    // Update invitation status
    invitation.status = "accepted";
    await invitation.save();

    console.log("Invitation updated to accepted");

    // Generate token
    const jwtToken = user.generateToken(invitation.tenantId);

    console.log("JWT token generated");

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
        token: jwtToken,
      },
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Error in acceptInvitation:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({
      success: false,
      message: "Error accepting invitation",
      error: error.message,
    });
  }
};

// @desc    Update user role
// @route   PATCH /api/users/:userId/role
// @access  Private (Owner/Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Check permissions
    if (req.user.role !== "owner" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only owners and admins can update roles",
      });
    }

    // Find user
    const user = await User.findOne({
      _id: userId,
      tenantId: req.user.tenantId,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent changing owner role
    if (user.role === "owner") {
      return res.status(403).json({
        success: false,
        message: "Cannot change owner role",
      });
    }

    // Admins cannot promote to owner
    if (req.user.role === "admin" && role === "owner") {
      return res.status(403).json({
        success: false,
        message: "Only owners can assign owner role",
      });
    }

    // Update role
    user.role = role;
    await user.save();

    res.json({
      success: true,
      data: user,
      message: "Role updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating role",
      error: error.message,
    });
  }
};

// @desc    Remove user from tenant
// @route   DELETE /api/users/:userId
// @access  Private (Owner/Admin)
exports.removeUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check permissions
    if (req.user.role !== "owner" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only owners and admins can remove users",
      });
    }

    // Find user
    const user = await User.findOne({
      _id: userId,
      tenantId: req.user.tenantId,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent removing owner
    if (user.role === "owner") {
      return res.status(403).json({
        success: false,
        message: "Cannot remove owner",
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: "User removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing user",
      error: error.message,
    });
  }
};

// @desc    Cancel invitation
// @route   DELETE /api/users/invitations/:invitationId
// @access  Private (Owner/Admin)
exports.cancelInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    console.log("cancelInvitation called with ID:", invitationId);

    // Check permissions
    if (req.user.role !== "owner" && req.user.role !== "admin") {
      console.log("User role denied:", req.user.role);
      return res.status(403).json({
        success: false,
        message: "Only owners and admins can cancel invitations",
      });
    }

    // Find invitation
    const invitation = await Invitation.findOne({
      _id: invitationId,
      tenantId: req.user.tenantId,
    });

    if (!invitation) {
      console.log("Invitation not found:", invitationId);
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    console.log("Found invitation:", {
      email: invitation.email,
      status: invitation.status,
    });

    // Check if already accepted
    if (invitation.status === "accepted") {
      console.log("Cannot cancel accepted invitation");
      return res.status(400).json({
        success: false,
        message: "Cannot cancel accepted invitations",
      });
    }

    // Delete invitation
    await Invitation.findByIdAndDelete(invitationId);

    console.log("Invitation cancelled successfully");

    res.json({
      success: true,
      message: "Invitation cancelled successfully",
    });
  } catch (error) {
    console.error("Error in cancelInvitation:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling invitation",
      error: error.message,
    });
  }
};
