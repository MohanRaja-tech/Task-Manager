const express = require('express');
const {
  getDashboardStats,
  getLoginAttempts,
  getUsers,
  getAllUsersDetailed,
  getUserTasks,
  getUserLoginHistory,
  updateUserStatus,
  deleteUser
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(protect);
router.use(requireAdmin);

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Login attempts management
router.get('/login-attempts', getLoginAttempts);

// User management
router.get('/users', getUsers);
router.get('/users-detailed', getAllUsersDetailed);
router.get('/users/:userId/tasks', getUserTasks);
router.get('/users/:userId/login-history', getUserLoginHistory);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;
