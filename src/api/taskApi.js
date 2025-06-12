import axios from 'axios';
import config from '../config';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  console.log('Auth token:', token ? 'Present' : 'Missing');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const BASE_URL = `${config.API_URL}/api/tasks`;

// Get all tasks for a project
export const getTasks = async (projectId) => {
  try {
    console.log('Making GET request to /api/tasks for project:', projectId);
    const response = await axios.get(`${config.API_URL}/api/projects/${projectId}/tasks`, {
      headers: getAuthHeader()
    });
    console.log('GET /api/tasks response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getTasks:', error.response || error);
    throw error;
  }
};

export const getTaskById = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Create new task
export const createTask = async (taskData) => {
  try {
    console.log('Making POST request to /api/tasks with data:', taskData);
    const response = await axios.post(BASE_URL, {
      ...taskData,
      type: taskData.type || 'tech',
      status: taskData.status || 'todo',
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
export const updateTaskStatus = async (id, status) => {
  try {
    console.log('Making PATCH request to /api/tasks/' + id + '/status with status:', status);
    const response = await axios.patch(`${BASE_URL}/${id}/status`, { status }, {
      headers: getAuthHeader()
    });
    console.log('PATCH /api/tasks/' + id + '/status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updateTaskStatus:', error.response || error);
    throw error;
  }
};

// Update task details
export const updateTask = async (id, taskData) => {
  try {
    console.log('Making PUT request to /api/tasks/' + id + ' with data:', taskData);
    const response = await axios.put(`${BASE_URL}/${id}`, taskData, {
      headers: getAuthHeader()
    });
    console.log('PUT /api/tasks/' + id + ' response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updateTask:', error.response || error);
    throw error;
  }
};

// Delete task
export const deleteTask = async (id) => {
  try {
    console.log('Making DELETE request to /api/tasks/' + id);
    const response = await axios.delete(`${BASE_URL}/${id}`, {
      headers: getAuthHeader()
    });
    console.log('DELETE /api/tasks/' + id + ' response:', response.data);
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
    const response = await axios.post(`${BASE_URL}/${taskId}/comments`, {
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