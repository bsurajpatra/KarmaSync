import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome to Your Dashboard</h1>
          <p className="dashboard-subtitle">Manage your productivity and projects</p>
        </div>

        <div className="feature-grid">
          <Link to="/projects" className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-project-diagram fa-2x"></i>
            </div>
            <h3>Projects</h3>
            <p>Manage your projects and track their progress</p>
          </Link>

          <div className="feature-card" onClick={handleLogout}>
            <div className="feature-icon">
              <i className="fas fa-sign-out-alt fa-2x"></i>
            </div>
            <h3>Logout</h3>
            <p>Sign out of your account</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard; 