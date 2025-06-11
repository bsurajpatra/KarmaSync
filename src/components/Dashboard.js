import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTasks, 
  faPlus, 
  faProjectDiagram, 
  faChartLine,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import Footer from './Footer';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const features = [
    {
      title: 'View Tasks',
      description: 'Track and manage your daily activities',
      icon: faTasks,
      link: '/dashboard',
      color: '#fdb99b'
    },
    {
      title: 'Create Log',
      description: 'Add new time entries and activities',
      icon: faPlus,
      link: '/create',
      color: '#cf8bf3'
    },
    {
      title: 'New Project',
      description: 'Create and manage your projects',
      icon: faProjectDiagram,
      link: '/project',
      color: '#a770ef'
    },
    {
      title: 'Analytics',
      description: 'View your productivity insights',
      icon: faChartLine,
      link: '/analytics',
      color: '#7b5291'
    }
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome, {user?.username}!</h1>
          <p className="dashboard-subtitle">Track your productivity and achieve your goals</p>
        </div>

        <div className="feature-grid">
          {features.map((feature, index) => (
            <Link to={feature.link} className="feature-card" key={index}>
              <div className="feature-icon" style={{ color: feature.color }}>
                <FontAwesomeIcon icon={feature.icon} size="2x" />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </Link>
          ))}
        </div>

        <div className="dashboard-footer">
          <button onClick={logout} className="btn btn-outline-primary">
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard; 