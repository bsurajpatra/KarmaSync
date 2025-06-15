import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectById, addCustomBoard, deleteCustomBoard } from '../api/projectApi';
import { getTasks, updateTaskStatus, createTask } from '../api/taskApi';
import BoardManager from './BoardManager';
import LoadingAnimation from './LoadingAnimation';
import '../styles/KanbanBoard.css';
import Footer from './Footer';

const KanbanBoard = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [boards, setBoards] = useState({
    todo: { name: 'To Do', items: [], compressed: false },
    doing: { name: 'Doing', items: [], compressed: false },
    done: { name: 'Done', items: [], compressed: false }
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
    customType: '',
    assignee: ''
  });
  const [showCustomType, setShowCustomType] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [isDraggingBoard, setIsDraggingBoard] = useState(false);
  const [draggedBoardId, setDraggedBoardId] = useState(null);

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
      await updateTaskStatus(taskId, targetBoard);

      setBoards(prev => {
        const newBoards = { ...prev };
        const task = newBoards[sourceBoard].items.find(item => item._id === taskId);
        
        if (task) {
          newBoards[sourceBoard].items = newBoards[sourceBoard].items.filter(
            item => item._id !== taskId
          );
          
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
        customType: '',
        assignee: ''
      });
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error creating issue:', err);
      setError(err.message || 'Failed to create issue. Please try again.');
    }
  };

  const handleBoardAdd = async (e) => {
    e.preventDefault();
    try {
      const savedBoard = await addCustomBoard(projectId, { name: newBoardName });
      setBoards(prev => ({
        ...prev,
        [savedBoard.id]: {
          name: savedBoard.name,
          items: []
        }
      }));
      setShowBoardManager(false);
      setNewBoardName('');
    } catch (err) {
      console.error('Error adding board:', err);
      setError('Failed to add new board');
    }
  };

  const isDefaultBoard = (boardId) => {
    return ['todo', 'doing', 'done'].includes(boardId);
  };

  const canDeleteBoard = (boardId, board) => {
    return !isDefaultBoard(boardId) && board.items.length === 0;
  };

  const handleBoardDelete = async (boardId) => {
    if (!canDeleteBoard(boardId, boards[boardId])) {
      return;
    }

    try {
      await deleteCustomBoard(projectId, boardId);
      const { [boardId]: deletedBoard, ...remainingBoards } = boards;
      setBoards(remainingBoards);
    } catch (err) {
      console.error('Error deleting board:', err);
      setError('Failed to delete board');
    }
  };

  const toggleBoardCompress = (boardId) => {
    setBoards(prev => ({
      ...prev,
      [boardId]: {
        ...prev[boardId],
        compressed: !prev[boardId].compressed
      }
    }));
  };

  // Add board drag handlers
  const handleBoardDragStart = (e, boardId) => {
    setIsDraggingBoard(true);
    setDraggedBoardId(boardId);
    e.dataTransfer.setData('boardId', boardId);
    e.currentTarget.classList.add('dragging-board');
  };

  const handleBoardDragEnd = (e) => {
    setIsDraggingBoard(false);
    setDraggedBoardId(null);
    e.currentTarget.classList.remove('dragging-board');
  };

  const handleBoardDragOver = (e) => {
    e.preventDefault();
    const draggedOverBoard = e.currentTarget;
    if (draggedOverBoard.classList.contains('kanban-column')) {
      draggedOverBoard.classList.add('board-drag-over');
    }
  };

  const handleBoardDragLeave = (e) => {
    e.currentTarget.classList.remove('board-drag-over');
  };

  const handleBoardDrop = (e, targetBoardId) => {
    e.preventDefault();
    e.currentTarget.classList.remove('board-drag-over');
    
    const sourceBoardId = e.dataTransfer.getData('boardId');
    if (sourceBoardId === targetBoardId) return;

    setBoards(prev => {
      const boardEntries = Object.entries(prev);
      const sourceIndex = boardEntries.findIndex(([id]) => id === sourceBoardId);
      const targetIndex = boardEntries.findIndex(([id]) => id === targetBoardId);
      
      const newBoardEntries = [...boardEntries];
      const [removed] = newBoardEntries.splice(sourceIndex, 1);
      newBoardEntries.splice(targetIndex, 0, removed);
      
      return Object.fromEntries(newBoardEntries);
    });
  };

  if (loading) return <LoadingAnimation message="Loading your board..." />;

  if (error) return <div className="error-message">{error}</div>;

  if (!project) return <div className="error-message">Project not found</div>;

  // Update the board rendering to use native drag and drop
  const renderBoard = (boardId, board) => (
    <div 
      key={boardId}
      className={`kanban-column ${board.compressed ? 'compressed' : ''}`}
      draggable
      onDragStart={(e) => handleBoardDragStart(e, boardId)}
      onDragEnd={handleBoardDragEnd}
      onDragOver={handleBoardDragOver}
      onDragLeave={handleBoardDragLeave}
      onDrop={(e) => handleBoardDrop(e, boardId)}
    >
      <div className="column-header">
        <div className="column-header-left">
          <h3>{board.name}</h3>
          {!board.compressed && <span className="task-count">{board.items.length}</span>}
        </div>
        <button 
          className="compress-decompress-btn"
          onClick={() => toggleBoardCompress(boardId)}
          title={board.compressed ? "Expand" : "Compress"}
        >
          <i className={`fas fa-${board.compressed ? 'expand' : 'compress'}-alt`}></i>
        </button>
      </div>
      {!board.compressed && (
        <div className="task-list">
        {board.items.map(task => (
          <div
            key={task._id}
            className="issue-card"
            draggable
            onDragStart={(e) => handleDragStart(e, task._id, boardId)}
            onDragEnd={handleDragEnd}
            onClick={() => navigate(`/task/${task._id}`)}
          >
            <div className="issue-card__row issue-card__row--title">
              <span className="issue-card__id">#{task.serialNumber}</span>
              <h3>{task.title}</h3>
            </div>
            {project?.projectType === 'collaborative' && task.assignee && (
              <div className="issue-card__row issue-card__row--assignee">
                <div className="issue-card__assignee">
                  <i className="fas fa-user"></i>
                  <span>{task.assignee?.username || task.assignee?.fullName}</span>
                </div>
              </div>
            )}
            <div className="issue-card__row issue-card__row--meta">
              <span className={`issue-card__type ${task.type && ['tech', 'review', 'bug', 'feature', 'documentation'].includes(task.type) ? `issue-card__type--${task.type}` : ''}`}>
                {task.type === 'tech' ? 'Technical' :
                 task.type === 'review' ? 'Review' :
                 task.type === 'bug' ? 'Bug' :
                 task.type === 'feature' ? 'Feature' :
                 task.type === 'documentation' ? 'Documentation' :
                 task.type ? task.type.charAt(0).toUpperCase() + task.type.slice(1) : 'Task'}
              </span>
              {task.deadline && (
                <div className="issue-card__deadline">
                  <i className="far fa-clock"></i>
                  <span>{new Date(task.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <div className="kanban-header-content">
          <div className="kanban-header-left">
            <h1>{project.title} - Kanban Board</h1>
          </div>
          <div className="kanban-header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(`/project/${projectId}/overview`)}
            >
              <i className="fas fa-arrow-left"></i> Back to Project Overview
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(`/project/${projectId}/tasks`)}
            >
              <i className="fas fa-list"></i> List Issues
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowBoardManager(true)}
            >
              <i className="fas fa-columns"></i> Manage Boards
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleAddIssue}
            >
              <i className="fas fa-plus"></i> Add Issue
            </button>
          </div>
        </div>
      </div>

        <div className="kanban-board">
          {Object.entries(boards).map(([status, board]) => (
          renderBoard(status, board)
          ))}
        </div>

      {showBoardManager && (
        <div className="board-manager-modal">
          <div className="board-manager-content">
            <button 
              className="modal-close-btn"
              onClick={() => setShowBoardManager(false)}
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="board-manager-header">
              <h2>Manage Boards</h2>
            </div>
            <div className="board-list">
              {Object.entries(boards).map(([id, board]) => (
                <div key={id} className="board-item">
                  <span className="board-item-name">{board.name}</span>
                  <div className="board-item-actions">
                    {canDeleteBoard(id, board) && (
                      <button 
                        className="delete-board-btn"
                        onClick={() => handleBoardDelete(id)}
                        title="Delete Board"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                    {!canDeleteBoard(id, board) && (
                      <span className="board-status">
                        {isDefaultBoard(id) ? 'Default Board' : 'Has Issues'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <form className="add-board-form" onSubmit={handleBoardAdd}>
              <input
                type="text"
                placeholder="New board name"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                required
              />
              <button type="submit">Add Board</button>
            </form>
          </div>
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
                    customType: '',
                    assignee: ''
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

                {project?.projectType === 'collaborative' && (
                  <div className="form-group">
                    <label htmlFor="assignee">Assignee</label>
                    <select
                      id="assignee"
                      name="assignee"
                      value={issueFormData.assignee}
                      onChange={handleIssueFormChange}
                      className="form-control"
                    >
                      <option value="">Select Assignee</option>
                      {project.collaborators.map((collab) => (
                        <option key={collab.userId._id} value={collab.userId._id}>
                          {collab.userId.username}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
                        customType: '',
                        assignee: ''
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
      <Footer />
    </div>
  );
};

export default KanbanBoard; 