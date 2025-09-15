import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import './TaskFilters.css';

const TaskFilters = ({ filters, onFiltersChange, categories, assignees }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      priority: 'all',
      category: 'all',
      assignee: 'all',
      search: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all' && value !== '');

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="task-filters-container"
    >
      <div className="filters-header">
        <div className="filters-title">
          <Filter className="filter-icon" />
          <h3>Filter Tasks</h3>
        </div>
        
        {hasActiveFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className="clear-filters-btn"
          >
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </motion.button>
        )}
      </div>

      <div className="filters-grid">
        {/* Search */}
        <div className="filter-group">
          <label className="filter-label">
            Search Tasks
          </label>
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
              placeholder="Search by task title..."
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <label className="filter-label">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div className="filter-group">
          <label className="filter-label">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="filter-select"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-label">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee Filter */}
        <div className="filter-group">
          <label className="filter-label">
            Assignee
          </label>
          <select
            value={filters.assignee}
            onChange={(e) => handleFilterChange('assignee', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Assignees</option>
            {assignees.map(assignee => (
              <option key={assignee} value={assignee}>
                {assignee}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="active-filters">
          <div className="active-filters-title">Active filters:</div>
          <div className="active-filters-list">
            {filters.search && (
              <span className="active-filter-tag">
                Search: "{filters.search}"
                <X 
                  className="filter-tag-remove"
                  onClick={() => handleFilterChange('search', '')}
                />
              </span>
            )}
            
            {filters.status !== 'all' && (
              <span className="active-filter-tag">
                Status: {statusOptions.find(opt => opt.value === filters.status)?.label}
                <X 
                  className="filter-tag-remove"
                  onClick={() => handleFilterChange('status', 'all')}
                />
              </span>
            )}
            
            {filters.priority !== 'all' && (
              <span className="active-filter-tag">
                Priority: {priorityOptions.find(opt => opt.value === filters.priority)?.label}
                <X 
                  className="filter-tag-remove"
                  onClick={() => handleFilterChange('priority', 'all')}
                />
              </span>
            )}
            
            {filters.category !== 'all' && (
              <span className="active-filter-tag">
                Category: {filters.category}
                <X 
                  className="filter-tag-remove"
                  onClick={() => handleFilterChange('category', 'all')}
                />
              </span>
            )}
            
            {filters.assignee !== 'all' && (
              <span className="active-filter-tag">
                Assignee: {filters.assignee}
                <X 
                  className="filter-tag-remove"
                  onClick={() => handleFilterChange('assignee', 'all')}
                />
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TaskFilters;
