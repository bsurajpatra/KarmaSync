import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectById, updateProject, deleteProject } from '../api/projectApi';
import { getTasks, createTask } from '../api/taskApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import LoadingAnimation from './LoadingAnimation';
import '../styles/ProjectOverview.css';
import Footer from './Footer';
import { searchUsers } from '../api/userApi';

const ROLE_TYPES = {
  MANAGER: 'manager',
  DEVELOPER: 'developer'
};

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
  const [boardStats, setBoardStats] = useState([]);
  const [showAddIssueModal, setShowAddIssueModal] = useState(false);
  const [issueFormData, setIssueFormData] = useState({
    title: '',
    description: '',
    type: 'tech',
    status: 'todo',
    deadline: '',
    customType: ''
  });
  const [showCustomType, setShowCustomType] = useState(false);
  const [removingCollaborator, setRemovingCollaborator] = useState(null);
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [newCollaboratorRole, setNewCollaboratorRole] = useState('member');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

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

      // Calculate board statistics
      const boardCounts = {
        todo: { name: 'To Do', value: 0 },
        doing: { name: 'Doing', value: 0 },
        done: { name: 'Done', value: 0 }
      };

      // Count tasks for each default board
      tasksData.forEach(task => {
        if (boardCounts[task.status]) {
          boardCounts[task.status].value++;
        } else {
          // Handle custom boards
          boardCounts[task.status] = {
            name: task.status.charAt(0).toUpperCase() + task.status.slice(1),
            value: 1
          };
        }
      });

      // Convert to array format for the pie chart
      const stats = Object.values(boardCounts).filter(board => board.value > 0);
      setBoardStats(stats);
    } catch (err) {
      console.error('Error fetching task count:', err);
    }
  }, [id]);

  // Debounced search function
  const debouncedSearch = useCallback(
    async (term) => {
      if (term.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        console.log('Searching for users with term:', term);
        const results = await searchUsers(term);
        console.log('Search results:', results);
        
        // Create a Set of existing collaborator IDs for faster lookup
        const existingCollaboratorIds = new Set(
          project?.collaborators.map(collab => collab.userId._id) || []
        );
        
        // Filter out existing collaborators and current user
        const filteredResults = results.filter(user => 
          !existingCollaboratorIds.has(user._id) && // Check if user is not already a collaborator
          user._id !== project?.createdBy._id // Filter out current user
        );
        
        console.log('Filtered results:', filteredResults);
        setSearchResults(filteredResults);
      } catch (err) {
        console.error('Error searching users:', err);
        setError('Failed to search users. Please try again.');
      } finally {
        setSearchLoading(false);
      }
    },
    [project]
  );

  // Effect for debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        debouncedSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddCollaborator = (user) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleRoleSelect = async (role) => {
    if (selectedUser && project) {
      try {
        // Check if user is already a collaborator
        const isAlreadyCollaborator = project.collaborators.some(
          collab => collab.userId._id === selectedUser._id
        );

        if (isAlreadyCollaborator) {
          setError('This user is already a collaborator');
          return;
        }

        // Create new collaborator object
        const newCollaborator = {
          userId: selectedUser._id,
          role: role
        };

        // Get existing collaborators excluding the project creator
        const existingCollaborators = project.collaborators.filter(
          collab => collab.userId._id !== project.createdBy._id
        );

        // Add new collaborator to the filtered list
        const updatedCollaborators = [
          ...existingCollaborators,
          newCollaborator
        ];

        const updatedProject = await updateProject(project._id, {
          collaborators: updatedCollaborators
        });

        setProject(updatedProject);
        setShowAddCollaborator(false);
        setSelectedUser(null);
        setSearchTerm('');
        setSearchResults([]);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to add collaborator');
      }
    }
  };

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

  const handleIssueFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      if (value === 'custom') {
        setShowCustomType(true);
        setIssueFormData(prev => ({
          ...prev,
          [name]: prev.customType || ''
        }));
      } else {
        setShowCustomType(false);
        setIssueFormData(prev => ({
          ...prev,
          [name]: value,
          customType: ''
        }));
      }
    } else if (name === 'customType') {
      const validatedValue = value.replace(/[^a-zA-Z0-9-_]/g, '');
      setIssueFormData(prev => ({
        ...prev,
        type: validatedValue,
        customType: validatedValue
      }));
    } else {
      setIssueFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleIssueFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...issueFormData,
        projectId: id
      };

      const newIssue = await createTask(taskData);
      
      // Update tasks list and count
      setTasks(prev => [...prev, newIssue]);
      setTaskCount(prev => prev + 1);
      
      // Update board stats
      setBoardStats(prev => {
        const newStats = [...prev];
        const boardIndex = newStats.findIndex(board => board.name === issueFormData.status);
        if (boardIndex >= 0) {
          newStats[boardIndex].value++;
        } else {
          newStats.push({
            name: issueFormData.status,
            value: 1
          });
        }
        return newStats;
      });

      // Reset form and close modal
      setShowAddIssueModal(false);
      setShowCustomType(false);
      setIssueFormData({
        title: '',
        description: '',
        type: 'tech',
        status: 'todo',
        deadline: '',
        customType: ''
      });
      setError('');
    } catch (err) {
      console.error('Error creating issue:', err);
      setError(err.message || 'Failed to create issue');
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      const updatedCollaborators = project.collaborators
        .filter(collab => collab.userId._id !== collaboratorId)
        .map(collab => ({
          userId: collab.userId._id,
          role: collab.role
        }));
      
      const updatedProject = await updateProject(id, {
        collaborators: updatedCollaborators
      });
      
      setProject(updatedProject);
      setRemovingCollaborator(null);
    } catch (err) {
      console.error('Error removing collaborator:', err);
      setError(err.message || 'Failed to remove collaborator');
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

  if (loading) return <LoadingAnimation message="Loading project details..." />;

  if (error) return <div className="error-message">{error}</div>;

  if (!project) return <div className="error-message">Project not found</div>;

  console.log('Project data:', project);
  console.log('Collaborators:', project.collaborators);

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
                <h1>
                  {project.title}
                  <button 
                    className="edit-title-btn"
                    onClick={() => setEditingTitle(true)}
                  >
                    Edit
                  </button>
                </h1>
                <div className="project-meta">
                  <span className="project-id">ID: {project.shortId}</span>
                  <span className="project-date">
                    Created on {new Date(project.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="projects-header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/projects')}
            >
              <i className="fas fa-arrow-left"></i> Back to Projects
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/project/${project._id}/kanban`)}
            >
              <i className="fas fa-columns"></i> Kanban Board
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <i className="fas fa-trash"></i> Delete Project
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
                className="section-edit-btn"
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
            <div className="section-header">
              <h2>GitHub Repository</h2>
              {!editingGithub && (
                <button 
                  className="section-edit-btn"
                  onClick={() => setEditingGithub(true)}
                >
                  {project.githubLink ? 'Edit' : 'Add'}
                </button>
              )}
            </div>
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
              </div>
            ) : (
              <div className="github-display">
                <p className="no-github">No GitHub repository linked</p>
              </div>
            )}
          </div>

        <div className="project-overview-section">
          <div className="project-type-status">
            <div>
              <h3>Project Type</h3>
              <p className="project-type">
                <span className={`project-type-badge ${project.projectType}`}>
                  {project.projectType.charAt(0).toUpperCase() + project.projectType.slice(1)}
                </span>
              </p>
            </div>
            <div>
              <h3>Project Status</h3>
              <p className="project-status">
                <span className={`status-badge ${project.status}`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {project.projectType === 'collaborative' && (
          <div className="project-overview-section">
            <div className="section-header">
              <h2>Collaborators</h2>
            </div>
            <div className="collaborators-list">
              <div className="collaborators-header">
                <div className="collab-name">Name</div>
                <div className="collab-email">Email</div>
                <div className="collab-role">Role</div>
                <div className="collab-actions">Actions</div>
              </div>
              {project.collaborators.map((collab) => (
                <div key={collab.userId._id} className="collaborator-item">
                  <div className="collab-name">
                    <i className="fas fa-user"></i>
                    <span>{collab.userId.fullName || collab.userId.username}</span>
                  </div>
                  <div className="collab-email">
                    <i className="fas fa-envelope"></i>
                    <span>{collab.userId.email}</span>
                  </div>
                  <div className={`collab-role ${collab.role}`}>
                    <i className={`fas ${collab.role === 'manager' ? 'fa-user-tie' : 'fa-code'}`}></i>
                    <span>{collab.role === 'manager' ? 'Project Manager' : 'Developer'}</span>
                  </div>
                  <div className="collab-actions">
                    {collab.userId._id !== project.createdBy._id && (
                      <button
                        className="btn-remove-collaborator"
                        onClick={() => setRemovingCollaborator(collab)}
                      >
                        <i className="fas fa-user-minus"></i>
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="add-collaborator-section">
                <button className="btn-add-collaborator" onClick={() => setShowAddCollaborator(true)}>
                  <i className="fas fa-user-plus"></i>
                  <span>Add Collaborator</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="project-overview-section">
          <div className="tasks-header">
            <h2>Issues Overview</h2>
            <div className="tasks-actions">
              {taskCount === 0 && (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddIssueModal(true)}
                >
                  <i className="fas fa-plus"></i> Add First Issue
                </button>
              )}
              <button 
                className="btn btn-secondary"
                onClick={() => navigate(`/project/${id}/tasks`)}
              >
                View All Issues
              </button>
            </div>
          </div>
          
          <div className="issues-overview">
            <div className="issues-stats">
              <div className="total-issues">
                <span className="issues-count">{taskCount}</span>
                <span className="issues-label">Total Issues</span>
              </div>
            </div>
            
            <div className="chart-container">
              {boardStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={boardStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {boardStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} issues`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data-chart">
                  0 Issues Found
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="project-overview-section project-danger-section">
          <h2>Danger Zone</h2>
          <div className="project-danger-content">
            <div className="project-danger-info">
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

      {showAddIssueModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Issue</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAddIssueModal(false);
                  setShowCustomType(false);
                  setIssueFormData({
                    title: '',
                    description: '',
                    type: 'tech',
                    status: 'todo',
                    deadline: '',
                    customType: ''
                  });
                }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleIssueFormSubmit} className="issue-form">
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={issueFormData.title}
                    onChange={handleIssueFormChange}
                    required
                    className="form-control"
                    placeholder="Enter issue title"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={issueFormData.description}
                    onChange={handleIssueFormChange}
                    className="form-control"
                    rows="1"
                    placeholder="Enter issue description"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <select
                    id="type"
                    name="type"
                    value={showCustomType ? 'custom' : issueFormData.type}
                    onChange={handleIssueFormChange}
                    className="form-control"
                  >
                    <option value="tech">Technical</option>
                    <option value="review">Review</option>
                    <option value="bug">Bug</option>
                    <option value="feature">Feature</option>
                    <option value="documentation">Documentation</option>
                    <option value="custom">Custom Type</option>
                  </select>
                  {showCustomType && (
                    <input
                      type="text"
                      name="customType"
                      value={issueFormData.customType}
                      onChange={handleIssueFormChange}
                      className="form-control custom-type-input"
                      placeholder="Enter custom issue type"
                      required
                    />
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={issueFormData.status}
                    onChange={handleIssueFormChange}
                    className="form-control"
                  >
                    <option value="todo">To Do</option>
                    <option value="doing">Doing</option>
                    <option value="done">Done</option>
                    {project?.customBoards?.map(board => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="deadline">Deadline</label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={issueFormData.deadline}
                    onChange={handleIssueFormChange}
                    className="form-control"
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    Create Issue
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddIssueModal(false);
                      setShowCustomType(false);
                      setIssueFormData({
                        title: '',
                        description: '',
                        type: 'tech',
                        status: 'todo',
                        deadline: '',
                        customType: ''
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {removingCollaborator && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Remove Collaborator</h2>
              <button 
                className="modal-close"
                onClick={() => setRemovingCollaborator(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove this collaborator from the project?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setRemovingCollaborator(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleRemoveCollaborator(removingCollaborator.userId._id)}
              >
                Remove Collaborator
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCollaborator && (
        <div className="collab-modal-overlay">
          <div className="collab-modal">
            <div className="collab-modal-header">
              <h3>Add Collaborator</h3>
              <button 
                className="collab-modal-close" 
                onClick={() => {
                  setShowAddCollaborator(false);
                  setSelectedUser(null);
                  setSearchTerm('');
                  setSearchResults([]);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="collab-modal-content">
              {!selectedUser ? (
                <div className="collab-search-wrapper">
                  <input
                    type="text"
                    placeholder="Search users by username or email"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="collab-search-field"
                  />
                  {searchLoading && (
                    <div className="collab-search-loading">
                      <LoadingAnimation message="Searching..." />
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <div className="collab-search-results">
                      {searchResults.map(user => (
                        <div 
                          key={user._id} 
                          className="collab-search-item"
                          onClick={() => handleAddCollaborator(user)}
                        >
                          <div className="collab-user-info">
                            <span className="collab-username">{user.username}</span>
                            <span className="collab-email">{user.email}</span>
                          </div>
                          <i className="fas fa-chevron-right"></i>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchTerm.length >= 2 && !searchLoading && searchResults.length === 0 && (
                    <div className="collab-no-results">No users found</div>
                  )}
                </div>
              ) : (
                <div className="collab-role-wrapper">
                  <div className="collab-selected-user">
                    <h4>Selected User</h4>
                    <div className="collab-user-details">
                      <span className="collab-username">{selectedUser.username}</span>
                      <span className="collab-email">{selectedUser.email}</span>
                    </div>
                    <button 
                      className="collab-change-user"
                      onClick={() => {
                        setSelectedUser(null);
                        setSearchTerm('');
                      }}
                    >
                      <i className="fas fa-arrow-left"></i> Change User
                    </button>
                  </div>
                  <div className="role-options">
                    <button
                      className="role-option manager"
                      onClick={() => handleRoleSelect(ROLE_TYPES.MANAGER)}
                    >
                      <h4>Project Manager</h4>
                      <p>Full access to project management</p>
                      <ul>
                        <li>Create, edit, and delete tasks</li>
                        <li>Manage project details</li>
                        <li>Manage collaborators</li>
                        <li>Full commenting access</li>
                      </ul>
                    </button>
                    <button
                      className="role-option developer"
                      onClick={() => handleRoleSelect(ROLE_TYPES.DEVELOPER)}
                    >
                      <h4>Developer</h4>
                      <p>Task execution and updates</p>
                      <ul>
                        <li>View and update task status</li>
                        <li>Comment on assigned tasks</li>
                        <li>Limited project access</li>
                      </ul>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProjectOverview; 