import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectById, updateProject } from '../api/projectApi';

const ProjectOverview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingGithub, setEditingGithub] = useState(false);
  const [githubLink, setGithubLink] = useState('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      console.log('Fetching project details:', id);
      const data = await getProjectById(id);
      console.log('Project details:', data);
      setProject(data);
      setGithubLink(data.githubLink || '');
      setError('');
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProject = await updateProject(id, { githubLink });
      setProject(updatedProject);
      setEditingGithub(false);
      setError('');
    } catch (err) {
      console.error('Error updating GitHub link:', err);
      setError(err.message || 'Failed to update GitHub link');
    }
  };

  if (loading) return <div className="loading">Loading project details...</div>;

  if (error) return <div className="error-message">{error}</div>;

  if (!project) return <div className="error-message">Project not found</div>;

  return (
    <div className="projects-container">
      <div className="projects-header">
        <div className="projects-header-content">
          <div className="projects-header-left">
            <h1>{project.title}</h1>
            <p className="project-meta">
              Created on {new Date(project.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="projects-header-actions">
            <button 
              className="back-to-dashboard-button"
              onClick={() => navigate('/projects')}
            >
              <i className="fas fa-arrow-left"></i> Back to Projects
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/project/${id}/kanban`)}
            >
              <i className="fas fa-columns"></i> Go to Kanban Board
            </button>
          </div>
        </div>
      </div>

      <div className="project-overview-container">
        <div className="project-overview-section">
          <h2>Description</h2>
          <p>{project.description || 'No description provided'}</p>
        </div>

        <div className="project-overview-section">
          <h2>GitHub Repository</h2>
          {editingGithub ? (
            <form onSubmit={handleGithubSubmit} className="github-form">
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                placeholder="https://github.com/username/repository"
                pattern="https://github.com/.*"
                className="github-input"
                required
              />
              <div className="github-form-actions">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingGithub(false);
                    setGithubLink(project.githubLink || '');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : project.githubLink ? (
            <div className="github-display">
              <a 
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="github-link"
              >
                <i className="fab fa-github"></i> {project.githubLink.replace('https://github.com/', '')}
              </a>
              <button 
                className="btn btn-secondary btn-edit-github"
                onClick={() => setEditingGithub(true)}
              >
                <i className="fas fa-edit"></i> Edit
              </button>
            </div>
          ) : (
            <div className="github-display">
              <p className="no-github">No GitHub repository linked</p>
              <button 
                className="btn btn-primary"
                onClick={() => setEditingGithub(true)}
              >
                <i className="fab fa-github"></i> Add GitHub Repository
              </button>
            </div>
          )}
        </div>

        <div className="project-overview-section">
          <h2>Project Type</h2>
          <p className="project-type">
            <span className={`project-type-badge ${project.projectType}`}>
              {project.projectType.charAt(0).toUpperCase() + project.projectType.slice(1)}
            </span>
          </p>
        </div>

        <div className="project-overview-section">
          <h2>Project Status</h2>
          <p className="project-status">
            <span className={`status-badge ${project.status}`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview; 