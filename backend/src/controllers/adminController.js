const LoginAttempt = require('../models/LoginAttempt');
const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Get login statistics for last 30 days
    const loginStats = await LoginAttempt.getStats(30);
    
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const googleUsers = await User.countDocuments({ authProvider: 'google' });
    const localUsers = await User.countDocuments({ authProvider: 'local' });
    
    // Get task statistics
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: 'todo' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });
    
    // Get recent users (last 7 days)
    const recentUsers = await User.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).countDocuments();
    
    // Get top active users by task count
    const topUsers = await Task.aggregate([
      {
        $group: {
          _id: '$userId',
          taskCount: { $sum: 1 },
          completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          taskCount: 1,
          completedCount: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedCount', '$taskCount'] },
              100
            ]
          }
        }
      },
      {
        $sort: { taskCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        loginStats: loginStats[0] || {
          totalAttempts: 0,
          successfulLogins: 0,
          failedLogins: 0,
          uniqueUsersCount: 0,
          successRate: 0
        },
        userStats: {
          total: totalUsers,
          active: activeUsers,
          google: googleUsers,
          local: localUsers,
          recent: recentUsers
        },
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0
        },
        topUsers
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get all login attempts with pagination
// @route   GET /api/admin/login-attempts
// @access  Private (Admin only)
const getLoginAttempts = async (req, res) => {
  try {
    const { page = 1, limit = 20, success, email, days = 30 } = req.query;
    
    const query = {};
    
    // Filter by success status if provided
    if (success !== undefined) {
      query.success = success === 'true';
    }
    
    // Filter by email if provided
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }
    
    // Filter by date range
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      query.createdAt = { $gte: startDate };
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'userId',
        select: 'name email username'
      }
    };
    
    const totalCount = await LoginAttempt.countDocuments(query);
    const attempts = await LoginAttempt.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'name email username');
    
    res.json({
      success: true,
      data: attempts,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(totalCount / parseInt(limit)),
        total: totalCount,
        limit: parseInt(limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get login attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching login attempts',
      error: error.message
    });
  }
};

// @desc    Get all users with detailed information
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsersDetailed = async (req, res) => {
  try {
    const users = await User.find({}, '-password')
      .sort({ createdAt: -1 })
      .populate('tasks');
    
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const taskCount = await Task.countDocuments({ userId: user._id });
      const completedTasks = await Task.countDocuments({ userId: user._id, status: 'completed' });
      const pendingTasks = await Task.countDocuments({ userId: user._id, status: 'todo' });
      const inProgressTasks = await Task.countDocuments({ userId: user._id, status: 'in-progress' });
      
      // Get recent login attempts
      const recentLogins = await LoginAttempt.find({ 
        userId: user._id, 
        success: true 
      })
      .sort({ createdAt: -1 })
      .limit(5);
      
      // Calculate session time (simplified - time between login attempts)
      const sessionTimes = [];
      for (let i = 0; i < recentLogins.length - 1; i++) {
        const sessionDuration = new Date(recentLogins[i].createdAt) - new Date(recentLogins[i + 1].createdAt);
        if (sessionDuration > 0 && sessionDuration < 24 * 60 * 60 * 1000) { // Less than 24 hours
          sessionTimes.push(sessionDuration);
        }
      }
      
      const avgSessionTime = sessionTimes.length > 0 
        ? sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length 
        : 0;
      
      return {
        ...user.toObject(),
        stats: {
          totalTasks: taskCount,
          completedTasks,
          pendingTasks,
          inProgressTasks,
          completionRate: taskCount > 0 ? ((completedTasks / taskCount) * 100).toFixed(1) : 0,
          loginCount: recentLogins.length,
          avgSessionTime: Math.round(avgSessionTime / (1000 * 60)), // in minutes
          recentLogins: recentLogins.map(login => ({
            date: login.createdAt,
            ipAddress: login.ipAddress,
            deviceInfo: login.deviceInfo
          }))
        }
      };
    }));
    
    res.json({
      success: true,
      data: {
        users: usersWithStats,
        totalCount: users.length,
        activeUsers: users.filter(user => user.isActive).length,
        signupStats: {
          today: users.filter(user => {
            const today = new Date();
            const userDate = new Date(user.createdAt);
            return userDate.toDateString() === today.toDateString();
          }).length,
          thisWeek: users.filter(user => {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return new Date(user.createdAt) >= weekAgo;
          }).length,
          thisMonth: users.filter(user => {
            const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return new Date(user.createdAt) >= monthAgo;
          }).length
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
};

// @desc    Get user tasks with detailed information
// @route   GET /api/admin/users/:userId/tasks
// @access  Private (Admin only)
const getUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const tasks = await Task.find({ userId })
      .sort({ createdAt: -1 });
    
    const user = await User.findById(userId, 'name email username');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        user,
        tasks,
        stats: {
          total: tasks.length,
          completed: tasks.filter(task => task.status === 'completed').length,
          pending: tasks.filter(task => task.status === 'todo').length,
          inProgress: tasks.filter(task => task.status === 'in-progress').length,
          overdue: tasks.filter(task => {
            return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
          }).length
        }
      }
    });
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user tasks',
      error: error.message
    });
  }
};

// @desc    Get user login history
// @route   GET /api/admin/users/:userId/login-history
// @access  Private (Admin only)
const getUserLoginHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(userId, 'name email username');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const loginHistory = await LoginAttempt.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * page)
      .skip((page - 1) * limit);
    
    const totalLogins = await LoginAttempt.countDocuments({ userId });
    const successfulLogins = await LoginAttempt.countDocuments({ userId, success: true });
    
    res.json({
      success: true,
      data: {
        user,
        loginHistory,
        stats: {
          totalAttempts: totalLogins,
          successfulLogins,
          failedLogins: totalLogins - successfulLogins,
          successRate: totalLogins > 0 ? ((successfulLogins / totalLogins) * 100).toFixed(1) : 0
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalLogins / limit),
          hasNext: page * limit < totalLogins,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user login history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching login history',
      error: error.message
    });
  }
};

// @desc    Get all users with pagination (original function)
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, authProvider, isActive } = req.query;
    
    const query = {};
    
    // Search by name, email, or username
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by auth provider
    if (authProvider) {
      query.authProvider = authProvider;
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();
    
    const total = await User.countDocuments(query);
    
    // Get task counts for each user
    const usersWithTaskCounts = await Promise.all(
      users.map(async (user) => {
        const taskCount = await Task.countDocuments({ userId: user._id });
        const completedTasks = await Task.countDocuments({ 
          userId: user._id, 
          status: 'completed' 
        });
        
        return {
          ...user,
          taskCount,
          completedTasks,
          completionRate: taskCount > 0 ? ((completedTasks / taskCount) * 100).toFixed(1) : 0
        };
      })
    );
    
    res.json({
      success: true,
      data: usersWithTaskCounts,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
};

// @desc    Update user status (activate/deactivate)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      id,
      { isActive, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status',
      error: error.message
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow deleting admin users
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }
    
    // Delete user's tasks
    await Task.deleteMany({ userId: id });
    
    // Delete user
    await User.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getLoginAttempts,
  getUsers,
  getAllUsersDetailed,
  getUserTasks,
  getUserLoginHistory,
  updateUserStatus,
  deleteUser
};
