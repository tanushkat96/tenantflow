const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    // Get counts
    const totalProjects = await Project.countDocuments({ 
      tenantId, 
      status: { $ne: 'archived' } 
    });

    const activeProjects = await Project.countDocuments({ 
      tenantId, 
      status: 'active' 
    });

    const totalTasks = await Task.countDocuments({ tenantId });

    const completedTasks = await Task.countDocuments({ 
      tenantId, 
      status: 'done' 
    });

    const todoTasks = await Task.countDocuments({ 
      tenantId, 
      status: 'todo' 
    });

    const inProgressTasks = await Task.countDocuments({ 
      tenantId, 
      status: 'inprogress' 
    });

    const totalMembers = await User.countDocuments({ 
      tenantId, 
      isActive: true 
    });

    // Calculate completion rate
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    // Get recent tasks
    const recentTasks = await Task.find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignee', 'firstName lastName email avatar')
      .populate('projectId', 'name key color');

    res.json({
      success: true,
      data: {
        overview: {
          totalProjects,
          activeProjects,
          totalTasks,
          completedTasks,
          todoTasks,
          inProgressTasks,
          totalMembers,
          completionRate
        },
        recentTasks
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};