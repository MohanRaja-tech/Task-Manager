import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminHeader.css';

const AdminHeader = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <header className="admin-header">
      <div className="admin-header-container">
        <div className="admin-header-content">
          {/* Logo and Title */}
          <div className="admin-logo-section">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="admin-logo"
            >
              <Shield className="shield-icon" />
            </motion.div>
            <div className="admin-branding">
              <h1 className="admin-title">Admin Panel</h1>
              <p className="admin-subtitle">TaskManager Administration</p>
            </div>
          </div>

          {/* Navigation and Actions */}
          <div className="admin-nav-actions">
            {/* User Menu */}
            <div className="user-menu-container">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`user-menu-trigger ${showUserMenu ? 'open' : ''}`}
              >
                <div className="user-avatar">
                  <Shield size={20} />
                </div>
                <div className="user-info">
                  <p className="user-name">Admin</p>
                  <p className="user-role">Administrator</p>
                </div>
              </motion.button>

              {/* User Dropdown */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="user-menu-dropdown"
                >
                  <button className="user-menu-item">
                    <User className="menu-item-icon" />
                    Profile
                  </button>
                  <button className="user-menu-item">
                    <Settings className="menu-item-icon" />
                    Admin Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="user-menu-item danger"
                  >
                    <LogOut className="menu-item-icon" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default AdminHeader;
