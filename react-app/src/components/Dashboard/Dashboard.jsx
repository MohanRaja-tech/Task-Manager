import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { taskService } from '../../services/taskService';
import Header from './Header';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import TaskStats from './TaskStats';
import TaskFilters from './TaskFilters';
import Sidebar from './Sidebar';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignee: 'all',
    search: ''
  });

  // Load tasks from backend API
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await taskService.getTasks();
      if (response.success) {
        setTasks(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load tasks');
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError(error.message || 'Failed to load tasks');
      
      // Show welcome task if it's the first time and no tasks exist
      if (!tasks.length && user) {
        const welcomeTask = {
          id: 'temp_' + Date.now(),
          title: `Welcome ${user.name || user.username}! Your first task`,
          description: 'Get familiar with the task management interface and create your first task',
          status: 'todo',
          priority: 'medium',
          category: 'Getting Started',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          isTemporary: true
        };
        setTasks([welcomeTask]);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleCreateTask = async (taskData) => {
    try {
      console.log('Creating task with data:', taskData);
      
      // Remove temporary tasks first
      setTasks(prev => prev.filter(task => !task.isTemporary));
      
      const response = await taskService.createTask(taskData);
      console.log('Task creation response:', response);
      
      if (response.success) {
        setTasks(prev => [response.data, ...prev]);
        setShowTaskForm(false);
        console.log('Task created successfully:', response.data);
      } else {
        throw new Error(response.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError(error.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      const response = await taskService.updateTask(editingTask._id, taskData);
      if (response.success) {
        setTasks(prev => prev.map(task => 
          task._id === editingTask._id ? response.data : task
        ));
        setEditingTask(null);
        setShowTaskForm(false);
      } else {
        throw new Error(response.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // Handle temporary tasks (don't send to backend)
      const task = tasks.find(t => t.id === taskId || t._id === taskId);
      if (task?.isTemporary) {
        setTasks(prev => prev.filter(task => task.id !== taskId && task._id !== taskId));
        return;
      }

      const response = await taskService.deleteTask(taskId);
      if (response.success) {
        setTasks(prev => prev.filter(task => task._id !== taskId));
      } else {
        throw new Error(response.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Handle temporary tasks
      const task = tasks.find(t => t.id === taskId || t._id === taskId);
      if (task?.isTemporary) {
        setTasks(prev => prev.map(task => 
          (task.id === taskId || task._id === taskId) 
            ? { ...task, status: newStatus }
            : task
        ));
        return;
      }

      const response = await taskService.updateTask(taskId, { status: newStatus });
      if (response.success) {
        setTasks(prev => prev.map(task => 
          task._id === taskId ? response.data : task
        ));
      } else {
        throw new Error(response.message || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      setError(error.message || 'Failed to update task status');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  // Handle task updates from timer or other components
  const handleTaskUpdate = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      (task._id || task.id) === (updatedTask._id || updatedTask.id) 
        ? updatedTask 
        : task
    ));
  };

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.category !== 'all' && task.category !== filters.category) return false;
    if (filters.assignee !== 'all' && task.assignee !== filters.assignee) return false;
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Get unique values for filter options
  const categories = [...new Set(tasks.map(task => task.category))];
  const assignees = [...new Set(tasks.map(task => task.assignee))];

  return (
    <div className="dashboard-container">
      <Header 
        user={user} 
        onCreateTask={() => setShowTaskForm(true)}
      />
      
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="error-banner"
              style={{
                background: '#fee',
                color: '#c33',
                padding: '12px',
                borderRadius: '8px',
                margin: '16px 0',
                border: '1px solid #fcc'
              }}
            >
              {error}
              <button 
                onClick={() => setError(null)}
                style={{ float: 'right', background: 'none', border: 'none', color: '#c33', cursor: 'pointer' }}
              >
                ×
              </button>
            </motion.div>
          )}

          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="dashboard-welcome"
          >
            <h1>
              Welcome back, {user?.name}!
            </h1>
            <p>
              {loading ? 'Loading your tasks...' : "Here's what's happening with your tasks today."}
            </p>
          </motion.div>

          <div className="dashboard-grid">
            {/* Main Content Area */}
            <div className="dashboard-main-content">
              {/* Task Statistics */}
              <TaskStats tasks={tasks} />

              {/* Filters */}
              <TaskFilters
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
                assignees={assignees}
              />

              {/* Task List */}
              <TaskList
                tasks={filteredTasks}
                onStatusChange={handleStatusChange}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onTaskUpdate={handleTaskUpdate}
              />
            </div>

            {/* Sidebar Content */}
            <div className="dashboard-sidebar">
              <Sidebar />
            </div>
          </div>
        </div>

        {/* Task Form Modal */}
        {showTaskForm && (
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onClose={handleCloseForm}
            categories={categories}
            assignees={assignees}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
