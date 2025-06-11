import React, { useState } from 'react';
import axios from 'axios';
import { useHistory, Link } from 'react-router-dom';
import config from '../config';
import Footer from './Footer';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const history = useHistory();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateUsername = (username) => {
    // Username should be 3-20 characters, alphanumeric with underscores and hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!validateUsername(formData.username)) {
      setError('Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      console.log('Sending signup request to:', `${config.API_URL}/api/auth/signup`);
      console.log('Signup data:', {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email
      });
      
      const response = await axios.post(`${config.API_URL}/api/auth/signup`, {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Signup response:', response.data);
      setSuccess(true);
      setTimeout(() => {
        history.push('/login');
      }, 3000);
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

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
              Signup successful! Redirecting to login...
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="text"
                name="fullName"
                required
                className="auth-input"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <input
                type="text"
                name="username"
                required
                className="auth-input"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
              <small className="input-hint">3-20 characters, letters, numbers, _ and - only</small>
            </div>
            
            <div className="form-group">
              <input
                type="email"
                name="email"
                required
                className="auth-input"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
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
            </div>
            
            <div className="form-group password-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
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
            </div>
            
            <button type="submit" className="auth-button">
              Sign Up
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