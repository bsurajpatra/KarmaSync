import axios from 'axios';
import { API_BASE_URL } from '../config';

// Search users by username or email
export const searchUsers = async (searchTerm) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users/search`, {
      params: { searchTerm },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}; 