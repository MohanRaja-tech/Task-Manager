import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
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
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignee: 'all',
    search: ''
  });

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskManagerTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Initialize with some sample tasks
      const sampleTasks = [
        {
          id: 1,
          title: 'Design new user interface',
          description: 'Create mockups and wireframes for the new dashboard',
          status: 'in-progress',
          priority: 'high',
          category: 'Design',
          assignee: 'John Doe',
          dueDate: '2025-08-10',
          createdAt: '2025-08-01',
          updatedAt: '2025-08-03'
        },
        {
          id: 2,
          title: 'Review pull requests',
          description: 'Review and approve pending pull requests from the team',
          status: 'pending',
          priority: 'medium',
          category: 'Development',
          assignee: 'Jane Smith',
          dueDate: '2025-08-05',
          createdAt: '2025-08-01',
          updatedAt: '2025-08-01'
        },
        {
          id: 3,
          title: 'Update documentation',
          description: 'Update API documentation with new endpoints',
          status: 'completed',
          priority: 'low',
          category: 'Documentation',
          assignee: 'Bob Johnson',
          dueDate: '2025-08-02',
          createdAt: '2025-07-30',
          updatedAt: '2025-08-02'
        }
      ];
      setTasks(sampleTasks);
      localStorage.setItem('taskManagerTasks', JSON.stringify(sampleTasks));
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('taskManagerTasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleCreateTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    setShowTaskForm(false);
  };

  const handleUpdateTask = (taskData) => {
    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
        : task
    ));
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
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
              Here's what's happening with your tasks today.
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
