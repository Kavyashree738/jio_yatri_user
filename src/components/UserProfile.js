import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaPhone, FaEnvelope, FaSignOutAlt, FaEdit, FaCamera, FaShareAlt } from 'react-icons/fa';
import '../styles/UserProfile.css';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Header from '../components/pages/Header';
import Footer from '../components/pages/Footer';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://jio-yatri-user.onrender.com/api/users';
const DEBUG = true;

const UserProfile = () => {
  const { user, setMessage } = useAuth();
  const navigate = useNavigate();

  // State
  const [dbUser, setDbUser] = useState(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [showTicker, setShowTicker] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  // Provider detection
  const providerInfo = useMemo(() => {
    if (!user) return { type: 'unknown', ids: [] };
    const ids = user.providerData.map(p => p.providerId);
    return {
      type: ids.includes('phone') ? 'phone' :
        ids.includes('google.com') ? 'google' :
          (ids.includes('password') || ids.includes('apple.com')) ? 'email' :
            'unknown',
      ids,
      isPhone: ids.includes('phone'),
      isGoogle: ids.includes('google.com'),
      isEmailPw: ids.includes('password') || ids.includes('apple.com'),
    };
  }, [user]);

  // Resolved values
  const resolvedName = manualName || dbUser?.name || user?.displayName || '';
  const resolvedEmail = manualEmail || dbUser?.email || user?.email || '';
  const resolvedPhone = manualPhone || dbUser?.phone || user?.phoneNumber || '';
  const resolvedPhoto = (() => {
    if (uploadedPhoto) return uploadedPhoto;
    if (dbUser?.photo) return dbUser.photo;
    if (user?.photoURL) return user.photoURL;
    return null;
  })();

  // Get user initials for default avatar
  const getUserInitials = () => {
    if (!resolvedName) return '';
    return resolvedName.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // API calls
  const apiCreateOrUpdate = async (payload) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      console.error('API Error:', err);
      return null;
    }
  };

  const apiGetUser = async (uid) => {
    try {
      const res = await fetch(`${API_URL}/${uid}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error('API Error:', err);
      return null;
    }
  };

  // Handlers
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const newPhoto = reader.result;
      setUploadedPhoto(newPhoto);

      if (user) {
        const payload = {
          uid: user.uid,
          name: resolvedName,
          email: resolvedEmail,
          phone: resolvedPhone,
          photo: newPhoto,
        };
        const result = await apiCreateOrUpdate(payload);
        if (result?.user) setDbUser(result.user);
        setMessage?.({ text: 'Profile photo updated!', isError: false });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    const payload = {
      uid: user.uid,
      name: manualName || user.displayName || '',
      email: manualEmail || user.email || '',
      phone: manualPhone || user.phoneNumber || '',
      photo: uploadedPhoto || user.photoURL || '',
    };
    
    const result = await apiCreateOrUpdate(payload);
    if (result?.user) setDbUser(result.user);
    setShowForm(false);
    setMessage?.({ text: 'Profile updated!', isError: false });
  };

  const beginEdit = () => {
    setManualName(resolvedName);
    setManualEmail(resolvedEmail);
    setManualPhone(resolvedPhone);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setManualName(dbUser?.name || user?.displayName || '');
    setManualEmail(dbUser?.email || user?.email || '');
    setManualPhone(dbUser?.phone || user?.phoneNumber || '');
    setUploadedPhoto(dbUser?.photo || user?.photoURL || null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/home');
    } catch (err) {
      setMessage?.({ text: `Logout failed: ${err.message}`, isError: true });
    }
  };

  // in component top or inside useEffect when user changes
useEffect(() => {
  console.log('AUTH user:', user);
  console.log('user.photoURL:', user?.photoURL);
  console.log('dbUser.photo:', dbUser?.photo);
}, [user, dbUser]);


  // Effects
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTicker(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || loadedRef.current) return;
    loadedRef.current = true;

    const loadUserData = async () => {
      setLoading(true);
      const existing = await apiGetUser(user.uid);

      if (existing) {
        setDbUser(existing);
        setManualName(existing.name || user.displayName || '');
        setManualEmail(existing.email || user.email || '');
        setManualPhone(existing.phone || user.phoneNumber || '');
        setUploadedPhoto(existing.photo || user.photoURL || null);

        const missingPhoneForGoogle = providerInfo.isGoogle && !(existing.phone || user.phoneNumber);
        const missingNameOrEmailForPhone = providerInfo.isPhone && !(existing.name && existing.email);
        setShowForm(missingPhoneForGoogle || missingNameOrEmailForPhone);
      } else {
        const payload = {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          photo: user.photoURL || '',
        };
        const created = await apiCreateOrUpdate(payload);
        setDbUser(created?.user || created || null);
        setManualName(payload.name);
        setManualEmail(payload.email);
        setManualPhone(payload.phone);
        setUploadedPhoto(payload.photo || null);
        setShowForm(providerInfo.isGoogle ? !payload.phone : !(payload.name && payload.email));
      }

      setLoading(false);
    };

    loadUserData();
  }, [user, providerInfo]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="user-profile-modern-container">Loading profile...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="user-profile-modern-container">
        <div className="user-profile-modern-card">
          <div className="user-profile-modern-content">
            {/* Avatar Section */}
            <div className="user-profile-modern-header">
              <div className="user-profile-modern-avatar-container">
                {resolvedPhoto ? (
                  <img
                    src={resolvedPhoto}
                    alt="Profile"
                    className="user-profile-modern-avatar"
                  />
                ) : (
                  <div className="user-profile-modern-default-avatar">
                    {getUserInitials() || <FaUser className="avatar-icon" />}
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
                {resolvedName || 'User'}
              </h2>

              {!showForm && (
                <button className="user-profile-modern-edit-btn" onClick={beginEdit}>
                  <FaEdit /> Edit Profile
                </button>
              )}
            </div>

            {/* Edit Form */}
            {showForm && (
              <form className="user-profile-modern-form" onSubmit={handleProfileSubmit}>
                <h3 className="user-profile-modern-form-title">
                  {providerInfo.isPhone ? 'Complete Your Profile' : 'Update Your Profile'}
                </h3>

                {providerInfo.isPhone && (
                  <>
                    <div className="user-profile-modern-form-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        required={!resolvedName}
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
                        required={!resolvedEmail}
                      />
                    </div>
                  </>
                )}

                {providerInfo.isGoogle && (
                  <div className="user-profile-modern-form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      required={!resolvedPhone}
                      pattern="[0-9]{10}"
                      title="10-digit phone number"
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
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Contact Info */}
            <div className="user-profile-modern-details">
              <div className="user-profile-modern-section">
                <h6 className="user-profile-modern-section-title">Contact Information</h6>
                <div className="user-profile-modern-details-grid">
                  {resolvedPhone && (
                    <div className="user-profile-modern-detail-item">
                      <div className="user-profile-modern-detail-icon">
                        <FaPhone />
                      </div>
                      <div className="user-profile-modern-detail-content">
                        <span className="user-profile-modern-detail-label">Phone</span>
                        <span className="user-profile-modern-detail-value">
                          {resolvedPhone}
                        </span>
                      </div>
                    </div>
                  )}
                  {resolvedEmail && (
                    <div className="user-profile-modern-detail-item">
                      <div className="user-profile-modern-detail-icon">
                        <FaEnvelope />
                      </div>
                      <div className="user-profile-modern-detail-content">
                        <span className="user-profile-modern-detail-label">Email</span>
                        <span className="user-profile-modern-detail-value">
                          {resolvedEmail}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              className="user-profile-modern-share-btn"
              onClick={() => navigate('/refferal')}
            >
              <FaShareAlt />
              {showTicker ? (
                <div className="ticker-container">
                  <div className="ticker-text">Share & Get ₹10 Cashback</div>
                </div>
              ) : (
                <span>Share</span>
              )}
            </button>

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
