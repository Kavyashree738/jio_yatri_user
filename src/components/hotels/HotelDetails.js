import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaClock, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../../styles/hotels/HotelDetails.css";
import Header from "../pages/Header";
import Footer from "../pages/Footer";
const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/hotels/${id}`
        );
        setHotel(res.data.data);
      } catch (err) {
        console.error("Error fetching hotel:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const navigateImage = (direction) => {
    if (!hotel?.hotelImageUrls) return;
    if (direction === 'prev') {
      setCurrentImageIndex(prev => prev === 0 ? hotel.hotelImageUrls.length - 1 : prev - 1);
    } else {
      setCurrentImageIndex(prev => prev === hotel.hotelImageUrls.length - 1 ? 0 : prev + 1);
    }
  };

  if (loading) return (
    <div className="hdl-loading-screen">
      <div className="hdl-spinner"></div>
      <p>Loading hotel details...</p>
    </div>
  );

  if (!hotel) return (
    <div className="hdl-error-screen">
      <p>Hotel details not found</p>
      <button className="hdl-back-btn" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  return (
    <>
    <Header/>
    <div className="hdl-container">
      <button className="hdl-back-btn" onClick={() => navigate(-1)}>
        <FaChevronLeft /> Back to List
      </button>

      <div className="hdl-gallery-container">
        {hotel.hotelImageUrls?.length > 0 && (
          <>
            <div className="hdl-main-image">
              <img 
                src={hotel.hotelImageUrls[currentImageIndex]} 
                alt={`${hotel.name} ${currentImageIndex + 1}`} 
                className="hdl-current-image"
              />
              <button 
                className="hdl-nav-btn hdl-prev-btn" 
                onClick={() => navigateImage('prev')}
                aria-label="Previous image"
              >
                <FaChevronLeft />
              </button>
              <button 
                className="hdl-nav-btn hdl-next-btn" 
                onClick={() => navigateImage('next')}
                aria-label="Next image"
              >
                <FaChevronRight />
              </button>
              <div className="hdl-image-counter">
                {currentImageIndex + 1} / {hotel.hotelImageUrls.length}
              </div>
            </div>
            <div className="hdl-thumbnail-container">
              {hotel.hotelImageUrls.map((img, index) => (
                <div 
                  className={`hdl-thumbnail ${index === currentImageIndex ? 'hdl-active' : ''}`}
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="hdl-content-container">
        <div className="hdl-header">
          <div className="hdl-header-info">
            <h1 className="hdl-title">{hotel.name}</h1>
            <div className="hdl-meta-container">
              <div className="hdl-meta-item">
                <FaMapMarkerAlt className="hdl-meta-icon" />
                <span>{hotel.address?.address || "Address not available"}</span>
              </div>
              <div className="hdl-meta-item">
                <FaClock className="hdl-meta-icon" />
                <span>{hotel.openingTime || 'N/A'} - {hotel.closingTime || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="hdl-action-container">
            <div className="hdl-rating">
              <FaStar className="hdl-star-icon" /> 
              <span>{hotel.averageRating?.toFixed(1) || '4.5'}</span>
            </div>
            <button 
              className="hdl-edit-btn" 
              onClick={() => navigate(`/hotels/${id}/edit`)}
            >
              Edit
            </button>
          </div>
        </div>

        <div className="hdl-menu-section">
          <h2 className="hdl-section-title">Menu</h2>
          {hotel.menuImageUrl && (
            <div className="hdl-menu-image-wrapper">
              <img 
                src={hotel.menuImageUrl} 
                alt="Menu" 
                className="hdl-menu-image" 
              />
            </div>
          )}
          <div className="hdl-menu-grid">
            {hotel.menuItems?.length > 0 ? (
              hotel.menuItems.map((item) => (
                <div className="hdl-menu-card" key={item._id}>
                  <h3 className="hdl-menu-item-name">{item.name}</h3>
                  <p className="hdl-menu-item-price">₹{item.price}</p>
                  {item.description && (
                    <p className="hdl-menu-item-desc">{item.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="hdl-no-menu">No menu items available</p>
            )}
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default HotelDetails;