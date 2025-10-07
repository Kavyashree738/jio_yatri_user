// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//     FaStar, FaPhone, FaWhatsapp, FaShoppingBag,
//     FaClock, FaMapMarkerAlt, FaChevronLeft, FaChevronRight,
//     FaMotorcycle, FaPlus, FaUtensils, FaStore, FaCarrot,
//     FaBoxes, FaMedkit, FaEdit
// } from 'react-icons/fa';
// import Slider from 'react-slick';
// import { useParams, useNavigate } from 'react-router-dom';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';
// import Header from '../components/pages/Header';
// import Footer from '../components/pages/Footer';
// import '../styles/ShopDisplay.css';
// import { useAuth } from '../context/AuthContext'; // Import useAuth hook

// const ShopDisplay = () => {
//     const { category } = useParams();
//     const [shops, setShops] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [visiblePhoneNumbers, setVisiblePhoneNumbers] = useState([]);
//     const navigate = useNavigate();
//     const { user } = useAuth(); // Get current user

//     const categoryInfo = {
//         hotel: { name: 'Hotels & Restaurants', icon: <FaUtensils /> },
//         grocery: { name: 'Grocery Stores', icon: <FaStore /> },
//         vegetable: { name: 'Vegetable Vendors', icon: <FaCarrot /> },
//         provision: { name: 'Provision Stores', icon: <FaBoxes /> },
//         medical: { name: 'Medical Stores', icon: <FaMedkit /> }
//     };

//     const formatTime = (timeStr) => {
//         if (!timeStr) return '';
//         const [hour, minute] = timeStr.split(':').map(Number);
//         const ampm = hour >= 12 ? 'PM' : 'AM';
//         const hour12 = hour % 12 === 0 ? 12 : hour % 12;
//         return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
//     };

//     useEffect(() => {
//         const fetchShops = async () => {
//             try {
//                 const res = await axios.get(
//                     `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/shops/category/${category}`
//                 );
//                 console.log('Fetched shops data:', res.data.data); // Debug log
//                 setShops(res.data.data);
//                 setLoading(false);
//             } catch (err) {
//                 console.error('Error fetching shops:', err); // Debug log
//                 setError(err.response?.data?.error || err.message || 'Failed to fetch shops');
//                 setLoading(false);
//             }
//         };
//         fetchShops();
//     }, [category]);

//     const NextArrow = ({ onClick }) => (
//         <div className="sd-arrow sd-next-arrow" onClick={onClick}>
//             <FaChevronRight />
//         </div>
//     );

//     const PrevArrow = ({ onClick }) => (
//         <div className="sd-arrow sd-prev-arrow" onClick={onClick}>
//             <FaChevronLeft />
//         </div>
//     );

//     const sliderSettings = {
//         dots: false,
//         infinite: false,
//         speed: 500,
//         slidesToShow: 3,
//         slidesToScroll: 1,
//         arrows: true,
//         nextArrow: <NextArrow />,
//         prevArrow: <PrevArrow />,
//         responsive: [
//             {
//                 breakpoint: 768,
//                 settings: {
//                     slidesToShow: 2,
//                 }
//             },
//             {
//                 breakpoint: 480,
//                 settings: {
//                     slidesToShow: 1,
//                 }
//             }
//         ]
//     };

//     const openWhatsApp = (phone, shopName) => {
//         if (!phone) {
//             alert("Phone number is missing");
//             return;
//         }

//         const rawPhone = phone.replace(/\D/g, '');
//         const phoneNumber = rawPhone.startsWith('91') ? rawPhone : '91' + rawPhone;
//         const message = encodeURIComponent(
//             `Hi, I found your business "${shopName}" on JioYatri and would like to inquire.`
//         );
//         window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`, '_blank');
//     };

//     const handleOrder = (shop, e) => {
//         e.stopPropagation();
//         navigate(`/shop-order/${shop._id}`, {
//             state: { shop }
//         });
//     };

//     const handleShopClick = (shopId) => {
//         navigate(`/shop/${shopId}`);
//     };

//     const handleEditShop = (shopId, e) => {
//         e.stopPropagation();

//         // Debugging logs
//         // console.log("Current User UID:", user?.uid);
//         // console.log("Shop UserID:", shops.find(s => s._id === shopId)?.userId);
//         // console.log("Is owner?", user?.uid === shops.find(s => s._id === shopId)?.userId);

//         // Verify ownership before navigating
//         const shopToEdit = shops.find(s => s._id === shopId);
//         if (!shopToEdit) {
//             console.error("Shop not found");
//             return;
//         }

//         if (user?.uid !== shopToEdit.userId) {
//             console.error("User doesn't own this shop");
//             alert("You don't have permission to edit this shop");
//             return;
//         }

//         navigate(`/edit-shop/${shopId}`);
//     };
//     if (loading) {
//         return (
//             <div className="sd-loading-container">
//                 <div className="sd-spinner"></div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="sd-error-container">
//                 <p className="sd-error-message">{error}</p>
//             </div>
//         );
//     }

//     return (
//         <>
//             <Header />
//             <div className="sd-container">
//                 {/* <div className="sd-promo-banner">
//                     <div className="sd-promo-content">
//                         <div className="sd-promo-icon">
//                             {categoryInfo[category]?.icon}
//                         </div>
//                         <div className="sd-promo-text">
//                             <h3>Do you own a {categoryInfo[category]?.name || 'business'}?</h3>
//                             <p>Join JioYatri to reach thousands of customers!</p>
//                         </div>
//                         <button
//                             className="sd-promo-button"
//                             onClick={() => navigate('/register', { state: { category } })}
//                         >
//                             <FaPlus /> Add Your Business
//                         </button>
//                     </div>
//                 </div> */}

//                 <div className="sd-header">
//                     <h1 className="sd-title">{categoryInfo[category]?.name || 'Shops'}</h1>
//                     <p className="sd-subtitle">
//                         Discover the best {categoryInfo[category]?.name?.toLowerCase() || 'shops'} in your area
//                     </p>
//                 </div>

//                 <button
//                     className="sd-back-btn"
//                     onClick={() => navigate('/home')}
//                 >back</button>

//                 <div className="sd-shops-list">
//                     {shops.map((shop) => (
//                         <div
//                             key={shop._id}
//                             className="sd-shop-card"
//                             onClick={() => handleShopClick(shop._id)}
//                         >
//                             {/* Add edit button for shop owner */}
//                             {/* {user && user.uid === shop.userId && (
//                                 <button
//                                     className="sd-edit-button"
//                                     onClick={(e) => handleEditShop(shop._id, e)}
//                                     title="Edit Shop"
//                                 >
//                                     <FaEdit />
//                                 </button>
//                             )} */}

//                             <div className="sd-shop-images-scrollable">
//                                 <div className="sd-image-scroll-container">
//                                     {shop.shopImageUrls?.map((imgUrl, index) => (
//                                         <img
//                                             key={index}
//                                             src={imgUrl}
//                                             alt={`${shop.shopName} ${index + 1}`}
//                                             className="sd-scroll-image"
//                                         />
//                                     ))}
//                                 </div>
//                             </div>

//                             <div className="sd-shop-info">
//                                 <div className="sd-shop-header">
//                                     <h2 className="sd-shop-name">{shop.shopName}</h2>
//                                     {/* <div className="sd-rating">
//                                         <FaStar className="sd-star-icon" />
//                                         <span>{shop.averageRating || '4.0'}</span>
//                                         <span className="sd-ratings-count">({shop.ratingCount || '100'} Ratings)</span>
//                                     </div> */}
//                                 </div>

//                                 <div className="sd-shop-address">
//                                     <FaMapMarkerAlt className="sd-icon" />
//                                     <span>{shop.address?.address || 'Address not available'}</span>
//                                 </div>

//                                 <div className="sd-shop-timing">
//                                     <FaClock className="sd-icon" />
//                                     <span>
//                                         {shop.openingTime ? `Opens at ${formatTime(shop.openingTime)}` : 'Opening time not available'}
//                                         {shop.closingTime && ` | Closes at ${formatTime(shop.closingTime)}`}
//                                     </span>
//                                 </div>

//                                 <div className="sd-shop-stats">
//                                     <div className="sd-stat-item">
//                                         <FaStar className="sd-icon" />
//                                         <span>{shop.averageRating || 'New'}</span>
//                                     </div>
//                                     <div className="sd-stat-item">
//                                         <FaShoppingBag className="sd-icon" />
//                                         <span>{shop.items?.length || 0} items</span>
//                                     </div>
//                                 </div>

//                                 <div className="sd-shop-actions">
//                                     {visiblePhoneNumbers.includes(shop._id) ? (
//                                         <a
//                                             href={`tel:${shop.phone}`}
//                                             className="sd-action-btn sd-call"
//                                             onClick={(e) => e.stopPropagation()}
//                                         >
//                                             <FaPhone className="sd-icon" /> {shop.phone}
//                                         </a>
//                                     ) : (
//                                         <button
//                                             className="sd-action-btn sd-call"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 setVisiblePhoneNumbers([...visiblePhoneNumbers, shop._id]);
//                                             }}
//                                         >
//                                             <FaPhone className="sd-icon" /> Show Number
//                                         </button>
//                                     )}

//                                     <button
//                                         className="sd-action-btn sd-whatsapp"
//                                         onClick={(e) => {
//                                             e.stopPropagation();
//                                             openWhatsApp(shop.phone, shop.shopName);
//                                         }}
//                                     >
//                                         <FaWhatsapp className="sd-icon" /> WhatsApp
//                                     </button>

//                                     {/* <button
//                                         className="sd-action-btn sd-order"
//                                         onClick={(e) => handleOrder(shop, e)}
//                                     >
//                                         <FaShoppingBag className="sd-icon" /> Order Now
//                                     </button> */}
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//             <Footer />
//         </>
//     );
// };

// export default ShopDisplay;

// src/pages/ShopDetails.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaClock,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaPhone,
  FaWhatsapp,
  FaUtensils,
  FaStore,
  FaCarrot,
  FaBoxes,
  FaMedkit,
  FaFire,
  FaBreadSlice,
  FaCoffee,
} from "react-icons/fa";
import Header from "../components/pages/Header";
import Footer from "../components/pages/Footer";
import "../styles/ShopDetails.css";
import { useCart } from "../context/CartContext";

const categoryIcons = {
  hotel: <FaUtensils />,
  grocery: <FaStore />,
  vegetable: <FaCarrot />,
  provision: <FaBoxes />,
  medical: <FaMedkit />,
  bakery: <FaBreadSlice />,
  cafe: <FaCoffee />,
};

const ShopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [vegFilter, setVegFilter] = useState("all");

  const { addItem, cart } = useCart();
  const shopCartItems = shop ? cart?.[shop._id]?.items || [] : [];
  const cartCount = shopCartItems.reduce((s, it) => s + (it.quantity || 0), 0);

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  // ✅ Using only Render API URL
  useEffect(() => {
    const fetchShop = async () => {
      try {
        if (!id) {
          setError("Invalid shop ID");
          setLoading(false);
          return;
        }

        console.log("🧭 Fetching shop with ID:", id);

        const res = await axios.get(
          `https://jio-yatri-user.onrender.com/api/shops/${id}`
        );

        setShop(res.data.data);
      } catch (err) {
        console.error("❌ Error fetching shop:", err);
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to fetch shop details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [id]);

  const handleThumbnailClick = (index) => setCurrentImageIndex(index);

  const navigateImage = (direction) => {
    if (!shop?.shopImageUrls) return;
    if (direction === "prev") {
      setCurrentImageIndex((prev) =>
        prev === 0 ? shop.shopImageUrls.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === shop.shopImageUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const openWhatsApp = (phone, shopName) => {
    if (!phone) {
      alert("Phone number is missing");
      return;
    }
    const rawPhone = phone.replace(/\D/g, "");
    const phoneNumber = rawPhone.startsWith("91")
      ? rawPhone
      : "91" + rawPhone;
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

  const filteredItems = () => {
    if (!shop?.itemsWithUrls?.length && !shop?.items?.length) return [];
    const items = shop.itemsWithUrls || shop.items;

    return items.filter((item) => {
      const categoryMatch =
        filter === "all" ||
        (item.category && item.category.toLowerCase() === filter);
      const vegMatch =
        vegFilter === "all" ||
        (vegFilter === "veg" && item.veg) ||
        (vegFilter === "nonveg" && !item.veg);
      return categoryMatch && vegMatch;
    });
  };

  if (loading)
    return (
      <div className="sd-loading-screen">
        <div className="sd-spinner"></div>
        <p>Loading shop details...</p>
      </div>
    );

  if (error)
    return (
      <div className="sd-error-screen">
        <p>{error}</p>
        <button className="sd-back-btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );

  if (!shop)
    return (
      <div className="sd-error-screen">
        <p>Shop details not found</p>
        <button className="sd-back-btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );

  const isFoodCategory = ["hotel", "bakery", "cafe"].includes(shop.category);

  return (
    <>
      <Header />
      <div className="sd-details-container">
        <button className="sd-back-btn" onClick={() => navigate(-1)}>
          <FaChevronLeft /> Back to List
        </button>

        <div className="sd-category-badge">
          {categoryIcons[shop.category] || <FaStore />}
          <span>{shop.category || "Shop"}</span>
        </div>

        {/* Image Gallery */}
        {shop.shopImageUrls?.length > 0 && (
          <div className="sd-gallery-container">
            <div className="sd-main-image">
              <img
                src={shop.shopImageUrls[currentImageIndex]}
                alt={`${shop.shopName} ${currentImageIndex + 1}`}
                className="sd-current-image"
              />
              <button
                className="sd-nav-btn sd-prev-btn"
                onClick={() => navigateImage("prev")}
              >
                <FaChevronLeft />
              </button>
              <button
                className="sd-nav-btn sd-next-btn"
                onClick={() => navigateImage("next")}
              >
                <FaChevronRight />
              </button>
              <div className="sd-image-counter">
                {currentImageIndex + 1} / {shop.shopImageUrls.length}
              </div>
            </div>
          </div>
        )}

        {/* Shop Info */}
        <div className="sd-content-container">
          <div className="sd-header">
            <h1 className="sd-title">{shop.shopName}</h1>
            <div className="sd-meta-container">
              <div className="sd-meta-item">
                <FaMapMarkerAlt className="sd-meta-icon" />
                <span>{shop.address?.address || "Address not available"}</span>
              </div>
              <div className="sd-meta-item">
                <FaClock className="sd-meta-icon" />
                <span>
                  {shop.openingTime
                    ? `Opens at ${formatTime(shop.openingTime)}`
                    : "Opening time not available"}
                </span>
                {shop.closingTime && (
                  <span>{` | Closes at ${formatTime(shop.closingTime)}`}</span>
                )}
              </div>
            </div>

            <div className="sd-contact-actions">
              {showPhone ? (
                <a href={`tel:${shop.phone}`} className="sd-call-btn">
                  <FaPhone /> {shop.phone}
                </a>
              ) : (
                <button
                  className="sd-call-btn"
                  onClick={() => setShowPhone(true)}
                >
                  <FaPhone /> Show Number
                </button>
              )}
              <button
                className="sd-whatsapp-btn"
                onClick={() => openWhatsApp(shop.phone, shop.shopName)}
              >
                <FaWhatsapp /> WhatsApp
              </button>
            </div>
          </div>

          {/* Products Section */}
          <div className="sd-products-section">
            <h2 className="sd-section-title">
              {isFoodCategory ? "Menu Items" : "Products"}
            </h2>

            {filteredItems().length > 0 ? (
              <div className="sd-products-grid">
                {filteredItems().map((item) => (
                  <div className="sd-product-card" key={item._id || item.name}>
                    <div className="sd-product-image-container">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="sd-product-image"
                        />
                      ) : (
                        <div className="sd-product-image-placeholder">
                          {isFoodCategory ? (
                            <FaUtensils className="sd-placeholder-icon" />
                          ) : (
                            <FaBoxes className="sd-placeholder-icon" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="sd-product-info">
                      <h3 className="sd-product-name">{item.name}</h3>
                      <p className="sd-product-price">₹{item.price}</p>
                      <button
                        className="sd-add-btn"
                        onClick={() =>
                          addItem(
                            {
                              _id: shop._id,
                              shopName: shop.shopName,
                              category: shop.category,
                            },
                            {
                              itemId: item._id || item.id,
                              name: item.name,
                              price: Number(item.price) || 0,
                              imageUrl: item.imageUrl || null,
                            }
                          )
                        }
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="sd-no-products">No products available</p>
            )}
          </div>
        </div>

        {/* Floating Cart Button */}
        <button
          className="sd-cart-fab"
          onClick={() => navigate(`/cart/${shop._id}`, { state: { shop } })}
        >
          🛒
          {cartCount > 0 && <span className="sd-cart-badge">{cartCount}</span>}
        </button>
      </div>

      <Footer />
    </>
  );
};

export default ShopDetails;
