import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaPhone, FaEnvelope, FaSignOutAlt, FaEdit, FaCheck } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md'
import '../styles/UserProfile.css';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Header from '../components/pages/Header';
import Footer from '../components/pages/Footer';
import { useNavigate } from 'react-router-dom';

// 👇 Add a local placeholder image file to your project.
import avatarPlaceholder from '../assets/images/profile.png';

// (Optional) If you want *random* placeholder variants, import more & put in this array:
const PLACEHOLDER_POOL = [avatarPlaceholder]; // add more paths if you have them

const pickRandomPlaceholder = () => {
  const i = Math.floor(Math.random() * PLACEHOLDER_POOL.length);
  return PLACEHOLDER_POOL[i];
};

const UserProfile = () => {
  const { user, setMessage } = useAuth();
  const navigate = useNavigate();

  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Stable random placeholder (only picked once per mount)
  const randomPlaceholder = useMemo(() => pickRandomPlaceholder(), []);

  // 🔹 Load saved data from localStorage only once
  useEffect(() => {
    const savedPhoto = localStorage.getItem('uploadedPhoto');
    const savedName = localStorage.getItem('profileName') || '';
    const savedEmail = localStorage.getItem('profileEmail') || '';
    const savedPhone = localStorage.getItem('profilePhone') || '';

    setUploadedPhoto(savedPhoto);
    setProfileData({
      name: savedName,
      email: savedEmail,
      phone: savedPhone
    });
  }, []);

  // 🔹 Compute which avatar to show: uploaded > firebase > placeholder
  const avatarSrc = uploadedPhoto || user?.photoURL || randomPlaceholder;

  // 🔹 Handle broken image URLs (e.g., if user photo 404s after logout)
  const handleAvatarError = useCallback((e) => {
    if (e?.target?.src !== randomPlaceholder) {
      e.target.src = randomPlaceholder;
    }
  }, [randomPlaceholder]);

  // 🔹 Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedPhoto(reader.result);
      localStorage.setItem('uploadedPhoto', reader.result);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Handle input changes for profile edit
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 🔹 Save profile data
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('profileName', profileData.name);
    localStorage.setItem('profileEmail', profileData.email);
    localStorage.setItem('profilePhone', profileData.phone);

    setEditingProfile(false);
    setMessage({ text: 'Profile updated successfully!', isError: false });
  };

  // 🔹 Handle logout
  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('uploadedPhoto');
      localStorage.removeItem('profileName');
      localStorage.removeItem('profileEmail');
      localStorage.removeItem('profilePhone');

      await signOut(auth);

      // Reset state
      setUploadedPhoto(null);
      setProfileData({ name: '', email: '', phone: '' });

      setMessage({ text: 'Logged out successfully', isError: false });
      navigate('/home');
    } catch (error) {
      console.error('Logout error:', error);
      setMessage({ text: 'Logout failed: ' + error.message, isError: true });
    }
  };

  const displayName = profileData.name || user?.displayName || 'User';
  const displayEmail = profileData.email || user?.email || '';
  const displayPhone = profileData.phone || user?.phoneNumber || '';
  const isVerified = user?.emailVerified || user?.phoneNumber;

  return (
    <>
      <Header />
      <div className="profile-app-container">
        <div className="profile-header-section">
          <div className="profile-avatar-container">
            <div className="profile-avatar-wrapper">
              {isLoading ? (
                <div className="profile-loading-spinner"></div>
              ) : (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="profile-avatar"
                  onError={handleAvatarError}
                />
              )}

              <label htmlFor="upload-photo" className="profile-avatar-edit">
                <FaEdit size={14} />
              </label>
              <input
                type="file"
                accept="image/*"
                id="upload-photo"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>

            <div className="profile-header-info">
              <h2 className="profile-name">
                {displayName}
                {isVerified && <MdVerified className="verified-badge" />}
              </h2>
              <p className="profile-email">{displayEmail}</p>
            </div>
          </div>
        </div>

        <div className="profile-content-section">
          {editingProfile ? (
            <form className="profile-edit-form" onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingProfile(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  <FaCheck /> Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-details-card">
                <h3 className="details-title">Account Details</h3>
                <div className="detail-item">
                  <FaUser className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{displayName}</span>
                  </div>
                </div>
                {displayEmail && (
                  <div className="detail-item">
                    <FaEnvelope className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{displayEmail}</span>
                    </div>
                  </div>
                )}
                {displayPhone && (
                  <div className="detail-item">
                    <FaPhone className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{displayPhone}</span>
                    </div>
                  </div>
                )}
                <button
                  className="edit-profile-btn"
                  onClick={() => setEditingProfile(true)}
                >
                  <FaEdit /> Edit Profile
                </button>
              </div>

              <div className="profile-meta-card">
                <h3 className="details-title">Account Information</h3>
                <div className="meta-item">
                  <span className="meta-label">Account Created</span>
                  <span className="meta-value">
                    {user?.metadata?.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Last Login</span>
                  <span className="meta-value">
                    {user?.metadata?.lastSignInTime
                      ? new Date(user.metadata.lastSignInTime).toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </>
          )}

          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
