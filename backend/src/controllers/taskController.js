const Task = require('../models/Task');
const { validationResult } = require('express-validator');

// @desc    Get all tasks for authenticated user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, priority, category, sort = 'createdAt', order = 'desc' } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category) filters.category = category;
    
    console.log(`Getting tasks for user ${req.user.id} with filters:`, filters);
    
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = {};
    sortObj[sort] = sortOrder;
    
    const tasks = await Task.find({ userId: req.user.id, ...filters })
      .sort(sortObj)
      .exec();
    
    console.log(`Found ${tasks.length} tasks for user ${req.user.id}`);
    
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks',
      error: error.message
    });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task',
      error: error.message
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
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
    
    const { title, description, status, priority, category, dueDate, tags, assignee } = req.body;
    
    console.log(`Creating task for user ${req.user.id}:`, { title, status, priority, assignee });
    
    const taskData = {
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      userId: req.user.id
    };
    
    if (category) taskData.category = category;
    if (dueDate) taskData.dueDate = new Date(dueDate);
    if (tags && Array.isArray(tags)) taskData.tags = tags;
    if (assignee) taskData.assignee = assignee;
    
    const task = await Task.create(taskData);
    
    console.log(`Task created successfully:`, task._id);
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating task',
      error: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, category, dueDate, tags, assignee } = req.body;
    
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    console.log(`Updating task ${req.params.id} for user ${req.user.id}`);
    
    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) task.tags = Array.isArray(tags) ? tags : [];
    if (assignee !== undefined) task.assignee = assignee;
    
    await task.save();
    
    console.log(`Task updated successfully:`, task._id);
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task',
      error: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    console.log(`Deleting task ${req.params.id} for user ${req.user.id}`);
    
    await Task.findByIdAndDelete(req.params.id);
    
    console.log(`Task deleted successfully:`, req.params.id);
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task',
      error: error.message
    });
  }
};

// @desc    Get task statistics for user
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    console.log(`Getting task stats for user ${req.user.id}`);
    
    const stats = await Task.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format stats
    const formattedStats = {
      todo: 0,
      'in-progress': 0,
      completed: 0,
      total: 0
    };
    
    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });
    
    // Get overdue tasks count
    const overdueTasks = await Task.countDocuments({
      userId: req.user.id,
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() }
    });
    
    formattedStats.overdue = overdueTasks;
    
    console.log(`Task stats for user ${req.user.id}:`, formattedStats);
    
    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task statistics',
      error: error.message
    });
  }
};

// @desc    Bulk update tasks
// @route   PATCH /api/tasks/bulk
// @access  Private
const bulkUpdateTasks = async (req, res) => {
  try {
    const { taskIds, updates } = req.body;
    
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task IDs array is required'
      });
    }
    
    console.log(`Bulk updating ${taskIds.length} tasks for user ${req.user.id}`);
    
    const result = await Task.updateMany(
      { 
        _id: { $in: taskIds }, 
        userId: req.user.id 
      },
      { $set: updates }
    );
    
    console.log(`Bulk update completed: ${result.modifiedCount} tasks updated`);
    
    res.json({
      success: true,
      message: `${result.modifiedCount} tasks updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while bulk updating tasks',
      error: error.message
    });
  }
};

// @desc    Start task timer
// @route   PATCH /api/tasks/:id/start
// @access  Private
const startTaskTimer = async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Stop any other active tasks for this user
    await Task.updateMany(
      { userId: req.user.id, isActive: true },
      { 
        $set: { isActive: false },
        $unset: { startedAt: 1 }
      }
    );
    
    // Start this task
    task.status = 'in-progress';
    task.isActive = true;
    task.startedAt = new Date();
    
    await task.save();
    
    res.json({
      success: true,
      message: 'Task timer started',
      data: task
    });
  } catch (error) {
    console.error('Start task timer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting task timer',
      error: error.message
    });
  }
};

// @desc    Stop task timer
// @route   PATCH /api/tasks/:id/stop
// @access  Private
const stopTaskTimer = async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    if (task.isActive && task.startedAt) {
      const sessionTime = Math.floor((new Date() - task.startedAt) / (1000 * 60));
      task.timeSpent += sessionTime;
    }
    
    task.isActive = false;
    task.startedAt = undefined;
    
    await task.save();
    
    res.json({
      success: true,
      message: 'Task timer stopped',
      data: task
    });
  } catch (error) {
    console.error('Stop task timer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while stopping task timer',
      error: error.message
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  bulkUpdateTasks,
  startTaskTimer,
  stopTaskTimer
};
