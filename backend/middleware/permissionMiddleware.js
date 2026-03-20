const Task = require('../models/Task');
const Project = require('../models/Project');

// Check if user can assign tasks
exports.canAssignTasks = (req, res, next) => {
  const userRole = req.user.role;
  
  if (userRole === 'owner' || userRole === 'admin') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Only Owners and Admins can assign tasks',
  });
};

// Check if user can update a specific task
exports.canUpdateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const userId = req.user._id.toString();
    const userRole = req.user.role;

    // Owner and Admin can update any task
    if (userRole === 'owner' || userRole === 'admin') {
      req.task = task; // Attach task to request
      return next();
    }

    // Check if user is assigned to this task
    const isAssigned = task.assignedTo.some(
      assignee => assignee.toString() === userId
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You can only update tasks assigned to you',
      });
    }

    req.task = task; // Attach task to request
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking task permissions',
      error: error.message,
    });
  }
};

// Check if user can view a project
exports.canViewProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const userId = req.user._id.toString();
    const userRole = req.user.role;

    // Owner and Admin can view all projects
    if (userRole === 'owner' || userRole === 'admin') {
      req.project = project;
      return next();
    }

    // Check if user is a member of this project
    const isMember = project.members.some(
      member => member.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project',
      });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking project permissions',
      error: error.message,
    });
  }
};

// Validate assignees (prevent assigning to owner)
exports.validateAssignees = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo || assignedTo.length === 0) {
      return next();
    }

    const User = require('../models/User');
    
    // Convert to array if single value
    const assigneeIds = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

    // Check each assignee
    for (const assigneeId of assigneeIds) {
      const assignee = await User.findById(assigneeId);
      
      if (!assignee) {
        return res.status(404).json({
          success: false,
          message: `User ${assigneeId} not found`,
        });
      }

      // ✅ OWNER PROTECTION: Cannot assign tasks to owner
      if (assignee.role === 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Tasks cannot be assigned to the organization owner',
        });
      }

      // Verify assignee is in same tenant
      if (assignee.tenantId.toString() !== req.user.tenantId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Cannot assign tasks to users outside your organization',
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error validating assignees',
      error: error.message,
    });
  }
};