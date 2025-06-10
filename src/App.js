import React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import TasksList from "./components/tasks-list.component";
import EditTask from "./components/edit-task.component";
import CreateTask from "./components/create-task.component";
import CreateProject from "./components/create-project.component";
import Login from "./components/Login";
import Signup from "./components/Signup";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";

// Protected Route component
const ProtectedRoute = ({ children, ...rest }) => {
  const { token } = useAuth();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        token ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route path="/" exact component={LandingPage} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/forgot-password" component={Login} />
          <ProtectedRoute path="/dashboard" exact>
            <Dashboard />
          </ProtectedRoute>
          <ProtectedRoute path="/tasks" exact>
            <TasksList />
          </ProtectedRoute>
          <ProtectedRoute path="/edit/:id">
            <EditTask />
          </ProtectedRoute>
          <ProtectedRoute path="/create">
            <CreateTask />
          </ProtectedRoute>
          <ProtectedRoute path="/project">
            <CreateProject />
          </ProtectedRoute>
          <Redirect to="/dashboard" />
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
