import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../api/authApi';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        await getCurrentUser();
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper" style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to right, #fdb99b, #cf8bf3, #a770ef)'
      }}>
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Welcome to KarmaSync</h1>
            <p className="dashboard-subtitle">Manage your productivity and projects</p>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>

        <div className="feature-grid">
          <Link to="/projects" className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-project-diagram fa-2x"></i>
            </div>
            <h3>Projects</h3>
            <p>Manage your projects and track their progress</p>
          </Link>

          <Link to="/profile" className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-user-cog fa-2x"></i>
            </div>
            <h3>Profile</h3>
            <p>Manage your account settings and preferences</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;