import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, User, Tag, AlertTriangle, Save, Plus } from 'lucide-react';
import './TaskForm.css';

const TaskForm = ({ task, onSubmit, onClose, categories, assignees }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    assignee: '',
    dueDate: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Populate form data when editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        category: task.category || '',
        assignee: task.assignee || '',
        dueDate: task.dueDate || ''
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Task title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Task description must be at least 10 characters';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.assignee.trim()) {
      newErrors.assignee = 'Assignee is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSubmit({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        assignee: formData.assignee.trim()
      });
    } catch (error) {
      setErrors({ submit: 'Failed to save task. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Get today's date for min date restriction
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="task-form-overlay">
      <div className="task-form-container">
        {/* Background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="form-backdrop"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="task-form-modal"
        >
          {/* Header */}
          <div className="task-form-header">
            <div className="task-form-header-content">
              <div className={`task-form-icon ${task ? 'edit' : ''}`}>
                {task ? <Save className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
              <div className="task-form-title-group">
                <h3>
                  {task ? 'Edit Task' : 'Create New Task'}
                </h3>
                <p>
                  {task ? 'Update task details below' : 'Fill in the details to create a new task'}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="task-form-close"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Form Content */}
          <div className="task-form-content">
            {/* Form */}
            <form onSubmit={handleSubmit} className="task-form">
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="error-message"
              >
                {errors.submit}
              </motion.div>
            )}

            {/* Task Title */}
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="Enter task title..."
                maxLength={100}
              />
              {errors.title && <div className="field-error">{errors.title}</div>}
              <div className="character-counter">
                {formData.title.length}/100 characters
              </div>
            </div>

            {/* Task Description */}
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                placeholder="Describe the task in detail..."
                rows={4}
                maxLength={500}
              />
              {errors.description && <div className="field-error">{errors.description}</div>}
              <div className="character-counter">
                {formData.description.length}/500 characters
              </div>
            </div>

            {/* Priority and Category Row */}
            <div className="form-group row">
              {/* Priority */}
              <div className="form-group">
                <label className="form-label">Priority *</label>
                <div className="input-container">
                  <div className="input-icon">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="form-select with-icon priority-select"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category *</label>
                <div className="input-container">
                  <div className="input-icon">
                    <Tag className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`form-input with-icon ${errors.category ? 'error' : ''}`}
                    placeholder="e.g., Development, Design, Marketing"
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map(category => (
                      <option key={category} value={category} />
                    ))}
                    <option value="Development" />
                    <option value="Design" />
                    <option value="Marketing" />
                    <option value="Testing" />
                    <option value="Documentation" />
                    <option value="Meeting" />
                    <option value="Research" />
                  </datalist>
                </div>
                {errors.category && <div className="field-error">{errors.category}</div>}
              </div>
            </div>

            {/* Assignee and Due Date Row */}
            <div className="form-group row">
              {/* Assignee */}
              <div className="form-group">
                <label className="form-label">Assignee *</label>
                <div className="input-container">
                  <div className="input-icon">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    name="assignee"
                    value={formData.assignee}
                    onChange={handleChange}
                    className={`form-input with-icon ${errors.assignee ? 'error' : ''}`}
                    placeholder="Enter assignee name"
                    list="assignees"
                  />
                  <datalist id="assignees">
                    {assignees.map(assignee => (
                      <option key={assignee} value={assignee} />
                    ))}
                    <option value="John Doe" />
                    <option value="Jane Smith" />
                    <option value="Bob Johnson" />
                    <option value="Alice Brown" />
                    <option value="Charlie Wilson" />
                  </datalist>
                </div>
                {errors.assignee && <div className="field-error">{errors.assignee}</div>}
              </div>

              {/* Due Date */}
              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <div className="input-container">
                  <div className="input-icon">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className={`form-input with-icon ${errors.dueDate ? 'error' : ''}`}
                    min={today}
                  />
                </div>
                {errors.dueDate && <div className="field-error">{errors.dueDate}</div>}
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="form-btn form-btn-secondary"
              >
                Cancel
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`form-btn form-btn-primary ${task ? 'edit' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="form-loading-spinner"></div>
                    {task ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <>
                    {task ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {task ? 'Update Task' : 'Create Task'}
                  </>
                )}
              </motion.button>
            </div>
          </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TaskForm;
