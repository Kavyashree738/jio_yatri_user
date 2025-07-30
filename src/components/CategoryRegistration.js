import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaUserCircle, FaHome, FaBuilding, FaTruck, FaBoxes, FaShoppingCart,
    FaUtensils, FaCarrot, FaMedkit, FaStore, FaTimes, FaPlus, FaTrash,
    FaSpinner, FaCheck, FaUpload, FaImage, FaClock, FaPhone, FaWallet,
    FaEnvelope, FaMapMarkerAlt, FaImages, FaFileImage, FaArrowLeft, FaArrowRight, FaHotel
} from 'react-icons/fa';
import { MdRestaurant, MdFastfood, MdLocalDining } from 'react-icons/md';
import axios from 'axios';
import AddressAutocomplete from '../components/AddressAutocomplete';
import '../styles/CategoryRegistration.css'
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './pages/Header';
import Footer from './pages/Footer';


const CategoryRegistration = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const location = useLocation();
    const [formData, setFormData] = useState({
        shopName: '',
        phone: '',
        phonePeNumber: '',
        email: '',
        address: { address: '', coordinates: { lat: null, lng: null } },
        openingTime: '',
        closingTime: '',
        items: [],
        rooms: []
    });
    const [selectedCategory, setSelectedCategory] = useState(location.state?.category || '');
    const [shopImages, setShopImages] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeSection, setActiveSection] = useState('basic');
    const [progress, setProgress] = useState(25);

    const categories = [
        { name: 'Groceries', value: 'grocery', icon: <FaStore />, color: '#4ECDC4' },
        { name: 'Vegetables', value: 'vegetable', icon: <FaCarrot />, color: '#45B7D1' },
        { name: 'Provisions', value: 'provision', icon: <FaBoxes />, color: '#FFA07A' },
        { name: 'Medical', value: 'medical', icon: <FaMedkit />, color: '#98D8C8' },
        { name: 'Hotels', value: 'hotel', icon: <FaUtensils />, color: '#FF6B6B' }
    ];

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/home', { state: { from: '/category-registration' } });
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        let completed = 0;
        if (formData.shopName) completed += 10;
        if (formData.phone) completed += 10;
        if (formData.phonePeNumber) completed += 10;
        if (formData.address.address) completed += 10;
        if (formData.openingTime && formData.closingTime) completed += 10;
        if (formData.items.length > 0) completed += 20;
        if (shopImages.length > 0) completed += 15;
        if (formData.items.some(item => item.image)) completed += 15;

        setProgress(Math.min(100, completed));
    }, [formData, shopImages]);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setFormData({
            ...formData,
            items: category === 'hotel' ? [] : [{ name: '', price: '', image: null }],
            rooms: category === 'hotel' ? [{ type: 'single', pricePerNight: '', amenities: [] }] : []
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddressSelect = (addressData) => {
        setFormData({
            ...formData,
            address: {
                address: addressData.address,
                coordinates: addressData.coordinates
            }
        });
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.items];
        updatedItems[index][field] = value;
        setFormData({ ...formData, items: updatedItems });
    };

    const handleRoomChange = (index, field, value) => {
        const updatedRooms = [...formData.rooms];
        if (field === 'amenities') {
            updatedRooms[index][field] = value.split(',').map(item => item.trim());
        } else {
            updatedRooms[index][field] = value;
        }
        setFormData({ ...formData, rooms: updatedRooms });
    };

    const handleItemImageUpload = (index, file) => {
        const updatedItems = [...formData.items];
        updatedItems[index].image = file;
        setFormData({ ...formData, items: updatedItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { name: '', price: '', image: null }]
        });
    };

    const removeItem = (index) => {
        const updatedItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: updatedItems });
    };

    const addRoom = () => {
        setFormData({
            ...formData,
            rooms: [...formData.rooms, { type: 'single', pricePerNight: '', amenities: [] }]
        });
    };

    const removeRoom = (index) => {
        const updatedRooms = formData.rooms.filter((_, i) => i !== index);
        setFormData({ ...formData, rooms: updatedRooms });
    };

    const validateForm = () => {
        if (!formData.shopName.trim()) {
            setError('Shop name is required');
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
        if (formData.items.length === 0 && selectedCategory !== 'hotel') {
            setError('Please add at least one item');
            return false;
        }
        if (formData.rooms.length === 0 && selectedCategory === 'hotel') {
            setError('Please add at least one room');
            return false;
        }
        if (selectedCategory !== 'hotel' && formData.items.some(item => !item.image)) {
            setError('Please upload an image for each item');
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
            setError('You must be logged in to register');
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('userId', user.uid);
            formDataToSend.append('category', selectedCategory);
            formDataToSend.append('shopName', formData.shopName);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('phonePeNumber', formData.phonePeNumber);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('address', JSON.stringify(formData.address));
            formDataToSend.append('openingTime', formData.openingTime);
            formDataToSend.append('closingTime', formData.closingTime);

            if (selectedCategory !== 'hotel') {
                formDataToSend.append('items', JSON.stringify(formData.items));
            } else {
                formDataToSend.append('rooms', JSON.stringify(formData.rooms));
            }

            // Add shop images
            shopImages.forEach(file => formDataToSend.append('shopImages', file));

            // Add item images
            if (selectedCategory !== 'hotel') {
                formData.items.forEach((item, index) => {
                    if (item.image) {
                        formDataToSend.append('itemImages', item.image);
                    }
                });
            }

            const res = await axios.post(
                `https://jio-yatri-user.onrender.com/api/shops/register`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${await user.getIdToken()}`
                    }
                }
            );

            setSuccess('Registration successful! Redirecting...');
            setTimeout(() => navigate('/home'), 2000);
        } catch (err) {
            console.error('Error:', err.response?.data || err.message);
            setError(err.response?.data?.error || err.message || 'Registration failed');
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
                <p>You need to be logged in to register.</p>
                <button onClick={() => navigate('/home')}>Go to Login</button>
            </div>
        );
    }

    if (!selectedCategory) {
        return (
            <div className="hr-container">
                <div className="hr-card">
                    <div className="hr-header">
                        <h1 className="hr-title">Select Your Business Category</h1>
                        <p className="hr-subtitle">Choose the category that best describes your business</p>
                    </div>

                    <div className="hr-category-grid">
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                className="hr-category-card"
                                style={{ backgroundColor: category.color }}
                                onClick={() => handleCategorySelect(category.value)}
                            >
                                <div className="hr-category-icon">{category.icon}</div>
                                <h3 className="hr-category-name">{category.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const getCategoryIcon = () => {
        const category = categories.find(c => c.value === selectedCategory);
        return (
            <div className="hr-category-indicator" style={{ backgroundColor: category.color }}>
                {category.icon}
                <span>{category.name}</span>
            </div>
        );
    };

    return (
        <>
        <Header/>
        <div className="hr-container">
            <div className="hr-card">
                <div className="hr-header">
                    <h1 className="hr-title">Register Your {categories.find(c => c.value === selectedCategory).name} Business</h1>
                    <p className="hr-subtitle">Fill in the details to list your business on our platform</p>

                    {getCategoryIcon()}

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
                            <FaStore className="hr-nav-icon" />
                            Basic Info
                        </button>
                        <button
                            className={`hr-nav-btn ${activeSection === 'items' ? 'hr-active' : ''}`}
                            onClick={() => setActiveSection('items')}
                            disabled={!formData.shopName}
                        >
                            {selectedCategory === 'hotel' ? (
                                <FaHotel className="hr-nav-icon" />
                            ) : (
                                <FaBoxes className="hr-nav-icon" />
                            )}
                            {selectedCategory === 'hotel' ? 'Rooms' : 'Items'}
                        </button>
                        <button
                            className={`hr-nav-btn ${activeSection === 'images' ? 'hr-active' : ''}`}
                            onClick={() => setActiveSection('images')}
                            disabled={
                                selectedCategory === 'hotel'
                                    ? formData.rooms.length === 0
                                    : formData.items.length === 0
                            }
                        >
                            <FaImage className="hr-nav-icon" />
                            Images
                        </button>
                        <button
                            className={`hr-nav-btn ${activeSection === 'review' ? 'hr-active' : ''}`}
                            onClick={() => setActiveSection('review')}
                            disabled={shopImages.length === 0}
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
                            <FaStore className="hr-section-icon" />
                            Basic Information
                        </h2>

                        <div className="hr-form-grid">
                            <div className="hr-form-group">
                                <label className="hr-label">
                                    <FaStore className="hr-input-icon" />
                                    Shop Name <span className="hr-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="shopName"
                                    value={formData.shopName}
                                    onChange={handleInputChange}
                                    placeholder="Enter shop name"
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
                                onClick={() => setActiveSection('items')}
                                disabled={!formData.shopName || !formData.phone || !formData.phonePeNumber || !formData.address.address}
                            >
                                Next: {selectedCategory === 'hotel' ? 'Rooms' : 'Items'}
                                {selectedCategory === 'hotel' ? <FaHotel /> : <FaBoxes />}
                            </button>
                        </div>
                    </div>

                    {/* Items/Rooms Section */}
                    <div className={`hr-section ${activeSection !== 'items' ? 'hr-hidden' : ''}`}>
                        <h2 className="hr-section-title">
                            {selectedCategory === 'hotel' ? (
                                <FaHotel className="hr-section-icon" />
                            ) : (
                                <FaBoxes className="hr-section-icon" />
                            )}
                            {selectedCategory === 'hotel' ? 'Room Details' : 'Item Details'}
                        </h2>

                        {selectedCategory === 'hotel' ? (
                            <>
                                {formData.rooms.map((room, index) => (
                                    <div key={index} className="hr-item-form">
                                        <h3 className="hr-item-title">Room {index + 1}</h3>

                                        <div className="hr-form-grid">
                                            <div className="hr-form-group">
                                                <label className="hr-label">Room Type</label>
                                                <select
                                                    value={room.type}
                                                    onChange={(e) => handleRoomChange(index, 'type', e.target.value)}
                                                    className="hr-select"
                                                >
                                                    <option value="single">Single</option>
                                                    <option value="double">Double</option>
                                                    <option value="suite">Suite</option>
                                                </select>
                                            </div>

                                            <div className="hr-form-group">
                                                <label className="hr-label">Price Per Night</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={room.pricePerNight}
                                                    onChange={(e) => handleRoomChange(index, 'pricePerNight', e.target.value)}
                                                    className="hr-input"
                                                    required
                                                />
                                            </div>

                                            <div className="hr-form-group hr-full-width">
                                                <label className="hr-label">Amenities (comma separated)</label>
                                                <input
                                                    type="text"
                                                    value={room.amenities.join(', ')}
                                                    onChange={(e) => handleRoomChange(index, 'amenities', e.target.value)}
                                                    className="hr-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="hr-item-actions">
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    className="hr-btn hr-btn-remove"
                                                    onClick={() => removeRoom(index)}
                                                >
                                                    <FaTrash /> Remove Room
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="hr-btn hr-btn-add"
                                    onClick={addRoom}
                                >
                                    <FaPlus /> Add Another Room
                                </button>
                            </>
                        ) : (
                            <>
                                {formData.items.map((item, index) => (
                                    <div key={index} className="hr-item-form">
                                        <h3 className="hr-item-title">Item {index + 1}</h3>

                                        <div className="hr-form-grid">
                                            <div className="hr-form-group">
                                                <label className="hr-label">Name</label>
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                    className="hr-input"
                                                    required
                                                />
                                            </div>

                                            <div className="hr-form-group">
                                                <label className="hr-label">Price</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.price}
                                                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                    className="hr-input"
                                                    required
                                                />
                                            </div>

                                            {selectedCategory === 'provision' && (
                                                <div className="hr-form-group">
                                                    <label className="hr-label">Weight (e.g., 1kg, 500g)</label>
                                                    <input
                                                        type="text"
                                                        value={item.weight || ''}
                                                        onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                                                        className="hr-input"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Item Image Upload */}
                                        <div className="hr-form-group hr-full-width">
                                            <label className="hr-label">
                                                <FaImage className="hr-input-icon" />
                                                Item Image <span className="hr-required">*</span>
                                            </label>
                                            <div className="hr-file-upload-container">
                                                <label className="hr-file-upload-label">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleItemImageUpload(index, e.target.files[0]);
                                                            }
                                                        }}
                                                        className="hr-file-input"
                                                    />
                                                    <span className="hr-file-upload-text">
                                                        {item.image
                                                            ? item.image.name
                                                            : 'No file selected'}
                                                    </span>
                                                    <span className="hr-file-upload-button">
                                                        <FaUpload style={{ marginRight: '8px' }} /> Browse
                                                    </span>
                                                </label>
                                            </div>
                                            {item.image && (
                                                <div className="hr-image-preview">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <FaFileImage style={{ color: '#6b73ff', flexShrink: 0 }} />
                                                        <span className="hr-image-name" title={item.image.name}>
                                                            {item.image.name.length > 20
                                                                ? `${item.image.name.substring(0, 15)}...${item.image.name.split('.').pop()}`
                                                                : item.image.name}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ fontSize: '0.8rem', color: '#718096' }}>
                                                            {(item.image.size / 1024 / 1024).toFixed(2)}MB
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updatedItems = [...formData.items];
                                                                updatedItems[index].image = null;
                                                                setFormData({ ...formData, items: updatedItems });
                                                            }}
                                                            className="hr-btn-remove-image"
                                                            aria-label="Remove image"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="hr-item-actions">
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    className="hr-btn hr-btn-remove"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <FaTrash /> Remove Item
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="hr-btn hr-btn-add"
                                    onClick={addItem}
                                >
                                    <FaPlus /> Add Another Item
                                </button>
                            </>
                        )}

                        <div className="hr-section-actions">
                            <button
                                type="button"
                                className="hr-btn hr-btn-prev"
                                onClick={() => setActiveSection('basic')}
                            >
                                <FaArrowLeft /> Back
                            </button>
                            <button
                                type="button"
                                className="hr-btn hr-btn-next"
                                onClick={() => setActiveSection('images')}
                                disabled={
                                    selectedCategory === 'hotel'
                                        ? formData.rooms.length === 0
                                        : formData.items.length === 0 || formData.items.some(item => !item.image)
                                }
                            >
                                Next: Images <FaImage />
                            </button>
                        </div>
                    </div>

                    {/* Images Section */}
                    <div className={`hr-section ${activeSection !== 'images' ? 'hr-hidden' : ''}`}>
                        <h2 className="hr-section-title">
                            <FaImage className="hr-section-icon" />
                            Upload Shop Images
                        </h2>

                        <div className="hr-file-upload-group">
                            <label className="hr-label">
                                <FaImages className="hr-input-icon" />
                                Shop Images (up to 5)
                            </label>
                            <p className="hr-upload-hint">Upload high-quality images of your shop (JPG or PNG, max 5MB each)</p>
                            <div className="hr-file-upload-container">
                                <label className="hr-file-upload-label">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files);
                                            const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
                                            if (files.length !== validFiles.length) {
                                                alert('Some files were too large (max 5MB) and were not selected');
                                            }
                                            const newImages = [...shopImages, ...validFiles].slice(0, 5);
                                            setShopImages(newImages);
                                        }}
                                    />
                                    <span className="hr-file-upload-text">
                                        {shopImages.length > 0
                                            ? `${shopImages.length} file(s) selected`
                                            : 'No files selected'}
                                    </span>
                                    <span className="hr-file-upload-button">
                                        <FaUpload style={{ marginRight: '8px' }} /> Browse
                                    </span>
                                </label>
                            </div>

                            {shopImages.length > 0 && (
                                <div className="hr-image-previews">
                                    {shopImages.map((img, index) => (
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
                                                        const updated = [...shopImages];
                                                        updated.splice(index, 1);
                                                        setShopImages(updated);
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
                                onClick={() => setActiveSection('items')}
                            >
                                <FaArrowLeft /> Back
                            </button>
                            <button
                                type="button"
                                className="hr-btn hr-btn-next"
                                onClick={() => setActiveSection('review')}
                                disabled={shopImages.length === 0}
                            >
                                Next: Review <FaArrowRight />
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
                                    <FaStore className="hr-review-icon" />
                                    Basic Information
                                </h3>
                                <div className="hr-review-grid">
                                    <div className="hr-review-item">
                                        <span className="hr-review-label">Shop Name:</span>
                                        <span className="hr-review-value">{formData.shopName}</span>
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
                                    {selectedCategory === 'hotel' ? (
                                        <FaHotel className="hr-review-icon" />
                                    ) : (
                                        <FaBoxes className="hr-review-icon" />
                                    )}
                                    {selectedCategory === 'hotel'
                                        ? `Rooms (${formData.rooms.length})`
                                        : `Items (${formData.items.length})`}
                                </h3>
                                <div className="hr-review-items">
                                    {selectedCategory === 'hotel' ? (
                                        <>
                                            {formData.rooms.slice(0, 3).map((room, index) => (
                                                <div key={index} className="hr-review-item-detail">
                                                    <span className="hr-item-name">{room.type} Room</span>
                                                    <span className="hr-item-price">₹{room.pricePerNight}/night</span>
                                                </div>
                                            ))}
                                            {formData.rooms.length > 3 && (
                                                <div className="hr-review-more-items">
                                                    + {formData.rooms.length - 3} more rooms
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {formData.items.slice(0, 3).map((item, index) => (
                                                <div key={index} className="hr-review-item-detail">
                                                    <span className="hr-item-name">{item.name}</span>
                                                    <span className="hr-item-price">₹{item.price}</span>
                                                </div>
                                            ))}
                                            {formData.items.length > 3 && (
                                                <div className="hr-review-more-items">
                                                    + {formData.items.length - 3} more items
                                                </div>
                                            )}
                                        </>
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
                                        <span className="hr-count-bubble">{shopImages.length}</span>
                                        <span>Shop Images</span>
                                    </div>
                                    {selectedCategory !== 'hotel' && (
                                        <div className="hr-images-count">
                                            <span className="hr-count-bubble">
                                                {formData.items.filter(item => item.image).length}
                                            </span>
                                            <span>Item Images</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="hr-section-actions">
                            <button
                                type="button"
                                className="hr-btn hr-btn-prev"
                                onClick={() => setActiveSection('images')}
                            >
                                <FaArrowLeft /> Back
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
        <Footer/>
        </>
    );
};

export default CategoryRegistration;