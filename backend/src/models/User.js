const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: function() {
      return !this.googleId; // Username is required only if not a Google user
    },
    unique: true,
    sparse: true, // Allow null values to be non-unique
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password is required only if not a Google user
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  // Google OAuth fields
  googleId: {
    type: String,
    sparse: true, // Allow null values to be non-unique
    unique: true
  },
  name: {
    type: String,
    trim: true
  },
  picture: {
    type: String
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt
});

// Hash password before saving (only for local auth users)
userSchema.pre('save', async function(next) {
  // Skip password hashing for Google users
  if (this.authProvider === 'google' || !this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Instance method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Virtual property for admin status
userSchema.virtual('isAdminUser').get(function() {
  return this.role === 'admin';
});

// Static method to find by email or username
userSchema.statics.findByCredentials = async function(identifier) {
  return await this.findOne({
    $or: [
      { email: identifier },
      { username: identifier }
    ]
  }).select('+password');
};

// Static method to find or create Google user
userSchema.statics.findOrCreateGoogleUser = async function(googleUserData) {
  try {
    // First, try to find existing user by Google ID
    let user = await this.findOne({ googleId: googleUserData.googleId });
    
    if (user) {
      // Update last login and return existing user
      await user.updateLastLogin();
      return user;
    }
    
    // Check if user exists with same email but different auth provider
    user = await this.findOne({ email: googleUserData.email });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = googleUserData.googleId;
      user.name = googleUserData.name;
      user.picture = googleUserData.picture;
      user.authProvider = 'google';
      await user.updateLastLogin();
      await user.save();
      return user;
    }
    
    // Create new user with Google data
    const newUser = await this.create({
      email: googleUserData.email,
      googleId: googleUserData.googleId,
      name: googleUserData.name,
      username: googleUserData.name.toLowerCase().replace(/\s+/g, '') + Math.random().toString(36).substr(2, 5),
      picture: googleUserData.picture,
      authProvider: 'google',
      lastLogin: new Date()
    });
    
    return newUser;
  } catch (error) {
    throw new Error('Error creating Google user: ' + error.message);
  }
};

module.exports = mongoose.model('User', userSchema);
