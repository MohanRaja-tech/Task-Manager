import { getAuthToken } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios-like request function with auth headers
const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...(options.body && { body: JSON.stringify(options.body) }),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return { success: true };
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Task API functions
export const taskService = {
  // Get all tasks for authenticated user
  async getTasks(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add supported query parameters
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.category) queryParams.append('category', params.category);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.tags) queryParams.append('tags', params.tags.join(','));
    if (params.overdue !== undefined) queryParams.append('overdue', params.overdue);
    if (params.dueToday !== undefined) queryParams.append('dueToday', params.dueToday);
    
    const queryString = queryParams.toString();
    const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;
    
    return await request(endpoint);
  },

  // Get single task by ID
  async getTask(taskId) {
    return await request(`/tasks/${taskId}`);
  },

  // Create new task
  async createTask(taskData) {
    console.log('TaskService: Creating task with data:', taskData);
    console.log('TaskService: Auth token:', getAuthToken() ? 'Present' : 'Missing');
    
    return await request('/tasks', {
      method: 'POST',
      body: taskData,
    });
  },

  // Update existing task
  async updateTask(taskId, updates) {
    return await request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: updates,
    });
  },

  // Delete task
  async deleteTask(taskId) {
    return await request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Get task statistics
  async getTaskStats() {
    return await request('/tasks/stats');
  },

  // Bulk update tasks
  async bulkUpdateTasks(taskIds, updates) {
    return await request('/tasks/bulk', {
      method: 'PATCH',
      body: {
        taskIds,
        updates,
      },
    });
  },

  // Mark task as completed
  async completeTask(taskId) {
    return await this.updateTask(taskId, { status: 'completed' });
  },

  // Mark task as in progress
  async startTask(taskId) {
    return await this.updateTask(taskId, { status: 'in-progress' });
  },

  // Mark task as todo
  async resetTask(taskId) {
    return await this.updateTask(taskId, { status: 'todo' });
  },

  // Update task priority
  async updateTaskPriority(taskId, priority) {
    return await this.updateTask(taskId, { priority });
  },

  // Add tags to task
  async addTaskTags(taskId, newTags) {
    const task = await this.getTask(taskId);
    const existingTags = task.data.tags || [];
    const updatedTags = [...new Set([...existingTags, ...newTags])];
    
    return await this.updateTask(taskId, { tags: updatedTags });
  },

  // Remove tags from task
  async removeTaskTags(taskId, tagsToRemove) {
    const task = await this.getTask(taskId);
    const existingTags = task.data.tags || [];
    const updatedTags = existingTags.filter(tag => !tagsToRemove.includes(tag));
    
    return await this.updateTask(taskId, { tags: updatedTags });
  },

  // Get tasks by category
  async getTasksByCategory(category) {
    return await this.getTasks({ category });
  },

  // Get overdue tasks
  async getOverdueTasks() {
    return await this.getTasks({ overdue: true });
  },

  // Get tasks due today
  async getTasksDueToday() {
    return await this.getTasks({ dueToday: true });
  },

  // Search tasks
  async searchTasks(query) {
    return await this.getTasks({ search: query });
  },

  // Get tasks with pagination
  async getTasksPaginated(page = 1, limit = 10) {
    return await this.getTasks({ page, limit });
  }
};

// Export individual functions for convenience
export const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  bulkUpdateTasks,
  completeTask,
  startTask,
  resetTask,
  updateTaskPriority,
  addTaskTags,
  removeTaskTags,
  getTasksByCategory,
  getOverdueTasks,
  getTasksDueToday,
  searchTasks,
  getTasksPaginated
} = taskService;

export default taskService;
