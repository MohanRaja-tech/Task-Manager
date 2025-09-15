import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const notificationButtonRef = useRef(null);
  const userButtonRef = useRef(null);

  // Function to calculate dropdown position
  const getDropdownPosition = (buttonRef, dropdownWidth = 280) => {
    if (!buttonRef.current) return { top: 0, left: 0 };
    
    const rect = buttonRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    return {
      top: rect.bottom + scrollTop + 12, // 12px gap
      left: rect.right + scrollLeft - dropdownWidth, // Align to right edge of button
    };
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationButtonRef.current && !notificationButtonRef.current.contains(event.target) && 
          !event.target.closest('.notifications-dropdown-portal')) {
        setShowNotifications(false);
      }
        if (userButtonRef.current && !userButtonRef.current.contains(event.target) && 
          !event.target.closest('.user-dropdown-portal')) {
        setShowUserMenu(false);
      }
    };

    if (showNotifications || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showNotifications, showUserMenu]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToAdmin = () => {
    navigate('/admin');
  };

  // Real notifications would come from props or context
  const notifications = [];

  // Notification Dropdown Portal
  const NotificationDropdown = () => {
    if (!showNotifications) return null;
    
    const position = getDropdownPosition(notificationButtonRef, 320);
    
    return createPortal(
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="notifications-dropdown notifications-dropdown-portal"
        style={{ 
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 999999,
          width: '20rem',
          maxHeight: '24rem'
        }}
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
      </motion.div>,
      document.body
    );
  };

  // User Dropdown Portal
  const UserDropdown = () => {
    if (!showUserMenu) return null;
    
    const position = getDropdownPosition(userButtonRef, 224);
    
    return createPortal(
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="user-dropdown user-dropdown-portal"
        style={{ 
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 999999,
          width: '14rem'
        }}
      >
        <div className="user-dropdown-header">
          <p className="user-dropdown-name">{user?.name || user?.username || 'User'}</p>
          <p className="user-dropdown-email">{user?.email || 'user@example.com'}</p>
        </div>
        <div className="user-dropdown-menu">
          <button className="user-dropdown-item profile">
            <User className="dropdown-item-icon" />
            Profile Settings
          </button>
          {user?.role === 'admin' && (
            <button onClick={goToAdmin} className="user-dropdown-item admin">
              <Shield className="dropdown-item-icon" />
              Admin Panel
            </button>
          )}
          <div className="dropdown-divider" />
          <button onClick={handleLogout} className="user-dropdown-item logout">
            <LogOut className="dropdown-item-icon" />
            Sign Out
          </button>
        </div>
      </motion.div>,
      document.body
    );
  };

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
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2387/2387635.png" 
                alt="TaskFlow Pro Logo"
                className="logo-image"
              />
            </motion.div>
            <div className="logo-text">
              <h1 className="logo-title">TaskFlow Pro</h1>
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
                ref={notificationButtonRef}
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="notification-btn"
              >
                <Bell className="notification-icon" />
                {notifications.length > 0 && (
                  <span className="notification-badge">
                    {notifications.length}
                  </span>
                )}
              </motion.button>
            </div>

            {/* User Menu */}
            <div className="user-menu-wrapper">
              <motion.button
                ref={userButtonRef}
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="user-menu-btn"
              >
                <div className="user-avatar">
                  <span className="user-avatar-text">
                    {(user?.name || user?.username || 'U')?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="user-info">
                  <p className="user-name">{user?.name || user?.username || 'User'}</p>
                  <p className="user-role">{user?.role || 'Member'}</p>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Dropdowns rendered via portals */}
      <NotificationDropdown />
      <UserDropdown />

      {/* Overlay for mobile */}
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
