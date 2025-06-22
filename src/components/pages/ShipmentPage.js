import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import '../../styles/components.css';
import { FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';

const vehicleTypes = [
  { type: 'TwoWheeler', name: '2 Wheeler', rate: 20, emoji: '🛵', capacity: 'Up to 8kg' },
  { type: 'ThreeWheeler', name: '3 Wheeler', rate: 30, emoji: '🛺', capacity: 'Up to 500kg' },
  { type: 'Truck', name: 'Truck', rate: 40, emoji: '🚚', capacity: 'Up to 1200kg' }
];

function ShipmentPage() {
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [calculatedCosts, setCalculatedCosts] = useState({});
  const [distance, setDistance] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize state with location state if available
  const [shipmentData, setShipmentData] = useState(() => {
    const locationState = location.state?.shipmentData;
    return locationState || {
      sender: {
        name: '',
        phone: '',
        email: '',
        address: {
          addressLine1: '',
          coordinates: null
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
      vehicleType: 'two-wheeler',
      distance: 0,
      cost: 0
    };
  });

  useEffect(() => {
    if (location.state?.selectedAddress && location.state?.type) {
      const { type, selectedAddress } = location.state;
      setShipmentData(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          address: {
            addressLine1: selectedAddress.address,
            coordinates: selectedAddress.coordinates
          }
        }
      }));

      // Clear state to prevent duplicate updates
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleInputChange = (e, type) => {
    const { name, value } = e.target;
    setShipmentData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [name]: value
      }
    }));
  };

  const handleVehicleSelect = (type) => {
    setShipmentData(prev => ({
      ...prev,
      vehicleType: type,
      cost: calculatedCosts[type] || 0
    }));
  };

  const navigateToAddressSelection = (type) => {
    navigate('/select-address', {
      state: {
        type,
        currentAddress: shipmentData[type].address,
        shipmentData: shipmentData
      }
    });
  };

  const calculateDistance = async () => {
    const { sender, receiver } = shipmentData;

    if (!sender.address.coordinates || !receiver.address.coordinates) {
      setError('Please select valid addresses for both sender and receiver');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/shipments/calculate-distance', {
        origin: sender.address.coordinates,
        destination: receiver.address.coordinates
      });

      const calculatedDistance = response.data.distance;
      setDistance(calculatedDistance);

      // Calculate cost for all vehicle types
      const costs = {};
      vehicleTypes.forEach(vehicle => {
        costs[vehicle.type] = calculatedDistance * vehicle.rate;
      });

      setCalculatedCosts(costs);

      // Update the current cost for selected vehicle
      setShipmentData(prev => ({
        ...prev,
        distance: calculatedDistance,
        cost: costs[prev.vehicleType]
      }));

      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to calculate distance');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!showSummary) {
      const success = await calculateDistance();
      if (success) {
        setShowSummary(true);
      }
    } else {
      if (!user) {
        setError('Please login to create shipments');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const payload = {
          sender: {
            name: shipmentData.sender.name,
            phone: shipmentData.sender.phone,
            email: shipmentData.sender.email || '', // Include email
            address: {
              addressLine1: shipmentData.sender.address.addressLine1,
              coordinates: shipmentData.sender.address.coordinates
            }
          },
          receiver: {
            name: shipmentData.receiver.name,
            phone: shipmentData.receiver.phone,
            email: shipmentData.receiver.email || '', // Include email
            address: {
              addressLine1: shipmentData.receiver.address.addressLine1,
              coordinates: shipmentData.receiver.address.coordinates
            }
          },
          vehicleType: shipmentData.vehicleType,
          distance: shipmentData.distance,
          cost: shipmentData.cost
        };
        console.log(payload)
        const response = await axios.post('http://localhost:5000/api/shipments', payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setTrackingNumber(response.data.trackingNumber);
        setSuccess(true);
      } catch (error) {
        console.error("Error details:", error.response?.data);
        setError(
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to submit shipment. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    setShowSummary(false);
  };

  if (success) {
    return (
      <div className="page-container">
        <Header />
        <div className="content-wrap">
          <div className="summary">
            <h2>Order Confirmed!</h2>
            <p>Your shipment has been successfully created.</p>
            <div className="confirmation-details">
              <p>Tracking Number: {trackingNumber}</p>
              <p>Estimated Cost: ₹{shipmentData.cost.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="page-container">
        {/* <Header /> */}
        <div className="content-wrap">
          <div className="summary-container">
            <h2>Order Summary</h2>
            <div className="summary-grid">
              <div className="summary-section">
                <h3>Sender</h3>
                <p>{shipmentData.sender.name}</p>
                <p>{shipmentData.sender.phone}</p>
                <p>{shipmentData.sender.email}</p>
                <p>{shipmentData.sender.address.addressLine1}</p>
              </div>
              <div className="summary-section">
                <h3>Receiver</h3>
                <p>{shipmentData.receiver.name}</p>
                <p>{shipmentData.receiver.phone}</p>
                <p>{shipmentData.receiver.email}</p>
                <p>{shipmentData.receiver.address.addressLine1}</p>
              </div>
            </div>
            <div className="summary-details">
              <div className="detail-row">
                <span>Vehicle Type:</span>
                <span>{vehicleTypes.find(v => v.type === shipmentData.vehicleType)?.name}</span>
              </div>
              <div className="detail-row">
                <span>Distance:</span>
                <span>{shipmentData.distance.toFixed(2)} km</span>
              </div>
              <div className="detail-row">
                <span>Rate:</span>
                <span>₹{vehicleTypes.find(v => v.type === shipmentData.vehicleType)?.rate}/km</span>
              </div>
              <div className="detail-row total">
                <span>Total Cost:</span>
                <span>₹{shipmentData.cost.toFixed(2)}</span>
              </div>
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={handleBack}>
                Back
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header />
      <div className="content-wrap">
        <form className="form" onSubmit={handleSubmit}>
          <h2>Sender Information</h2>
          <div className="form-group">
            <div className="form-row">
              <div className="form-col">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={shipmentData.sender.name}
                  onChange={(e) => handleInputChange(e, 'sender')}
                  placeholder="Name"
                  required
                />
              </div>
              <div className="form-col">
                <label>Phone Number</label>
                <div className="phone-input-container">
                  <span className="phone-prefix">+91</span>
                  <input
                    type="tel"
                    name="phone"
                    value={shipmentData.sender.phone}
                    onChange={(e) => handleInputChange(e, 'sender')}
                    placeholder="Phone Number"
                    required
                    pattern="[0-9]{10}"
                    className="phone-input"
                  />
                </div>
              </div>
            </div>
            <div className="form-row">
              <label>Sender Address</label>
              <div className="address-input-container">
                <span className="address-icon">
                  <FaMapMarkerAlt />
                </span>
                <input
                  type="text"
                  value={shipmentData.sender.address.addressLine1}
                  onClick={() => navigateToAddressSelection('sender')}
                  readOnly
                  placeholder="Select sender address"
                  required
                  className="address-input"
                />
                <span className="address-arrow">
                  <FaChevronRight />
                </span>
              </div>
            </div>
          </div>

          <h2>Receiver Information</h2>
          <div className="form-group">
            <div className="form-row">
              <div className="form-col">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={shipmentData.receiver.name}
                  onChange={(e) => handleInputChange(e, 'receiver')}
                  placeholder="Name"
                  required
                />
              </div>
              <div className="form-col">
                <label>Phone Number</label>
                <div className="phone-input-container">
                  <span className="phone-prefix">+91</span>
                  <input
                    type="tel"
                    name="phone"
                    value={shipmentData.receiver.phone}
                    onChange={(e) => handleInputChange(e, 'receiver')}
                    placeholder="Phone number"
                    required
                    pattern="[0-9]{10}"
                    className="phone-input"
                  />
                </div>
              </div>
            </div>
            <div className="form-row">
              <label>Receiver Address</label>
              <div className="address-input-container">
                <span className="address-icon">
                  <FaMapMarkerAlt />
                </span>
                <input
                  type="text"
                  value={shipmentData.receiver.address.addressLine1}
                  onClick={() => navigateToAddressSelection('receiver')}
                  readOnly
                  placeholder="Select receiver address"
                  required
                  className="address-input"
                />
                <span className="address-arrow">
                  <FaChevronRight />
                </span>
              </div>
            </div>
          </div>

          <h2>Select Vehicle Type</h2>
          <div className="vehicle-container">
            {vehicleTypes.map((vehicle) => (
              <div
                key={vehicle.type}
                className={`vehicle-card ${shipmentData.vehicleType === vehicle.type ? 'selected' : ''}`}
                onClick={() => handleVehicleSelect(vehicle.type)}
              >
                <div className="vehicle-content">
                  <div className="vehicle-main-info">
                    <span className="vehicle-emoji">{vehicle.emoji}</span>
                    <div className="vehicle-text">
                      <h3 className="vehicle-name">{vehicle.name}</h3>
                      <p className="vehicle-capacity">{vehicle.capacity}</p>
                    </div>
                  </div>
                  <div className="vehicle-pricing">
                    <p className="vehicle-rate">₹{vehicle.rate}/km</p>
                    {distance > 0 && (
                      <p className="estimated-cost">₹{(distance * vehicle.rate).toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={
                !shipmentData.sender.name ||
                !shipmentData.sender.phone ||
                !shipmentData.sender.address.addressLine1 ||
                !shipmentData.receiver.name ||
                !shipmentData.receiver.phone ||
                !shipmentData.receiver.address.addressLine1 ||
                isSubmitting
              }
            >
              {isSubmitting ? 'Calculating...' : 'Next'}
            </button>
          </div>
        </form>
      </div>
      {/* <Footer /> */}
    </div>
  );
}

export default ShipmentPage;
