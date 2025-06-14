import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup, checkUsername } from '../api/authApi';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import LoadingAnimation from './LoadingAnimation';
import Footer from './Footer';

const Signup = () => {
  console.log('Signup component rendered');
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
  const [availabilityStatus, setAvailabilityStatus] = useState({
    username: { isChecking: false, isAvailable: null, message: '' }
  });
  const navigate = useNavigate();

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) return;
    
    setAvailabilityStatus(prev => ({
      ...prev,
      username: { ...prev.username, isChecking: true }
    }));

    try {
      const response = await checkUsername(username);
      setAvailabilityStatus(prev => ({
        ...prev,
        username: {
          isChecking: false,
          isAvailable: response.available,
          message: response.message
        }
      }));
    } catch (error) {
      setAvailabilityStatus(prev => ({
        ...prev,
        username: {
          isChecking: false,
          isAvailable: false,
          message: error.message
        }
      }));
    }
  };

  // Debounced check function
  const debouncedCheckUsername = debounce(checkUsernameAvailability, 500);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    console.log('Input changed:', { field: name, value });
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setFieldErrors(prev => ({
      ...prev,
      [name]: ''
    }));

    // Trigger username availability check
    if (name === 'username' && value.length >= 3) {
      debouncedCheckUsername(value);
    }
  };

  const validateUsername = (username) => {
    console.log('Validating username:', username);
    const regex = /^[a-zA-Z0-9_-]+$/;
    return regex.test(username);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    console.log('Form data:', formData);

    // Reset errors
    setError('');
    setFieldErrors({});

    // Validate form data
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (!validateUsername(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    } else if (!availabilityStatus.username.isAvailable) {
      errors.username = availabilityStatus.username.message;
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    console.log('Validation errors:', errors);
    if (Object.keys(errors).length > 0) {
      console.log('Form validation failed');
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    console.log('Starting signup process...');

    try {
      const signupData = {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      console.log('Signup request payload:', signupData);

      const response = await signup(signupData);
      console.log('Signup response:', response);
      
      setSuccess(true);
      console.log('Setting success state to true');

      console.log('Preparing to navigate to OTP verification');
      const navigationData = {
        state: { 
          userData: {
            email: formData.email,
            username: formData.username
          }
        }
      };
      console.log('Navigation data:', navigationData);

      navigate('/verify-otp', navigationData);
      console.log('Navigation triggered');

    } catch (err) {
      console.error('Signup error:', err);
      
      if (err.message === 'Email already registered') {
        setError('An account with this email already exists. Proceed for login instead.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during signup');
      }
    } finally {
      console.log('Signup process completed');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingAnimation message="Creating your account..." />;
  }

  return (
    <div className="auth-container">
      <div className="auth-logo-section">
        <img src="/logo.png" alt="KarmaSync Logo" className="auth-logo" />
        <div className="auth-logo-text">KarmaSync</div>
      </div>
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p className="auth-subtitle">Join us and start managing your projects</p>
          </div>

          {error && (
            <div className="auth-error">
              {error.includes('Please login') 
                ? 'An account with this email already exists. Proceed for login instead.' 
                : error}
            </div>
          )}
          {success && (
            <div className="auth-success">
              Account created successfully! Redirecting to verification...
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <input
                type="text"
                name="fullName"
                className="auth-input"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
              />
              {fieldErrors.fullName && (
                <div className="error-message">{fieldErrors.fullName}</div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <input
                type="text"
                name="username"
                className="auth-input"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
              {availabilityStatus.username.isChecking ? (
                <div className="info-message" style={{ color: '#ffffff' }}>Checking username availability...</div>
              ) : availabilityStatus.username.message && (
                <div className={`${availabilityStatus.username.isAvailable ? 'success-message' : 'error-message'}`} style={{ color: '#ffffff' }}>
                  {availabilityStatus.username.message}
                </div>
              )}
              {fieldErrors.username && (
                <div className="error-message">{fieldErrors.username}</div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <input
                type="email"
                name="email"
                className="auth-input"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              {fieldErrors.email && (
                <div className="error-message">{fieldErrors.email}</div>
              )}
            </div>

            <div className="form-group password-group" style={{ marginBottom: '0.75rem' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="auth-input"
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
              {fieldErrors.password && (
                <div className="error-message">{fieldErrors.password}</div>
              )}
            </div>

            <div className="form-group password-group" style={{ marginBottom: '0.75rem' }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="auth-input"
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
              {fieldErrors.confirmPassword && (
                <div className="error-message">{fieldErrors.confirmPassword}</div>
              )}
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading || success}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Login
              </Link>
            </p>
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