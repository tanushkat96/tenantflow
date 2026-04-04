const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    taskId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Task',    required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    tenantId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant',  required: true, index: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    type: {
      type: String,
      enum: [
        'created', 'updated', 'status_change', 'priority_change',
        'assigned', 'unassigned', 'due_date_set', 'comment_added',
        'tag_added', 'tag_removed', 'attachment', 'completed',
      ],
      required: true,
    },
    description: { type: String, required: true },
    changes: {
      field: String,
      from:  mongoose.Schema.Types.Mixed,
      to:    mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ taskId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);