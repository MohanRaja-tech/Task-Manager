import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle, Calendar, TrendingUp, Users } from 'lucide-react';
import OverdueReviewPopup from './OverdueReviewPopup';
import './TaskStats.css';

const TaskStats = ({ tasks }) => {
  const [showOverduePopup, setShowOverduePopup] = useState(false);

  const handleReviewClick = () => {
    setShowOverduePopup(true);
  };

  const handleClosePopup = () => {
    setShowOverduePopup(false);
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'completed').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    pending: tasks.filter(task => task.status === 'todo').length,
    overdue: tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate < today && task.status !== 'completed';
    }).length,
    dueSoon: tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
      return dueDate <= threeDaysFromNow && dueDate >= today && task.status !== 'completed';
    }).length
  };

  const completionRate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0;

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: Calendar,
      color: 'total'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'completed'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'in-progress'
    },
    {
      title: 'To Do',
      value: stats.pending,
      icon: Users,
      color: 'pending'
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'overdue'
    },
    {
      title: 'Due Soon',
      value: stats.dueSoon,
      icon: TrendingUp,
      color: 'due-soon'
    }
  ];

  return (
    <div className="task-stats-container">
      {/* Main Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
            data-color={stat.color}
          >
            <div className="stat-content">
              <div className={`stat-icon ${stat.color}`}>
                <stat.icon className="stat-icon-svg" />
              </div>
              <div className="stat-value-section">
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
            <div className="stat-info">
              <p className="stat-title">{stat.title}</p>
              {stat.title === 'Completed' && (
                <p className="stat-subtitle">
                  {completionRate}% completion rate
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="progress-overview"
      >
        <div className="progress-header">
          <h3 className="progress-title">Task Progress Overview</h3>
          <span className="progress-percentage">{completionRate}% Complete</span>
        </div>

        {/* Progress Bar */}
        <div className="progress-details">
          <div className="progress-info">
            <span className="progress-label">Overall Progress</span>
            <span className="progress-count">{stats.completed} of {stats.total} tasks</span>
          </div>
          <div className="progress-bar-container">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ delay: 0.8, duration: 1 }}
              className="progress-bar-fill"
            />
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="status-breakdown">
          <div className="status-item">
            <div className="status-value completed">{stats.completed}</div>
            <div className="status-name">Completed</div>
          </div>
          <div className="status-item">
            <div className="status-value in-progress">{stats.inProgress}</div>
            <div className="status-name">In Progress</div>
          </div>
          <div className="status-item">
            <div className="status-value pending">{stats.pending}</div>
            <div className="status-name">To Do</div>
          </div>
          <div className="status-item">
            <div className="status-value overdue">{stats.overdue}</div>
            <div className="status-name">Overdue</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Insights */}
      <div className="analytics-grid">
        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="analytics-card"
        >
          <h3 className="analytics-title">Priority Distribution</h3>
          <div className="priority-list">
            {['high', 'medium', 'low'].map(priority => {
              const count = tasks.filter(task => task.priority === priority).length;
              const percentage = stats.total > 0 ? (count / stats.total * 100).toFixed(1) : 0;
              
              return (
                <div key={priority} className="priority-item">
                  <div className="priority-info">
                    <div className={`priority-dot ${priority}`} />
                    <span className="priority-name">{priority}</span>
                  </div>
                  <div className="priority-stats">
                    <span className="priority-count">{count} tasks</span>
                    <span className="priority-percentage">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="analytics-card"
        >
          <h3 className="analytics-title">Quick Actions</h3>
          <div className="quick-actions">
            {stats.overdue > 0 && (
              <div className="action-item overdue">
                <div className="action-info">
                  <AlertTriangle className="action-icon" />
                  <span className="action-text">
                    {stats.overdue} overdue task{stats.overdue !== 1 ? 's' : ''}
                  </span>
                </div>
                <button 
                  className="action-button overdue"
                  onClick={handleReviewClick}
                >
                  Review
                </button>
              </div>
            )}
            
            {stats.dueSoon > 0 && (
              <div className="action-item due-soon">
                <div className="action-info">
                  <Clock className="action-icon" />
                  <span className="action-text">
                    {stats.dueSoon} task{stats.dueSoon !== 1 ? 's' : ''} due soon
                  </span>
                </div>
                <button className="action-button due-soon">
                  View
                </button>
              </div>
            )}

            {stats.overdue === 0 && stats.dueSoon === 0 && (
              <div className="action-item success">
                <div className="action-info">
                  <CheckCircle className="action-icon" />
                  <span className="action-text">
                    All tasks are on track!
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Overdue Review Popup */}
      <OverdueReviewPopup 
        isOpen={showOverduePopup} 
        onClose={handleClosePopup} 
        tasks={tasks}
      />
    </div>
  );
};

export default TaskStats;
