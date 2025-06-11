import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser, updateProfile, deleteAccount } from '../api/authApi';
import axios from 'axios';

const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    console.log('Profile component mounted');
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data...');
      setLoading(true);
      const user = await getCurrentUser();
      console.log('User data received:', user);
      setUserData(user);
      setFormData(prev => ({ ...prev, fullName: user.fullName }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input changed:', { name, value });
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    console.log('Updating profile with data:', formData);
    setError('');
    setSuccess('');

    try {
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          return;
        }
        if (!formData.currentPassword) {
          setError('Current password is required to set a new password');
          return;
        }
      }

      const response = await updateProfile({
        fullName: formData.fullName,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      console.log('Profile update response:', response);

      setSuccess('Profile updated successfully');
      setEditMode(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      fetchUserData();
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.message || 'Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        console.log('Deleting account...');
        await deleteAccount();
        console.log('Account deleted successfully');
        await logout();
        navigate('/');
      } catch (error) {
        console.error('Account deletion error:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setError(error.message || 'Failed to delete account');
      }
    }
  };

  if (loading) {
    return (
      <div className="profile-wrapper">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-content">
        <div className="profile-header">
          <h1>Profile Settings</h1>
          <p className="profile-subtitle">Manage your account information</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-card">
          {!editMode ? (
            <div className="profile-info">
              <div className="info-group">
                <label>Full Name</label>
                <p>{userData?.fullName}</p>
              </div>
              <div className="info-group">
                <label>Username</label>
                <p>{userData?.username}</p>
              </div>
              <div className="info-group">
                <label>Email</label>
                <p>{userData?.email}</p>
              </div>
              <button 
                className="edit-button"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter to verify changes"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData(prev => ({
                      ...prev,
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    }));
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="danger-zone">
            <h3>Danger Zone</h3>
            <button 
              className="delete-button"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 