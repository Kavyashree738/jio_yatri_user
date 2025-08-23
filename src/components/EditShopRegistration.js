import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaUserCircle, FaHome, FaBuilding, FaTruck, FaBoxes, FaShoppingCart,
    FaUtensils, FaCarrot, FaMedkit, FaStore, FaTimes, FaPlus, FaTrash,
    FaSpinner, FaCheck, FaUpload, FaImage, FaClock, FaPhone, FaWallet,
    FaEnvelope, FaMapMarkerAlt, FaImages, FaFileImage, FaArrowLeft, FaArrowRight,
    FaPrescriptionBottleAlt, FaLeaf
} from 'react-icons/fa';
import { MdLocalDining } from 'react-icons/md';
import axios from 'axios';
import AddressAutocomplete from '../components/AddressAutocomplete';
import '../styles/CategoryRegistration.css';
import { useAuth } from '../context/AuthContext';
import Header from './pages/Header';
import Footer from './pages/Footer';

const EditShopRegistration = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { shopId } = useParams();
    const [formData, setFormData] = useState({
        shopName: '',
        phone: '',
        phonePeNumber: '',
        email: '',
        address: { address: "", coordinates: { lat: null, lng: null } },
        openingTime: '',
        closingTime: '',
        items: [],
        cuisineTypes: []
    });
    const [selectedCategory, setSelectedCategory] = useState('');
    const [shopImages, setShopImages] = useState([]);
    const [existingShopImages, setExistingShopImages] = useState([]);
    const [existingItemImages, setExistingItemImages] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('basic');
    const [progress, setProgress] = useState(25);
    const [isOwner, setIsOwner] = useState(null);

    const categories = [
        { name: 'Groceries', value: 'grocery', icon: <FaStore />, color: '#4ECDC4' },
        { name: 'Vegetables', value: 'vegetable', icon: <FaCarrot />, color: '#45B7D1' },
        { name: 'Provisions', value: 'provision', icon: <FaBoxes />, color: '#FFA07A' },
        { name: 'Medical', value: 'medical', icon: <FaMedkit />, color: '#98D8C8' },
        { name: 'Food Service', value: 'hotel', icon: <MdLocalDining />, color: '#FF6B6B' }
    ];

    const cuisineOptions = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Continental'];
    const foodCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'];

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/home', { state: { from: `/edit-shop/${shopId}` } });
        }
    }, [user, authLoading, navigate, shopId]);

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                const token = await user.getIdToken(true);
                const res = await axios.get(
                    `https://jio-yatri-user.onrender.com/api/shops/${shopId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const shopData = res.data?.data || {};

                if (shopData.userId !== user.uid) {
                    setIsOwner(false);
                    setIsLoading(false);
                    return;
                }

                const safeItems = Array.isArray(shopData.items) ? shopData.items : [];
                const safeShopImages = Array.isArray(shopData.shopImages) ? shopData.shopImages : [];
                const safeCuisineTypes = Array.isArray(shopData.cuisineTypes) ? shopData.cuisineTypes : [];

                setFormData({
                    shopName: shopData.shopName || '',
                    phone: shopData.phone || '',
                    phonePeNumber: shopData.phonePeNumber || '',
                    email: shopData.email || '',
                    address: shopData.address || { address: '', coordinates: { lat: null, lng: null } },
                    openingTime: shopData.openingTime || '',
                    closingTime: shopData.closingTime || '',
                    items: safeItems,
                    cuisineTypes: safeCuisineTypes
                });

                setExistingShopImages(safeShopImages);
                setExistingItemImages(safeItems.map(item => item.imageUrl).filter(url => url));
                setSelectedCategory(shopData.category || '');
                setIsOwner(true);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching shop data:', err);
                setError(err.response?.data?.error || 'Failed to load shop data');
                setIsOwner(false);
                setIsLoading(false);
            }
        };

        if (user && shopId) fetchShopData();
    }, [user, shopId]);

    useEffect(() => {
        let completed = 0;
        const items = Array.isArray(formData.items) ? formData.items : [];

        if (formData.shopName) completed += 10;
        if (formData.phone) completed += 10;
        if (formData.phonePeNumber) completed += 10;
        if (formData.address?.address) completed += 10;
        if (formData.openingTime && formData.closingTime) completed += 10;

        if (items.length > 0) completed += 30;

        const shopImagesLength = Array.isArray(shopImages) ? shopImages.length : 0;
        const existingShopImagesLength = Array.isArray(existingShopImages) ? existingShopImages.length : 0;

        if (shopImagesLength > 0 || existingShopImagesLength > 0) completed += 20;

        if (items.some(item => item.image || item.imageUrl)) completed += 10;

        setProgress(Math.min(100, completed));
    }, [formData, shopImages, existingShopImages]);

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
        const updatedItems = [...(formData.items || [])];
        updatedItems[index][field] = value;
        setFormData({ ...formData, items: updatedItems });
    };

    const handleItemImageUpload = (index, file) => {
        const updatedItems = [...(formData.items || [])];
        updatedItems[index].imageUrl = undefined;
        updatedItems[index].image = file;
        setFormData({ ...formData, items: updatedItems });
    };

    const handleCuisineTypeChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const newCuisineTypes = checked
                ? [...prev.cuisineTypes, value]
                : prev.cuisineTypes.filter(type => type !== value);
            return { ...prev, cuisineTypes: newCuisineTypes };
        });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, {
                name: '',
                price: '',
                veg: true,
                category: 'main',
                image: null,
                description: ''
            }]
        });
    };

    const removeItem = (index) => {
        const updatedItems = (formData.items || []).filter((_, i) => i !== index);
        setFormData({ ...formData, items: updatedItems });
    };

    const validateForm = () => {
        const items = Array.isArray(formData.items) ? formData.items : [];

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
        if (formData.items.length === 0) {
            setError('Please add at least one menu item');
            return false;
        }
        if (formData.items.some(item => !item.image && !item.imageUrl)) {
            setError('Please upload an image for each menu item');
            return false;
        }

        return true;
    };
const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    console.log('[DEBUG] Update form submission started');

    if (!validateForm()) {
        console.log('[DEBUG] Form validation failed');
        return;
    }
    if (!user) {
        console.error('[ERROR] User not authenticated');
        setError('You must be logged in to update');
        return;
    }

    setIsSubmitting(true);
    console.log('[DEBUG] Starting submission process');

    try {
        const formDataToSend = new FormData();
        console.log('[DEBUG] FormData object created');

        // Add simple fields with debug logging
        const addField = (name, value) => {
            formDataToSend.append(name, value);
            console.log(`[DEBUG] Added field: ${name} = ${value}`);
        };

        addField('userId', user.uid);
        addField('shopId', shopId);
        addField('category', selectedCategory);
        addField('shopName', formData.shopName);
        addField('phone', formData.phone);
        addField('phonePeNumber', formData.phonePeNumber);
        addField('email', formData.email || '');

        // Handle address with debug
        const addressString = JSON.stringify(formData.address);
        addField('address', addressString);
        console.log('[DEBUG] Address data:', formData.address);

        // Add other fields
        addField('openingTime', formData.openingTime);
        addField('closingTime', formData.closingTime);
        addField('cuisineTypes', JSON.stringify(formData.cuisineTypes));

        // Prepare items data with detailed logging
        console.log('[DEBUG] Processing items:', formData.items);
        const itemsToSend = formData.items.map((item, index) => {
            console.log(`[DEBUG] Processing item ${index}:`, item);
            
            const itemData = {
                name: item.name,
                price: item.price,
                veg: item.veg,
                category: item.category,
                description: item.description || ''
            };

            // Image handling with detailed logging
            if (item.imageUrl) {
                console.log(`[DEBUG] Item ${index} has imageUrl:`, item.imageUrl);
                const urlParts = item.imageUrl.split('/');
                itemData.image = urlParts[urlParts.length - 1];
                console.log(`[DEBUG] Extracted image ID: ${itemData.image}`);
            } 
            else if (item.image instanceof File) {
                console.log(`[DEBUG] Item ${index} has new image file:`, item.image.name);
                // Will be handled in files section
            }
            else if (item.image) {
                console.log(`[DEBUG] Item ${index} has direct image ID:`, item.image);
                itemData.image = item.image;
            }
            else {
                console.warn(`[WARNING] Item ${index} has no image data`);
            }

            return itemData;
        });
        
        addField('items', JSON.stringify(itemsToSend));
        console.log('[DEBUG] Items data prepared:', itemsToSend);

        // Handle existing shop images with validation
        const existingShopImagesToSend = existingShopImages || [];
        console.log('[DEBUG] Existing shop images:', existingShopImagesToSend);
        addField('existingShopImages', JSON.stringify(existingShopImagesToSend));

        // Handle existing item images with validation
        const existingItemImageIds = formData.items
            .filter(item => item.imageUrl)
            .map(item => {
                const urlParts = item.imageUrl.split('/');
                const imageId = urlParts[urlParts.length - 1];
                console.log(`[DEBUG] Extracted item image ID from URL: ${imageId}`);
                return imageId;
            });
        
        console.log('[DEBUG] Existing item image IDs:', existingItemImageIds);
        addField('existingItemImages', JSON.stringify(existingItemImageIds));

        // Add new shop images with validation
        console.log('[DEBUG] New shop images to upload:', shopImages.length);
        shopImages.forEach((file, index) => {
            if (file.size > 5 * 1024 * 1024) {
                console.warn(`[WARNING] Shop image ${index} exceeds 5MB limit`);
            } else {
                formDataToSend.append('shopImages', file);
                console.log(`[DEBUG] Added shop image ${index}: ${file.name}`);
            }
        });

        // Add new item images with validation
        console.log('[DEBUG] Processing new item images');
        formData.items.forEach((item, index) => {
            if (item.image instanceof File) {
                if (item.image.size > 5 * 1024 * 1024) {
                    console.warn(`[WARNING] Item ${index} image exceeds 5MB limit`);
                } else {
                    formDataToSend.append('itemImages', item.image);
                    console.log(`[DEBUG] Added item image ${index}: ${item.image.name}`);
                }
            }
        });

        // Log complete FormData before sending (note: can't directly log FormData)
        console.log('[DEBUG] FormData prepared, ready to send to API');

        const token = await user.getIdToken();
        console.log('[DEBUG] Firebase token acquired');

        const apiUrl = `https://jio-yatri-user.onrender.com/api/shops/${shopId}`;
        console.log(`[DEBUG] Sending to API endpoint: ${apiUrl}`);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`[DEBUG] Upload progress: ${percentCompleted}%`);
            }
        };

        console.log('[DEBUG] Starting API request...');
        const res = await axios.put(apiUrl, formDataToSend, config);

        console.log('[DEBUG] API response received:', {
            status: res.status,
            data: res.data
        });

        if (!res.data.success) {
            console.error('[ERROR] API returned unsuccessful response:', res.data);
            throw new Error(res.data.error || 'Update failed');
        }

        console.log('[DEBUG] Update successful, preparing redirect');
        setSuccess('Update successful! Redirecting...');
        setTimeout(() => {
            console.log('[DEBUG] Navigating to shop page');
            navigate(`/shop/${shopId}`);
        }, 2000);

    } catch (err) {
        console.error('[ERROR] Update failed:', {
            message: err.message,
            stack: err.stack,
            response: err.response?.data
        });

        let errorMessage = 'Update failed';
        if (err.response) {
            // Handle different types of API errors
            if (err.response.status === 413) {
                errorMessage = 'File size too large (max 5MB)';
            } else if (err.response.data?.error) {
                errorMessage = err.response.data.error;
            }
        } else if (err.message) {
            errorMessage = err.message;
        }

        setError(errorMessage);
    } finally {
        console.log('[DEBUG] Submission process completed');
        setIsSubmitting(false);
    }
};


    const removeExistingShopImage = (index) => {
        const updated = [...existingShopImages];
        updated.splice(index, 1);
        setExistingShopImages(updated);
    };

    const removeExistingItemImage = (index) => {
        const updated = [...existingItemImages];
        updated.splice(index, 1);
        setExistingItemImages(updated);
    };

    const getCategoryIcon = () => {
        const category = categories.find(c => c.value === selectedCategory);
        return (
            <div className="hr-category-indicator" style={{ backgroundColor: category.color }}>
                {category.icon}
                <span>{category.name}</span>
            </div>
        );
    };

    if (authLoading) {
        return (
            <div className="hr-loading-container">
                <FaSpinner className="hr-spinner" />
                <p>Loading authentication...</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="hr-loading-container">
                <FaSpinner className="hr-spinner" />
                <p>Loading shop data...</p>
            </div>
        );
    }

    if (isOwner === false) {
        return (
            <div className="hr-auth-error">
                <p>You are not authorized to edit this shop.</p>
                <button onClick={() => navigate('/home')}>Go Back</button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="hr-auth-error">
                <p>You need to be logged in to edit shop details.</p>
                <button onClick={() => navigate('/home')}>Go to Login</button>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="hr-container">
                <div className="hr-card">
                    <div className="hr-header">
                        <h1 className="hr-title">Edit Your {categories.find(c => c.value === selectedCategory).name} Business</h1>
                        <p className="hr-subtitle">Update your business details</p>

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
                                <MdLocalDining className="hr-nav-icon" />
                                Menu Items
                            </button>
                            <button
                                className={`hr-nav-btn ${activeSection === 'images' ? 'hr-active' : ''}`}
                                onClick={() => setActiveSection('images')}
                                disabled={(formData.items || []).length === 0}
                            >
                                <FaImage className="hr-nav-icon" />
                                Images
                            </button>
                            <button
                                className={`hr-nav-btn ${activeSection === 'review' ? 'hr-active' : ''}`}
                                onClick={() => setActiveSection('review')}
                                disabled={shopImages.length === 0 && existingShopImages.length === 0}
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
                                        Restaurant Name <span className="hr-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="shopName"
                                        value={formData.shopName}
                                        onChange={handleInputChange}
                                        placeholder="Enter restaurant name"
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

                            {/* <div className="hr-form-group">
                                <label className="hr-label">Cuisine Types</label>
                                <div className="hr-checkbox-group">
                                    {cuisineOptions.map(type => (
                                        <label key={type} className="hr-checkbox-label">
                                            <input
                                                type="checkbox"
                                                value={type}
                                                checked={formData.cuisineTypes.includes(type)}
                                                onChange={handleCuisineTypeChange}
                                            />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                            </div> */}

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
                                    Next: Menu Items <MdLocalDining />
                                </button>
                            </div>
                        </div>

                        {/* Menu Items Section */}
                        <div className={`hr-section ${activeSection !== 'items' ? 'hr-hidden' : ''}`}>
                            <h2 className="hr-section-title">
                                <MdLocalDining className="hr-section-icon" />
                                Menu Items
                            </h2>

                            {(formData.items || []).map((item, index) => (
                                <div key={index} className="hr-item-form">
                                    <h3 className="hr-item-title">Menu Item {index + 1}</h3>

                                    <div className="hr-form-grid">
                                        <div className="hr-form-group">
                                            <label className="hr-label">Dish Name</label>
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                className="hr-input"
                                                required
                                            />
                                        </div>

                                        <div className="hr-form-group">
                                            <label className="hr-label">Price (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.price}
                                                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                className="hr-input"
                                                required
                                            />
                                        </div>

                                        <div className="hr-form-group">
                                            <label className="hr-label">Type</label>
                                            <div className="hr-veg-toggle-container">
                                                <button
                                                    type="button"
                                                    className={`hr-veg-toggle ${item.veg ? 'active' : ''}`}
                                                    onClick={() => handleItemChange(index, 'veg', !item.veg)}
                                                >
                                                    {item.veg ? 'Vegetarian' : 'Non-Vegetarian'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="hr-form-group">
                                            <label className="hr-label">Category</label>
                                            <select
                                                value={item.category}
                                                onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                                                className="hr-select"
                                            >
                                                {foodCategories.map(cat => (
                                                    <option key={cat.toLowerCase()} value={cat.toLowerCase()}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="hr-form-group hr-full-width">
                                            <label className="hr-label">Description</label>
                                            <input
                                                type="text"
                                                value={item.description || ''}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                className="hr-input"
                                                placeholder="Short description of the dish"
                                            />
                                        </div>
                                    </div>

                                    {/* Item Image Upload */}
                                    <div className="hr-form-group hr-full-width">
                                        <label className="hr-label">
                                            <FaImage className="hr-input-icon" />
                                            Dish Image <span className="hr-required">*</span>
                                        </label>
                                        {item.imageUrl ? (
                                            <div className="hr-existing-image-container">
                                                <div className="hr-image-preview">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <FaFileImage style={{ color: '#6b73ff', flexShrink: 0 }} />
                                                        <span className="hr-image-name" title={item.imageUrl}>
                                                            Existing Image
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updatedItems = [...formData.items];
                                                            updatedItems[index].imageUrl = undefined;
                                                            setFormData({ ...formData, items: updatedItems });
                                                            removeExistingItemImage(index);
                                                        }}
                                                        className="hr-btn-remove-image"
                                                        aria-label="Remove image"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                                <p className="hr-image-note">Upload new image below to replace</p>
                                            </div>
                                        ) : null}
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
                                        {item?.image && (
                                            <div className="hr-image-preview">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <FaFileImage style={{ color: '#6b73ff', flexShrink: 0 }} />
                                                    <span className="hr-image-name" title={item.image?.name || ''}>
                                                        {item.image?.name && item.image.name.length > 20
                                                            ? `${item.image.name.substring(0, 15)}...${item.image.name.split('.').pop()}`
                                                            : item.image?.name || ''}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {item.image?.size && (
                                                        <span style={{ fontSize: '0.8rem', color: '#718096' }}>
                                                            {(item.image.size / 1024 / 1024).toFixed(2)}MB
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updatedItems = [...(formData.items || [])];
                                                            if (updatedItems[index]) {
                                                                updatedItems[index].image = null;
                                                                setFormData({ ...formData, items: updatedItems });
                                                            }
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
                                <FaPlus /> Add Menu Item
                            </button>

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
                                        (formData.items || []).length === 0 ||
                                        (formData.items || []).some(item => !item.image && !item.imageUrl)
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
                                Restaurant Images
                            </h2>

                            <div className="hr-file-upload-group">
                                <label className="hr-label">
                                    <FaImages className="hr-input-icon" />
                                    Restaurant Images (up to 5)
                                </label>
                                <p className="hr-upload-hint">Upload high-quality images of your restaurant (JPG or PNG, max 5MB each)</p>

                                {/* Existing Images */}
                                {existingShopImages.length > 0 && (
                                    <div className="hr-existing-images-container">
                                        <h4 className="hr-existing-images-title">Existing Images</h4>
                                        <div className="hr-image-previews">
                                            {existingShopImages.map((img, index) => (
                                                <div key={`existing-${index}`} className="hr-image-preview">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <FaFileImage style={{ color: '#6b73ff', flexShrink: 0 }} />
                                                        <span className="hr-image-name" title={img}>
                                                            Image {index + 1}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingShopImage(index)}
                                                        className="hr-btn-remove-image"
                                                        aria-label="Remove image"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* New Images Upload */}
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
                                    disabled={shopImages.length === 0 && existingShopImages.length === 0}
                                >
                                    Next: Review <FaArrowRight />
                                </button>
                            </div>
                        </div>

                        {/* Review Section */}
                        <div className={`hr-section ${activeSection !== 'review' ? 'hr-hidden' : ''}`}>
                            <h2 className="hr-section-title">
                                <FaCheck className="hr-section-icon" />
                                Review Your Changes
                            </h2>

                            <div className="hr-review-container">
                                <div className="hr-review-section">
                                    <h3 className="hr-review-subtitle">
                                        <FaStore className="hr-review-icon" />
                                        Basic Information
                                    </h3>
                                    <div className="hr-review-grid">
                                        <div className="hr-review-item">
                                            <span className="hr-review-label">Restaurant Name:</span>
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
                                            <span className="hr-review-label">Cuisine Types:</span>
                                            <span className="hr-review-value">
                                                {formData.cuisineTypes.join(', ') || 'None'}
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
                                        <MdLocalDining className="hr-review-icon" />
                                        Menu Items ({(formData.items || []).length})
                                    </h3>
                                    <div className="hr-review-items">
                                        {(formData.items || []).slice(0, 3).map((item, index) => (
                                            <div key={index} className="hr-review-item-detail">
                                                <span className="hr-item-name">{item.name}</span>
                                                <span className="hr-item-price">₹{item.price}</span>
                                                <span className={`hr-item-tag ${item.veg ? 'veg' : 'nonveg'}`}>
                                                    {item.veg ? 'Veg' : 'Non-Veg'}
                                                </span>
                                                {item.category && (
                                                    <span className="hr-item-category">({item.category})</span>
                                                )}
                                            </div>
                                        ))}
                                        {(formData.items || []).length > 3 && (
                                            <div className="hr-review-more-items">
                                                + {(formData.items || []).length - 3} more items
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="hr-review-section">
                                    <h3 className="hr-review-subtitle">
                                        <FaImage className="hr-review-icon" />
                                        Images ({existingShopImages.length + shopImages.length})
                                    </h3>
                                    <div className="hr-review-images">
                                        {existingShopImages.slice(0, 3).map((img, index) => (
                                            <div key={`existing-img-${index}`} className="hr-review-image-item">
                                                <FaFileImage className="hr-review-image-icon" />
                                                <span className="hr-review-image-text">Existing Image {index + 1}</span>
                                            </div>
                                        ))}
                                        {shopImages.slice(0, 3).map((img, index) => (
                                            <div key={`new-img-${index}`} className="hr-review-image-item">
                                                <FaFileImage className="hr-review-image-icon" />
                                                <span className="hr-review-image-text">{img.name}</span>
                                            </div>
                                        ))}
                                        {(existingShopImages.length + shopImages.length) > 3 && (
                                            <div className="hr-review-more-images">
                                                + {(existingShopImages.length + shopImages.length) - 3} more images
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
                                            <FaSpinner className="hr-spinner" /> Updating...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheck /> Update Restaurant
                                        </>
                                    )}
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

export default EditShopRegistration;