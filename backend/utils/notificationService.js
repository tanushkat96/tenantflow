const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmailNotification } = require('./emailService');
const { emitToUser } = require('../config/socket');

// Create notification and emit real-time event
const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    const populatedNotification = await Notification.findById(notification._id)
      .populate('actionBy', 'firstName lastName email avatar')
      .populate('userId', 'firstName lastName email notificationSettings');

    // Emit real-time notification
    emitToUser(notificationData.userId, 'new-notification', populatedNotification);

    // Send email if user has email notifications enabled
    const user = await User.findById(notificationData.userId);
    if (user && shouldSendEmail(user, notificationData.type)) {
      await sendEmailNotification({
        to: user.email,
        type: notificationData.type,
        data: {
          userName: `${user.firstName} ${user.lastName}`,
          ...notificationData,
        },
      });
      
      notification.emailSent = true;
      await notification.save();
    }

    return populatedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Check if email should be sent based on user preferences
const shouldSendEmail = (user, notificationType) => {
  if (!user.notificationSettings || !user.notificationSettings.emailNotifications) {
    return false;
  }

  const typeMap = {
    task_assigned: 'taskAssigned',
    task_completed: 'taskCompleted',
    task_status_changed: 'taskStatusChanged',
    project_updated: 'projectUpdates',
    team_invite: 'teamInvites',
  };

  const settingKey = typeMap[notificationType];
  return settingKey ? user.notificationSettings[settingKey] : false;
};

// Notify task assigned
const notifyTaskAssigned = async ({ task, assignedTo, assignedBy }) => {
  return await createNotification({
    tenantId: task.tenantId,
    userId: assignedTo,
    type: 'task_assigned',
    title: 'New Task Assigned',
    message: `You have been assigned to "${task.title}"`,
    relatedTo: 'task',
    relatedId: task._id,
    actionBy: assignedBy,
  });
};

// Notify task completed
const notifyTaskCompleted = async ({ task, completedBy }) => {
  if (task.createdBy.toString() !== completedBy.toString()) {
    return await createNotification({
      tenantId: task.tenantId,
      userId: task.createdBy,
      type: 'task_completed',
      title: 'Task Completed',
      message: `"${task.title}" has been marked as completed`,
      relatedTo: 'task',
      relatedId: task._id,
      actionBy: completedBy,
    });
  }
};

// Notify task status changed
const notifyTaskStatusChanged = async ({ task, assignees, changedBy, oldStatus, newStatus }) => {
  const notifications = [];

  // Build a set of already-notified user IDs to avoid duplicates
  const notifiedIds = new Set();

  // Notify assignees (excluding the person who made the change)
  for (const assigneeId of assignees) {
    const idStr = assigneeId.toString();
    if (idStr !== changedBy.toString()) {
      const notification = await createNotification({
        tenantId: task.tenantId,
        userId: assigneeId,
        type: 'task_status_changed',
        title: 'Task Status Updated',
        message: `"${task.title}" moved from ${oldStatus} to ${newStatus}`,
        relatedTo: 'task',
        relatedId: task._id,
        actionBy: changedBy,
      });
      notifications.push(notification);
      notifiedIds.add(idStr);
    }
  }

  // Also notify all admins and owners in the tenant
  const adminsAndOwners = await User.find({
    tenantId: task.tenantId,
    role: { $in: ['admin', 'owner'] },
  }).select('_id');

  for (const user of adminsAndOwners) {
    const idStr = user._id.toString();
    // Skip if already notified or if they are the one who changed the status
    if (idStr === changedBy.toString() || notifiedIds.has(idStr)) continue;

    const notification = await createNotification({
      tenantId: task.tenantId,
      userId: user._id,
      type: 'task_status_changed',
      title: 'Task Status Updated',
      message: `"${task.title}" moved from ${oldStatus} to ${newStatus}`,
      relatedTo: 'task',
      relatedId: task._id,
      actionBy: changedBy,
    });
    notifications.push(notification);
    notifiedIds.add(idStr);
  }

  return notifications;
};

// Notify project updated
const notifyProjectUpdated = async ({ project, members, updatedBy }) => {
  const notifications = [];
  
  for (const member of members) {
    if (member.userId.toString() !== updatedBy.toString()) {
      const notification = await createNotification({
        tenantId: project.tenantId,
        userId: member.userId,
        type: 'project_updated',
        title: 'Project Updated',
        message: `"${project.name}" has been updated`,
        relatedTo: 'project',
        relatedId: project._id,
        actionBy: updatedBy,
      });
      notifications.push(notification);
    }
  }
  
  return notifications;
};

module.exports = {
  createNotification,
  notifyTaskAssigned,
  notifyTaskCompleted,
  notifyTaskStatusChanged,
  notifyProjectUpdated,
};