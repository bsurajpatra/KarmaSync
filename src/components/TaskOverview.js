import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, updateTask, deleteTask, addTaskComment } from '../api/taskApi';
import { getProjectById } from '../api/projectApi';
import LoadingAnimation from './LoadingAnimation';

const TaskOverview = () => {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [comment, setComment] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    status: '',
    deadline: '',
    customType: ''
  });
  const [showCustomType, setShowCustomType] = useState(false);

  useEffect(() => {
    fetchTaskAndProject();
  }, [taskId]);

  const fetchTaskAndProject = async () => {
    try {
      const taskData = await getTaskById(taskId);
      setTask(taskData);
      setFormData({
        title: taskData.title,
        description: taskData.description,
        type: taskData.type,
        status: taskData.status,
        deadline: taskData.deadline
      });

      const projectId = taskData.projectId._id || taskData.projectId;
      const projectData = await getProjectById(projectId);
      setProject(projectData);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      if (value === 'custom') {
        setShowCustomType(true);
        setFormData(prev => ({
          ...prev,
          [name]: prev.customType || ''
        }));
      } else {
        setShowCustomType(false);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          customType: ''
        }));
      }
    } else if (name === 'customType') {
      const validatedValue = value.replace(/[^a-zA-Z0-9-_]/g, '');
      setFormData(prev => ({
        ...prev,
        type: validatedValue,
        customType: validatedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedTask = await updateTask(taskId, formData);
      setTask(updatedTask);
      setEditing(false);
      setError('');
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.message || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(taskId);
      navigate(`/project/${project._id}/tasks`);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.message || 'Failed to delete task');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const updatedTask = await addTaskComment(taskId, comment);
      setTask(updatedTask);
      setComment('');
      setError('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err.message || 'Failed to add comment');
    }
  };

  if (loading) return (
    <div className="task-overview-container" style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to right, #fdb99b, #cf8bf3, #a770ef)'
    }}>
      <LoadingAnimation message="Loading task details..." />
    </div>
  );

  if (error) return <div className="error-message">{error}</div>;
  if (!task) return <div className="error-message">Task not found</div>;

  return (
    <div className="task-overview-container">
      <div className="task-overview-header">
        <div className="task-overview-header-content">
          <div className="task-overview-header-left">
            <h1>Task Details</h1>
          </div>
          <div className="task-overview-header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(`/project/${project._id}/tasks`)}
            >
              <i className="fas fa-arrow-left"></i> Back to Tasks
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(`/project/${project._id}/kanban`)}
            >
              <i className="fas fa-columns"></i> View in Kanban
            </button>
            {!editing && (
              <button 
                className="btn btn-primary"
                onClick={() => setEditing(true)}
              >
                <i className="fas fa-edit"></i> Edit Task
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="task-overview-content">
        {editing ? (
          <form onSubmit={handleSubmit} className="task-edit-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-control"
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
                className="form-control"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={showCustomType ? 'custom' : formData.type}
                onChange={handleInputChange}
                className="form-control"
                required
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
                  value={formData.customType}
                  onChange={handleInputChange}
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
                value={formData.status}
                onChange={handleInputChange}
                className="form-control"
                required
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
                value={formData.deadline}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    title: task.title,
                    description: task.description,
                    type: task.type,
                    status: task.status,
                    deadline: task.deadline
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="task-details">
            <div className="task-section">
              <h2>{task.title}</h2>
              <div className="task-meta">
                <span className={`task-type ${task.type}`}>
                  {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                </span>
                <span className={`task-status ${task.status}`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
                <span className="task-date">
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                </span>
                {task.deadline && (
                  <span className="task-deadline">
                    Deadline: {new Date(task.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="task-description">
                <h3>Description</h3>
                <p>{task.description || 'No description provided'}</p>
              </div>
            </div>

            <div className="task-section">
              <h3>Comments</h3>
              <div className="comments-list">
                {task.comments?.map(comment => (
                  <div key={comment._id} className="comment">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author}</span>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="form-control"
                  rows="3"
                />
                <button type="submit" className="btn btn-primary">
                  Add Comment
                </button>
              </form>
            </div>

            <div className="task-section danger-zone">
              <h3>Danger Zone</h3>
              <div className="danger-zone-content">
                <div className="danger-action">
                  <div className="danger-action-info">
                    <h4>Delete this task</h4>
                    <p>Once you delete a task, there is no going back. Please be certain.</p>
                  </div>
                  <button 
                    className="btn btn-danger"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delete Task</h2>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteConfirm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this task?</p>
              <p className="warning-text">This action cannot be undone.</p>
              <div className="task-to-delete">
                <strong>Task to delete:</strong> {task.title}
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
                onClick={handleDelete}
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskOverview; 