import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('Auth Token:', token ? 'Present' : 'Missing');
  return token;
};

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Get all todos
export const getTodos = async () => {
  try {
    const response = await api.get('/todos');
    return response.data;
  } catch (error) {
    console.error('Get Todos Error:', error);
    throw error;
  }
};

// Create a new todo
export const createTodo = async (todoData) => {
  try {
    console.log('Creating Todo:', todoData);
    const response = await api.post('/todos', todoData);
    return response.data;
  } catch (error) {
    console.error('Create Todo Error:', error);
    throw error;
  }
};

// Update a todo
export const updateTodo = async (todoId, todoData) => {
  try {
    console.log('Updating Todo:', { todoId, todoData });
    const response = await api.put(`/todos/${todoId}`, todoData);
    return response.data;
  } catch (error) {
    console.error('Update Todo Error:', error);
    throw error;
  }
};

// Delete a todo
export const deleteTodo = async (todoId) => {
  try {
    console.log('Deleting Todo:', todoId);
    const response = await api.delete(`/todos/${todoId}`);
    return response.data;
  } catch (error) {
    console.error('Delete Todo Error:', error);
    throw error;
  }
};

// Update todo status
export const updateTodoStatus = async (todoId, status) => {
  try {
    console.log('Updating Todo Status:', { todoId, status });
    const response = await api.put(`/todos/${todoId}`, { status });
    return response.data;
  } catch (error) {
    console.error('Update Todo Status Error:', error);
    throw error;
  }
};

// Get todos by category
export const getTodosByCategory = async (category) => {
  try {
    const response = await api.get(`/todos?category=${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching todos by category:', error);
    throw error;
  }
};

// Get todos by priority
export const getTodosByPriority = async (priority) => {
  try {
    const response = await api.get(`/todos?priority=${priority}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching todos by priority:', error);
    throw error;
  }
};

// Get todos by status
export const getTodosByStatus = async (status) => {
  try {
    const response = await api.get(`/todos?status=${status}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching todos by status:', error);
    throw error;
  }
}; 