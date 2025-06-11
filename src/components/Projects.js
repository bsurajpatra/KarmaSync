import React, { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../api/projectApi';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    console.log('Projects component mounted');
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      console.log('Fetching projects...');
      const data = await getProjects();
      console.log('Projects fetched successfully:', data);
      setProjects(data);
      setError('');
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting project data:', formData);
      if (editingProject) {
        console.log('Updating existing project:', editingProject._id);
        await updateProject(editingProject._id, formData);
        console.log('Project updated successfully');
      } else {
        console.log('Creating new project');
        const response = await createProject(formData);
        console.log('Project created successfully:', response);
      }
      setShowForm(false);
      setEditingProject(null);
      setFormData({ title: '', description: '' });
      fetchProjects();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(editingProject ? 'Failed to update project' : 'Failed to create project');
    }
  };

  const handleEdit = (project) => {
    console.log('Editing project:', project);
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        console.log('Deleting project:', id);
        await deleteProject(id);
        console.log('Project deleted successfully');
        fetchProjects();
      } catch (err) {
        console.error('Error deleting project:', err);
        setError('Failed to delete project');
      }
    }
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="projects-container" style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      paddingBottom: '0',
      overflow: 'hidden'
    }}>
      <div className="projects-header">
        <h1>My Projects</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            console.log('Opening new project form');
            setShowForm(true);
            setEditingProject(null);
            setFormData({ title: '', description: '' });
          }}
        >
          Create New Project
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="project-form-container">
          <form onSubmit={handleSubmit} className="project-form">
            <h2>{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  console.log('Canceling form');
                  setShowForm(false);
                  setEditingProject(null);
                  setFormData({ title: '', description: '' });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="projects-grid" style={{ 
        flex: 1,
        overflowY: 'auto',
        paddingRight: '1rem'
      }}>
        {projects.map(project => (
          <div key={project._id} className="project-card">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="project-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => handleEdit(project)}
              >
                Edit
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDelete(project._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects; 