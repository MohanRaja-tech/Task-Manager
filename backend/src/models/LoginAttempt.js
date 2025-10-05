const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  success: {
    type: Boolean,
    required: true,
    default: false
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  loginMethod: {
    type: String,
    enum: ['email', 'google-signup', 'google-signin'],
    default: 'email'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  location: {
    country: String,
    city: String,
    region: String
  },
  deviceInfo: {
    browser: String,
    os: String,
    device: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
loginAttemptSchema.index({ createdAt: -1 });
loginAttemptSchema.index({ email: 1, createdAt: -1 });
loginAttemptSchema.index({ success: 1, createdAt: -1 });

// Static method to log login attempt
loginAttemptSchema.statics.logAttempt = async function(data) {
  try {
    const attempt = new this(data);
    await attempt.save();
    return attempt;
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
};

// Static method to get login statistics
loginAttemptSchema.statics.getStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        successfulLogins: { $sum: { $cond: ['$success', 1, 0] } },
        failedLogins: { $sum: { $cond: ['$success', 0, 1] } },
        uniqueUsers: { $addToSet: '$email' }
      }
    },
    {
      $project: {
        totalAttempts: 1,
        successfulLogins: 1,
        failedLogins: 1,
        uniqueUsersCount: { $size: '$uniqueUsers' },
        successRate: {
          $multiply: [
            { $divide: ['$successfulLogins', '$totalAttempts'] },
            100
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
