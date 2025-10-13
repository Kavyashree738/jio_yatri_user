import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaStar, FaPhone, FaWhatsapp, FaShoppingBag,
  FaClock, FaMapMarkerAlt, FaChevronLeft, FaChevronRight,
  FaUtensils, FaStore, FaCarrot, FaBoxes, FaMedkit,
  FaBreadSlice, FaCoffee, FaRoute
} from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/pages/Header';
import Footer from '../components/pages/Footer';
import '../styles/ShopDisplay.css';
import { useAuth } from '../context/AuthContext';

const ShopDisplay = () => {
  const { category } = useParams();
  const [shops, setShops] = useState([]); // All shops with distances
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visiblePhoneNumbers, setVisiblePhoneNumbers] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const categoryInfo = {
    hotel:    { name: 'Hotels & Restaurants', icon: <FaUtensils /> },
    grocery:  { name: 'Grocery Stores',       icon: <FaStore /> },
    vegetable:{ name: 'Vegetable Vendors',    icon: <FaCarrot /> },
    provision:{ name: 'Provision Stores',     icon: <FaBoxes /> },
    medical:  { name: 'Medical Stores',       icon: <FaMedkit /> },
    bakery:   { name: 'Bakeries',             icon: <FaBreadSlice /> },
    cafe:     { name: 'Cafes',                icon: <FaCoffee /> },
  };

  // STEP 1: Load all shops immediately (FAST)
  useEffect(() => {
    const fetchAllShops = async () => {
      try {
        // console.log('🔄 STEP 1: Loading all shops immediately...');
        const res = await axios.get(
          `https://jio-yatri-user.onrender.com/api/shops/category/${category}`
        );
        
        // Set shops immediately without distances
        setShops(res.data.data);
        setLoading(false);
        // console.log('✅ STEP 1: All shops loaded successfully');
        
        // STEP 2: After shops are displayed, get user location and calculate distances
        getUserLocation(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch shops');
        setLoading(false);
      }
    };
    fetchAllShops();
  }, [category]);

  // STEP 2: Get user location and calculate distances automatically
  const getUserLocation = (shopsData) => {
    if (!navigator.geolocation) {
      // console.log('📍 Geolocation not supported');
      return;
    }

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // console.log('📍 User location obtained:', { latitude, longitude });
        
        // STEP 3: Automatically calculate distances and sort
        await calculateAndSortDistances(shopsData, latitude, longitude);
        setLocationLoading(false);
      },
      (error) => {
        // console.log('📍 Location access denied or failed:', error);
        setLocationLoading(false);
        // User can still see all shops, just without distances
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // STEP 3: Calculate distances and sort shops automatically
  const calculateAndSortDistances = async (shopsData, userLat, userLng) => {
    try {
      // console.log('📍 Automatically calculating distances and sorting...');
      const res = await axios.post('https://jio-yatri-user.onrender.com/api/shops/calculate-distances', {
        userLat,
        userLng,
        shops: shopsData
      });
      
      // Update shops with distances and sorted order
      setShops(res.data.data);
      // console.log('✅ Automatic distance calculation and sorting complete');
    } catch (err) {
      // console.error('❌ Distance calculation failed:', err);
      // Keep showing shops without distances if calculation fails
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const openWhatsApp = (phone, shopName) => {
    if (!phone) {
      alert('Phone number is missing');
      return;
    }
    const rawPhone = phone.replace(/\D/g, '');
    const phoneNumber = rawPhone.startsWith('91') ? rawPhone : '91' + rawPhone;
    const message = encodeURIComponent(`Hi, I found your business "${shopName}" on JioYatri.`);
    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    const url = isMobile
      ? `https://wa.me/${phoneNumber}?text=${message}`
      : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
    window.open(url, '_blank');
  };

  const handleShopClick = (shopId) => {
    navigate(`/shop/${shopId}`);
  };

  if (loading) {
    return (
      <div className="sd-loading-container">
        <div className="sd-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="sd-container">
        <div className="sd-header">
          <h1 className="sd-title">{categoryInfo[category]?.name || 'Shops'}</h1>
          <p className="sd-subtitle">
            Discover the best {categoryInfo[category]?.name?.toLowerCase() || 'shops'} in your area
          </p>
        </div>

        {/* Location Status */}
        <div className="sd-location-status">
          {locationLoading ? (
            <div className="sd-location-loading">
              <div className="sd-small-spinner"></div>
             
            </div>
          ) : (
            <div className="sd-shop-count">
              {/* Showing {shops.length} shops
              {shops[0]?.distance !== undefined && ' • Sorted by distance (nearest first)'} */}
            </div>
          )}
        </div>

        <button className="sd-back-btn" onClick={() => navigate('/home')}>Back to Home</button>

        {/* Shops List - ALL shops displayed, automatically sorted by distance when available */}
        <div className="sd-shops-list">
          {shops.map((shop) => (
            <div
              key={shop._id}
              className="sd-shop-card"
              onClick={() => handleShopClick(shop._id)}
            >
              <div className="sd-shop-images-scrollable">
                <div className="sd-image-scroll-container">
                  {shop.shopImageUrls?.map((imgUrl, index) => (
                    <img
                      key={index}
                      src={imgUrl}
                      alt={`${shop.shopName} ${index + 1}`}
                      className="sd-scroll-image"
                    />
                  ))}
                </div>
              </div>

              <div className="sd-shop-info">
                <div className="sd-shop-header">
                  <h2 className="sd-shop-name">{shop.shopName}</h2>
                  {shop.distance !== undefined && (
                    <span className="sd-distance-badge">
                      <FaMapMarkerAlt /> {shop.distance.toFixed(1)} km
                    </span>
                  )}
                </div>

                <div className="sd-shop-address">
                  <FaMapMarkerAlt className="sd-icon" />
                  <span>{shop.address?.address || 'Address not available'}</span>
                </div>

                <div className="sd-shop-timing">
                  <FaClock className="sd-icon" />
                  <span>
                    {shop.openingTime
                      ? `Opens at ${formatTime(shop.openingTime)}`
                      : 'Opening time not available'}
                    {shop.closingTime && ` | Closes at ${formatTime(shop.closingTime)}`}
                  </span>
                </div>

                <div className="sd-shop-stats">
                  <div className="sd-stat-item">
                    <FaStar className="sd-icon" />
                    <span>{shop.averageRating || 'New'}</span>
                  </div>
                  <div className="sd-stat-item">
                    <FaShoppingBag className="sd-icon" />
                    <span>{shop.items?.length || 0} items</span>
                  </div>
                </div>

                <div className="sd-shop-actions">
                  {visiblePhoneNumbers.includes(shop._id) ? (
                    <a
                      href={`tel:${shop.phone}`}
                      className="sd-action-btn sd-call"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaPhone className="sd-icon" /> {shop.phone}
                    </a>
                  ) : (
                    <button
                      className="sd-action-btn sd-call"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVisiblePhoneNumbers([...visiblePhoneNumbers, shop._id]);
                      }}
                    >
                      <FaPhone className="sd-icon" /> Show Number
                    </button>
                  )}

                  <button
                    className="sd-action-btn sd-whatsapp"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWhatsApp(shop.phone, shop.shopName);
                    }}
                  >
                    <FaWhatsapp className="sd-icon" /> WhatsApp
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ShopDisplay;