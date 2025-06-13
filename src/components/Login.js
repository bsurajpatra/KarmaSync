import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import config from '../config';
import Footer from './Footer';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import LoadingAnimation from './LoadingAnimation';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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

    try {
      console.log('Attempting login with:', { email: formData.email });
      const response = await axios.post(`${config.API_URL}/api/auth/login`, formData);
      console.log('Login response:', response.data);
      
      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid response from server');
      }
      
      // Use the login function from AuthContext with both user data and token
      await login(response.data.user, response.data.token);
      console.log('Login successful, redirecting to dashboard');
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.message || 'An error occurred during login');
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
      <LoadingAnimation message="Signing you in..." />
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
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Sign in to continue your productivity journey</p>
          </div>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
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
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign Up
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

export default Login;