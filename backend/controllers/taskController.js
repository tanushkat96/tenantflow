const Task = require('../models/Task');
const Project = require('../models/Project');

// Get all tasks (with filters)
exports.getAllTasks = async (req, res) => {
  try {
    const { projectId, status, assignee, priority } = req.query;

    // Build query
    const query = { tenantId: req.user.tenantId };
    
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (assignee) query.assignee = assignee;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
      .populate('assignee', 'firstName lastName email avatar')
      .populate('reporter', 'firstName lastName email')
      .populate('projectId', 'name key color')
      .sort({ position: 1, createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
};

// Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    })
      .populate('assignee', 'firstName lastName email avatar')
      .populate('reporter', 'firstName lastName email avatar')
      .populate('projectId', 'name key color');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
};

// Create task
exports.createTask = async (req, res) => {
  try {
    const { projectId, title, description, status, priority, assignee, dueDate, labels } = req.body;

    // Verify project exists and user has access
    const project = await Project.findOne({
      _id: projectId,
      tenantId: req.user.tenantId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const task = await Task.create({
      tenantId: req.user.tenantId,
      projectId,
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      assignee,
      reporter: req.user.userId,
      dueDate,
      labels: labels || []
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'firstName lastName email avatar')
      .populate('reporter', 'firstName lastName email avatar')
      .populate('projectId', 'name key color');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const updates = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId
      },
      updates,
      { new: true, runValidators: true }
    )
      .populate('assignee', 'firstName lastName email avatar')
      .populate('reporter', 'firstName lastName email avatar')
      .populate('projectId', 'name key color');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
};

// Update task status (for drag-drop)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, position } = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId
      },
      { status, position },
      { new: true }
    )
      .populate('assignee', 'firstName lastName email avatar')
      .populate('projectId', 'name key color');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status',
      error: error.message
    });
  }
};