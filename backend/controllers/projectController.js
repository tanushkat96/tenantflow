const Project = require('../models/Project');
const User = require('../models/User');

// Get all projects for a tenant
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 
      tenantId: req.user.tenantId 
    })
      .populate('owner', 'firstName lastName email')
      .populate('members.userId', 'firstName lastName email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    })
      .populate('owner', 'firstName lastName email')
      .populate('members.userId', 'firstName lastName email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
};

// Create new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, key, color } = req.body;

    // Check if project key already exists for this tenant
    const existingProject = await Project.findOne({
      tenantId: req.user.tenantId,
      key: key.toUpperCase()
    });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'Project key already exists'
      });
    }

    const project = await Project.create({
      tenantId: req.user.tenantId,
      name,
      description,
      key: key.toUpperCase(),
      color: color || '#3B82F6',
      owner: req.user.userId,
      members: [{
        userId: req.user.userId,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'firstName lastName email')
      .populate('members.userId', 'firstName lastName email avatar');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: populatedProject
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { name, description, color, status } = req.body;

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId
      },
      {
        name,
        description,
        color,
        status
      },
      { new: true, runValidators: true }
    )
      .populate('owner', 'firstName lastName email')
      .populate('members.userId', 'firstName lastName email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
};

// Add member to project
exports.addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;

    // Verify user exists and belongs to same tenant
    const user = await User.findOne({
      _id: userId,
      tenantId: req.user.tenantId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is already a member
    const existingMember = project.members.find(
      m => m.userId.toString() === userId
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member'
      });
    }

    project.members.push({
      userId,
      role: role || 'member',
      joinedAt: new Date()
    });

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'firstName lastName email')
      .populate('members.userId', 'firstName lastName email avatar');

    res.json({
      success: true,
      message: 'Member added successfully',
      data: populatedProject
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add member',
      error: error.message
    });
  }
};

// Remove member from project
exports.removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const project = await Project.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project.members = project.members.filter(
      m => m.userId.toString() !== memberId
    );

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'firstName lastName email')
      .populate('members.userId', 'firstName lastName email avatar');

    res.json({
      success: true,
      message: 'Member removed successfully',
      data: populatedProject
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member',
      error: error.message
    });
  }
};