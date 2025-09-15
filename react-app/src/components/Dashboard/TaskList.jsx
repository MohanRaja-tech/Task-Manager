import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, User, Edit3, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import './TaskList.css';

const TaskList = ({ tasks, onStatusChange, onEditTask, onDeleteTask }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'status-badge completed';
      case 'in-progress':
        return 'status-badge in-progress';
      case 'todo':
        return 'status-badge pending';
      case 'pending': // Backward compatibility
        return 'status-badge pending';
      default:
        return 'status-badge pending';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-badge high';
      case 'medium':
        return 'priority-badge medium';
      case 'low':
        return 'priority-badge low';
      default:
        return 'priority-badge medium';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="status-icon" />;
      case 'in-progress':
        return <Clock className="status-icon" />;
      case 'todo':
        return <AlertCircle className="status-icon" />;
      case 'pending': // Backward compatibility
        return <AlertCircle className="status-icon" />;
      default:
        return <AlertCircle className="status-icon" />;
    }
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'completed') return false;
    const due = new Date(dueDate);
    const today = new Date();
    return due < today;
  };

  const isDueSoon = (dueDate, status) => {
    if (status === 'completed') return false;
    const due = new Date(dueDate);
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
    return due <= threeDaysFromNow && due >= today;
  };

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="task-list-empty"
      >
        <div className="empty-content">
          <div className="empty-icon">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="empty-title">No tasks found</h3>
          <p className="empty-description">
            Try adjusting your filters or create a new task to get started.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="task-list-container"
    >
      <div className="task-list-header">
        <h2 className="task-list-title">
          Tasks ({tasks.length})
        </h2>
        <div className="task-count">
          Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="task-list">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`task-card ${task.status} ${
              isOverdue(task.dueDate, task.status) ? 'overdue' :
              isDueSoon(task.dueDate, task.status) ? 'due-soon' :
              ''
            }`}
          >
            <div className="task-card-content">
              <div className="task-header">
                <div className="task-main-info">
                  <h3 className="task-title">
                    {task.title}
                  </h3>
                  <p className="task-description">
                    {task.description}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="task-actions">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEditTask(task)}
                    className="task-action-btn edit"
                    title="Edit task"
                  >
                    <Edit3 className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDeleteTask(task._id || task.id)}
                    className="task-action-btn delete"
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              {/* Task Meta Information */}
              <div className="task-meta">
                {/* Status */}
                <div className="task-badge-container">
                  <span className={`task-badge ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span>{task.status.replace('-', ' ')}</span>
                  </span>
                </div>

                {/* Priority */}
                <div className="task-badge-container">
                  <span className={`task-badge ${getPriorityColor(task.priority)}`}>
                    <span>{task.priority} Priority</span>
                  </span>
                </div>

                {/* Category */}
                <div className="task-badge-container">
                  <span className="task-badge category-badge">
                    {task.category}
                  </span>
                </div>
              </div>

              {/* Task Details */}
              <div className="task-details">
                {/* Due Date */}
                <div className="task-detail-item">
                  <Calendar className="h-4 w-4 task-detail-icon" />
                  <span className="task-detail-text">
                    Due: <span className="task-detail-value">{format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                    {isOverdue(task.dueDate, task.status) && (
                      <span className="due-date-warning"> (Overdue)</span>
                    )}
                    {isDueSoon(task.dueDate, task.status) && (
                      <span className="due-date-alert"> (Due Soon)</span>
                    )}
                  </span>
                </div>

                {/* Assignee */}
                <div className="task-detail-item">
                  <User className="h-4 w-4 task-detail-icon" />
                  <span className="task-detail-text">Assigned to: <span className="task-detail-value">{task.assignee}</span></span>
                </div>

                {/* Created Date */}
                <div className="task-detail-item">
                  <Clock className="h-4 w-4 task-detail-icon" />                  <span className="task-detail-text">Created: <span className="task-detail-value">{format(new Date(task.createdAt), 'MMM dd, yyyy')}</span></span>
                </div>
              </div>

              {/* Status Change Buttons */}
              <div className="task-footer">
                <div className="task-updated">
                  Last updated: {format(new Date(task.updatedAt), 'MMM dd, yyyy HH:mm')}
                </div>
                
                <div className="status-actions">
                  {task.status !== 'todo' && task.status !== 'pending' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onStatusChange(task._id || task.id, 'todo')}
                      className="status-btn pending"
                    >
                      Mark To Do
                    </motion.button>
                  )}
                  
                  {task.status !== 'in-progress' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onStatusChange(task._id || task.id, 'in-progress')}
                      className="status-btn in-progress"
                    >
                      Start Progress
                    </motion.button>
                  )}
                  
                  {task.status !== 'completed' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onStatusChange(task._id || task.id, 'completed')}
                      className="status-btn completed"
                    >
                      Mark Complete
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TaskList;
