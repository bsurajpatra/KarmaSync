import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectById, updateProject, deleteProject } from '../api/projectApi';
import { getTasks } from '../api/taskApi';

const ProjectOverview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingGithub, setEditingGithub] = useState(false);
  const [githubLink, setGithubLink] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskCount, setTaskCount] = useState(0);
  const [tasks, setTasks] = useState([]);

  const fetchProject = useCallback(async () => {
    try {
      console.log('Fetching project details:', id);
      const data = await getProjectById(id);
      console.log('Project details:', data);
      setProject(data);
      setGithubLink(data.githubLink || '');
      setTitle(data.title || '');
      setDescription(data.description || '');
      setError('');
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchTaskCount = useCallback(async () => {
    try {
      console.log('Fetching tasks for project:', id);
      const tasksData = await getTasks(id);
      console.log('Tasks received:', tasksData);
      setTasks(tasksData);
      setTaskCount(tasksData.length);
    } catch (err) {
      console.error('Error fetching task count:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
    fetchTaskCount();
  }, [fetchProject, fetchTaskCount]);

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

  const handleTitleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProject = await updateProject(id, { title });
      setProject(updatedProject);
      setEditingTitle(false);
      setError('');
    } catch (err) {
      console.error('Error updating title:', err);
      setError(err.message || 'Failed to update title');
    }
  };

  const handleDescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProject = await updateProject(id, { description });
      setProject(updatedProject);
      setEditingDescription(false);
      setError('');
    } catch (err) {
      console.error('Error updating description:', err);
      setError(err.message || 'Failed to update description');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject(id);
      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err.message || 'Failed to delete project');
    }
  };

  const DeleteConfirmationModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Delete Project</h2>
          <button 
            className="modal-close"
            onClick={() => setShowDeleteConfirm(false)}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete this project?</p>
          <p className="warning-text">This action cannot be undone. All project data, including tasks and boards, will be permanently deleted.</p>
          <div className="project-to-delete">
            <strong>Project to delete:</strong> {project?.title}
          </div>
        </div>
        <div className="modal-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </button>
          <button 
            className="btn btn-danger"
            onClick={handleDeleteProject}
          >
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="loading">Loading project details...</div>;

  if (error) return <div className="error-message">{error}</div>;

  if (!project) return <div className="error-message">Project not found</div>;

  return (
    <div className="projects-container">
      {showDeleteConfirm && <DeleteConfirmationModal />}
      
      <div className="projects-header">
        <div className="projects-header-content">
          <div className="projects-header-left">
            {editingTitle ? (
              <form onSubmit={handleTitleSubmit} className="edit-form">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Project Title"
                  className="edit-input"
                  required
                />
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Save</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingTitle(false);
                      setTitle(project.title);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="title-display">
                <h1>{project.title}</h1>
                <button 
                  className="btn btn-danger"
                  onClick={() => setEditingTitle(true)}
                >
                  Edit
                </button>
              </div>
            )}
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
          <div className="section-header">
            <h2>Description</h2>
            {!editingDescription && (
              <button 
                className="btn btn-danger"
                onClick={() => setEditingDescription(true)}
              >
                Edit
              </button>
            )}
          </div>
          {editingDescription ? (
            <form onSubmit={handleDescriptionSubmit} className="edit-form">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Project Description"
                className="edit-textarea"
                rows="4"
                required
              />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingDescription(false);
                    setDescription(project.description || '');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p>{project.description || 'No description provided'}</p>
          )}
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

        

        <div className="project-overview-section tasks-section">
          <div className="section-header">
            <h2>Issues</h2>
            <button 
              className="btn btn-primary view-all-btn"
              onClick={() => navigate(`/project/${id}/tasks`)}
            >
              View All Issues
            </button>
          </div>
          
          <div className="tasks-list">
            {tasks.length > 0 ? (
              tasks.slice(0, 3).map((task) => (
                <div key={task._id} className="task-item">
                  <div className="task-item-header">
                    <h3>{task.title}</h3>
                    <span className={`task-type ${task.type}`}>
                      {task.type}
                    </span>
                  </div>
                  <p className="task-description">{task.description}</p>
                  <div className="task-meta">
                    <span className={`status-badge ${task.status}`}>
                      {task.status}
                    </span>
                    <span className="task-date">
                      {new Date(task.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-tasks">No tasks created yet</p>
            )}
          </div>
        </div>

        <div className="project-overview-section danger-zone">
          <h2>Danger Zone</h2>
          <div className="danger-zone-content">
            <div className="danger-action">
              <div className="danger-action-info">
                <h3>Delete this project</h3>
                <p>Once you delete a project, there is no going back. Please be certain.</p>
              </div>
              <button 
                className="btn btn-danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;