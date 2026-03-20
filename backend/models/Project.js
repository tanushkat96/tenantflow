const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'completed'],
      default: 'active',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // ✅ CORRECTED: Members with role structure
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['admin', 'member', 'viewer'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // ✅ Auto-calculated progress
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Method to calculate project progress
projectSchema.methods.calculateProgress = async function () {
  const Task = mongoose.model('Task');

  const tasks = await Task.find({ projectId: this._id });

  if (tasks.length === 0) {
    this.progress = 0;
    return 0;
  }

  const completedTasks = tasks.filter((task) => task.status === 'done').length;
  this.progress = Math.round((completedTasks / tasks.length) * 100);

  return this.progress;
};

// ✅ Compound index for tenant + key uniqueness
projectSchema.index({ tenantId: 1, key: 1 }, { unique: true });

// ✅ Index for filtering by members
projectSchema.index({ 'members.userId': 1 });

// ✅ Index for owner
projectSchema.index({ owner: 1 });

module.exports = mongoose.model('Project', projectSchema);