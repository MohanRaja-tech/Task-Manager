import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Shield, 
  Users, 
  Activity, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Eye, 
  Calendar,
  Monitor,
  Globe,
  Smartphone
} from 'lucide-react';
import { format } from 'date-fns';
import AdminHeader from './AdminHeader';
import './AdminPanel.css';

const AdminPanel = () => {
  const { getLoginAttempts } = useAuth();
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [viewType, setViewType] = useState('all');

  useEffect(() => {
    const attempts = getLoginAttempts();
    setLoginAttempts(attempts);
  }, [getLoginAttempts]);

  // Filter attempts based on time range
  const filterByTimeRange = (attempts) => {
    const now = new Date();
    const timeRanges = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    
    const days = timeRanges[selectedTimeRange];
    const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    return attempts.filter(attempt => new Date(attempt.timestamp) >= cutoffDate);
  };

  // Filter attempts based on view type
  const filterByViewType = (attempts) => {
    if (viewType === 'successful') return attempts.filter(attempt => attempt.success);
    if (viewType === 'failed') return attempts.filter(attempt => !attempt.success);
    return attempts;
  };

  const filteredAttempts = filterByViewType(filterByTimeRange(loginAttempts));

  // Calculate statistics
  const stats = {
    total: filteredAttempts.length,
    successful: filteredAttempts.filter(attempt => attempt.success).length,
    failed: filteredAttempts.filter(attempt => !attempt.success).length,
    uniqueUsers: new Set(filteredAttempts.map(attempt => attempt.email)).size,
    uniqueIPs: new Set(filteredAttempts.map(attempt => attempt.ip)).size
  };

  // Get device type from user agent
  const getDeviceType = (userAgent) => {
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) return 'Mobile';
    if (/Tablet|iPad/.test(userAgent)) return 'Tablet';
    return 'Desktop';
  };

  return (
    <div className="admin-panel">
      <AdminHeader />
      
      <main className="admin-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="admin-fade-in"
        >
          {/* Statistics Cards */}
          <div className="admin-stats-grid">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="admin-stat-card info"
            >
              <div className="stat-header">
                <div className="stat-icon info">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Attempts</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="admin-stat-card success"
            >
              <div className="stat-header">
                <div className="stat-icon success">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
              <div className="stat-value">{stats.successful}</div>
              <div className="stat-label">Successful Logins</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="admin-stat-card danger"
            >
              <div className="stat-header">
                <div className="stat-icon danger">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div className="stat-value">{stats.failed}</div>
              <div className="stat-label">Failed Attempts</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="admin-stat-card info"
            >
              <div className="stat-header">
                <div className="stat-icon info">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="stat-value">{stats.uniqueUsers}</div>
              <div className="stat-label">Unique Users</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="admin-stat-card warning"
            >
              <div className="stat-header">
                <div className="stat-icon warning">
                  <Globe className="h-5 w-5" />
                </div>
              </div>
              <div className="stat-value">{stats.uniqueIPs}</div>
              <div className="stat-label">Unique IPs</div>
            </motion.div>
          </div>

          {/* Control Panel */}
          <div className="admin-controls">
            <div className="controls-header">
              <h3 className="controls-title">Filter & Analysis</h3>
              <div className="controls-filters">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="control-select"
                >
                  <option value="1d">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>

                <select
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                  className="control-select"
                >
                  <option value="all">All Attempts</option>
                  <option value="successful">Successful Only</option>
                  <option value="failed">Failed Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Login Attempts Table */}
          <div className="admin-table-container">
            <div className="admin-table-header">
              <h3 className="admin-table-title">Recent Login Attempts</h3>
            </div>
            
            {filteredAttempts.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>User</th>
                    <th>Device</th>
                    <th>IP Address</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.slice(0, 20).map((attempt, index) => (
                    <tr key={index}>
                      <td>
                        <span className={`status-badge ${attempt.success ? 'success' : 'failed'}`}>
                          {attempt.success ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {attempt.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td>{attempt.email}</td>
                      <td>
                        <div className="device-type">
                          {getDeviceType(attempt.userAgent) === 'Mobile' ? (
                            <Smartphone className="device-icon" />
                          ) : (
                            <Monitor className="device-icon" />
                          )}
                          {getDeviceType(attempt.userAgent)}
                        </div>
                      </td>
                      <td>
                        <div className="ip-info">
                          <div className="ip-address">{attempt.ip}</div>
                          <div className="location">{attempt.location || 'Unknown'}</div>
                        </div>
                      </td>
                      <td>
                        <div className="time-info">
                          <div className="time-primary">
                            {format(new Date(attempt.timestamp), 'MMM d, HH:mm')}
                          </div>
                          <div className="time-secondary">
                            {format(new Date(attempt.timestamp), 'yyyy')}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty-state">
                <Eye className="empty-icon" />
                <h3>No login attempts found</h3>
                <p>No data available for the selected time range and filters.</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminPanel;
