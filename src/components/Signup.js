import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import config from '../config';
import Footer from './Footer';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import LoadingAnimation from './LoadingAnimation';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const navigate = useNavigate();

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific error when user starts typing
    setFieldErrors(prev => ({
      ...prev,
      [name]: ''
    }));

    // Check username availability after user stops typing
    if (name === 'username' && value.length >= 3) {
      setCheckingUsername(true);
      try {
        const response = await axios.post(`${config.API_URL}/api/auth/check-username`, {
          username: value
        });
        if (response.data.available) {
          setFieldErrors(prev => ({
            ...prev,
            username: ''
          }));
        } else {
          setFieldErrors(prev => ({
            ...prev,
            username: 'Username is already taken'
          }));
        }
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setCheckingUsername(false);
      }
    }
  };

  const validateUsername = (username) => {
    // Username should be 3-20 characters, alphanumeric with underscores and hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    // Validation
    const errors = {};
    
    if (!validateUsername(formData.username)) {
      errors.username = 'Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${config.API_URL}/api/auth/signup`, {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Account created successfully! Please login to continue.'
          }
        });
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('Username')) {
          setFieldErrors(prev => ({
            ...prev,
            username: error.response.data.message
          }));
        } else if (error.response.data.message.includes('Email')) {
          setFieldErrors(prev => ({
            ...prev,
            email: error.response.data.message
          }));
        } else {
          setError(error.response.data.message);
        }
      } else {
        setError('An error occurred during signup');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="auth-container" style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to right, #fdb99b, #cf8bf3, #a770ef)'
    }}>
      <LoadingAnimation message="Creating your account..." />
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-logo-section">
        <img src="/logo.png" alt="KarmaSync Logo" className="auth-logo" />
      </div>
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p className="auth-subtitle">Join us to start your productivity journey</p>
          </div>
          
          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div className="auth-success">
              Account created successfully! Redirecting to login...
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="text"
                name="fullName"
                required
                className={`auth-input ${fieldErrors.fullName ? 'error' : ''}`}
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
              />
              {fieldErrors.fullName && <div className="field-error">{fieldErrors.fullName}</div>}
            </div>
            
            <div className="form-group">
              <input
                type="text"
                name="username"
                required
                className={`auth-input ${fieldErrors.username ? 'error' : ''}`}
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
              {checkingUsername && <div className="checking-username">Checking username availability...</div>}
              {fieldErrors.username && <div className="field-error">{fieldErrors.username}</div>}
              <small className="input-hint">3-20 characters, letters, numbers, _ and - only</small>
            </div>
            
            <div className="form-group">
              <input
                type="email"
                name="email"
                required
                className={`auth-input ${fieldErrors.email ? 'error' : ''}`}
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
            </div>
            
            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className={`auth-input ${fieldErrors.password ? 'error' : ''}`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
            </div>
            
            <div className="form-group password-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                className={`auth-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading || checkingUsername || Object.keys(fieldErrors).length > 0}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Login
              </Link>
            </p>
            <Link to="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
            <Link to="/" className="auth-link back-link">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup; 