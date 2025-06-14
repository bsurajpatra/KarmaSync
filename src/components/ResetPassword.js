import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import config from '../config';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import LoadingAnimation from './LoadingAnimation';
import Footer from './Footer';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Invalid reset token');
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending reset password request with token:', token);
      const response = await axios.post(`${config.API_URL}/api/auth/reset-password/${token}`, {
        password: formData.password
      });

      console.log('Reset password response:', response.data);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password reset successful! Please login with your new password.' 
          }
        });
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-content">
          <div className="auth-card">
            <div className="auth-error">Invalid reset token</div>
            <div className="auth-footer">
              <Link to="/forgot-password" className="auth-link">
                Request a new password reset
              </Link>
              <Link to="/login" className="auth-link">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingAnimation message="Resetting your password..." />;

  return (
    <div className="auth-container">
      <div className="auth-logo-section">
      <img src="/logo.png" alt="KarmaSync Logo" className="auth-logo" />
      <div className="auth-logo-text">KarmaSync</div>
      </div>
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Reset Password</h2>
            <p className="auth-subtitle">Enter your new password</p>
          </div>
          
          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div className="auth-success">
              Password reset successful! Redirecting to login...
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className="auth-input"
                placeholder="New Password"
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
                placeholder="Confirm New Password"
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
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading || success}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
          
          <div className="auth-footer">
            <Link to="/login" className="auth-link">
              Back to Login
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

export default ResetPassword; 