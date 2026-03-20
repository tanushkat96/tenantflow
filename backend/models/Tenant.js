const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
  },
  subdomain: {
    type: String,
    required: [true, 'Subdomain is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
   description: {  // ← ADD THIS
      type: String,
      trim: true,
    },
  plan: {
    type: String,
    enum: ['free', 'professional', 'enterprise'],
    default: 'free',
  },
  settings: {
    logo: String,
    primaryColor: {
      type: String,
      default: '#0891B2',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Tenant', tenantSchema);