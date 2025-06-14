import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTasks, createTask } from '../api/taskApi';
import LoadingAnimation from './LoadingAnimation';
import '../styles/TaskList.css';
import Footer from './Footer';

const TaskList = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const data = await getTasks(projectId);
      setTasks(data);
      setError('');
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
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
        projectId
      };

      const newIssue = await createTask(taskData);
      setTasks(prev => [...prev, newIssue]);
      
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

  if (loading) {
    return <LoadingAnimation message="Loading your tasks..." />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <div className="tasks-header-content">
          <h2>Project Issues</h2>
          <div className="tasks-header-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddIssueModal(true)}
            >
              <i className="fas fa-plus"></i> Add Issue
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(`/project/${projectId}/kanban`)}
            >
              <i className="fas fa-columns"></i> Back to Kanban Board
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(`/project/${projectId}/overview`)}
            >
              <i className="fas fa-arrow-left"></i> Back to Overview
            </button>
          </div>
        </div>
      </div>
      
      {tasks.length === 0 ? (
        <div className="no-tasks">
          <p>No tasks found</p>
          <strong>Create your first issue to get started!</strong>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map(task => (
            <div 
              key={task._id} 
              className="task-item"
              onClick={() => navigate(`/task/${task._id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="task-item-header">
                <h3>
                  <span className="task-id">#{task.serialNumber}</span>
                  {task.title}
                </h3>
                <div className="task-badges">
                  <span className={`task-type ${task.type}`}>
                    {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                  </span>
                  <span className={`task-status ${task.status}`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="task-meta">
                <span className="task-date">
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                </span>
                {task.deadline && (
                  <span className="task-deadline">
                    Deadline: {new Date(task.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
                    rows="3"
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
      <Footer />
    </div>
  );
};

export default TaskList; 