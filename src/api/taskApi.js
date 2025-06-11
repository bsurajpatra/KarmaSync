import axios from 'axios';
import config from '../config';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  console.log('Auth token:', token ? 'Present' : 'Missing');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all tasks for a project
export const getTasks = async (projectId) => {
  try {
    console.log('Making GET request to /api/projects/' + projectId + '/tasks');
    const response = await axios.get(`${config.API_URL}/api/projects/${projectId}/tasks`, {
      headers: getAuthHeader()
    });
    console.log('GET /api/projects/' + projectId + '/tasks response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getTasks:', error.response || error);
    throw error;
  }
};

// Create new task
export const createTask = async (projectId, taskData) => {
  try {
    console.log('Making POST request to /api/tasks with data:', taskData);
    const response = await axios.post(`${config.API_URL}/api/tasks`, {
      ...taskData,
      projectId
    }, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    console.log('POST /api/tasks response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in createTask:', error.response || error);
    throw error;
  }
};

// Update task status
export const updateTaskStatus = async (taskId, status) => {
  try {
    console.log('Making PATCH request to /api/tasks/' + taskId + ' with status:', status);
    const response = await axios.patch(`${config.API_URL}/api/tasks/${taskId}`, {
      status
    }, {
      headers: getAuthHeader()
    });
    console.log('PATCH /api/tasks/' + taskId + ' response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updateTaskStatus:', error.response || error);
    throw error;
  }
};

// Update task details
export const updateTask = async (taskId, taskData) => {
  try {
    console.log('Making PUT request to /api/tasks/' + taskId + ' with data:', taskData);
    const response = await axios.put(`${config.API_URL}/api/tasks/${taskId}`, taskData, {
      headers: getAuthHeader()
    });
    console.log('PUT /api/tasks/' + taskId + ' response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updateTask:', error.response || error);
    throw error;
  }
};

// Delete task
export const deleteTask = async (taskId) => {
  try {
    console.log('Making DELETE request to /api/tasks/' + taskId);
    const response = await axios.delete(`${config.API_URL}/api/tasks/${taskId}`, {
      headers: getAuthHeader()
    });
    console.log('DELETE /api/tasks/' + taskId + ' response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in deleteTask:', error.response || error);
    throw error;
  }
};

// Add comment to task
export const addTaskComment = async (taskId, comment) => {
  try {
    console.log('Making POST request to /api/tasks/' + taskId + '/comments with data:', comment);
    const response = await axios.post(`${config.API_URL}/api/tasks/${taskId}/comments`, {
      text: comment
    }, {
      headers: getAuthHeader()
    });
    console.log('POST /api/tasks/' + taskId + '/comments response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in addTaskComment:', error.response || error);
    throw error;
  }
}; 