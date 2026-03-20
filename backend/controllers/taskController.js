const Task = require("../models/Task");
const Project = require("../models/Project");
const {
  notifyTaskAssigned,
  notifyTaskCompleted,
  notifyTaskStatusChanged,
} = require("../utils/notificationService");

// @desc    Get all tasks (filtered by project membership)
// @route   GET /api/tasks
// @access  Private
exports.getAllTasks = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    let tasks;

    if (userRole === "owner" || userRole === "admin") {
      // Owner/Admin can see all tasks in tenant
      tasks = await Task.find({ tenantId: req.user.tenantId })
        .populate("projectId", "name key color")
        .populate("assignedTo", "firstName lastName email role")
        .populate("createdBy", "firstName lastName email")
        .sort({ createdAt: -1 });
    } else {
      // Members/Viewers can only see tasks they're assigned to or created
      // OR tasks in projects they're members of
      const Project = require("../models/Project");
      const projects = await Project.find({
        tenantId: req.user.tenantId,
        "members.userId": userId,
      }).select("_id");

      const projectIds = projects.map((p) => p._id);

      tasks = await Task.find({
        tenantId: req.user.tenantId,
        $or: [
          { assignedTo: userId },
          { createdBy: userId },
          { projectId: { $in: projectIds } },
        ],
      })
        .populate("projectId", "name key color")
        .populate("assignedTo", "firstName lastName email role")
        .populate("createdBy", "firstName lastName email")
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assignedTo,
      labels,
    } = req.body;
    const userRole = req.user.role;

    // ✅ RULE 1: Only Admin/Owner can assign tasks
    if (assignedTo && assignedTo.length > 0) {
      if (userRole !== "owner" && userRole !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only Owners and Admins can assign tasks",
        });
      }
    }

    // Create task
    const task = await Task.create({
      tenantId: req.user.tenantId,
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assignedTo: Array.isArray(assignedTo)
        ? assignedTo
        : assignedTo
          ? [assignedTo]
          : [],
      labels,
      createdBy: req.user._id,
    });

    // ✅ Update project progress if task is in a project
    if (projectId) {
      const project = await Project.findById(projectId);
      if (project && project.calculateProgress) {
        await project.calculateProgress();
        await project.save();
      }
    }

    // ✅ Send notifications to all assignees
    if (assignedTo && assignedTo.length > 0) {
      const assignees = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

      for (const assigneeId of assignees) {
        await notifyTaskAssigned({
          task,
          assignedTo: assigneeId,
          assignedBy: req.user._id,
          tenantId: req.user.tenantId,
        });
      }
    }

    // Populate before sending response
    await task.populate("assignedTo", "firstName lastName email role");
    await task.populate("createdBy", "firstName lastName email");
    await task.populate("projectId", "name key color");

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating task",
      error: error.message,
    });
  }
};

// @desc    Update task status (for drag-drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    console.log('Updating task status:', {
      taskId: req.params.id,
      newStatus: status,
      userId: req.user._id,
      userRole: req.user.role,
    });

    const task = await Task.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!task) {
      console.log('Task not found');
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // ✅ Check if user can update this task
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    // ✅ Ensure assignedTo is an array
    const assignedToArray = Array.isArray(task.assignedTo) 
      ? task.assignedTo 
      : task.assignedTo 
      ? [task.assignedTo] 
      : [];

    const isAssigned = assignedToArray.some((a) => {
      const assigneeId = a._id ? a._id.toString() : a.toString();
      return assigneeId === userId;
    });

    console.log('Permission check:', {
      userRole,
      isAssigned,
      assignedTo: assignedToArray.length,
    });

    if (userRole !== 'owner' && userRole !== 'admin' && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You can only update tasks assigned to you',
      });
    }

    const oldStatus = task.status;
    task.status = status;
    task.updatedBy = req.user._id;
    await task.save();

    console.log('Task status updated:', { oldStatus, newStatus: status });

    // ✅ Update project progress
    if (task.projectId) {
      try {
        const Project = require('../models/Project');
        const project = await Project.findById(task.projectId);
        if (project && project.calculateProgress) {
          await project.calculateProgress();
          await project.save();
          console.log('Project progress updated');
        }
      } catch (progressError) {
        console.error('Error updating project progress:', progressError);
        // Don't fail the request if progress update fails
      }
    }

    // ✅ Send notification (wrapped in try-catch)
    try {
      const {
        notifyTaskCompleted,
        notifyTaskStatusChanged,
      } = require('../utils/notificationService');

      if (status === 'done') {
        await notifyTaskCompleted({
          task,
          completedBy: req.user._id,
          tenantId: req.user.tenantId,
        });
      } else if (oldStatus !== status) {
        await notifyTaskStatusChanged({
          task,
          oldStatus,
          newStatus: status,
          changedBy: req.user._id,
          tenantId: req.user.tenantId,
        });
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task status',
      error: error.message,
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Owner/Admin only)
exports.deleteTask = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== "owner" && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only Owners and Admins can delete tasks",
      });
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // ✅ Update project progress
    if (task.projectId) {
      const project = await Project.findById(task.projectId);
      if (project && project.calculateProgress) {
        await project.calculateProgress();
        await project.save();
      }
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting task",
      error: error.message,
    });
  }
};

// @desc    Update task status (for drag-drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // ✅ Check if user can update this task
    const userId = req.user._id.toString();
    const userRole = req.user.role;
    const isAssigned = task.assignedTo.some((a) => a.toString() === userId);

    if (userRole !== "owner" && userRole !== "admin" && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You can only update tasks assigned to you",
      });
    }

    const oldStatus = task.status;
    task.status = status;
    task.updatedBy = req.user._id;
    await task.save();

    // ✅ Update project progress
    if (task.projectId) {
      const project = await Project.findById(task.projectId);
      if (project && project.calculateProgress) {
        await project.calculateProgress();
        await project.save();
      }
    }

    // ✅ Send notification
    if (status === "done") {
      await notifyTaskCompleted({
        task,
        completedBy: req.user._id,
        tenantId: req.user.tenantId,
      });
    } else if (oldStatus !== status) {
      await notifyTaskStatusChanged(task, oldStatus, status, req.user);
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating task status",
      error: error.message,
    });
  }
};
