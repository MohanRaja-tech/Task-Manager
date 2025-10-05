const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  bulkUpdateTasks,
  startTaskTimer,
  stopTaskTimer
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(protect);

// Validation rules for creating tasks
const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Task description cannot exceed 1000 characters'),
  
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed'])
    .withMessage('Status must be one of: todo, in-progress, completed'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.some(tag => typeof tag !== 'string' || tag.length > 50)) {
        throw new Error('Each tag must be a string with maximum 50 characters');
      }
      return true;
    }),
  
  body('assignee')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Assignee name cannot exceed 100 characters')
];

// Validation rules for updating tasks
const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Task description cannot exceed 1000 characters'),
  
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed'])
    .withMessage('Status must be one of: todo, in-progress, completed'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters'),
  
  body('dueDate')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true;
      if (!Date.parse(value)) {
        throw new Error('Due date must be a valid date');
      }
      return true;
    }),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.some(tag => typeof tag !== 'string' || tag.length > 50)) {
        throw new Error('Each tag must be a string with maximum 50 characters');
      }
      return true;
    }),
  
  body('assignee')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Assignee name cannot exceed 100 characters')
];

// Validation for bulk operations
const bulkUpdateValidation = [
  body('taskIds')
    .isArray({ min: 1 })
    .withMessage('Task IDs array is required and must contain at least one ID'),
  
  body('updates')
    .isObject()
    .withMessage('Updates object is required'),
  
  body('updates.status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed'])
    .withMessage('Status must be one of: todo, in-progress, completed'),
  
  body('updates.priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high')
];

// Routes
// GET /api/tasks/stats - Get task statistics (must be before /:id route)
router.get('/stats', getTaskStats);

// GET /api/tasks - Get all tasks for authenticated user
router.get('/', getTasks);

// POST /api/tasks - Create new task
router.post('/', createTaskValidation, createTask);

// PATCH /api/tasks/bulk - Bulk update tasks (must be before /:id routes)
router.patch('/bulk', bulkUpdateValidation, bulkUpdateTasks);

// PATCH /api/tasks/:id/start - Start task timer (must be before /:id routes)
router.patch('/:id/start', startTaskTimer);

// PATCH /api/tasks/:id/stop - Stop task timer (must be before /:id routes)  
router.patch('/:id/stop', stopTaskTimer);

// GET /api/tasks/:id - Get single task by ID
router.get('/:id', getTask);

// PUT /api/tasks/:id - Update task
router.put('/:id', updateTaskValidation, updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', deleteTask);

module.exports = router;
