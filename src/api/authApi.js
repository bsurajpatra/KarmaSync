import axios from 'axios';
import config from '../config';

// Login user
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${config.API_URL}/api/auth/login`, credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Signup user
export const signup = async (userData) => {
  try {
    const response = await axios.post(`${config.API_URL}/api/auth/signup`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await axios.get(`${config.API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    logout();
    throw error;
  }
};

// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${config.API_URL}/api/auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${config.API_URL}/api/auth/reset-password`, {
      token,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 