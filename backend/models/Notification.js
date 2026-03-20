const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'task_completed',
        'task_status_changed',
        'project_updated',
        'team_invite',
        'mention',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedTo: {
      type: String,
      enum: ['task', 'project', 'team', 'comment'],
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
