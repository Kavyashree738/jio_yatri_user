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
import { useTranslation } from "react-i18next";

import l1 from '../assets/images/loading/banana.png'
import l2 from '../assets/images/loading/brocolli.png'
import l3 from '../assets/images/loading/cake.png'
import l4 from '../assets/images/loading/medicine.png'
import l5 from '../assets/images/loading/milk.png'

const ShopDisplay = () => {
  const { category } = useParams();
  const [shops, setShops] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visiblePhoneNumbers, setVisiblePhoneNumbers] = useState([]);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();  // <-- MULTI LANGUAGE ENABLED

  // 🔹 CATEGORY TRANSLATIONS (OPTION B)
  const categoryInfo = {
    hotel:    { name: t("category_hotels"),     icon: <FaUtensils /> },
    grocery:  { name: t("category_groceries"),  icon: <FaStore /> },
    vegetable:{ name: t("category_vegetables"), icon: <FaCarrot /> },
    provision:{ name: t("category_provisions"), icon: <FaBoxes /> },
    medical:  { name: t("category_medical"),    icon: <FaMedkit /> },
    bakery:   { name: t("category_bakery"),     icon: <FaBreadSlice /> },
    cafe:     { name: t("category_cafe"),       icon: <FaCoffee /> },
  };

  // STEP 1: Load all shops immediately (FAST)
  useEffect(() => {
    const fetchAllShops = async () => {
      try {
        const res = await axios.get(
          `https://jio-yatri-user.onrender.com/api/shops/category/${category}`
        );
        
        setShops(res.data.data);
        setLoading(false);
        
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
    if (!navigator.geolocation) return;

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        await calculateAndSortDistances(shopsData, latitude, longitude);
        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);
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
      const res = await axios.post(
        'https://jio-yatri-user.onrender.com/api/shops/calculate-distances',
        {
          userLat,
          userLng,
          shops: shopsData
        }
      );
      
      setShops(res.data.data);
    } catch (err) {}
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
      alert(t("whatsapp_no_phone"));
      return;
    }

    const rawPhone = phone.replace(/\D/g, '');
    const phoneNumber = rawPhone.startsWith('91') ? rawPhone : '91' + rawPhone;
    const message = encodeURIComponent(
      `${t("whatsapp_message")} "${shopName}".`
    );
    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    const url = isMobile
      ? `https://wa.me/${phoneNumber}?text=${message}`
      : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

    window.open(url, '_blank');
  };

  const handleShopClick = (shopId) => {
    navigate(`/shop/${shopId}`);
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="jy-loader">
        <img src={l1} className="jy-item i1" alt="item1" />
        <img src={l2} className="jy-item i2" alt="item2" />
        <img src={l3} className="jy-item i3" alt="item3" />
        <img src={l4} className="jy-item i4" alt="item4" />
        <img src={l5} className="jy-item i5" alt="item5" />

        <div className="jy-text">{t("loading_essentials")}</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="sd-container">
        <div className="sd-header">
          <h1 className="sd-title">{categoryInfo[category]?.name || t("shops")}</h1>
          <p className="sd-subtitle">
            {t("discover_best")} 
            
          </p>
        </div>

        {/* BACK BUTTON */}
        <button className="sd-back-btn" onClick={() => navigate('/home')}>
          {t("back_home")}
        </button>

        {/* Shops List */}
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
                  <span>{shop.address?.address || t("address_not_available")}</span>
                </div>

                <div className="sd-shop-timing">
                  <FaClock className="sd-icon" />
                  <span>
                    {shop.openingTime
                      ? `${t("opens_at")} ${formatTime(shop.openingTime)}`
                      : t("opening_time_not_available")}
                    {shop.closingTime && ` | ${t("closes_at")} ${formatTime(shop.closingTime)}`}
                  </span>
                </div>

                <div className="sd-shop-stats">
                  <div className="sd-stat-item">
                    <FaStar className="sd-icon" />
                    <span>{shop.averageRating || t("new")}</span>
                  </div>
                  <div className="sd-stat-item">
                    <FaShoppingBag className="sd-icon" />
                    <span>{shop.items?.length || 0} {t("items")}</span>
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
                      <FaPhone className="sd-icon" /> {t("show_number")}
                    </button>
                  )}

                  <button
                    className="sd-action-btn sd-whatsapp"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWhatsApp(shop.phone, shop.shopName);
                    }}
                  >
                    <FaWhatsapp className="sd-icon" /> {t("whatsapp")}
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
