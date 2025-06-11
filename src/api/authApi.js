import axios from 'axios';
import config from '../config';

// Set up axios defaults
axios.defaults.baseURL = config.API_URL;

// Add token to requests if it exists
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Get token from localStorage
const getStoredToken = () => {
  return localStorage.getItem('token');
};

// Initialize auth token if it exists
const token = getStoredToken();
if (token) {
  setAuthToken(token);
}

// Login user
export const login = async (credentials) => {
  try {
    const response = await axios.post('/api/auth/login', credentials);
    const { token, user } = response.data;
    setAuthToken(token);
    return { user };
  } catch (error) {
    throw error.response?.data || { message: 'Error logging in' };
  }
};

// Signup user
export const signup = async (userData) => {
  try {
    const response = await axios.post('/api/auth/signup', userData);
    const { token, user } = response.data;
    setAuthToken(token);
    return { user };
  } catch (error) {
    throw error.response?.data || { message: 'Error registering user' };
  }
};

// Logout user
export const logout = () => {
  setAuthToken(null);
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No auth token found');
    }

    // Set token in headers for this request
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.get('/api/auth/me', config);
    console.log('getCurrentUser response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('getCurrentUser error:', error); // Debug log
    throw error.response?.data || { message: 'Error fetching user data' };
  }
};

// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error processing forgot password request' };
  }
};

// Reset password
export const resetPassword = async (token, password) => {
  try {
    const response = await axios.post(`/api/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error resetting password' };
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No auth token found');
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.put('/api/auth/profile', profileData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating profile' };
  }
};

// Delete user account
export const deleteAccount = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No auth token found');
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.delete('/api/auth/delete-account', config);
    setAuthToken(null); // Clear token after account deletion
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting account' };
  }
}; 