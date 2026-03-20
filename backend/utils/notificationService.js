const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendEmailNotification } = require("./emailService"); // ✅ Correct import

// Create notification and optionally send email
const createNotification = async ({
  tenantId,
  userId,
  type,
  title,
  message,
  relatedTo,
  relatedId,
  actionBy,
  sendEmail = true,
}) => {
  try {
    // Create notification in database
    const notification = await Notification.create({
      tenantId,
      userId,
      type,
      title,
      message,
      relatedTo,
      relatedId,
      actionBy,
    });

    // Get user to check notification settings
    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found for notification");
      return notification;
    }

    // Check if user wants email notifications
    const settings = user.notificationSettings || {};
    const emailEnabled = settings.emailNotifications !== false;

    // Check type-specific settings
    let shouldSendEmail = emailEnabled && sendEmail;

    if (shouldSendEmail) {
      switch (type) {
        case "task_assigned":
          shouldSendEmail = settings.taskAssigned !== false;
          break;
        case "task_completed":
          shouldSendEmail = settings.taskCompleted !== false;
          break;
        case "project_updated":
          shouldSendEmail = settings.projectUpdates !== false;
          break;
        case "team_invite":
          shouldSendEmail = settings.teamInvites !== false;
          break;
        default:
          shouldSendEmail = true;
      }
    }

    // Send email if enabled
    if (shouldSendEmail) {
      try {
        // Get action user details if available
        let actionByUser = null;
        if (actionBy) {
          actionByUser = await User.findById(actionBy);
        }

        // ✅ Use correct function name
        await sendEmailNotification({
          toEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`,
          type,
          title,
          message,
          actionByName: actionByUser
            ? `${actionByUser.firstName} ${actionByUser.lastName}`
            : "Someone",
        });

        notification.emailSent = true;
        await notification.save();
      } catch (emailError) {
        console.error("Error sending notification email:", emailError);
        // Don't fail the notification if email fails
      }
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Notify task assignment
const notifyTaskAssigned = async ({
  task,
  assignedTo,
  assignedBy,
  tenantId,
}) => {
  try {
    return await createNotification({
      tenantId,
      userId: assignedTo,
      type: "task_assigned",
      title: "New Task Assigned",
      message: `You have been assigned to task: "${task.title}"`,
      relatedTo: "task",
      relatedId: task._id,
      actionBy: assignedBy,
    });
  } catch (error) {
    console.error("Error sending task assignment notification:", error);
  }
};

// Notify task completed
const notifyTaskCompleted = async ({ task, completedBy, tenantId }) => {
  try {
    // Notify task creator
    if (
      task.createdBy &&
      task.createdBy.toString() !== completedBy.toString()
    ) {
      return await createNotification({
        tenantId,
        userId: task.createdBy,
        type: "task_completed",
        title: "Task Completed",
        message: `Task "${task.title}" has been marked as completed`,
        relatedTo: "task",
        relatedId: task._id,
        actionBy: completedBy,
      });
    }
  } catch (error) {
    console.error("Error sending task completion notification:", error);
  }
};

// Notify task status change
const notifyTaskStatusChanged = async (
  task,
  oldStatus,
  newStatus,
  changedBy,
) => {
  try {
    // Notify assignees if different from person who changed it
    if (task.assignedTo && task.assignedTo.length > 0) {
      const notifications = [];
      const tenantId = task.tenantId;
      const changedById = changedBy._id || changedBy;

      for (const assigneeId of task.assignedTo) {
        if (assigneeId.toString() !== changedById.toString()) {
          notifications.push(
            createNotification({
              tenantId,
              userId: assigneeId,
              type: "task_status_changed",
              title: "Task Status Updated",
              message: `Task "${task.title}" status changed from ${oldStatus} to ${newStatus}`,
              relatedTo: "task",
              relatedId: task._id,
              actionBy: changedById,
            }),
          );
        }
      }

      return await Promise.all(notifications);
    }
  } catch (error) {
    console.error("Error sending task status change notification:", error);
  }
};

// Notify project update
const notifyProjectUpdated = async ({
  project,
  members,
  updatedBy,
  tenantId,
}) => {
  try {
    // Notify all project members except the person who updated
    const notifications = members
      .filter((memberId) => memberId.toString() !== updatedBy.toString())
      .map((memberId) =>
        createNotification({
          tenantId,
          userId: memberId,
          type: "project_updated",
          title: "Project Updated",
          message: `Project "${project.name}" has been updated`,
          relatedTo: "project",
          relatedId: project._id,
          actionBy: updatedBy,
        }),
      );

    return await Promise.all(notifications);
  } catch (error) {
    console.error("Error sending project update notification:", error);
  }
};

module.exports = {
  createNotification,
  notifyTaskAssigned,
  notifyTaskCompleted,
  notifyTaskStatusChanged,
  notifyProjectUpdated,
};
