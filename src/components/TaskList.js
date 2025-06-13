import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTasks } from '../api/taskApi';
import LoadingAnimation from './LoadingAnimation';

const TaskList = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <div className="tasks-container" style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to right, #fdb99b, #cf8bf3, #a770ef)'
      }}>
        <LoadingAnimation message="Loading tasks..." />
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <div className="tasks-header-content">
          <h2>Project Tasks</h2>
          <div className="tasks-header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(`/project/${projectId}/kanban`)}
            >
              <i className="fas fa-columns"></i> Back to Kanban Board
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/project/${projectId}/overview`)}
            >
              <i className="fas fa-arrow-left"></i> Back to Project
            </button>
          </div>
        </div>
      </div>
      
      {tasks.length === 0 ? (
        <div className="no-tasks">No tasks found</div>
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
                <h3>{task.title}</h3>
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
    </div>
  );
};

export default TaskList; 