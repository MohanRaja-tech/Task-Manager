import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Calendar, Clock, User, Tag, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import './OverdueReviewPopup.css';

const OverdueReviewPopup = ({ isOpen, onClose, tasks }) => {
  if (!isOpen) return null;

  // Filter overdue tasks
  const overdueTasks = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today && task.status !== 'completed';
  });

  // Generate reasons for overdue tasks
  const getOverdueReason = (task) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    
    const reasons = [];
    
    // Time-based reasons
    if (daysOverdue === 1) {
      reasons.push("Task was due yesterday");
    } else if (daysOverdue <= 7) {
      reasons.push(`Task is ${daysOverdue} days overdue`);
    } else if (daysOverdue <= 30) {
      reasons.push(`Task is ${daysOverdue} days overdue - requires immediate attention`);
    } else {
      reasons.push(`Task is severely overdue (${daysOverdue} days) - critical review needed`);
    }

    // Priority-based reasons
    if (task.priority === 'high') {
      reasons.push("High priority task needs urgent completion");
    } else if (task.priority === 'medium') {
      reasons.push("Medium priority task affecting project timeline");
    }

    // Status-based reasons
    if (task.status === 'todo') {
      reasons.push("Task hasn't been started yet");
    } else if (task.status === 'in-progress') {
      reasons.push("Task is in progress but missed deadline");
    }

    // Category-based suggestions
    if (task.category) {
      reasons.push(`${task.category} category task may impact related work`);
    }

    return reasons;
  };

  const getRecommendedAction = (task) => {
    const daysOverdue = Math.floor((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
    
    if (task.priority === 'high' || daysOverdue > 7) {
      return "Prioritize immediately";
    } else if (task.status === 'todo') {
      return "Start working on this task";
    } else if (task.status === 'in-progress') {
      return "Focus on completion";
    } else {
      return "Review and update";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="overdue-popup-overlay">
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overdue-backdrop"
            onClick={onClose}
          />

          {/* Popup Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="overdue-popup-modal"
          >
            {/* Header */}
            <div className="overdue-popup-header">
              <div className="overdue-header-content">
                <div className="overdue-header-icon">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="overdue-header-text">
                  <h3>Overdue Tasks Review</h3>
                  <p>
                    {overdueTasks.length} task{overdueTasks.length !== 1 ? 's' : ''} require{overdueTasks.length === 1 ? 's' : ''} your attention
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="overdue-close-btn"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="overdue-popup-content">
              {overdueTasks.length === 0 ? (
                <div className="overdue-empty-state">
                  <CheckCircle2 className="empty-icon" />
                  <h4>Great job!</h4>
                  <p>You have no overdue tasks at the moment.</p>
                </div>
              ) : (
                <div className="overdue-tasks-list">
                  {overdueTasks.map((task, index) => (
                    <motion.div
                      key={task.id || task._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="overdue-task-card"
                    >
                      {/* Task Header */}
                      <div className="overdue-task-header">
                        <div className="overdue-task-title">
                          <h4>{task.title}</h4>
                          <div className="overdue-task-meta">
                            <span className={`priority-badge ${task.priority}`}>
                              {task.priority} priority
                            </span>
                            <span className={`status-badge ${task.status}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                        <div className="overdue-days-indicator">
                          {Math.floor((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24))} days
                        </div>
                      </div>

                      {/* Task Details */}
                      <div className="overdue-task-details">
                        <div className="overdue-detail-item">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                        </div>
                        {task.assignee && (
                          <div className="overdue-detail-item">
                            <User className="h-4 w-4" />
                            <span>Assigned to: {task.assignee}</span>
                          </div>
                        )}
                        {task.category && (
                          <div className="overdue-detail-item">
                            <Tag className="h-4 w-4" />
                            <span>Category: {task.category}</span>
                          </div>
                        )}
                      </div>

                      {/* Overdue Reasons */}
                      <div className="overdue-reasons">
                        <h5>Why this task is overdue:</h5>
                        <ul className="reasons-list">
                          {getOverdueReason(task).map((reason, idx) => (
                            <li key={idx} className="reason-item">
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommended Action */}
                      <div className="overdue-action">
                        <div className="action-label">Recommended Action:</div>
                        <div className="action-text">{getRecommendedAction(task)}</div>
                      </div>

                      {/* Task Description */}
                      {task.description && (
                        <div className="overdue-task-description">
                          <strong>Description:</strong>
                          <p>{task.description}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="overdue-popup-footer">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="overdue-footer-btn primary"
              >
                Got it, thanks!
              </motion.button>
              {overdueTasks.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="overdue-footer-btn secondary"
                >
                  Take me to tasks
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OverdueReviewPopup;