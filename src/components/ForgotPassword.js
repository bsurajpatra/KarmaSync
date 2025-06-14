import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import config from '../config';
import LoadingAnimation from './LoadingAnimation';
import { forgotPassword } from '../api/authApi';
import Footer from './Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      console.log('Sending forgot password request to:', `${config.API_URL}/api/auth/forgot-password`);
      console.log('Request payload:', { email });
      
      const response = await axios.post(`${config.API_URL}/api/auth/forgot-password`, { email });
      console.log('Forgot password response:', response.data);
      
      setSuccess(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      setError(error.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingAnimation message="Processing your request..." />;

  return (
    <div className="auth-container">
      <div className="auth-logo-section">
      <img src="/logo.png" alt="KarmaSync Logo" className="auth-logo" />
      <div className="auth-logo-text">KarmaSync</div>
      </div>
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Forgot Password</h2>
            <p className="auth-subtitle">Enter your email to reset your password</p>
          </div>
          
          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div className="auth-success">
              Password reset instructions have been sent to your email.
              Please check your spam folder if you don't see the email in your inbox
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="email"
                required
                className="auth-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>
              Remember your password?{' '}
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

export default ForgotPassword; 