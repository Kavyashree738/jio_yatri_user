// src/pages/ShopDetails.js (or similar)

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
  FaBreadSlice,
  FaCoffee,
} from "react-icons/fa";
import Header from "../components/pages/Header";
import Footer from "../components/pages/Footer";
import "../styles/ShopDetails.css";
import { useCart } from "../context/CartContext";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [vegFilter, setVegFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Cart
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

  // Map backend category → translated label
  const getCategoryLabel = (cat) => {
    switch (cat) {
      case "hotel":
        return t("category_hotels");
      case "grocery":
        return t("category_groceries");
      case "vegetable":
        return t("category_vegetables");
      case "provision":
        return t("category_provisions");
      case "medical":
        return t("category_medical");
      case "bakery":
        return t("category_bakery");
      case "cafe":
        return t("category_cafe");
      default:
        return t("shopdetails_category_default"); // e.g. "Shop"
    }
  };

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await axios.get(
          `https://jio-yatri-user.onrender.com/api/shops/${id}`
        );
        setShop(res.data.data);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            t("shopdetails_fetch_error") // "Failed to fetch shop details"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [id, t]);

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
      alert(t("shopdetails_phone_missing")); // "Phone number is missing"
      return;
    }
    const rawPhone = phone.replace(/\D/g, "");
    const phoneNumber = rawPhone.startsWith("91") ? rawPhone : "91" + rawPhone;
    const message = encodeURIComponent(
      t("shopdetails_whatsapp_message", {
        shopName,
      }) // e.g. `Hi, I found your business "{{shopName}}" on JioYatri.`
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
      const nameMatch = item.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const categoryMatch =
        filter === "all" ||
        (item.category && item.category.toLowerCase() === filter);
      const vegMatch =
        vegFilter === "all" ||
        (vegFilter === "veg" && item.veg) ||
        (vegFilter === "nonveg" && !item.veg);

      return nameMatch && categoryMatch && vegMatch;
    });
  };

  if (loading) {
    return (
      <div className="sd-loading-screen">
        <div className="sd-spinner"></div>
        <p>{t("shopdetails_loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sd-error-screen">
        <p>{error}</p>
        <button className="sd-back-btn" onClick={() => navigate(-1)}>
          {t("shopdetails_go_back")}
        </button>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="sd-error-screen">
        <p>{t("shopdetails_not_found")}</p>
        <button className="sd-back-btn" onClick={() => navigate(-1)}>
          {t("shopdetails_go_back")}
        </button>
      </div>
    );
  }

  const isFoodCategory = ["hotel", "bakery", "cafe"].includes(shop.category);

  return (
    <>
      <Header />
      <div className="sd-details-container">
        <button className="sd-back-btn" onClick={() => navigate(-1)}>
          <FaChevronLeft /> {t("shopdetails_back_to_list")}
        </button>

        <div className="sd-category-badge">
          {categoryIcons[shop.category] || <FaStore />}
          <span>{getCategoryLabel(shop.category)}</span>
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
              <div className="sd-thumbnail-container">
                {shop.shopImageUrls.map((img, index) => (
                  <div
                    className={`sd-thumbnail ${
                      index === currentImageIndex ? "sd-active" : ""
                    }`}
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
                  <span>
                    {shop.address?.address ||
                      t("shopdetails_address_not_available")}
                  </span>
                </div>
                <div className="sd-meta-item">
                  <FaClock className="sd-meta-icon" />
                  <span>
                    {shop.openingTime
                      ? `${t("shopdetails_opens_at")} ${formatTime(
                          shop.openingTime
                        )}`
                      : t("shopdetails_opening_time_not_available")}
                  </span>
                  <span>
                    {shop.closingTime &&
                      ` | ${t("shopdetails_closes_at")} ${formatTime(
                        shop.closingTime
                      )}`}
                  </span>
                </div>
              </div>
            </div>
            <div className="sd-action-container">
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
                    <FaPhone /> {t("shopdetails_show_number")}
                  </button>
                )}
                <button
                  className="sd-whatsapp-btn"
                  onClick={() => openWhatsApp(shop.phone, shop.shopName)}
                >
                  <FaWhatsapp /> {t("shopdetails_whatsapp")}
                </button>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="sd-products-section">
            <h2 className="sd-section-title">
              {isFoodCategory ? t("shopdetails_menu_items") : t("shopdetails_products")}
            </h2>

            {/* Search Bar */}
            <div className="sd-search-container">
              <input
                type="text"
                placeholder={t("shopdetails_search_item_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sd-search-input"
              />
            </div>

            {/* Filters for Hotel */}
            {shop.category === "hotel" && (
              <div className="sd-filters-container">
                <div className="sd-filter-group">
                  <h4>{t("shopdetails_filter_category_label")}</h4>
                  <div className="sd-filter-buttons">
                    {[
                      ["all", t("shopdetails_filter_all")],
                      ["breakfast", t("shopdetails_filter_breakfast")],
                      ["lunch", t("shopdetails_filter_lunch")],
                      ["dinner", t("shopdetails_filter_dinner")],
                      ["snacks", t("shopdetails_filter_snacks")],
                    ].map(([val, label]) => (
                      <button
                        key={val}
                        className={filter === val ? "active" : ""}
                        onClick={() => setFilter(val)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sd-filter-group">
                  <h4>{t("shopdetails_filter_type_label")}</h4>
                  <div className="sd-filter-buttons">
                    {[
                      ["all", t("shopdetails_filter_type_all")],
                      ["veg", t("shopdetails_filter_type_veg")],
                      ["nonveg", t("shopdetails_filter_type_nonveg")],
                    ].map(([val, label]) => (
                      <button
                        key={val}
                        className={vegFilter === val ? "active" : ""}
                        onClick={() => setVegFilter(val)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-food.jpg";
                          }}
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

                      {/* Veg/Non-Veg Badge */}
                      {["hotel", "bakery"].includes(shop.category) && (
                        <div
                          className={`sd-veg-badge ${
                            item.veg ? "veg" : "nonveg"
                          }`}
                        >
                          {item.veg
                            ? t("shopdetails_badge_veg")
                            : t("shopdetails_badge_nonveg")}
                        </div>
                      )}
                    </div>

                    <div className="sd-product-info">
                      <div className="sd-product-name-price">
                        <h3 className="sd-product-name">{item.name}</h3>
                        <p className="sd-product-price">₹{item.price}</p>
                      </div>

                      {/* Food Category */}
                      {shop.category === "hotel" && item.category && (
                        <p className="sd-food-category">
                          {item.category.charAt(0).toUpperCase() +
                            item.category.slice(1)}
                        </p>
                      )}

                      {/* Provision & Grocery & Vegetable items meta */}
                      {["provision", "grocery", "vegetable"].includes(
                        shop.category
                      ) &&
                        (item.brand ||
                          item.weight ||
                          item.quantity !== undefined) && (
                          <div className="sd-provision-meta">
                            {item.brand && (
                              <span className="sd-provision-chip sd-provision-brand">
                                {item.brand}
                              </span>
                            )}
                            {item.weight && (
                              <span className="sd-provision-chip sd-provision-weight">
                                {item.weight}
                              </span>
                            )}
                            {item.quantity !== undefined && (
                              <span className="sd-provision-chip sd-provision-qty">
                                {t("shopdetails_qty_label")} {item.quantity}
                              </span>
                            )}
                          </div>
                        )}

                      {item.description && (
                        <p className="sd-product-desc">{item.description}</p>
                      )}

                      {/* Tags Section */}
                      <div className="sd-product-tags">
                        {item.organic && (
                          <span className="sd-product-tag organic">
                            {t("shopdetails_tag_organic")}
                          </span>
                        )}
                        {item.prescriptionRequired && (
                          <span className="sd-product-tag prescription">
                            {t("shopdetails_tag_prescription_required")}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart */}
                      <div className="sd-card-actions">
                        <button
                          className="sd-add-btn"
                          onClick={() => {
                            addItem(
                              {
                                _id: shop._id,
                                shopName: shop.shopName,
                                category: shop.category,
                                phone: shop.phone,
                                phonePeNumber: shop.phonePeNumber,
                              },
                              {
                                itemId: item._id || item.id,
                                name: item.name,
                                price: Number(item.price) || 0,
                                imageUrl: item.imageUrl || null,
                                veg:
                                  typeof item.veg === "boolean"
                                    ? item.veg
                                    : null,
                                category: item.category || null,
                              }
                            );
                          }}
                        >
                          {t("shopdetails_add_to_cart")} {/* "+ Add" */}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="sd-no-products">
                {isFoodCategory
                  ? t("shopdetails_no_menu_items_match")
                  : t("shopdetails_no_products_available")}
              </p>
            )}
          </div>
        </div>

        {/* Floating Cart Button */}
        <button
          className="sd-cart-fab"
          onClick={() =>
            navigate(`/cart/${shop._id}`, { state: { shop } })
          }
          aria-label={t("shopdetails_view_cart")}
          title={t("shopdetails_view_cart")}
        >
          🛒
          {cartCount > 0 && (
            <span className="sd-cart-badge">{cartCount}</span>
          )}
        </button>
      </div>

      <Footer />
    </>
  );
};

export default ShopDetails;
