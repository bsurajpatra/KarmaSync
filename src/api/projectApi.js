import axios from 'axios';
import config from '../config';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  console.log('Auth token:', token ? 'Present' : 'Missing');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all projects
export const getProjects = async () => {
  try {
    console.log('Making GET request to /api/projects');
    const response = await axios.get(`${config.API_URL}/api/projects`, {
      headers: getAuthHeader()
    });
    console.log('GET /api/projects response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getProjects:', error.response || error);
    throw error;
  }
};

// Get project by ID
export const getProjectById = async (id) => {
  try {
    console.log('Making GET request to /api/projects/' + id);
    const response = await axios.get(`${config.API_URL}/api/projects/${id}`, {
      headers: getAuthHeader()
    });
    console.log('GET /api/projects/' + id + ' response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getProjectById:', error.response || error);
    throw error;
  }
};

// Create new project
export const createProject = async (projectData) => {
  try {
    console.log('Making POST request to /api/projects with data:', projectData);
    const headers = getAuthHeader();
    console.log('Request headers:', headers);

    const response = await axios.post(`${config.API_URL}/api/projects`, projectData, {
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    });
    console.log('POST /api/projects response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in createProject:', error.response || error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw { message: 'Error creating project' };
  }
};

// Update project
export const updateProject = async (id, projectData) => {
  try {
    console.log('Making PUT request to /api/projects/' + id + ' with data:', projectData);
    const response = await axios.put(`${config.API_URL}/api/projects/${id}`, projectData, {
      headers: getAuthHeader()
    });
    console.log('PUT /api/projects/' + id + ' response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updateProject:', error.response || error);
    throw error;
  }
};

// Delete project
export const deleteProject = async (id) => {
  try {
    console.log('Making DELETE request to /api/projects/' + id);
    const response = await axios.delete(`${config.API_URL}/api/projects/${id}`, {
      headers: getAuthHeader()
    });
    console.log('DELETE /api/projects/' + id + ' response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in deleteProject:', error.response || error);
    throw error;
  }
}; 