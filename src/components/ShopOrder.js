import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ShipmentPage from '../components/pages/ShipmentPage';
import axios from 'axios'; 
import { useAuth } from '../context/AuthContext';
import { FaStore, FaSpinner } from 'react-icons/fa';
import '../styles/components.css';

const ShopOrder = () => {
  const { shopId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        let shopData;
        
        if (location.state?.shop) {
          shopData = location.state.shop;
        } else {
          const response = await axios.get(
            `https://jio-yatri-user.onrender.com/api/shops/${shopId}`
          );
          shopData = response.data.data;
        }

        setShop(shopData);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch shop details');
        setLoading(false);
        navigate('/shops');
      }
    };

    fetchShopDetails();
  }, [shopId, location.state, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner-icon" />
        <p>Loading shop details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!shop) {
    return null;
  }

  const initialShipmentData = {
    sender: {
      name: shop.shopName,
      phone: shop.phone,
      email: shop.email || '',
      address: {
        addressLine1: shop.address?.address || '',
        coordinates: shop.address?.coordinates || null
      }
    },
    receiver: {
      name: '',
      phone: '',
      email: '',
      address: {
        addressLine1: '',
        coordinates: null
      }
    },
    vehicleType: 'TwoWheeler',
    distance: 0,
    cost: 0,
    paymentMethod: 'razorpay',
    shopId: shop._id,
    isShopOrder: true
  };

  return (
    <div className="shop-order-container">
      <div className="shop-order-banner">
        <FaStore className="shop-icon" />
        <span>Ordering from: <strong>{shop.shopName}</strong></span>
      </div>
      <ShipmentPage 
        initialData={initialShipmentData}
        isShopOrder={true}
      />
    </div>
  );
};

export default ShopOrder; // Make sure this export exists