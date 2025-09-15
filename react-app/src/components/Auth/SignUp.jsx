import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signup, signupWithGoogle } = useAuth();
  const navigate = useNavigate();

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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const result = await signup({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password
      });
      
      if (result.success) {
        // Show success message and redirect to login
        alert(result.message || 'Account created successfully! Please login with your credentials.');
        navigate('/login');
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setErrors({});
    
    try {
      console.log('SignUp component: Attempting Google sign up...');
      const result = await signupWithGoogle();
      
      if (result.success) {
        console.log('SignUp component: Google sign up successful, navigating to dashboard...');
        // For Google sign-up, user is automatically signed in
        navigate('/dashboard');
      } else {
        console.log('SignUp component: Google sign up failed:', result.error);
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error('SignUp component: Google sign up error:', error);
      setErrors({ submit: 'Google sign-up failed. Please try again.' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="auth-container signup-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-card"
      >
        {/* Header */}
        <div className="auth-header">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="auth-icon signup-icon"
          >
            <img 
              src="https://cdn-icons-png.flaticon.com/512/2387/2387635.png" 
              alt="TaskFlow Pro"
              className="auth-logo-image"
            />
          </motion.div>
          <h2 className="auth-title">
            Join TaskFlow Pro
          </h2>
          <p className="auth-subtitle">
            Create your professional task management account
          </p>
        </div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="auth-form-container"
        >
          <form onSubmit={handleSubmit} className="auth-form">
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="error-message"
              >
                {errors.submit}
              </motion.div>
            )}

            {/* Name Field */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-container">
                <div className="input-icon">
                  <User className="input-icon-svg" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-container">
                <div className="input-icon">
                  <Mail className="input-icon-svg" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-container">
                <div className="input-icon">
                  <Lock className="input-icon-svg" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? (
                    <EyeOff className="password-toggle-icon" />
                  ) : (
                    <Eye className="password-toggle-icon" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`strength-bar ${level <= passwordStrength ? 'active' : ''}`}
                        data-strength={passwordStrength}
                      />
                    ))}
                  </div>
                  <div className="strength-text">
                    Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                  </div>
                </div>
              )}
              
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-container">
                <div className="input-icon">
                  <Lock className="input-icon-svg" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="password-toggle-icon" />
                  ) : (
                    <Eye className="password-toggle-icon" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? (
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="submit-content">
                  <UserPlus className="submit-icon" />
                  Create Account
                </div>
              )}
            </motion.button>

            {/* Divider */}
            <div className="auth-divider">
              <span className="divider-line"></span>
              <span className="divider-text">or</span>
              <span className="divider-line"></span>
            </div>

            {/* Google Sign-up Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleSignUp}
              className="google-auth-btn"
            >
              {googleLoading ? (
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  Signing up with Google...
                </div>
              ) : (
                <div className="google-content">
                  <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </div>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="auth-link"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUp;
