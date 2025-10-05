const { validationResult } = require('express-validator');
const User = require('../models/User');
const LoginAttempt = require('../models/LoginAttempt');
const { generateToken } = require('../middleware/auth');
const googleAuthService = require('../services/googleAuth');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }
    
    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });
    
    // Generate token
    const token = generateToken(user._id);
    
    // Update last login
    await user.updateLastLogin();
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle duplicate key error (MongoDB)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { identifier, password } = req.body; // identifier can be email or username
    
    // Get client info for logging
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    // Find user by email or username
    const user = await User.findByCredentials(identifier);
    
    if (!user) {
      // Log failed login attempt
      await LoginAttempt.logAttempt({
        email: identifier,
        success: false,
        ipAddress,
        userAgent,
        loginMethod: 'email',
        failureReason: 'User not found'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      // Log failed login attempt
      await LoginAttempt.logAttempt({
        email: user.email,
        success: false,
        ipAddress,
        userAgent,
        loginMethod: 'email',
        userId: user._id,
        failureReason: 'Account deactivated'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Log failed login attempt
      await LoginAttempt.logAttempt({
        email: user.email,
        success: false,
        ipAddress,
        userAgent,
        loginMethod: 'email',
        userId: user._id,
        failureReason: 'Invalid password'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    // Update last login
    await user.updateLastLogin();
    
    // Log successful login attempt
    await LoginAttempt.logAttempt({
      email: user.email,
      success: true,
      ipAddress,
      userAgent,
      loginMethod: 'email',
      userId: user._id
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          isAdmin: user.role === 'admin',
          lastLogin: user.lastLogin
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { username, email } = req.body;
    const userId = req.user.id;
    
    // Check if username/email is taken by another user
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } },
        { $or: [{ email }, { username }] }
      ]
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({
        success: false,
        message: `This ${field} is already taken`
      });
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { username, email, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          updatedAt: user.updatedAt
        }
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `This ${field} is already taken`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Google Authentication for SignUp
// @route   POST /api/auth/google-signup
// @access  Public
const googleSignUp = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      console.log('No ID token provided in Google signup request');
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    console.log('Google SignUp request received');
    console.log('Verifying Google ID token for signup...');
    // Verify Google token
    const verificationResult = await googleAuthService.verifyGoogleToken(idToken);

    if (!verificationResult.success) {
      console.log('Google token verification failed:', verificationResult.error);
      return res.status(401).json({
        success: false,
        message: verificationResult.error
      });
    }

    console.log('Google token verified successfully, checking if user already exists...');
    
    // Extract user data from the verification result payload
    const googleUserData = {
      googleId: verificationResult.payload.sub, // Firebase UID
      email: verificationResult.payload.email,
      name: verificationResult.payload.name || verificationResult.payload.email.split('@')[0],
      picture: verificationResult.payload.picture || null
    };

    console.log('Google user data prepared for signup:', {
      googleId: googleUserData.googleId,
      email: googleUserData.email,
      name: googleUserData.name
    });

    // Check if user already exists (either by Google ID or email)
    const existingUserByGoogle = await User.findOne({ googleId: googleUserData.googleId });
    const existingUserByEmail = await User.findOne({ email: googleUserData.email });

    if (existingUserByGoogle || existingUserByEmail) {
      console.log('User already exists, signup not allowed');
      return res.status(409).json({
        success: false,
        message: 'User already exists. Please use Sign In instead.'
      });
    }

    // Create new user
    console.log('Creating new Google user...');
    const newUser = await User.create({
      email: googleUserData.email,
      googleId: googleUserData.googleId,
      name: googleUserData.name,
      username: googleUserData.name.toLowerCase().replace(/\s+/g, '') + Math.random().toString(36).substr(2, 5),
      picture: googleUserData.picture,
      authProvider: 'google',
      lastLogin: new Date()
    });

    // Generate JWT token
    const token = generateToken(newUser._id);

    console.log('Google SignUp successful for user:', newUser.email);

    res.json({
      success: true,
      message: 'Google signup successful',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
        picture: newUser.picture,
        authProvider: newUser.authProvider
      }
    });

  } catch (error) {
    console.error('Google SignUp error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google signup: ' + error.message
    });
  }
};

// @desc    Google Authentication for SignIn  
// @route   POST /api/auth/google-signin
// @access  Public
const googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      console.log('No ID token provided in Google signin request');
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    console.log('Google SignIn request received');
    console.log('Verifying Google ID token for signin...');
    // Verify Google token
    const verificationResult = await googleAuthService.verifyGoogleToken(idToken);

    if (!verificationResult.success) {
      console.log('Google token verification failed:', verificationResult.error);
      return res.status(401).json({
        success: false,
        message: verificationResult.error
      });
    }

    console.log('Google token verified successfully, looking for existing user...');
    
    // Extract user data from the verification result payload
    const googleUserData = {
      googleId: verificationResult.payload.sub, // Firebase UID
      email: verificationResult.payload.email,
      name: verificationResult.payload.name || verificationResult.payload.email.split('@')[0],
      picture: verificationResult.payload.picture || null
    };

    console.log('Google user data prepared for signin:', {
      googleId: googleUserData.googleId,
      email: googleUserData.email,
      name: googleUserData.name
    });

    // Look for existing user (by Google ID first, then by email)
    let user = await User.findOne({ googleId: googleUserData.googleId });
    
    if (!user) {
      // Check by email as fallback
      user = await User.findOne({ email: googleUserData.email, authProvider: 'google' });
    }

    if (!user) {
      console.log('User not found, signin not allowed');
      return res.status(404).json({
        success: false,
        message: 'Account not found. Please sign up first.'
      });
    }

    // Update user's last login and any updated profile info
    console.log('Updating user login information...');
    user.lastLogin = new Date();
    user.picture = googleUserData.picture || user.picture; // Update picture if available
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    console.log('Google SignIn successful for user:', user.email);

    res.json({
      success: true,
      message: 'Google signin successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        picture: user.picture,
        authProvider: user.authProvider
      }
    });

  } catch (error) {
    console.error('Google SignIn error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google signin: ' + error.message
    });
  }
};

// @desc    Google Authentication (Legacy - for backward compatibility)
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    console.log('Google authentication request received');
    const { idToken } = req.body;
    
    if (!idToken) {
      console.log('No ID token provided in request');
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }
    
    console.log('Verifying Google ID token...');
    // Verify Google token
    const verificationResult = await googleAuthService.verifyGoogleToken(idToken);
    
    if (!verificationResult.success) {
      console.log('Google token verification failed:', verificationResult.error);
      return res.status(401).json({
        success: false,
        message: verificationResult.error
      });
    }
    
    console.log('Google token verified successfully, creating/finding user...');
    
    // Extract user data from the verification result payload
    const googleUserData = {
      googleId: verificationResult.payload.sub, // Firebase UID
      email: verificationResult.payload.email,
      name: verificationResult.payload.name || verificationResult.payload.email.split('@')[0],
      picture: verificationResult.payload.picture || null
    };
    
    console.log('Google user data prepared:', {
      googleId: googleUserData.googleId,
      email: googleUserData.email,
      name: googleUserData.name
    });
    
    // Find or create user
    const user = await User.findOrCreateGoogleUser(googleUserData);
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    console.log('Google authentication successful for user:', user.email);
    
    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          picture: user.picture,
          role: user.role,
          authProvider: user.authProvider,
          lastLogin: user.lastLogin
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google authentication: ' + error.message
    });
  }
};

// @desc    Create admin user (temporary endpoint)
// @route   POST /api/auth/create-admin
// @access  Public (will be removed after use)
const createAdminUser = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      // Update existing admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@2006', salt);
      
      await User.findByIdAndUpdate(existingAdmin._id, {
        email: 'admin@gmail.com',
        password: hashedPassword,
        name: 'System Administrator',
        username: 'admin',
        role: 'admin',
        isAdmin: true
      });
      
      return res.status(200).json({
        success: true,
        message: 'Admin user updated successfully',
        credentials: {
          email: 'admin@gmail.com',
          password: 'Admin@2006'
        }
      });
    } else {
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@2006', salt);

      const adminUser = new User({
        email: 'admin@gmail.com',
        password: hashedPassword,
        name: 'System Administrator',
        username: 'admin',
        role: 'admin',
        isAdmin: true
      });

      await adminUser.save();
      
      return res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        credentials: {
          email: 'admin@gmail.com',
          password: 'Admin@2006'
        }
      });
    }
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating admin user',
      error: error.message
    });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  googleAuth,
  googleSignUp,
  googleSignIn,
  createAdminUser
};
