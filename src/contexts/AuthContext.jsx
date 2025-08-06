import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState([]);

  useEffect(() => {
    // Check for existing authentication on app load
    const savedUser = localStorage.getItem('taskManagerUser');
    const savedAttempts = localStorage.getItem('taskManagerLoginAttempts');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
    
    if (savedAttempts) {
      setLoginAttempts(JSON.parse(savedAttempts));
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication logic
      const mockUsers = [
        { 
          id: 1, 
          email: 'admin@taskmanager.com', 
          password: 'admin123', 
          role: 'admin', 
          name: 'Admin User',
          avatar: null
        },
        { 
          id: 2, 
          email: 'user@taskmanager.com', 
          password: 'user123', 
          role: 'user', 
          name: 'John Doe',
          avatar: null
        }
      ];

      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      // Log login attempt
      const attempt = {
        id: Date.now(),
        email,
        success: !!foundUser,
        timestamp: new Date().toISOString(),
        ip: '192.168.1.' + Math.floor(Math.random() * 255), // Mock IP
        userAgent: navigator.userAgent
      };

      const updatedAttempts = [attempt, ...loginAttempts].slice(0, 100); // Keep last 100 attempts
      setLoginAttempts(updatedAttempts);
      localStorage.setItem('taskManagerLoginAttempts', JSON.stringify(updatedAttempts));

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        setIsAuthenticated(true);
        localStorage.setItem('taskManagerUser', JSON.stringify(userWithoutPassword));
        return { success: true, user: userWithoutPassword };
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user creation
      const newUser = {
        id: Date.now(),
        email: userData.email,
        name: userData.name,
        role: 'user',
        avatar: null,
        createdAt: new Date().toISOString()
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('taskManagerUser', JSON.stringify(newUser));
      
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('taskManagerUser');
  };

  const getLoginAttempts = () => {
    return loginAttempts;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    getLoginAttempts
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
