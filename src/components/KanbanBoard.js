import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectById, addCustomBoard, deleteCustomBoard } from '../api/projectApi';
import { getTasks, updateTaskStatus, createTask } from '../api/taskApi';
import BoardManager from './BoardManager';
import LoadingAnimation from './LoadingAnimation';

const KanbanBoard = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [boards, setBoards] = useState({
    todo: { name: 'To Do', items: [] },
    doing: { name: 'Doing', items: [] },
    done: { name: 'Done', items: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showAddIssueModal, setShowAddIssueModal] = useState(false);
  const [showBoardManager, setShowBoardManager] = useState(false);
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
    fetchProjectAndTasks();
  }, [projectId]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectData, tasksData] = await Promise.all([
        getProjectById(projectId),
        getTasks(projectId)
      ]);

      setProject(projectData);
      
      // Initialize boards with default structure
      const groupedTasks = {
        todo: { 
          name: 'To Do',
          items: []
        },
        doing: { 
          name: 'Doing',
          items: []
        },
        done: { 
          name: 'Done',
          items: []
        }
      };

      // Add custom boards if they exist
      if (projectData.customBoards) {
        projectData.customBoards.forEach(board => {
          groupedTasks[board.id] = {
            name: board.name,
            items: []
          };
        });
      }

      // Distribute tasks to their respective boards
      tasksData.forEach(task => {
        if (groupedTasks[task.status]) {
          groupedTasks[task.status].items.push(task);
        } else {
          // If task status doesn't match any board, put it in todo
          groupedTasks.todo.items.push(task);
        }
      });
      
      setBoards(groupedTasks);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load board data');
    } finally {
      setLoading(false);
    }
  };

  // Add drag and drop handlers
  const handleDragStart = (e, taskId, sourceBoard) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceBoard', sourceBoard);
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragging-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragging-over');
  };

  const handleDrop = async (e, targetBoard) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragging-over');
    
    const taskId = e.dataTransfer.getData('taskId');
    const sourceBoard = e.dataTransfer.getData('sourceBoard');
    
    if (sourceBoard === targetBoard) return;

    try {
      // Update task status in the backend
      await updateTaskStatus(taskId, targetBoard);

      // Update local state
      setBoards(prev => {
        const newBoards = { ...prev };
        const task = newBoards[sourceBoard].items.find(item => item._id === taskId);
        
        if (task) {
          // Remove from source board
          newBoards[sourceBoard].items = newBoards[sourceBoard].items.filter(
            item => item._id !== taskId
          );
          
          // Add to target board
          newBoards[targetBoard].items = [...newBoards[targetBoard].items, {
            ...task,
            status: targetBoard
          }];
        }
        
        return newBoards;
      });
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status');
    }
  };

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
  };

  const handleAddIssue = () => {
    setShowAddIssueModal(true);
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
      // Prepare the task data
      const taskData = {
        title: issueFormData.title,
        description: issueFormData.description,
        type: issueFormData.type,
        status: issueFormData.status,
        deadline: issueFormData.deadline,
        projectId: projectId
      };

      console.log('Creating task with data:', taskData); // Debug log

      const newIssue = await createTask(taskData);
      console.log('Created task:', newIssue); // Debug log

      if (!newIssue) {
        throw new Error('Failed to create task - no response from server');
      }

      // Update the correct board with the new issue
      setBoards(prev => ({
        ...prev,
        [issueFormData.status]: {
          ...prev[issueFormData.status],
          items: [...prev[issueFormData.status].items, newIssue]
        }
      }));

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
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error creating issue:', err);
      setError(err.message || 'Failed to create issue. Please try again.');
    }
  };

  const handleBoardAdd = async (newBoard) => {
    try {
      const savedBoard = await addCustomBoard(projectId, newBoard);
      setBoards(prev => ({
        ...prev,
        [savedBoard.id]: {
          name: savedBoard.name,
          items: []
        }
      }));
      setShowBoardManager(false);
    } catch (err) {
      console.error('Error adding board:', err);
      setError('Failed to add new board');
    }
  };

  const handleBoardDelete = async (boardId) => {
    try {
      await deleteCustomBoard(projectId, boardId);
      const { [boardId]: deletedBoard, ...remainingBoards } = boards;
      
      // Move all issues from deleted board to 'todo'
      const movedIssues = deletedBoard.items.map(async (issue) => {
        await updateTaskStatus(issue._id, 'todo');
        return { ...issue, status: 'todo' };
      });
      
      await Promise.all(movedIssues);
      
      setBoards({
        ...remainingBoards,
        todo: {
          ...remainingBoards.todo,
          items: [...remainingBoards.todo.items, ...deletedBoard.items]
        }
      });
    } catch (err) {
      console.error('Error deleting board:', err);
      setError('Failed to delete board');
    }
  };

  if (loading) return (
    <div className="kanban-container" style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to right, #fdb99b, #cf8bf3, #a770ef)'
    }}>
      <LoadingAnimation message="Loading your board..." />
    </div>
  );

  if (error) return <div className="error-message">{error}</div>;

  if (!project) return <div className="error-message">Project not found</div>;

  // Update the board rendering to use native drag and drop
  const renderBoard = (boardId, board) => (
    <div 
      key={boardId}
      className="kanban-column"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, boardId)}
    >
      <div className="column-header">
        <h3>{board.name}</h3>
        <span className="task-count">{board.items.length}</span>
      </div>
      <div className="task-list">
        {board.items.map(task => (
          <div
            key={task._id}
            className="task-card"
            draggable
            onDragStart={(e) => handleDragStart(e, task._id, boardId)}
            onDragEnd={handleDragEnd}
            onClick={() => navigate(`/task/${task._id}`)}
            style={{ cursor: 'pointer' }}
          >
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <div className="task-meta">
              <span className={`task-type ${task.type}`}>
                {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
              </span>
              {task.deadline && (
                <span className="task-deadline">
                  Due: {new Date(task.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="kanban-container">
      <div className="projects-header">
        <div className="projects-header-content">
          <div className="projects-header-left">
            <h1>{project.title} - Kanban Board</h1>
          </div>
          <div className="projects-header-actions">
            <button 
              className="back-to-dashboard-button"
              onClick={() => navigate(`/project/${projectId}/overview`)}
            >
              <i className="fas fa-arrow-left"></i> Back to Overview
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(`/project/${projectId}/tasks`)}
            >
              <i className="fas fa-list"></i> View All Issues
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowBoardManager(!showBoardManager)}
            >
              Manage Boards
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleAddIssue}
            >
              Add Issue
            </button>
          </div>
        </div>
      </div>

      {showBoardManager && (
        <BoardManager
          boards={boards}
          onBoardAdd={handleBoardAdd}
          onBoardDelete={handleBoardDelete}
        />
      )}

      <div className="kanban-board">
        {Object.entries(boards).map(([status, board]) => (
          renderBoard(status, board)
        ))}
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

      {selectedIssue && (
        <div className="task-modal">
          {/* TODO: Implement issue details modal */}
        </div>
      )}
    </div>
  );
};

export default KanbanBoard; 