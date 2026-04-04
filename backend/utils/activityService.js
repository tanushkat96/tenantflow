const ActivityLog = require('../models/ActivityLog');

exports.logActivity = async ({
  taskId, projectId, tenantId, userId,
  type, description, changes,
}) => {
  try {
    await ActivityLog.create({
      taskId, projectId, tenantId, userId,
      type, description, changes,
    });
  } catch (error) {
    // Log silently — never block main operations
    console.error('Activity log error:', error);
  }
};