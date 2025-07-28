import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AddressAutocomplete from "../AddressAutocomplete";
import {
  FaTimes,
  FaPlus,
  FaTrash,
  FaSpinner,
  FaCheck,
  FaUpload,
  FaImage,
  FaUtensils,
  FaHotel,
  FaClock
} from "react-icons/fa";
import "../../styles/hotels/EditHotel.css";
import Header from "../pages/Header";
import Footer from "../pages/Footer";
const EditHotel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState({
    name: "",
    phone: "",
    phonePeNumber: "",
    email: "",
    openingTime: "10:00",
    closingTime: "22:00",
    category: "both",
    address: { address: "", coordinates: { lat: null, lng: null } },
    menuItems: [],
    menuImageUrl: "",
    hotelImages: [],
    existingHotelImages: []
  });

  const [newMenuItem, setNewMenuItem] = useState({ name: "", price: "", description: "" });
  const [menuImage, setMenuImage] = useState(null);
  const [menuImagePreview, setMenuImagePreview] = useState("");
  const [hotelImages, setHotelImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await axios.get(
          `https://jio-yatri-user.onrender.com/api/hotels/${id}`
        );
        const hotelData = res.data.data;
        setHotel({
          ...hotelData,
          openingTime: hotelData.openingTime || "10:00",
          closingTime: hotelData.closingTime || "22:00",
          existingHotelImages: hotelData.hotelImageUrls || []
        });
        setMenuImagePreview(hotelData.menuImageUrl || "");
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching hotel:", err);
        setError("Failed to load hotel data");
        setIsLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHotel({ ...hotel, [name]: value });
  };

  const handleAddressSelect = (addressData) => {
    setHotel({
      ...hotel,
      address: {
        address: addressData.address,
        coordinates: addressData.coordinates
      }
    });
  };

  const validateMenuItem = () => {
    if (!newMenuItem.name.trim()) {
      setError("Menu item name is required!");
      return false;
    }
    if (!newMenuItem.price || isNaN(newMenuItem.price) || Number(newMenuItem.price) <= 0) {
      setError("Please enter a valid price (greater than 0)");
      return false;
    }
    return true;
  };

  const handleAddMenuItem = () => {
    setError("");
    if (!validateMenuItem()) return;

    setHotel({
      ...hotel,
      menuItems: [
        ...hotel.menuItems,
        {
          ...newMenuItem,
          price: Number(newMenuItem.price).toFixed(2),
          _id: Date.now() // Temporary ID
        }
      ]
    });
    setNewMenuItem({ name: "", price: "", description: "" });
  };

  const handleRemoveMenuItem = (index) => {
    const updatedMenuItems = [...hotel.menuItems];
    updatedMenuItems.splice(index, 1);
    setHotel({ ...hotel, menuItems: updatedMenuItems });
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...hotel.existingHotelImages];
    updatedImages.splice(index, 1);
    setHotel({ ...hotel, existingHotelImages: updatedImages });
  };

  const handleRemoveNewImage = (index) => {
    const updatedImages = [...hotelImages];
    updatedImages.splice(index, 1);
    setHotelImages(updatedImages);
  };

  const validateForm = () => {
    if (!hotel.name.trim()) {
      setError("Hotel name is required");
      return false;
    }
    if (!hotel.phone?.match(/^[0-9]{10}$/)) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!hotel.phonePeNumber?.match(/^[0-9]{10}$/)) {
      setError("Please enter a valid 10-digit PhonePe number");
      return false;
    }
    if (hotel.email && !hotel.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!hotel.address.address) {
      setError("Please select an address from the suggestions");
      return false;
    }
    if (!hotel.openingTime || !hotel.closingTime) {
      setError("Opening and closing times are required");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    try {
      const formData = new FormData();
      formData.append("name", hotel.name);
      formData.append("phone", hotel.phone);
      formData.append("phonePeNumber", hotel.phonePeNumber);
      formData.append("email", hotel.email);
      formData.append("openingTime", hotel.openingTime);
      formData.append("closingTime", hotel.closingTime);
      formData.append("category", hotel.category);
      formData.append("address", JSON.stringify(hotel.address));

      const cleanedMenuItems = hotel.menuItems.map((item) => {
        if (item._id && typeof item._id === "string" && item._id.length === 24) return item;
        const { _id, ...rest } = item;
        return rest;
      });

      formData.append("menuItems", JSON.stringify(cleanedMenuItems));
      formData.append("existingImages", JSON.stringify(hotel.existingHotelImages));

      if (menuImage) formData.append("menuImage", menuImage);
      hotelImages.forEach((img) => formData.append("hotelImages", img));

      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api/hotels/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setSuccess("Hotel updated successfully! Redirecting...");
      setTimeout(() => navigate(`/hotel-display`), 1500);
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setError(err.response?.data?.error || err.message || "Failed to update hotel");
    }
  };

  if (isLoading) {
    return (
      <div className="eh-loading-container">
        <FaSpinner className="eh-spinner" />
        <p>Loading hotel data...</p>
      </div>
    );
  }

  return (
    <>
    <Header/>
    <div className="eh-container">
      <div className="eh-card">
        {/* Header */}
        <div className="eh-header">
          <h1 className="eh-title">
            <FaHotel className="eh-title-icon" /> Edit Hotel Details
          </h1>
          <div className="eh-subtitle">Update the information for {hotel.name || "this hotel"}</div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="eh-alert eh-alert-error">
            <div className="eh-alert-content">
              <FaTimes className="eh-alert-icon" />
              <div className="eh-alert-message">{error}</div>
            </div>
            <button className="eh-alert-close" onClick={() => setError("")}>
              <FaTimes />
            </button>
          </div>
        )}

        {success && (
          <div className="eh-alert eh-alert-success">
            <div className="eh-alert-content">
              <FaCheck className="eh-alert-icon" />
              <div className="eh-alert-message">{success}</div>
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="eh-section">
          <h2 className="eh-section-title">Basic Information</h2>
          <div className="eh-form-grid">
            <div className="eh-form-group">
              <label className="eh-label">Hotel Name</label>
              <input
                type="text"
                name="name"
                value={hotel.name}
                onChange={handleInputChange}
                className="eh-input"
              />
            </div>

            <div className="eh-form-group">
              <label className="eh-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={hotel.phone}
                onChange={handleInputChange}
                className="eh-input"
              />
            </div>

            <div className="eh-form-group">
              <label className="eh-label">PhonePe Number</label>
              <input
                type="text"
                name="phonePeNumber"
                value={hotel.phonePeNumber}
                onChange={handleInputChange}
                className="eh-input"
              />
            </div>

            <div className="eh-form-group">
              <label className="eh-label">Email</label>
              <input
                type="email"
                name="email"
                value={hotel.email}
                onChange={handleInputChange}
                className="eh-input"
              />
            </div>

            <div className="eh-form-group">
              <label className="eh-label">Category</label>
              <select
                name="category"
                value={hotel.category}
                onChange={handleInputChange}
                className="eh-select"
              >
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="eh-form-group">
              <label className="eh-label">Opening Time</label>
              <input
                type="time"
                name="openingTime"
                value={hotel.openingTime}
                onChange={handleInputChange}
                className="eh-time-input"
              />
            </div>

            <div className="eh-form-group">
              <label className="eh-label">Closing Time</label>
              <input
                type="time"
                name="closingTime"
                value={hotel.closingTime}
                onChange={handleInputChange}
                className="eh-time-input"
              />
            </div>

            <div className="eh-form-group eh-address-group">
              <label className="eh-label">Address</label>
              <AddressAutocomplete
                defaultValue={hotel.address.address}
                onSelect={handleAddressSelect}
                className="eh-address-input"
              />
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="eh-section">
          <h2 className="eh-section-title">
            <FaUtensils className="eh-section-icon" /> Menu Items
          </h2>
          
          <div className="eh-menu-items">
            {hotel.menuItems.length > 0 ? (
              hotel.menuItems.map((item, index) => (
                <div key={item._id || index} className="eh-menu-item">
                  <div className="eh-menu-item-content">
                    <span className="eh-menu-item-name">{item.name}</span>
                    <span className="eh-menu-item-price">₹{item.price}</span>
                    {item.description && (
                      <span className="eh-menu-item-desc">{item.description}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="eh-btn eh-btn-remove"
                    onClick={() => handleRemoveMenuItem(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            ) : (
              <div className="eh-empty-state">
                <p>No menu items added yet</p>
              </div>
            )}
          </div>

          <div className="eh-add-menu-item">
            <div className="eh-menu-input-grid">
              <input
                type="text"
                placeholder="Item Name"
                value={newMenuItem.name}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                className="eh-input"
              />
              <input
                type="text"
                placeholder="Price"
                value={newMenuItem.price}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                className="eh-input"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newMenuItem.description}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                className="eh-input"
              />
              <button
                type="button"
                className="eh-btn eh-btn-add"
                onClick={handleAddMenuItem}
              >
                <FaPlus /> Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Menu Image Section */}
        <div className="eh-section">
          <h2 className="eh-section-title">
            <FaImage className="eh-section-icon" /> Menu Image
          </h2>

          <div className="eh-image-upload-container">
            {menuImagePreview ? (
              <div className="eh-image-preview">
                <img src={menuImagePreview} alt="Menu preview" className="eh-preview-image" />
                <button
                  type="button"
                  className="eh-btn eh-btn-remove-image"
                  onClick={() => {
                    setMenuImage(null);
                    setMenuImagePreview("");
                  }}
                >
                  <FaTrash /> Remove
                </button>
              </div>
            ) : (
              <div className="eh-file-upload-box">
                <label className="eh-file-upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setMenuImage(file);
                        setMenuImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <div className="eh-file-upload-content">
                    <FaUpload className="eh-upload-icon" />
                    <p className="eh-file-upload-text">Upload Menu Image</p>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Hotel Images Section */}
        <div className="eh-section">
          <h2 className="eh-section-title">
            <FaImage className="eh-section-icon" /> Hotel Images
          </h2>

          <div className="eh-hotel-images-container">
            <div className="eh-images-grid">
              {hotel.existingHotelImages.map((img, index) => (
                <div className="eh-image-wrapper" key={index}>
                  <img src={img} alt="Hotel" className="eh-thumbnail" />
                  <div className="eh-image-overlay">
                    <button
                      type="button"
                      className="eh-btn eh-btn-remove-image"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
              {hotelImages.map((img, index) => (
                <div className="eh-image-wrapper" key={`new-${index}`}>
                  <img src={URL.createObjectURL(img)} alt="Hotel" className="eh-thumbnail" />
                  <div className="eh-image-overlay">
                    <button
                      type="button"
                      className="eh-btn eh-btn-remove-image"
                      onClick={() => handleRemoveNewImage(index)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="eh-file-upload-box">
              <label className="eh-file-upload-label">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setHotelImages([...hotelImages, ...files]);
                  }}
                />
                <div className="eh-file-upload-content">
                  <FaUpload className="eh-upload-icon" />
                  <p className="eh-file-upload-text">Upload New Hotel Images</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        <div className="eh-actions">
          <button
            type="button"
            className="eh-btn eh-btn-cancel"
            onClick={() => navigate(`/hotel-display`)}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="eh-btn eh-btn-save" 
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default EditHotel;
