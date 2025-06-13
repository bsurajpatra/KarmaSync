import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../api/authApi';
import LoadingAnimation from './LoadingAnimation';

// Logout Confirmation Modal Component
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Confirm Logout</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to log out?</p>
          <div className="modal-actions">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button className="logout-confirm-button" onClick={onConfirm}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
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
        <LoadingAnimation message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Welcome, {user?.name || 'User'}!</h1>
            <p className="dashboard-subtitle">Manage your productivity and projects</p>
          </div>
          <button className="logout-button" onClick={handleLogoutClick}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>

        <div className="feature-grid">
          <Link to="/projects" className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-project-diagram"></i>
            </div>
            <h3>Projects</h3>
            <p>Manage your projects and track progress</p>
          </Link>

          <Link to="/profile" className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-user"></i>
            </div>
            <h3>Profile</h3>
            <p>View and update your profile settings</p>
          </Link>

          <Link to="/contact" className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <h3>Contact Us</h3>
            <p>Get in touch with our support team</p>
          </Link>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};

export default Dashboard;