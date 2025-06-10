import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useHistory, Link } from 'react-router-dom';
import config from '../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${config.API_URL}/api/auth/login`, {
        email,
        password
      });
      login(response.data.user, response.data.token);
      history.push('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="container-ot">
      <div className="container-sc">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">Login</h3>
          <Link to="/" className="btn btn-outline-primary">
            Back to Home
          </Link>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email: </label>
            <input
              type="email"
              required
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password: </label>
            <input
              type="password"
              required
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input type="submit" value="Login" className="btn btn-primary" />
          </div>
        </form>
        <div className="text-center mt-3">
          <p className="mb-2">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary">
              Sign Up
            </Link>
          </p>
          <p className="mb-0">
            <Link to="/forgot-password" className="text-primary">
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;