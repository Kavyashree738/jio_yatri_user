// ShopDetails.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaStar, FaClock, FaMapMarkerAlt, FaChevronLeft,
  FaChevronRight, FaPhone, FaWhatsapp, FaShoppingBag,
  FaUtensils, FaStore, FaCarrot, FaBoxes, FaMedkit
} from "react-icons/fa";
import Header from "../components/pages/Header";
import Footer from "../components/pages/Footer";
import "../styles/ShopDetails.css";

const categoryIcons = {
  hotel: <FaUtensils />,
  grocery: <FaStore />,
  vegetable: <FaCarrot />,
  provision: <FaBoxes />,
  medical: <FaMedkit />
};

const ShopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [error, setError] = useState(null);

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await axios.get(
          `https://jio-yatri-user.onrender.com/api/shops/${id}`
        );
        setShop(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch shop details');
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [id]);

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const navigateImage = (direction) => {
    if (!shop?.shopImageUrls) return;
    if (direction === 'prev') {
      setCurrentImageIndex(prev => prev === 0 ? shop.shopImageUrls.length - 1 : prev - 1);
    } else {
      setCurrentImageIndex(prev => prev === shop.shopImageUrls.length - 1 ? 0 : prev + 1);
    }
  };

const openWhatsApp = (phone, shopName) => {
  if (!phone) {
    alert("Phone number is missing");
    return;
  }

  const rawPhone = phone.replace(/\D/g, '');
  const phoneNumber = rawPhone.startsWith('91') ? rawPhone : '91' + rawPhone;
  const message = encodeURIComponent(
    `Hi, I found your business "${shopName}" on JioYatri.`
  );

  const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

  const url = isMobile
    ? `https://wa.me/${phoneNumber}?text=${message}` // opens WhatsApp app on mobile
    : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`; // opens WhatsApp Web on desktop

  window.open(url, '_blank');
};



  const handleOrder = (shop, e) => {
    e.stopPropagation();
    navigate(`/shop-order/${shop._id}`, {
      state: { shop }
    });
  };

  if (loading) {
    return (
      <div className="sd-loading-screen">
        <div className="sd-spinner"></div>
        <p>Loading shop details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sd-error-screen">
        <p>{error}</p>
        <button className="sd-back-btn" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="sd-error-screen">
        <p>Shop details not found</p>
        <button className="sd-back-btn" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="sd-details-container">
        <button className="sd-back-btn" onClick={() => navigate(-1)}>
          <FaChevronLeft /> Back to List
        </button>

        <div className="sd-category-badge">
          {categoryIcons[shop.category] || <FaStore />}
          <span>{shop.category || 'Shop'}</span>
        </div>

        {/* Image Gallery */}
        <div className="sd-gallery-container">
          {shop.shopImageUrls?.length > 0 && (
            <>
              <div className="sd-main-image">
                <img
                  src={shop.shopImageUrls[currentImageIndex]}
                  alt={`${shop.shopName} ${currentImageIndex + 1}`}
                  className="sd-current-image"
                />
                <button className="sd-nav-btn sd-prev-btn" onClick={() => navigateImage('prev')}>
                  <FaChevronLeft />
                </button>
                <button className="sd-nav-btn sd-next-btn" onClick={() => navigateImage('next')}>
                  <FaChevronRight />
                </button>
                <div className="sd-image-counter">
                  {currentImageIndex + 1} / {shop.shopImageUrls.length}
                </div>
              </div>
              <div className="sd-thumbnail-container">
                {shop.shopImageUrls.map((img, index) => (
                  <div
                    className={`sd-thumbnail ${index === currentImageIndex ? 'sd-active' : ''}`}
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Shop Info */}
        <div className="sd-content-container">
          <div className="sd-header">
            <div className="sd-header-info">
              <h1 className="sd-title">{shop.shopName}</h1>
              <div className="sd-meta-container">
                <div className="sd-meta-item">
                  <FaMapMarkerAlt className="sd-meta-icon" />
                  <span>{shop.address?.address || "Address not available"}</span>
                </div>
                <div className="sd-meta-item">
                  <FaClock className="sd-meta-icon" />
                  <span>{shop.openingTime ? `Opens at ${formatTime(shop.openingTime)}` : 'Opening time not available'}</span>
                  <span>{shop.closingTime && ` | Closes at ${formatTime(shop.closingTime)}`}</span>
                </div>
              </div>
            </div>
            <div className="sd-action-container">
              <div className="sd-rating">
                <FaStar className="sd-star-icon" />
                <span>{shop.averageRating?.toFixed(1) || '4.5'}</span>
                <span className="sd-rating-count">({shop.ratingCount || '0'} ratings)</span>
              </div>
              <div className="sd-contact-actions">
                {showPhone ? (
                  <a href={`tel:${shop.phone}`} className="sd-call-btn">
                    <FaPhone /> {shop.phone}
                  </a>
                ) : (
                  <button className="sd-call-btn" onClick={() => setShowPhone(true)}>
                    <FaPhone /> Show Number
                  </button>
                )}
                <button className="sd-whatsapp-btn" onClick={() => openWhatsApp(shop.phone, shop.shopName)}>
                  <FaWhatsapp /> WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="sd-products-section">
            <h2 className="sd-section-title">Products</h2>
            {(shop.itemsWithUrls || shop.items)?.length > 0 ? (
              <div className="sd-products-grid">
                {(shop.itemsWithUrls || shop.items).map((item) => (
                  <div className="sd-product-card" key={item._id || item.name}>
                    <div className="sd-product-image-container">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="sd-product-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                      ) : (
                        <div className="sd-product-image-placeholder">
                          <FaBoxes className="sd-placeholder-icon" />
                        </div>
                      )}
                    </div>

                    <div className="sd-product-info">
                      <div className="sd-product-name-price">
                        <h3 className="sd-product-name">{item.name}</h3>
                        <p className="sd-product-price">₹{item.price}</p>
                      </div>
                      {item.description && (
                        <p className="sd-product-desc">{item.description}</p>
                      )}
                      <div className="sd-product-tags">
                        {item.organic && (
                          <span className="sd-product-tag organic">Organic</span>
                        )}
                        {item.prescriptionRequired && (
                          <span className="sd-product-tag prescription">Prescription Required</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="sd-no-products">No products available.</p>
            )}
          </div>

          <button className="sd-action-btn sd-order" onClick={(e) => handleOrder(shop, e)}>
            <FaShoppingBag className="sd-icon" /> Order Now
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ShopDetails;
