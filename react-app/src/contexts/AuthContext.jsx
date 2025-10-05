import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithGoogle } from '../config/firebase';
import config from '../config/config';

const AuthContext = createContext();

// Backend API configuration
const API_BASE_URL = config.authUrl;

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
    const token = localStorage.getItem('taskManagerToken');
    const savedUser = localStorage.getItem('taskManagerUser');
    const savedAttempts = localStorage.getItem('taskManagerLoginAttempts');
    
    if (token && savedUser) {
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
      console.log('Attempting login with:', { identifier: email });
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          identifier: email, // Backend expects 'identifier' not 'email'
          password 
        }),
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);

      // Log login attempt
      const attempt = {
        id: Date.now(),
        email,
        success: response.ok,
        timestamp: new Date().toISOString(),
        ip: '192.168.1.' + Math.floor(Math.random() * 255), // Mock IP
        userAgent: navigator.userAgent
      };

      const updatedAttempts = [attempt, ...loginAttempts].slice(0, 100);
      setLoginAttempts(updatedAttempts);
      localStorage.setItem('taskManagerLoginAttempts', JSON.stringify(updatedAttempts));

      if (response.ok) {
        const { token, user } = data.data; // Backend returns data.data
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('taskManagerToken', token);
        localStorage.setItem('taskManagerUser', JSON.stringify(user));
        return { success: true, user };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Network error occurred' };
    }
  };

  const signup = async (userData) => {
    try {
      console.log('Attempting signup with:', { username: userData.name, email: userData.email });
      
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.name, // Map name to username for backend
          email: userData.email,
          password: userData.password
        }),
      });

      console.log('Signup response status:', response.status);
      const data = await response.json();
      console.log('Signup response data:', data);

      if (response.ok) {
        const { token, user } = data.data; // Backend returns data.data
        
        // Don't automatically log in after signup, redirect to login instead
        return { 
          success: true, 
          user,
          message: 'Account created successfully! Please login with your credentials.' 
        };
      } else {
        // Handle validation errors
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors.map(error => error.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'Network error occurred' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('taskManagerToken');
    localStorage.removeItem('taskManagerUser');
  };

  const loginWithGoogle = async () => {
    try {
      console.log('Attempting Google sign in...');
      
      // Sign in with Firebase Google Auth
      const firebaseResult = await signInWithGoogle();
      
      if (!firebaseResult.success) {
        throw new Error(firebaseResult.error);
      }
      
      console.log('Firebase Google sign in successful, verifying with backend...');
      
      // Send ID token to backend for verification and user creation/login
      const response = await fetch(`${API_BASE_URL}/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idToken: firebaseResult.idToken 
        }),
      });
      
      console.log('Backend Google auth response status:', response.status);
      const data = await response.json();
      console.log('Backend Google auth response data:', data);
      
      if (response.ok) {
        const { token, user } = data.data;
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('taskManagerToken', token);
        localStorage.setItem('taskManagerUser', JSON.stringify(user));
        
        // Log successful login attempt
        const attempt = {
          id: Date.now(),
          email: user.email,
          success: true,
          timestamp: new Date().toISOString(),
          ip: '192.168.1.' + Math.floor(Math.random() * 255),
          userAgent: navigator.userAgent,
          method: 'google'
        };
        
        const updatedAttempts = [attempt, ...loginAttempts].slice(0, 100);
        setLoginAttempts(updatedAttempts);
        localStorage.setItem('taskManagerLoginAttempts', JSON.stringify(updatedAttempts));
        
        return { success: true, user };
      } else {
        throw new Error(data.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      
      // Log failed login attempt
      const attempt = {
        id: Date.now(),
        email: 'google_user',
        success: false,
        timestamp: new Date().toISOString(),
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: navigator.userAgent,
        method: 'google'
      };
      
      const updatedAttempts = [attempt, ...loginAttempts].slice(0, 100);
      setLoginAttempts(updatedAttempts);
      localStorage.setItem('taskManagerLoginAttempts', JSON.stringify(updatedAttempts));
      
      return { success: false, error: error.message || 'Google authentication failed' };
    }
  };

  const signupWithGoogle = async () => {
    try {
      console.log('Attempting Google sign up...');
      
      // Sign in with Firebase Google Auth
      const firebaseResult = await signInWithGoogle();
      
      if (!firebaseResult.success) {
        throw new Error(firebaseResult.error);
      }
      
      console.log('Firebase Google sign in successful, creating account with backend...');
      
      // Send ID token to backend for user creation
      const response = await fetch(`${API_BASE_URL}/google-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idToken: firebaseResult.idToken 
        }),
      });
      
      console.log('Backend Google signup response status:', response.status);
      const data = await response.json();
      console.log('Backend Google signup response data:', data);
      
      if (response.ok) {
        const { token, user } = data;
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('taskManagerToken', token);
        localStorage.setItem('taskManagerUser', JSON.stringify(user));
        
        // Log successful signup attempt
        const attempt = {
          id: Date.now(),
          email: user.email,
          success: true,
          timestamp: new Date().toISOString(),
          ip: '192.168.1.' + Math.floor(Math.random() * 255),
          userAgent: navigator.userAgent,
          method: 'google-signup'
        };
        
        const updatedAttempts = [attempt, ...loginAttempts].slice(0, 100);
        setLoginAttempts(updatedAttempts);
        localStorage.setItem('taskManagerLoginAttempts', JSON.stringify(updatedAttempts));
        
        return { success: true, user };
      } else {
        // Handle specific signup errors
        if (response.status === 409) {
          throw new Error('Account already exists. Please use Sign In instead.');
        }
        throw new Error(data.message || 'Google signup failed');
      }
    } catch (error) {
      console.error('Google signup error:', error);
      
      // Log failed signup attempt
      const attempt = {
        id: Date.now(),
        email: 'google_user',
        success: false,
        timestamp: new Date().toISOString(),
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: navigator.userAgent,
        method: 'google-signup'
      };
      
      const updatedAttempts = [attempt, ...loginAttempts].slice(0, 100);
      setLoginAttempts(updatedAttempts);
      localStorage.setItem('taskManagerLoginAttempts', JSON.stringify(updatedAttempts));
      
      return { success: false, error: error.message || 'Google signup failed' };
    }
  };

  const signinWithGoogle = async () => {
    try {
      console.log('Attempting Google sign in...');
      
      // Sign in with Firebase Google Auth
      const firebaseResult = await signInWithGoogle();
      
      if (!firebaseResult.success) {
        throw new Error(firebaseResult.error);
      }
      
      console.log('Firebase Google sign in successful, verifying with backend...');
      
      // Send ID token to backend for user verification and login
      const response = await fetch(`${API_BASE_URL}/google-signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          idToken: firebaseResult.idToken 
        }),
      });
      
      console.log('Backend Google signin response status:', response.status);
      const data = await response.json();
      console.log('Backend Google signin response data:', data);
      
      if (response.ok) {
        const { token, user } = data;
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('taskManagerToken', token);
        localStorage.setItem('taskManagerUser', JSON.stringify(user));
        
        // Log successful signin attempt
        const attempt = {
          id: Date.now(),
          email: user.email,
          success: true,
          timestamp: new Date().toISOString(),
          ip: '192.168.1.' + Math.floor(Math.random() * 255),
          userAgent: navigator.userAgent,
          method: 'google-signin'
        };
        
        const updatedAttempts = [attempt, ...loginAttempts].slice(0, 100);
        setLoginAttempts(updatedAttempts);
        localStorage.setItem('taskManagerLoginAttempts', JSON.stringify(updatedAttempts));
        
        return { success: true, user };
      } else {
        // Handle specific signin errors
        if (response.status === 404) {
          throw new Error('Account not found. Please sign up first.');
        }
        throw new Error(data.message || 'Google signin failed');
      }
    } catch (error) {
      console.error('Google signin error:', error);
      
      // Log failed signin attempt
      const attempt = {
        id: Date.now(),
        email: 'google_user',
        success: false,
        timestamp: new Date().toISOString(),
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: navigator.userAgent,
        method: 'google-signin'
      };
      
      const updatedAttempts = [attempt, ...loginAttempts].slice(0, 100);
      setLoginAttempts(updatedAttempts);
      localStorage.setItem('taskManagerLoginAttempts', JSON.stringify(updatedAttempts));
      
      return { success: false, error: error.message || 'Google signin failed' };
    }
  };

  const getLoginAttempts = () => {
    return loginAttempts;
  };

  const getAuthToken = () => {
    return localStorage.getItem('taskManagerToken');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle, // Legacy function for backward compatibility
    signupWithGoogle,
    signinWithGoogle,
    getLoginAttempts,
    getAuthToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Export getAuthToken for use in services
export const getAuthToken = () => {
  return localStorage.getItem('taskManagerToken');
};
