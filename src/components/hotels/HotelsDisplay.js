import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaStar, FaPhone, FaWhatsapp, FaShoppingBag, FaMusic,
  FaClock, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, 
  FaMotorcycle, FaPlus, FaUtensils
} from 'react-icons/fa';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../../styles/hotels/HotelsDisplay.css';
import Header from '../pages/Header';
import Footer from '../pages/Footer';

const HotelsDisplay = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visiblePhoneNumbers, setVisiblePhoneNumbers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get(
          `https://jio-yatri-user.onrender.com/api/hotels`
        );
        setHotels(res.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch hotels');
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  const NextArrow = ({ onClick }) => (
    <div className="hd-arrow hd-next-arrow" onClick={onClick}>
      <FaChevronRight />
    </div>
  );

  const PrevArrow = ({ onClick }) => (
    <div className="hd-arrow hd-prev-arrow" onClick={onClick}>
      <FaChevronLeft />
    </div>
  );

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    adaptiveHeight: true
  };

  const openWhatsApp = (phone, hotelName) => {
    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      alert("Phone number is missing");
      return;
    }

    const rawPhone = phone.replace(/\D/g, '');
    const phoneNumber = rawPhone.startsWith('91') ? rawPhone : '91' + rawPhone;

    const message = encodeURIComponent(
      `Hi, I found your business "${hotelName}" on JioYatri and would like to place an order.`
    );

    const url = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
    window.open(url, '_blank');
  };

  const handleDeliveryOrder = (hotel) => {
    navigate('/hotel-shipment', {
      state: {
      hotel: hotel  // ✅ Pass the full object
    }
    });
  };

  if (loading) {
    return (
      <div className="hd-loading-container">
        <div className="hd-spinner"></div>
        <p>Loading hotels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hd-error-container">
        <p className="hd-error-message">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="hd-container">
        {/* Add Your Hotel Banner - JustDial Style */}
        <div className="hd-promo-banner">
          <div className="hd-promo-content">
            <div className="hd-promo-icon">
              <FaUtensils />
            </div>
            <div className="hd-promo-text">
              <h3>Do you own a hotel or restaurant?</h3>
              <p>Join JioYatri to reach thousands of customers!</p>
            </div>
            <button 
              className="hd-promo-button"
              onClick={() => navigate('/hotel')}
            >
              <FaPlus /> Add Your Business
            </button>
          </div>
        </div>

        <div className="hd-header">
          <h1 className="hd-title">Restaurants & Hotels</h1>
          <p className="hd-subtitle">Discover the best dining experiences in your city</p>
        </div>

        <div className="hd-hotels-list">
          {hotels.map((hotel) => (
            <div key={hotel._id} className="hd-hotel-card">
              <div className="hd-hotel-images">
                <Slider {...sliderSettings}>
                  {hotel.hotelImageUrls?.slice(0, 5).map((imgUrl, index) => (
                    <div key={index} className="hd-image-slide">
                      <img src={imgUrl} alt={`${hotel.name} ${index + 1}`} />
                    </div>
                  ))}
                </Slider>
                {hotel.hotelImageUrls?.length > 5 && (
                  <div className="hd-more-images">+ {hotel.hotelImageUrls.length - 5} More</div>
                )}
              </div>

              <div className="hd-hotel-info">
                <div className="hd-hotel-header">
                  <h2 className="hd-hotel-name">{hotel.name}</h2>
                  <div className="hd-rating">
                    <FaStar className="hd-star-icon" />
                    <span>{hotel.averageRating || '4.1'}</span>
                    <span className="hd-ratings-count">({hotel.ratingCount || '469'} Ratings)</span>
                  </div>
                </div>

                <div className="hd-hotel-address">
                  <FaMapMarkerAlt className="hd-icon" />
                  <span>{hotel.address?.address || 'No address available'}</span>
                </div>

                <div className="hd-hotel-timing">
                  <FaClock className="hd-icon" />
                  <span>
                    {hotel.openingTime ? `Opens at ${hotel.openingTime}` : 'Opening time not available'}
                    {hotel.closingTime && ` | Closes at ${hotel.closingTime}`}
                  </span>
                </div>

                <div className="hd-hotel-features">
                  {hotel.features?.includes('Live Music') && (
                    <span className="hd-feature-tag">
                      <FaMusic className="hd-icon" /> Live Music
                    </span>
                  )}
                  {hotel.features?.includes('Order Online') && (
                    <span className="hd-feature-tag">
                      <FaShoppingBag className="hd-icon" /> Order online
                    </span>
                  )}
                </div>

                <div className="hd-hotel-actions">
                  {visiblePhoneNumbers.includes(hotel._id) ? (
                    <div className="hd-action-btn hd-call">
                      <FaPhone className="hd-icon" /> {hotel.phone}
                    </div>
                  ) : (
                    <button
                      className="hd-action-btn hd-call"
                      onClick={() =>
                        setVisiblePhoneNumbers([...visiblePhoneNumbers, hotel._id])
                      }
                    >
                      <FaPhone className="hd-icon" /> Show Number
                    </button>
                  )}

                  <button
                    className="hd-action-btn hd-whatsapp"
                    onClick={() => openWhatsApp(hotel.phone, hotel.name)}
                  >
                    <FaWhatsapp className="hd-icon" /> WhatsApp
                  </button>

                  {hotel.menuImageUrl && (
                    <button
                      className="hd-action-btn hd-menu"
                      onClick={() => navigate(`/hotel/${hotel._id}`)}
                    >
                      View Menu
                    </button>
                  )}

                  <button
                    className="hd-action-btn hd-delivery"
                    onClick={() => handleDeliveryOrder(hotel)}
                  >
                    <FaMotorcycle /> Order Delivery
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

export default HotelsDisplay;
