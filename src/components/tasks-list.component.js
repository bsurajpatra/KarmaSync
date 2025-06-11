import React, { useState, useEffect } from "react";
import TimerBar from "./timerbar.component";
import Task from "./task.component";
import axios from "axios";
import config from '../config';

const TasksList = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/tasks/`);
      setTasks(res.data);
    } catch (err) {
        console.log(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${config.API_URL}/tasks/` + id);
      setTasks(tasks.filter(el => el._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const rerenderCallback = () => {
    fetchTasks();
  };

    return (
      <div>
      <TimerBar rerenderCallback={rerenderCallback} />
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Project</th>
              <th>Task</th>
              <th>Duration</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
        <tbody>
          {tasks.map(currentTask => (
            <Task
              task={currentTask}
              deleteTask={deleteTask}
              key={currentTask._id}
            />
          ))}
        </tbody>
        </table>
      </div>
    );
};

export default TasksList;
