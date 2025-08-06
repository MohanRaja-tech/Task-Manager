import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Bell, Search, Settings, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ user, onCreateTask }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToAdmin = () => {
    navigate('/admin');
  };

  // Real notifications would come from props or context
  const notifications = [];

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo and Title */}
          <div className="header-logo">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="logo-icon"
            >
              <span>T</span>
            </motion.div>
            <div className="logo-text">
              <h1 className="logo-title">TaskManager</h1>
              <p className="logo-subtitle">Professional Task Management</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="header-search">
            <div className="search-container">
              <div className="search-icon">
                <Search className="search-icon-svg" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                className="search-input"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="header-actions">
            {/* Create Task Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateTask}
              className="create-task-btn"
            >
              <Plus className="btn-icon" />
              New Task
            </motion.button>

            {/* Notifications */}
            <div className="notification-wrapper">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="notification-btn"
              >
                <Bell className="notification-icon" />
                {notifications.length > 0 && (
                  <span className="notification-badge">
                    {notifications.length}
                  </span>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="notifications-dropdown"
                >
                  <div className="notifications-header">
                    <h3 className="notifications-title">Notifications</h3>
                  </div>
                  <div className="notifications-list">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div key={notification.id} className="notification-item">
                          <div className="notification-content">
                            <div className={`notification-dot ${notification.type}`} />
                            <div className="notification-details">
                              <h4 className="notification-item-title">{notification.title}</h4>
                              <p className="notification-item-message">{notification.message}</p>
                              <p className="notification-item-time">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="notification-empty">
                        <p>No notifications</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* User Menu */}
            <div className="user-menu-wrapper">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="user-menu-btn"
              >
                <div className="user-avatar">
                  <span className="user-avatar-text">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="user-info">
                  <p className="user-name">{user?.name}</p>
                  <p className="user-role">{user?.role}</p>
                </div>
              </motion.button>

              {/* User Dropdown */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="user-dropdown"
                >
                  <div className="user-dropdown-header">
                    <p className="user-dropdown-name">{user?.name}</p>
                    <p className="user-dropdown-email">{user?.email}</p>
                  </div>
                  <div className="user-dropdown-menu">
                    <button 
                      onClick={handleLogout}
                      className="user-dropdown-item logout"
                    >
                      <LogOut className="dropdown-item-icon" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="dropdown-overlay"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;
