import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getProjectById } from '../api/projectApi';
import { getTasks, updateTaskStatus } from '../api/taskApi';

const KanbanBoard = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState({
    todo: [],
    doing: [],
    done: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

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
      
      // Group tasks by status
      const groupedTasks = {
        todo: tasksData.filter(task => task.status === 'todo'),
        doing: tasksData.filter(task => task.status === 'doing'),
        done: tasksData.filter(task => task.status === 'done')
      };
      
      setTasks(groupedTasks);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load board data');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reorder within the same column
      const column = tasks[source.droppableId];
      const newColumn = Array.from(column);
      const [removed] = newColumn.splice(source.index, 1);
      newColumn.splice(destination.index, 0, removed);

      setTasks({
        ...tasks,
        [source.droppableId]: newColumn
      });
    } else {
      // Move between columns
      const sourceColumn = tasks[source.droppableId];
      const destColumn = tasks[destination.droppableId];
      const newSourceColumn = Array.from(sourceColumn);
      const newDestColumn = Array.from(destColumn);
      const [moved] = newSourceColumn.splice(source.index, 1);
      newDestColumn.splice(destination.index, 0, moved);

      setTasks({
        ...tasks,
        [source.droppableId]: newSourceColumn,
        [destination.droppableId]: newDestColumn
      });

      try {
        await updateTaskStatus(draggableId, destination.droppableId);
      } catch (err) {
        console.error('Error updating task status:', err);
        // Revert the change if the API call fails
        setTasks({
          ...tasks,
          [source.droppableId]: sourceColumn,
          [destination.droppableId]: destColumn
        });
      }
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  if (loading) return <div className="loading">Loading board...</div>;

  if (error) return <div className="error-message">{error}</div>;

  if (!project) return <div className="error-message">Project not found</div>;

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
              className="btn btn-primary"
              onClick={() => {/* TODO: Implement add task */}}
            >
              Add Task
            </button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {Object.entries(tasks).map(([status, items]) => (
            <div key={status} className="kanban-column">
              <h2 className="column-title">
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="task-count">{items.length}</span>
              </h2>
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`task-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  >
                    {items.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                            onClick={() => handleTaskClick(task)}
                          >
                            <h3>{task.title}</h3>
                            <div className="task-meta">
                              <span className={`task-type ${task.type}`}>
                                {task.type}
                              </span>
                              <span className="task-assignee">
                                {task.assignee.fullName}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {selectedTask && (
        <div className="task-modal">
          {/* TODO: Implement task details modal */}
        </div>
      )}
    </div>
  );
};

export default KanbanBoard; 