import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Smartphone,
  LogOut,
  User,
  TrendingUp,
  UserCheck,
  Settings,
  BarChart3,
  PieChart,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MapPin,
  Wifi
} from 'lucide-react';
import { format, formatDistance } from 'date-fns';
import AdminHeader from './AdminHeader';
import './AdminPanelNew.css';

const AdminPanelNew = () => {
  const { logout, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [userLoginHistory, setLoginHistory] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState([]);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('taskManagerToken');
      console.log('Fetching dashboard stats with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Dashboard stats response status:', response.status);
      const data = await response.json();
      console.log('Dashboard stats data:', data);
      
      if (data.success) {
        setDashboardStats(data.data);
      } else {
        console.error('Dashboard stats error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch all users with detailed information
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('taskManagerToken');
      console.log('Fetching users with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Users response status:', response.status);
      const data = await response.json();
      console.log('Users data:', data);
      
      if (data.success) {
        // The backend returns data.data as an array, not data.data.users
        setUsers(data.data || []);
      } else {
        console.error('Users fetch error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch user tasks
  const fetchUserTasks = async (userId) => {
    try {
      const token = localStorage.getItem('taskManagerToken');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setUserTasks(data.data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching user tasks:', error);
    }
  };

  // Fetch user login history
  const fetchUserLoginHistory = async (userId) => {
    try {
      const token = localStorage.getItem('taskManagerToken');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/login-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setLoginHistory(data.data.loginHistory || []);
      }
    } catch (error) {
      console.error('Error fetching login history:', error);
    }
  };

  // Fetch login attempts
  const fetchLoginAttempts = async () => {
    try {
      const token = localStorage.getItem('taskManagerToken');
      const response = await fetch('http://localhost:5000/api/admin/login-attempts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setLoginAttempts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching login attempts:', error);
    }
  };

  // Refresh all data
  const refreshAllData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboardStats(),
      fetchUsers()
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await refreshAllData();
      setLoading(false);
    };

    initializeData();
  }, []);

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Handle user selection
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setActiveTab('user-details');
    // For now, we'll just show user info without detailed tasks and login history
    setUserTasks([]);
    setLoginHistory([]);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Format session time
  const formatSessionTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading Admin Panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel-new">
      <AdminHeader />
      
      {/* Admin Navigation */}
      <div className="admin-nav">
        <div className="nav-left">
          <button 
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={20} />
            Dashboard
          </button>
          <button 
            className={`nav-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            Users
          </button>
          <button 
            className={`nav-button ${activeTab === 'login-activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('login-activity')}
          >
            <Activity size={20} />
            Login Activity
          </button>
        </div>
        
        <div className="nav-right">
          <button 
            className="refresh-button"
            onClick={refreshAllData}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <div className="admin-user-info">
            <Shield size={16} />
            <span>{user?.name || 'Admin'}</span>
          </div>
          
          <button 
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <AnimatePresence mode="wait">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="dashboard-content"
            >
              <h2>Admin Dashboard</h2>
              
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon users">
                    <Users size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>{dashboardStats.userStats?.total || 0}</h3>
                    <p>Total Users</p>
                    <small>{dashboardStats.userStats?.recent || 0} new this week</small>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon active">
                    <UserCheck size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>{dashboardStats.userStats?.active || 0}</h3>
                    <p>Active Users</p>
                    <small>Currently using the platform</small>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon tasks">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>{dashboardStats.taskStats?.total || 0}</h3>
                    <p>Total Tasks</p>
                    <small>{dashboardStats.taskStats?.completionRate || 0}% completion rate</small>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon logins">
                    <Activity size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>{dashboardStats.loginStats?.successfulLogins || 0}</h3>
                    <p>Login Sessions</p>
                    <small>{dashboardStats.loginStats?.successRate || 0}% success rate</small>
                  </div>
                </div>
              </div>

              {/* Top Users */}
              <div className="top-users-section">
                <h3>Most Active Users</h3>
                <div className="top-users-list">
                  {dashboardStats.topUsers?.slice(0, 5).map((user, index) => (
                    <div key={user._id} className="top-user-item">
                      <div className="user-rank">#{index + 1}</div>
                      <div className="user-info">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                      <div className="user-stats">
                        <span className="task-count">{user.taskCount} tasks</span>
                        <span className="completion-rate">{user.completionRate}% complete</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="users-content"
            >
              <div className="users-header">
                <h2>User Management</h2>
                <div className="users-controls">
                  <div className="search-box">
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="status-filter"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active Users</option>
                    <option value="inactive">Inactive Users</option>
                  </select>
                </div>
              </div>

              <div className="users-list">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                  <motion.div
                    key={user._id}
                    className="user-card"
                    whileHover={{ y: -2 }}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="user-main-info">
                      <div className="user-avatar">
                        <User size={24} />
                      </div>
                      <div className="user-details">
                        <h3>{user.name || 'Unknown User'}</h3>
                        <p>{user.email}</p>
                        <div className="user-meta">
                          <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="join-date">
                            Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="user-stats-quick">
                      <div className="stat">
                        <CheckCircle size={16} />
                        <span>{user.taskCount || 0} tasks</span>
                      </div>
                      <div className="stat">
                        <Activity size={16} />
                        <span>{user.completedTasks || 0} completed</span>
                      </div>
                      <div className="stat">
                        <Clock size={16} />
                        <span>{user.completionRate || 0}% done</span>
                      </div>
                    </div>
                    
                    <div className="user-actions">
                      <button className="view-details-btn">
                        <ExternalLink size={16} />
                        View Details
                      </button>
                    </div>
                  </motion.div>
                )) : (
                  <div className="no-users-message">
                    <User size={48} />
                    <h3>No Users Found</h3>
                    <p>No users match your current search and filter criteria.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* User Details Tab */}
          {activeTab === 'user-details' && selectedUser && (
            <motion.div
              key="user-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="user-details-content"
            >
              <div className="user-details-header">
                <button 
                  className="back-button"
                  onClick={() => setActiveTab('users')}
                >
                  ← Back to Users
                </button>
                <h2>{selectedUser.name}</h2>
              </div>

              <div className="user-details-grid">
                {/* User Info Card */}
                <div className="detail-card user-info-card">
                  <h3>User Information</h3>
                  <div className="user-info-grid">
                    <div className="info-item">
                      <label>Name:</label>
                      <span>{selectedUser.name}</span>
                    </div>
                    <div className="info-item">
                      <label>Email:</label>
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Username:</label>
                      <span>{selectedUser.username || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Status:</label>
                      <span className={`status ${selectedUser.isActive ? 'active' : 'inactive'}`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Auth Provider:</label>
                      <span>{selectedUser.authProvider}</span>
                    </div>
                    <div className="info-item">
                      <label>Last Login:</label>
                      <span>
                        {selectedUser.lastLogin 
                          ? format(new Date(selectedUser.lastLogin), 'PPp')
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tasks Summary */}
                <div className="detail-card tasks-summary-card">
                  <h3>Tasks Summary</h3>
                  <div className="tasks-stats">
                    <div className="task-stat">
                      <div className="task-stat-number">{selectedUser.taskCount || 0}</div>
                      <div className="task-stat-label">Total Tasks</div>
                    </div>
                    <div className="task-stat completed">
                      <div className="task-stat-number">{selectedUser.completedTasks || 0}</div>
                      <div className="task-stat-label">Completed</div>
                    </div>
                    <div className="task-stat in-progress">
                      <div className="task-stat-number">0</div>
                      <div className="task-stat-label">In Progress</div>
                    </div>
                    <div className="task-stat pending">
                      <div className="task-stat-number">{(selectedUser.taskCount || 0) - (selectedUser.completedTasks || 0)}</div>
                      <div className="task-stat-label">Pending</div>
                    </div>
                  </div>
                  <div className="completion-rate">
                    Completion Rate: {selectedUser.completionRate || 0}%
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Login Activity Tab */}
          {activeTab === 'login-activity' && (
            <motion.div
              key="login-activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="login-activity-content"
            >
              <h2>Login Activity</h2>
              <div className="activity-stats-summary">
                <div className="activity-stat-card">
                  <h3>Total Login Attempts</h3>
                  <div className="big-number">{dashboardStats.loginStats?.totalAttempts || 0}</div>
                </div>
                <div className="activity-stat-card">
                  <h3>Successful Logins</h3>
                  <div className="big-number success">{dashboardStats.loginStats?.successfulLogins || 0}</div>
                </div>
                <div className="activity-stat-card">
                  <h3>Failed Attempts</h3>
                  <div className="big-number failed">{dashboardStats.loginStats?.failedLogins || 0}</div>
                </div>
                <div className="activity-stat-card">
                  <h3>Success Rate</h3>
                  <div className="big-number">{Math.round(dashboardStats.loginStats?.successRate || 0)}%</div>
                </div>
              </div>
              
              <div className="recent-activity">
                <h3>Recent User Activity</h3>
                <div className="user-activity-list">
                  {users.filter(user => user.lastLogin).sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin)).slice(0, 10).map((user) => (
                    <div key={user._id} className="activity-item">
                      <div className="user-activity-info">
                        <div className="user-activity-avatar">
                          <User size={20} />
                        </div>
                        <div className="user-activity-details">
                          <strong>{user.name || user.username}</strong>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                      <div className="activity-time">
                        <span className="last-seen">Last seen:</span>
                        <span className="time">
                          {user.lastLogin 
                            ? formatDistance(new Date(user.lastLogin), new Date(), { addSuffix: true })
                            : 'Never'
                          }
                        </span>
                      </div>
                      <div className="activity-status success">
                        Online
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPanelNew;
