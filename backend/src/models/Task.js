const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed'],
    default: 'todo',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    required: true
  },
  category: {
    type: String,
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        // Allow null/undefined dates, and only validate if date is provided
        if (!value) return true;
        // Allow any valid date (remove past date restriction for now)
        return value instanceof Date && !isNaN(value);
      },
      message: 'Due date must be a valid date'
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  completedAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  isActive: {
    type: Boolean,
    default: false // true when timer is running
  },
  assignee: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

// Virtual for time remaining
taskSchema.virtual('timeRemaining').get(function() {
  if (!this.dueDate || this.status === 'completed') return null;
  
  const now = new Date();
  const diff = this.dueDate - now;
  
  if (diff < 0) return 'overdue';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return 'less than 1 hour';
});

// Virtual for current session time (if task is active)
taskSchema.virtual('currentSessionTime').get(function() {
  if (!this.isActive || !this.startedAt) return 0;
  
  const now = new Date();
  const sessionTime = Math.floor((now - this.startedAt) / (1000 * 60)); // in minutes
  return sessionTime;
});

// Virtual for total time formatted
taskSchema.virtual('totalTimeFormatted').get(function() {
  const total = this.timeSpent + (this.currentSessionTime || 0);
  if (total === 0) return 'No time logged';
  
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Index for efficient queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, dueDate: 1 });

// Middleware to handle timing and completion
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed') {
      // When completing a task
      if (!this.completedAt) {
        this.completedAt = new Date();
      }
      
      // If task was active, stop the timer and add session time
      if (this.isActive && this.startedAt) {
        const sessionTime = Math.floor((new Date() - this.startedAt) / (1000 * 60));
        this.timeSpent += sessionTime;
        this.isActive = false;
        this.startedAt = undefined;
      }
    } else if (this.status === 'in-progress') {
      // When starting progress
      if (!this.isActive) {
        this.startedAt = new Date();
        this.isActive = true;
      }
      this.completedAt = undefined;
    } else {
      // When setting to todo or other status
      if (this.isActive && this.startedAt) {
        const sessionTime = Math.floor((new Date() - this.startedAt) / (1000 * 60));
        this.timeSpent += sessionTime;
      }
      this.isActive = false;
      this.startedAt = undefined;
      this.completedAt = undefined;
    }
  }
  next();
});

// Static methods for common queries
taskSchema.statics.findByUser = function(userId, filters = {}) {
  const query = { userId };
  
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.category) query.category = filters.category;
  
  return this.find(query).sort({ createdAt: -1 });
};

taskSchema.statics.getTaskStats = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Task', taskSchema);
