import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import config from '../config';
import Footer from './Footer';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const history = useHistory();

  useEffect(() => {
    // Log the token when component mounts
    console.log('Reset token from URL:', token);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending reset request to:', `${config.API_URL}/api/auth/reset-password`);
      console.log('Request payload:', { token, password });
      
      const response = await axios.post(`${config.API_URL}/api/auth/reset-password`, {
        token,
        password
      });
      
      console.log('Reset response:', response.data);
      setSuccess(true);
      setTimeout(() => {
        history.push('/login');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
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
            <h2>Reset Password</h2>
            <p className="auth-subtitle">Enter your new password</p>
          </div>
          
          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div className="auth-success">
              Password has been reset successfully. Redirecting to login...
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="password"
                required
                className="auth-input"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength="6"
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                required
                className="auth-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength="6"
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          
          <div className="auth-footer">
            <Link to="/login" className="auth-link">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword; 