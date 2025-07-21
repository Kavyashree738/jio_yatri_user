import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaPhone, FaEnvelope, FaSignOutAlt, FaEdit, FaCamera } from 'react-icons/fa';
import '../styles/UserProfile.css';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Header from '../components/pages/Header';
import Footer from '../components/pages/Footer';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { user, setMessage } = useAuth();
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setUploadedPhoto(localStorage.getItem('uploadedPhoto'));
    setManualName(localStorage.getItem('manualName') || '');
    setManualEmail(localStorage.getItem('manualEmail') || '');
    setManualPhone(localStorage.getItem('manualPhone') || '');
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedPhoto(reader.result);
      localStorage.setItem('uploadedPhoto', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('manualName', manualName);
    localStorage.setItem('manualEmail', manualEmail);
    localStorage.setItem('manualPhone', manualPhone);
    setEditingProfile(false);
    setMessage({ text: 'Profile updated successfully!', isError: false });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/home');
    } catch (error) {
      setMessage({ text: 'Logout failed: ' + error.message, isError: true });
    }
  };

  if (!user) return <div className="user-profile-modern-container">Not logged in</div>;

  const isPhoneLogin = user.providerData.some(
    (provider) => provider.providerId === 'phone'
  );
  const isEmailLogin = user.providerData.some(
    (provider) =>
      provider.providerId === 'password' ||
      provider.providerId === 'google.com' ||
      provider.providerId === 'apple.com'
  );

  const shouldAskManualProfile =
    (isPhoneLogin && (!manualName || !manualEmail)) ||
    (isEmailLogin && !user.phoneNumber && !manualPhone) ||
    editingProfile;

  return (
    <>
      <Header />
      <div className="user-profile-modern-container">
        <div className="user-profile-modern-card">
          <div className="user-profile-modern-bg"></div>
          
          <div className="user-profile-modern-content">
            <div className="user-profile-modern-header">
              <div className="user-profile-modern-avatar-container">
                {uploadedPhoto ? (
                  <img src={uploadedPhoto} alt="Profile" className="user-profile-modern-avatar" />
                ) : user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="user-profile-modern-avatar" />
                ) : (
                  <div className="user-profile-modern-default-avatar">
                    <FaUser />
                  </div>
                )}
                <label htmlFor="upload-photo" className="user-profile-modern-avatar-upload">
                  <FaCamera className="camera-icon" />
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id="upload-photo"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </div>

              <h2 className="user-profile-modern-name">
                {user.displayName || manualName || 'User'}
              </h2>
              
              {!editingProfile && (manualName || manualPhone || manualEmail) && (
                <button 
                  className="user-profile-modern-edit-btn"
                  onClick={() => setEditingProfile(true)}
                >
                  <FaEdit /> Edit Profile
                </button>
              )}
            </div>

            {shouldAskManualProfile && (
              <form className="user-profile-modern-form" onSubmit={handleProfileSubmit}>
                <h3 className="user-profile-modern-form-title">Complete Your Profile</h3>
                {isPhoneLogin && (
                  <>
                    <div className="user-profile-modern-form-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="user-profile-modern-form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={manualEmail}
                        onChange={(e) => setManualEmail(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                {isEmailLogin && !user.phoneNumber && (
                  <div className="user-profile-modern-form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="user-profile-modern-form-actions">
                  <button type="submit" className="user-profile-modern-save-btn">
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="user-profile-modern-cancel-btn"
                    onClick={() => setEditingProfile(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="user-profile-modern-details">
              <div className="user-profile-modern-section">
                <h6 className="user-profile-modern-section-title">Contact Information</h6>
                <div className="user-profile-modern-details-grid">
                  {(user.phoneNumber || manualPhone) && (
                    <div className="user-profile-modern-detail-item">
                      <div className="user-profile-modern-detail-icon">
                        <FaPhone />
                      </div>
                      <div className="user-profile-modern-detail-content">
                        <span className="user-profile-modern-detail-label">Phone</span>
                        <span className="user-profile-modern-detail-value">{user.phoneNumber || manualPhone}</span>
                      </div>
                    </div>
                  )}
                  {(user.email || manualEmail) && (
                    <div className="user-profile-modern-detail-item">
                      <div className="user-profile-modern-detail-icon">
                        <FaEnvelope />
                      </div>
                      <div className="user-profile-modern-detail-content">
                        <span className="user-profile-modern-detail-label">Email</span>
                        <span className="user-profile-modern-detail-value">{user.email || manualEmail}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="user-profile-modern-section">
                <h6 className="user-profile-modern-section-title">Account Information</h6>
                <div className="user-profile-modern-details-grid">
                  {user.metadata?.creationTime && (
                    <div className="user-profile-modern-detail-item">
                      <div className="user-profile-modern-detail-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                          <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,7V13H17V11H13V7H11Z" />
                        </svg>
                      </div>
                      <div className="user-profile-modern-detail-content">
                        <span className="user-profile-modern-detail-label">Member Since</span>
                        <span className="user-profile-modern-detail-value">
                          {new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                  {user.metadata?.lastSignInTime && (
                    <div className="user-profile-modern-detail-item">
                      <div className="user-profile-modern-detail-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                          <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,7V13H17V11H13V7H11Z" />
                        </svg>
                      </div>
                      <div className="user-profile-modern-detail-content">
                        <span className="user-profile-modern-detail-label">Last Login</span>
                        <span className="user-profile-modern-detail-value">
                          {new Date(user.metadata.lastSignInTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button className="user-profile-modern-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
