import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, updateProject, deleteProject } from '../api/projectApi';
import LoadingAnimation from './LoadingAnimation';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
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
        console.log('Form data being sent:', formData);
        const response = await createProject(formData);
        console.log('Project created successfully:', response);
      }
      setShowForm(false);
      setEditingProject(null);
      setFormData({ title: '', description: '' });
      fetchProjects();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      setError(err.response?.data?.message || 'Failed to create project');
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

  const handleProjectTypeSelect = (type) => {
    if (type === 'personal') {
      navigate('/create-personal-project');
    } else {
      alert('Collaborative projects feature coming soon!');
    }
    setShowTypeModal(false);
  };

  if (loading) return (
    <div className="projects-container" style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to right, #fdb99b, #cf8bf3, #a770ef)'
    }}>
      <LoadingAnimation message="Loading your projects..." />
    </div>
  );

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
        <div className="projects-header-content">
          <div className="projects-header-left">
            <h1>My Projects</h1>
          </div>
          <div className="projects-header-actions">
            <button 
              className="back-to-dashboard-button"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowTypeModal(true)}
            >
              Create New Project
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showTypeModal && (
        <div className="project-type-modal">
          <h2>Select Project Type</h2>
          <div className="project-type-options">
            <div 
              className="project-type-option"
              onClick={() => handleProjectTypeSelect('personal')}
            >
              <h3>Personal Project</h3>
              <p>Create a project that you'll manage on your own</p>
            </div>
            <div 
              className="project-type-option disabled"
              onClick={() => handleProjectTypeSelect('collaborative')}
            >
              <h3>Collaborative Project</h3>
              <p>Create a project and invite team members (Coming Soon)</p>
            </div>
          </div>
        </div>
      )}

      <div className="projects-grid" style={{ 
        flex: 1,
        overflowY: 'auto',
        paddingRight: '1rem'
      }}>
        {projects.length === 0 ? (
          <div className="no-projects-message">
            <h3>No Projects Found</h3>
          </div>
        ) : (
          projects.map(project => (
            <div 
              key={project._id} 
              className="project-card"
                  onClick={() => navigate(`/project/${project._id}/overview`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="project-card-header">
                <h3>{project.title}</h3>
                <span className={`project-type-badge ${project.projectType}`}>
                  {project.projectType.charAt(0).toUpperCase() + project.projectType.slice(1)}
                </span>
              </div>
              <p>{project.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects; 