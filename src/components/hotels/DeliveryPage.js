import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaShoppingBag, 
  FaMoneyBillWave,
  FaUser,
  FaPhone,
  FaArrowLeft,
  FaCheck
} from 'react-icons/fa';
import axios from 'axios';
import Header from '../pages/Header';
import Footer from '../pages/Footer';
import "../../styles/hotels/DeliveryPage.css";
const DeliveryPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [deliveryData, setDeliveryData] = useState({
    hotel: {
      id: state?.hotelId || '',
      name: state?.hotelName || '',
      address: state?.hotelAddress || { addressLine1: '', coordinates: null },
      phone: state?.hotelPhone || '',
      images: state?.hotelImages || []
    },
    receiver: {
      name: '',
      phone: '',
      address: {
        addressLine1: '',
        coordinates: null
      }
    },
    items: '',
    distance: 0,
    cost: 0,
    loading: false,
    error: null
  });

  const calculateCost = (distance) => {
    // Rs. 20 base + Rs. 10 per km
    const calculated = 20 + (distance * 10);
    return Math.max(calculated, 40); // Minimum charge of Rs.40
  };

  const handleAddressSelect = () => {
    navigate('/select-address', {
      state: {
        returnPath: '/delivery',
        currentAddress: deliveryData.receiver.address,
        context: {
          hotelData: deliveryData.hotel,
          items: deliveryData.items
        }
      }
    });
  };

  const calculateDistance = async () => {
    if (!deliveryData.hotel.address.coordinates || !deliveryData.receiver.address.coordinates) {
      setDeliveryData(prev => ({
        ...prev,
        error: 'Please select both hotel and delivery locations'
      }));
      return;
    }

    setDeliveryData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios.post('https://jio-yatri-user.onrender.com/api/deliveries/calculate-distance', {
        origin: deliveryData.hotel.address.coordinates,
        destination: deliveryData.receiver.address.coordinates
      });

      const distance = response.data.distance;
      const cost = calculateCost(distance);

      setDeliveryData(prev => ({
        ...prev,
        distance,
        cost,
        loading: false
      }));
    } catch (error) {
      setDeliveryData(prev => ({
        ...prev,
        error: error.response?.data?.message || 'Failed to calculate distance',
        loading: false
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!deliveryData.receiver.name || !deliveryData.receiver.phone) {
      setDeliveryData(prev => ({
        ...prev,
        error: 'Please provide your name and phone number'
      }));
      return;
    }

    setDeliveryData(prev => ({ ...prev, loading: true }));

    try {
      const response = await axios.post('https://jio-yatri-user.onrender.com/api/deliveries', {
        hotelId: deliveryData.hotel.id,
        receiver: deliveryData.receiver,
        items: deliveryData.items,
        distance: deliveryData.distance,
        cost: deliveryData.cost
      });

      navigate('/delivery-confirmation', { 
        state: { 
          deliveryId: response.data.deliveryId,
          cost: deliveryData.cost,
          hotelName: deliveryData.hotel.name,
          items: deliveryData.items
        } 
      });
    } catch (error) {
      setDeliveryData(prev => ({
        ...prev,
        error: error.response?.data?.message || 'Delivery request failed',
        loading: false
      }));
    }
  };

  useEffect(() => {
    if (deliveryData.hotel.address.coordinates && deliveryData.receiver.address.coordinates) {
      calculateDistance();
    }
  }, [deliveryData.hotel.address.coordinates, deliveryData.receiver.address.coordinates]);

  return (
    <>
      <Header />
      <div className="delivery-container">
        <div className="delivery-header">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
          </button>
          <h2>Order Delivery from {deliveryData.hotel.name}</h2>
        </div>

        <form onSubmit={handleSubmit} className="delivery-form">
          {deliveryData.error && (
            <div className="error-message">{deliveryData.error}</div>
          )}

          <div className="form-section">
            <h3><FaShoppingBag /> What would you like to order?</h3>
            <textarea
              placeholder="Example: 2 Butter Chicken, 1 Garlic Naan, 1 Coke..."
              value={deliveryData.items}
              onChange={(e) => setDeliveryData({
                ...deliveryData,
                items: e.target.value
              })}
              required
            />
            <small>Note: You'll pay the hotel directly for these items</small>
          </div>

          <div className="form-section">
            <h3><FaUser /> Your Details</h3>
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder="Your name"
                value={deliveryData.receiver.name}
                onChange={(e) => setDeliveryData({
                  ...deliveryData,
                  receiver: {
                    ...deliveryData.receiver,
                    name: e.target.value
                  }
                })}
                required
              />
            </div>
            <div className="input-group">
              <FaPhone className="input-icon" />
              <input
                type="tel"
                placeholder="Phone number"
                value={deliveryData.receiver.phone}
                onChange={(e) => setDeliveryData({
                  ...deliveryData,
                  receiver: {
                    ...deliveryData.receiver,
                    phone: e.target.value
                  }
                })}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3><FaMapMarkerAlt /> Delivery Address</h3>
            <div 
              className="address-input"
              onClick={handleAddressSelect}
            >
              <FaMapMarkerAlt className="icon" />
              <span>
                {deliveryData.receiver.address.addressLine1 || 
                 'Select your delivery location'}
              </span>
            </div>
          </div>

          <div className="form-section pricing-section">
            <h3><FaMoneyBillWave /> Delivery Cost</h3>
            <div className="price-details">
              <div className="price-row">
                <span>Base Fee</span>
                <span>₹20</span>
              </div>
              <div className="price-row">
                <span>Distance ({deliveryData.distance.toFixed(2)} km × ₹10/km)</span>
                <span>₹{(deliveryData.distance * 10).toFixed(2)}</span>
              </div>
              <div className="price-row total">
                <span>Total Delivery Cost</span>
                <span>₹{deliveryData.cost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={deliveryData.loading || !deliveryData.cost}
          >
            {deliveryData.loading ? 'Processing...' : (
              <>
                <FaCheck /> Confirm Delivery (₹{deliveryData.cost.toFixed(2)})
              </>
            )}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default DeliveryPage;
