const Tenant = require('../models/Tenant');
const User = require('../models/User');

// @desc    Get organization settings
// @route   GET /api/settings/organization
// @access  Private
exports.getOrganization = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Get member count
    const memberCount = await User.countDocuments({
      tenantId: tenant._id,
      isActive: true,
    });

    res.json({
      success: true,
      data: {
        _id: tenant._id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        description: tenant.description,
        plan: tenant.plan,
        memberCount,
        createdAt: tenant.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching organization',
      error: error.message,
    });
  }
};

// @desc    Update organization settings
// @route   PUT /api/settings/organization
// @access  Private (Owner only)
exports.updateOrganization = async (req, res) => {
  try {
    // Check if user is owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only organization owners can update settings',
      });
    }

    const { name, description } = req.body;

    const tenant = await Tenant.findById(req.user.tenantId);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Update fields
    tenant.name = name || tenant.name;
    tenant.description = description;

    await tenant.save();

    res.json({
      success: true,
      data: tenant,
      message: 'Organization updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating organization',
      error: error.message,
    });
  }
};

// @desc    Delete organization
// @route   DELETE /api/settings/organization
// @access  Private (Owner only)
exports.deleteOrganization = async (req, res) => {
  try {
    // Check if user is owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only organization owners can delete the organization',
      });
    }

    const tenant = await Tenant.findById(req.user.tenantId);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Delete all users in tenant
    await User.deleteMany({ tenantId: tenant._id });

    // Delete tenant
    await Tenant.findByIdAndDelete(tenant._id);

    res.json({
      success: true,
      message: 'Organization deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting organization',
      error: error.message,
    });
  }
};

// @desc    Get notification settings
// @route   GET /api/settings/notifications
// @access  Private
exports.getNotificationSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user.notificationSettings || {
        emailNotifications: true,
        taskAssigned: true,
        taskCompleted: true,
        projectUpdates: true,
        teamInvites: true,
        weeklyDigest: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notification settings',
      error: error.message,
    });
  }
};

// @desc    Update notification settings
// @route   PUT /api/settings/notifications
// @access  Private
exports.updateNotificationSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.notificationSettings = req.body;
    await user.save();

    res.json({
      success: true,
      data: user.notificationSettings,
      message: 'Notification settings updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification settings',
      error: error.message,
    });
  }
};