import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddressAutocomplete from '../AddressAutocomplete';
import { FaTimes, FaPlus, FaTrash, FaSpinner, FaCheck, FaUpload, FaImage, FaUtensils, FaHotel, FaClock, FaPhone, FaWallet, FaEnvelope, FaMapMarkerAlt, FaImages, FaFileImage, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { MdRestaurant, MdFastfood, MdLocalDining } from 'react-icons/md';
import '../../styles/hotels/HotelRegistration.css';
import Header from '../pages/Header';
import Footer from '../pages/Footer';
import { useAuth } from '../../context/AuthContext';

const HotelRegistration = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    phonePeNumber: '',
    email: '',
    openingTime: '',
    closingTime: '',
    category: 'both',
    address: { address: '', coordinates: { lat: null, lng: null } },
    menuItems: [],
  });

  const [menuItem, setMenuItem] = useState({ name: '', price: '', description: '' });
  const [menuImage, setMenuImage] = useState(null);
  const [hotelImages, setHotelImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/home', { state: { from: '/hotel-registration' } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    let completed = 0;
    if (formData.name) completed += 10;
    if (formData.phone) completed += 10;
    if (formData.phonePeNumber) completed += 10;
    if (formData.address.address) completed += 10;
    if (formData.openingTime && formData.closingTime) completed += 10;
    if (formData.menuItems.length > 0) completed += 20;
    if (hotelImages.length > 0) completed += 15;
    if (menuImage) completed += 15;

    setProgress(Math.min(100, completed));
  }, [formData, menuImage, hotelImages]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateMenuItem = () => {
    if (!menuItem.name.trim()) {
      setError('Menu item name is required!');
      return false;
    }
    if (!menuItem.price || isNaN(menuItem.price) || Number(menuItem.price) <= 0) {
      setError('Please enter a valid price (greater than 0)');
      return false;
    }
    return true;
  };

  const handleAddMenuItem = () => {
    setError('');
    if (!validateMenuItem()) return;

    setFormData({
      ...formData,
      menuItems: [
        ...formData.menuItems,
        {
          ...menuItem,
          price: Number(menuItem.price).toFixed(2),
          id: Date.now()
        }
      ],
    });
    setMenuItem({ name: '', price: '', description: '' });
  };

  const handleRemoveMenuItem = (index) => {
    const updatedMenuItems = [...formData.menuItems];
    updatedMenuItems.splice(index, 1);
    setFormData({ ...formData, menuItems: updatedMenuItems });
  };

  const handleAddressSelect = (addressData) => {
    setFormData({
      ...formData,
      address: {
        address: addressData.address,
        coordinates: addressData.coordinates
      },
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Hotel name is required');
      return false;
    }
    if (!formData.phone.match(/^[0-9]{10}$/)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!formData.phonePeNumber.match(/^[0-9]{10}$/)) {
      setError('Please enter a valid 10-digit PhonePe number');
      return false;
    }
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.address.address) {
      setError('Please select an address from the suggestions');
      return false;
    }
    if (!formData.openingTime || !formData.closingTime) {
      setError('Opening and closing times are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    if (!user) {
      setError('You must be logged in to register a hotel');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
       formDataToSend.append('userId', user.uid);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('phonePeNumber', formData.phonePeNumber);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('openingTime', formData.openingTime);
      formDataToSend.append('closingTime', formData.closingTime);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('address', JSON.stringify(formData.address));
      formDataToSend.append('menuItems', JSON.stringify(formData.menuItems));

      if (menuImage) formDataToSend.append('menuImage', menuImage);
      hotelImages.forEach(img => formDataToSend.append('hotelImages', img));

      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/hotels/register`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${await user.getIdToken()}`
          }
        }
      );

      setSuccess('Hotel registered successfully! Redirecting...');
      setTimeout(() => navigate('/hotel'), 2000);
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      setError(err.response?.data?.error || err.message || 'Failed to register hotel');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="hr-loading-container">
        <FaSpinner className="hr-spinner" />
        <p>Checking authentication...</p>
      </div>
    );
  }

   if (!user) {
    return (
      <div className="hr-auth-error">
        <p>You need to be logged in to register a hotel.</p>
        <button onClick={() => navigate('/home')}>Go to Login</button>
      </div>
    );
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'veg': return <MdFastfood className="hr-category-icon hr-veg" />;
      case 'non-veg': return <MdLocalDining className="hr-category-icon hr-non-veg" />;
      default: return <MdRestaurant className="hr-category-icon hr-both" />;
    }
  };

  return (
    <>
      <Header />
      <div className="hr-container">
        <div className="hr-card">
          <div className="hr-header">
            <h1 className="hr-title">Register Your Hotel</h1>
            <p className="hr-subtitle">Fill in the details to list your hotel on our platform</p>

            <div className="hr-progress-container">
              <div className="hr-progress-bar" style={{ width: `${progress}%` }}>
                <span className="hr-progress-text">{progress}% Complete</span>
              </div>
            </div>

            <div className="hr-navigation">
              <button
                className={`hr-nav-btn ${activeSection === 'basic' ? 'hr-active' : ''}`}
                onClick={() => setActiveSection('basic')}
              >
                <FaHotel className="hr-nav-icon" />
                Basic Info
              </button>
              <button
                className={`hr-nav-btn ${activeSection === 'menu' ? 'hr-active' : ''}`}
                onClick={() => setActiveSection('menu')}
                disabled={!formData.name}
              >
                <FaUtensils className="hr-nav-icon" />
                Menu
              </button>
              <button
                className={`hr-nav-btn ${activeSection === 'images' ? 'hr-active' : ''}`}
                onClick={() => setActiveSection('images')}
                disabled={formData.menuItems.length === 0}
              >
                <FaImage className="hr-nav-icon" />
                Images
              </button>
              <button
                className={`hr-nav-btn ${activeSection === 'review' ? 'hr-active' : ''}`}
                onClick={() => setActiveSection('review')}
                disabled={hotelImages.length === 0}
              >
                <FaCheck className="hr-nav-icon" />
                Review
              </button>
            </div>
          </div>

          {error && (
            <div className="hr-alert hr-error">
              <div className="hr-alert-icon">!</div>
              <div className="hr-alert-message">{error}</div>
              <button className="hr-alert-close" onClick={() => setError('')}>
                <FaTimes />
              </button>
            </div>
          )}

          {success && (
            <div className="hr-alert hr-success">
              <div className="hr-alert-icon">✓</div>
              <div className="hr-alert-message">{success}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="hr-form">
            {/* Basic Information Section */}
            <div className={`hr-section ${activeSection !== 'basic' ? 'hr-hidden' : ''}`}>
              <h2 className="hr-section-title">
                <FaHotel className="hr-section-icon" />
                Basic Information
              </h2>

              <div className="hr-form-grid">
                <div className="hr-form-group">
                  <label className="hr-label">
                    <FaHotel className="hr-input-icon" />
                    Hotel Name <span className="hr-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter hotel name"
                    className="hr-input"
                    required
                  />
                </div>

                <div className="hr-form-group">
                  <label className="hr-label">
                    <FaPhone className="hr-input-icon" />
                    Phone Number <span className="hr-required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit phone number"
                    className="hr-input"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>

                <div className="hr-form-group">
                  <label className="hr-label">
                    <FaWallet className="hr-input-icon" />
                    PhonePe Number <span className="hr-required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phonePeNumber"
                    value={formData.phonePeNumber}
                    onChange={handleInputChange}
                    placeholder="10-digit PhonePe number"
                    className="hr-input"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>

                <div className="hr-form-group">
                  <label className="hr-label">
                    <FaEnvelope className="hr-input-icon" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@domain.com"
                    className="hr-input"
                  />
                </div>

                <div className="hr-form-group">
                  <label className="hr-label">
                    {getCategoryIcon(formData.category)}
                    Category <span className="hr-required">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="hr-select"
                    required
                  >
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div className="hr-form-group hr-time-group">
                  <label className="hr-label">
                    <FaClock className="hr-input-icon" />
                    Opening Time <span className="hr-required">*</span>
                  </label>
                  <input
                    type="time"
                    name="openingTime"
                    value={formData.openingTime}
                    onChange={handleInputChange}
                    className="hr-time-input"
                    required
                  />
                </div>

                <div className="hr-form-group hr-time-group">
                  <label className="hr-label">
                    <FaClock className="hr-input-icon" />
                    Closing Time <span className="hr-required">*</span>
                  </label>
                  <input
                    type="time"
                    name="closingTime"
                    value={formData.closingTime}
                    onChange={handleInputChange}
                    className="hr-time-input"
                    required
                  />
                </div>
              </div>

              <div className="hr-form-group hr-address-group">
                <label className="hr-label">
                  <FaMapMarkerAlt className="hr-input-icon" />
                  Address <span className="hr-required">*</span>
                </label>
                <AddressAutocomplete
                  onSelect={handleAddressSelect}
                  initialValue={formData.address.address}
                />
              </div>

              <div className="hr-section-actions">
                <button
                  type="button"
                  className="hr-btn hr-btn-next"
                  onClick={() => setActiveSection('menu')}
                  disabled={!formData.name || !formData.phone || !formData.phonePeNumber || !formData.address.address}
                >
                  Next: Menu <FaUtensils />
                </button>
              </div>
            </div>

            {/* Menu Section */}
            <div className={`hr-section ${activeSection !== 'menu' ? 'hr-hidden' : ''}`}>
              <h2 className="hr-section-title">
                <FaUtensils className="hr-section-icon" />
                Menu Items
              </h2>

              <div className="hr-menu-input-container">
                <div className="hr-menu-input-grid">
                  <div className="hr-form-group">
                    <input
                      type="text"
                      placeholder="Item Name *"
                      className="hr-input"
                      value={menuItem.name}
                      onChange={(e) => setMenuItem({ ...menuItem, name: e.target.value })}
                    />
                  </div>
                  <div className="hr-form-group">
                    <input
                      type="number"
                      placeholder="Price *"
                      className="hr-input"
                      value={menuItem.price}
                      onChange={(e) => setMenuItem({ ...menuItem, price: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="hr-form-group">
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      className="hr-input"
                      value={menuItem.description}
                      onChange={(e) => setMenuItem({ ...menuItem, description: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMenuItem}
                    className="hr-btn hr-btn-add"
                  >
                    <FaPlus /> Add Item
                  </button>
                </div>
              </div>

              {formData.menuItems.length > 0 ? (
                <div className="hr-menu-items-table">
                  <div className="hr-table-header">
                    <div className="hr-table-col hr-name">Item Name</div>
                    <div className="hr-table-col hr-price">Price (₹)</div>
                    <div className="hr-table-col hr-desc">Description</div>
                    <div className="hr-table-col hr-action">Action</div>
                  </div>
                  <div className="hr-table-body">
                    {formData.menuItems.map((item, index) => (
                      <div key={item.id || index} className="hr-table-row">
                        <div className="hr-table-col hr-name">{item.name}</div>
                        <div className="hr-table-col hr-price">₹{item.price}</div>
                        <div className="hr-table-col hr-desc">{item.description || '-'}</div>
                        <div className="hr-table-col hr-action">
                          <button
                            type="button"
                            onClick={() => handleRemoveMenuItem(index)}
                            className="hr-btn hr-btn-remove"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="hr-empty-state">
                  <MdRestaurant className="hr-empty-icon" />
                  <p>No menu items added yet</p>
                  <small>Add at least one menu item to proceed</small>
                </div>
              )}

              <div className="hr-section-actions">
                <button
                  type="button"
                  className="hr-btn hr-btn-prev"
                  onClick={() => setActiveSection('basic')}
                >
                  <FaTimes /> Back
                </button>
                <button
                  type="button"
                  className="hr-btn hr-btn-next"
                  onClick={() => setActiveSection('images')}
                  disabled={formData.menuItems.length === 0}
                >
                  Next: Images <FaImage />
                </button>
              </div>
            </div>

            {/* Images Section */}
            {/* Images Section */}
            <div className={`hr-section ${activeSection !== 'images' ? 'hr-hidden' : ''}`}>
              <h2 className="hr-section-title">
                <FaImage className="hr-section-icon" />
                Upload Images
              </h2>

              <div className="hr-file-upload-group">
                <label className="hr-label">
                  <FaUpload className="hr-input-icon" />
                  Menu Image (optional)
                </label>
                <p className="hr-upload-hint">Upload a clear image of your menu (JPG, PNG or PDF, max 5MB)</p>
                <div className="hr-file-upload-container">
                  <label className="hr-file-upload-label">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        if (e.target.files[0]?.size > 5 * 1024 * 1024) {
                          alert('File size should be less than 5MB');
                          return;
                        }
                        setMenuImage(e.target.files[0]);
                      }}
                    />
                    <span className="hr-file-upload-text">
                      {menuImage ? menuImage.name : 'No file selected'}
                    </span>
                    <span className="hr-file-upload-button">
                      <FaUpload style={{ marginRight: '8px' }} /> Browse
                    </span>
                  </label>
                  {menuImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuImage(null);
                        // Clear the input value to allow re-uploading the same file
                        document.querySelector('input[type="file"]').value = '';
                      }}
                      className="hr-btn-clear"
                      aria-label="Remove file"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              <div className="hr-file-upload-group">
                <label className="hr-label">
                  <FaImages className="hr-input-icon" />
                  Hotel Images (up to 5)
                </label>
                <p className="hr-upload-hint">Upload high-quality images of your hotel (JPG or PNG, max 5MB each)</p>
                <div className="hr-file-upload-container">
                  <label className="hr-file-upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        // Filter out files larger than 5MB
                        const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);

                        if (files.length !== validFiles.length) {
                          alert('Some files were too large (max 5MB) and were not selected');
                        }

                        // Combine with existing images, limit to 5
                        const newImages = [...hotelImages, ...validFiles].slice(0, 5);
                        setHotelImages(newImages);
                      }}
                    />
                    <span className="hr-file-upload-text">
                      {hotelImages.length > 0
                        ? `${hotelImages.length} file(s) selected`
                        : 'No files selected'}
                    </span>
                    <span className="hr-file-upload-button">
                      <FaUpload style={{ marginRight: '8px' }} /> Browse
                    </span>
                  </label>
                </div>

                {hotelImages.length > 0 && (
                  <div className="hr-image-previews">
                    {hotelImages.map((img, index) => (
                      <div key={`${img.name}-${index}`} className="hr-image-preview">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FaFileImage style={{ color: '#6b73ff', flexShrink: 0 }} />
                          <span className="hr-image-name" title={img.name}>
                            {img.name.length > 20
                              ? `${img.name.substring(0, 15)}...${img.name.split('.').pop()}`
                              : img.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#718096' }}>
                            {(img.size / 1024 / 1024).toFixed(2)}MB
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...hotelImages];
                              updated.splice(index, 1);
                              setHotelImages(updated);
                            }}
                            className="hr-btn-remove-image"
                            aria-label="Remove image"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="hr-section-actions">
                <button
                  type="button"
                  className="hr-btn hr-btn-prev"
                  onClick={() => setActiveSection('menu')}
                >
                  <FaArrowLeft style={{ marginRight: '8px' }} /> Back
                </button>
                <button
                  type="button"
                  className="hr-btn hr-btn-next"
                  onClick={() => setActiveSection('review')}
                  disabled={hotelImages.length === 0}
                >
                  Next: Review <FaArrowRight style={{ marginLeft: '8px' }} />
                </button>
              </div>
            </div>

            {/* Review Section */}
            <div className={`hr-section ${activeSection !== 'review' ? 'hr-hidden' : ''}`}>
              <h2 className="hr-section-title">
                <FaCheck className="hr-section-icon" />
                Review Your Information
              </h2>

              <div className="hr-review-container">
                <div className="hr-review-section">
                  <h3 className="hr-review-subtitle">
                    <FaHotel className="hr-review-icon" />
                    Basic Information
                  </h3>
                  <div className="hr-review-grid">
                    <div className="hr-review-item">
                      <span className="hr-review-label">Hotel Name:</span>
                      <span className="hr-review-value">{formData.name}</span>
                    </div>
                    <div className="hr-review-item">
                      <span className="hr-review-label">Phone:</span>
                      <span className="hr-review-value">{formData.phone}</span>
                    </div>
                    <div className="hr-review-item">
                      <span className="hr-review-label">PhonePe:</span>
                      <span className="hr-review-value">{formData.phonePeNumber}</span>
                    </div>
                    <div className="hr-review-item">
                      <span className="hr-review-label">Email:</span>
                      <span className="hr-review-value">{formData.email || '-'}</span>
                    </div>
                    <div className="hr-review-item">
                      <span className="hr-review-label">Category:</span>
                      <span className="hr-review-value">
                        {getCategoryIcon(formData.category)}
                        {formData.category === 'veg' ? 'Veg' :
                          formData.category === 'non-veg' ? 'Non-Veg' : 'Both'}
                      </span>
                    </div>
                    <div className="hr-review-item">
                      <span className="hr-review-label">Timings:</span>
                      <span className="hr-review-value">
                        {formData.openingTime} - {formData.closingTime}
                      </span>
                    </div>
                    <div className="hr-review-item hr-full-width">
                      <span className="hr-review-label">Address:</span>
                      <span className="hr-review-value">{formData.address.address}</span>
                    </div>
                  </div>
                </div>

                <div className="hr-review-section">
                  <h3 className="hr-review-subtitle">
                    <FaUtensils className="hr-review-icon" />
                    Menu Items ({formData.menuItems.length})
                  </h3>
                  <div className="hr-review-menu-items">
                    {formData.menuItems.slice(0, 3).map((item, index) => (
                      <div key={item.id || index} className="hr-review-menu-item">
                        <span className="hr-menu-item-name">{item.name}</span>
                        <span className="hr-menu-item-price">₹{item.price}</span>
                      </div>
                    ))}
                    {formData.menuItems.length > 3 && (
                      <div className="hr-review-more-items">
                        + {formData.menuItems.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>

                <div className="hr-review-section">
                  <h3 className="hr-review-subtitle">
                    <FaImage className="hr-review-icon" />
                    Images
                  </h3>
                  <div className="hr-review-images-info">
                    <div className="hr-images-count">
                      <span className="hr-count-bubble">{hotelImages.length}</span>
                      <span>Hotel Images</span>
                    </div>
                    <div className="hr-images-count">
                      <span className="hr-count-bubble">{menuImage ? 1 : 0}</span>
                      <span>Menu Image</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hr-section-actions">
                <button
                  type="button"
                  className="hr-btn hr-btn-prev"
                  onClick={() => setActiveSection('images')}
                >
                  <FaTimes /> Back
                </button>
                <button
                  type="submit"
                  className="hr-btn hr-btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="hr-spinner" />
                      Registering...
                    </>
                  ) : 'Submit Registration'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HotelRegistration;