const Task = require("../models/Task");
const Project = require("../models/Project");
const {
  notifyTaskAssigned,
  notifyTaskStatusChanged,
  notifyTaskCompleted,
} = require("../utils/notificationService");
const { emitToProject, emitToTenant } = require("../config/socket");

// Get All Tasks
exports.getAllTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const tenantId = req.user.tenantId;
    const userRole = req.user.role;
    const userId = req.user._id;

    let query = { tenantId };

    // Filter by project if provided
    if (projectId) {
      query.projectId = projectId;
    }

    // Non-admin/owner users can only see tasks assigned to them or created by them
    if (userRole !== "owner" && userRole !== "admin") {
      query.$or = [{ assignedTo: userId }, { createdBy: userId }];
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "firstName lastName email avatar")
      .populate("createdBy", "firstName lastName email avatar")
      .populate("updatedBy", "firstName lastName email avatar")
      .populate("projectId", "name key")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Get all tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

// Get Single Task
exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const task = await Task.findById(id)
      .populate("assignedTo", "firstName lastName email avatar")
      .populate("createdBy", "firstName lastName email avatar")
      .populate("updatedBy", "firstName lastName email avatar")
      .populate("projectId", "name key");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check permissions
    const isAssigned = task.assignedTo.some(
      (a) => a._id.toString() === userId.toString(),
    );
    const isCreator = task.createdBy._id.toString() === userId.toString();

    if (
      userRole !== "owner" &&
      userRole !== "admin" &&
      !isAssigned &&
      !isCreator
    ) {
      return res.status(403).json({
        message: "You do not have permission to view this task",
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch task",
      error: error.message,
    });
  }
};

// Create Task
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      assignedTo,
      dueDate,
      projectId,
    } = req.body;
    const userId = req.user._id;
    const tenantId = req.user.tenantId;
    const userRole = req.user.role;

    // Check assignment permissions
    if (assignedTo && assignedTo.length > 0) {
      if (userRole !== "owner" && userRole !== "admin") {
        return res.status(403).json({
          message: "Only Owners and Admins can assign tasks",
        });
      }
    }

    // Auto-assign the creator so they can update status on their own tasks
    let finalAssignees = assignedTo || [];
    if (userRole !== "owner" && userRole !== "admin") {
      // Members are always assigned to tasks they create
      if (!finalAssignees.some((id) => id.toString() === userId.toString())) {
        finalAssignees = [userId, ...finalAssignees];
      }
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || "medium",
      status: status || "todo",
      assignedTo: finalAssignees,
      dueDate,
      projectId,
      createdBy: userId,
      tenantId,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "firstName lastName email avatar")
      .populate("createdBy", "firstName lastName email avatar")
      .populate("projectId", "name key");

    // Send notifications to all assignees
    if (assignedTo && assignedTo.length > 0) {
      for (const assigneeId of assignedTo) {
        await notifyTaskAssigned({
          task: populatedTask,
          assignedTo: assigneeId,
          assignedBy: userId,
        });
      }
    }

    // Update project progress
    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        await project.calculateProgress();
        await project.save();
      }
    }

    // 📡 Emit real-time event to project
    if (projectId) {
      emitToProject(projectId, "task-created", populatedTask);
    }

    // 📡 Emit to tenant
    emitToTenant(tenantId, "task-created", populatedTask);

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

// Update Task Status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check permissions — allow assignees AND the task creator
    const isAssigned = task.assignedTo.some(
      (a) => a.toString() === userId.toString(),
    );
    const isCreator = task.createdBy.toString() === userId.toString();

    if (userRole !== "owner" && userRole !== "admin" && !isAssigned && !isCreator) {
      return res.status(403).json({
        message: "You can only update tasks assigned to or created by you",
      });
    }

    const oldStatus = task.status;
    task.status = status;
    task.updatedBy = userId;
    await task.save();

    const populatedTask = await Task.findById(id)
      .populate("assignedTo", "firstName lastName email avatar")
      .populate("createdBy", "firstName lastName email avatar")
      .populate("updatedBy", "firstName lastName email avatar")
      .populate("projectId", "name key");

    // Notify assignees about status change
    if (task.assignedTo && task.assignedTo.length > 0) {
      await notifyTaskStatusChanged({
        task: populatedTask,
        assignees: task.assignedTo,
        changedBy: userId,
        oldStatus,
        newStatus: status,
      });
    }

    // Notify creator if task is completed
    if (status === "done") {
      await notifyTaskCompleted({
        task: populatedTask,
        completedBy: userId,
      });
    }

    // Update project progress
    if (task.projectId) {
      const project = await Project.findById(task.projectId);
      if (project) {
        await project.calculateProgress();
        await project.save();

        // 📡 Emit project progress update
        emitToProject(task.projectId, "project-progress-updated", {
          projectId: task.projectId,
          progress: project.progress,
        });
      }
    }

    // 📡 Emit real-time status update
    if (task.projectId) {
      emitToProject(task.projectId, "task-status-updated", populatedTask);
    }
    emitToTenant(task.tenantId, "task-status-updated", populatedTask);

    res.json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error("Update task status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task status",
      error: error.message,
    });
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Allow owner, admin, or the task creator to delete
    const isCreator = task.createdBy.toString() === userId.toString();
    if (userRole !== "owner" && userRole !== "admin" && !isCreator) {
      return res.status(403).json({
        message: "Only Owners, Admins, or the task creator can delete tasks",
      });
    }

    const projectId = task.projectId;
    const tenantId = task.tenantId;

    await Task.findByIdAndDelete(id);

    // Update project progress
    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        await project.calculateProgress();
        await project.save();

        // 📡 Emit project progress update
        emitToProject(projectId, "project-progress-updated", {
          projectId,
          progress: project.progress,
        });
      }
    }

    // 📡 Emit task deleted event
    if (projectId) {
      emitToProject(projectId, "task-deleted", { taskId: id });
    }
    emitToTenant(tenantId, "task-deleted", { taskId: id });

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};

// Update Task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, assignedTo, dueDate } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check permissions - only owner, admin, or task creator can update
   const isCreator = task.createdBy.toString() === userId.toString();

const isAssigned = task.assignedTo.some(
  (a) => a.toString() === userId.toString()
);

if (
  userRole !== "owner" &&
  userRole !== "admin" &&
  !isCreator &&
  !isAssigned
) {
  return res.status(403).json({
    message:
      "Only assigned members, task creator, Owners, and Admins can update tasks",
  });
}

    // If reassigning, check permissions
   if (assignedTo) {
  const current = task.assignedTo.map((a) => a.toString());
  const incoming = assignedTo.map((a) => a.toString());

  const isSame =
    current.length === incoming.length &&
    current.every((id) => incoming.includes(id));

  if (!isSame && userRole !== "owner" && userRole !== "admin") {
    return res.status(403).json({
      message: "Only Owners and Admins can reassign tasks",
    });
  }
}

    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (status) task.status = status;  // ✅ Allow assigned members to update status via modal
    if (assignedTo) task.assignedTo = assignedTo;
    if (dueDate) task.dueDate = dueDate;
    task.updatedBy = userId;

    await task.save();

    const populatedTask = await Task.findById(id)
      .populate("assignedTo", "firstName lastName email avatar")
      .populate("createdBy", "firstName lastName email avatar")
      .populate("updatedBy", "firstName lastName email avatar")
      .populate("projectId", "name key");

    // 📡 Emit real-time update
    if (task.projectId) {
      emitToProject(task.projectId, "task-updated", populatedTask);
    }
    emitToTenant(task.tenantId, "task-updated", populatedTask);

    res.json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};
