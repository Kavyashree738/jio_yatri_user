import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FaStar, FaPhone, FaWhatsapp, FaShoppingBag,
    FaClock, FaMapMarkerAlt, FaChevronLeft, FaChevronRight,
    FaMotorcycle, FaPlus, FaUtensils, FaStore, FaCarrot,
    FaBoxes, FaMedkit, FaEdit
} from 'react-icons/fa';
import Slider from 'react-slick';
import { useParams, useNavigate } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Header from '../components/pages/Header';
import Footer from '../components/pages/Footer';
import '../styles/ShopDisplay.css';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const ShopDisplay = () => {
    const { category } = useParams();
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visiblePhoneNumbers, setVisiblePhoneNumbers] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth(); // Get current user

    const categoryInfo = {
        hotel: { name: 'Hotels & Restaurants', icon: <FaUtensils /> },
        grocery: { name: 'Grocery Stores', icon: <FaStore /> },
        vegetable: { name: 'Vegetable Vendors', icon: <FaCarrot /> },
        provision: { name: 'Provision Stores', icon: <FaBoxes /> },
        medical: { name: 'Medical Stores', icon: <FaMedkit /> }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hour, minute] = timeStr.split(':').map(Number);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 === 0 ? 12 : hour % 12;
        return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
    };

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const res = await axios.get(
                    `https://jio-yatri-user.onrender.com/api/shops/category/${category}`
                );
                console.log('Fetched shops data:', res.data.data); // Debug log
                setShops(res.data.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching shops:', err); // Debug log
                setError(err.response?.data?.error || err.message || 'Failed to fetch shops');
                setLoading(false);
            }
        };
        fetchShops();
    }, [category]);

    const NextArrow = ({ onClick }) => (
        <div className="sd-arrow sd-next-arrow" onClick={onClick}>
            <FaChevronRight />
        </div>
    );

    const PrevArrow = ({ onClick }) => (
        <div className="sd-arrow sd-prev-arrow" onClick={onClick}>
            <FaChevronLeft />
        </div>
    );

    const sliderSettings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

   const openWhatsApp = (phone, shopName) => {
    if (!phone) {
      alert("Phone number is missing");
      return;
    }
    const rawPhone = phone.replace(/\D/g, "");
    const phoneNumber = rawPhone.startsWith("91") ? rawPhone : "91" + rawPhone;
    const message = encodeURIComponent(
      `Hi, I found your business "${shopName}" on JioYatri.`
    );
    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(
      navigator.userAgent
    );
    const url = isMobile
      ? `https://wa.me/${phoneNumber}?text=${message}`
      : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
    window.open(url, "_blank");
  };

    const handleOrder = (shop, e) => {
        e.stopPropagation();
        navigate(`/shop-order/${shop._id}`, {
            state: { shop }
        });
    };

    const handleShopClick = (shopId) => {
        navigate(`/shop/${shopId}`);
    };

    const handleEditShop = (shopId, e) => {
        e.stopPropagation();

        // Debugging logs
        // console.log("Current User UID:", user?.uid);
        // console.log("Shop UserID:", shops.find(s => s._id === shopId)?.userId);
        // console.log("Is owner?", user?.uid === shops.find(s => s._id === shopId)?.userId);

        // Verify ownership before navigating
        const shopToEdit = shops.find(s => s._id === shopId);
        if (!shopToEdit) {
            console.error("Shop not found");
            return;
        }

        if (user?.uid !== shopToEdit.userId) {
            console.error("User doesn't own this shop");
            alert("You don't have permission to edit this shop");
            return;
        }

        navigate(`/edit-shop/${shopId}`);
    };
    if (loading) {
        return (
            <div className="sd-loading-container">
                <div className="sd-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="sd-error-container">
                <p className="sd-error-message">{error}</p>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="sd-container">
                {/* <div className="sd-promo-banner">
                    <div className="sd-promo-content">
                        <div className="sd-promo-icon">
                            {categoryInfo[category]?.icon}
                        </div>
                        <div className="sd-promo-text">
                            <h3>Do you own a {categoryInfo[category]?.name || 'business'}?</h3>
                            <p>Join JioYatri to reach thousands of customers!</p>
                        </div>
                        <button
                            className="sd-promo-button"
                            onClick={() => navigate('/register', { state: { category } })}
                        >
                            <FaPlus /> Add Your Business
                        </button>
                    </div>
                </div> */}

                <div className="sd-header">
                    <h1 className="sd-title">{categoryInfo[category]?.name || 'Shops'}</h1>
                    <p className="sd-subtitle">
                        Discover the best {categoryInfo[category]?.name?.toLowerCase() || 'shops'} in your area
                    </p>
                </div>

                <button
                    className="sd-back-btn"
                    onClick={() => navigate('/home')}
                >back</button>

                <div className="sd-shops-list">
                    {shops.map((shop) => (
                        <div
                            key={shop._id}
                            className="sd-shop-card"
                            onClick={() => handleShopClick(shop._id)}
                        >
                            {/* Add edit button for shop owner */}
                            {/* {user && user.uid === shop.userId && (
                                <button
                                    className="sd-edit-button"
                                    onClick={(e) => handleEditShop(shop._id, e)}
                                    title="Edit Shop"
                                >
                                    <FaEdit />
                                </button>
                            )} */}

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
                                    {/* <div className="sd-rating">
                                        <FaStar className="sd-star-icon" />
                                        <span>{shop.averageRating || '4.0'}</span>
                                        <span className="sd-ratings-count">({shop.ratingCount || '100'} Ratings)</span>
                                    </div> */}
                                </div>

                                <div className="sd-shop-address">
                                    <FaMapMarkerAlt className="sd-icon" />
                                    <span>{shop.address?.address || 'Address not available'}</span>
                                </div>

                                <div className="sd-shop-timing">
                                    <FaClock className="sd-icon" />
                                    <span>
                                        {shop.openingTime ? `Opens at ${formatTime(shop.openingTime)}` : 'Opening time not available'}
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

                                    {/* <button
                                        className="sd-action-btn sd-order"
                                        onClick={(e) => handleOrder(shop, e)}
                                    >
                                        <FaShoppingBag className="sd-icon" /> Order Now
                                    </button> */}
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
