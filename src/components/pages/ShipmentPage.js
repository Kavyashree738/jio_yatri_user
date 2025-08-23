import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import LocationMap from './LocationMap';
import { FaMapMarkerAlt, FaChevronRight, FaUser, FaPhone, FaExchangeAlt } from 'react-icons/fa';
import '../../styles/components.css';
import SearchBar from '../pages/SearchBar';
import SecondaryNav from './SecondaryNav';

const vehicleTypes = [
  {
    type: 'TwoWheeler',
    name: 'Bike',
    rate: 10,
    rateFor2Km: 20,
    emoji: '🛵',
    capacity: 'Up to 8kg',
    available: true,
    displayRate: "₹20 per 2 km"
  },
  {
    type: 'ThreeWheeler',
    name: 'Auto',
    rate: 20,
    rateFor2Km: 40,
    emoji: '🛺',
    capacity: 'Up to 500kg',
    available: true,
    displayRate: "₹40 per 2 km"
  },
  {
    type: 'Truck',
    name: 'Truck',
    rate: 40,
    rateFor2Km: 80,
    emoji: '🚚',
    capacity: 'Up to 1200kg',
    available: true,
    displayRate: "₹80 per 2 km"
  },
  {
    type: 'Pickup9ft',
    name: 'bulara',
    rate: 175,
    rateFor2Km: 350,
    emoji: '🛻',
    capacity: 'Up to 1700kg',
    available: true,
    displayRate: "₹350 per 2 km"
  },
  {
    type: 'Tata407',
    name: 'Tata 407',
    rate: 300,
    rateFor2Km: 600,
    emoji: '🚛',
    capacity: 'Up to 2500kg',
    available: true,
    displayRate: "₹600 per 2 km"
  },
  {
    type: 'ContainerTruck',
    name: 'Container Truck',
    rate: 80,
    rateFor2Km: 160,
    emoji: '🚒',
    capacity: 'Up to 5000kg',
    available: false,
    comingSoon: true,
    displayRate: "₹160 per 2 km"
  }
];

const paymentMethods = [
  { id: 'razorpay', name: 'Online', description: 'Secure payment with Razorpay', icon: '💳' },
  { id: 'pay_after', name: 'Cash', description: 'Pay online after delivery is completed', icon: '💸' }
];

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function ShipmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [calculatedCosts, setCalculatedCosts] = useState({});
  const [distance, setDistance] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('pay_after');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const debounceTimer = useRef(null);
  const [userClickedBack, setUserClickedBack] = useState(false);
  const [shouldAutoProgress, setShouldAutoProgress] = useState(true);
  const [shipmentData, setShipmentData] = useState(() => {
    const locationState = location.state?.shipmentData;
    const shopData = location.state?.shop;

    if (shopData) {
      return {
        sender: {
          name: shopData.shopName,
          phone: shopData.phone,
          email: shopData.email || '',
          address: {
            addressLine1: shopData.address?.address || '',
            coordinates: shopData.address?.coordinates || null
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
        parcel: {
          description: '',
          images: []
        },
        vehicleType: 'TwoWheeler',
        distance: 0,
        cost: 0,
        paymentMethod: 'pay_after',
        shopId: shopData._id,
        isShopOrder: true
      };
    }

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
      parcel: {
        description: '',
        images: []
      },
      vehicleType: 'TwoWheeler',
      distance: 0,
      cost: 0,
      paymentMethod: 'pay_after',
      isShopOrder: false
    };
  });

  // Debugging logs for state changes
  useEffect(() => {
    // console.log('Shipment data updated:', shipmentData);
  }, [shipmentData]);

  useEffect(() => {
    scrollToTop();
  }, [success, currentStep]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });

          setShipmentData(prev => {
            if (!prev.sender.address.coordinates) {
              return {
                ...prev,
                sender: {
                  ...prev.sender,
                  address: {
                    ...prev.sender.address,
                    coordinates: { lat: latitude, lng: longitude }
                  }
                }
              };
            }
            return prev;
          });
        },
        (error) => {
          setLocationError(error.message);
          // console.error('Geolocation error:', error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  useEffect(() => {
    const { selectedAddress, type } = location.state || {};

    if (selectedAddress && type) {
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

      if (shipmentData.sender.address.coordinates && shipmentData.receiver.address.coordinates) {
        calculateDistance(true);
      }

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname, shipmentData.sender.address.coordinates, shipmentData.receiver.address.coordinates]);

  useEffect(() => {
    const { sender, receiver } = shipmentData;
    if (sender.address.coordinates && receiver.address.coordinates) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        calculateDistance(true);
      }, 500);
    }
    return () => clearTimeout(debounceTimer.current);
  }, [shipmentData.sender.address.coordinates, shipmentData.receiver.address.coordinates]);

  useEffect(() => {
    if (currentStep === 1 && validateStep1() && shouldAutoProgress) {
      const timer = setTimeout(() => {
        calculateDistance().then(valid => {
          if (valid) setCurrentStep(2);
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shipmentData, currentStep, shouldAutoProgress]);

  const handleBackToDetails = () => {
    setShouldAutoProgress(false);
    setCurrentStep(1);
  };

  const handleInputChange = (e, type) => {
    setShouldAutoProgress(true);
    const { name, value } = e.target;
    setShipmentData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [name]: value
      }
    }));
  };

  const validateStep1 = () => {
    return (
      shipmentData.sender.name.trim() &&
      shipmentData.sender.phone.trim() &&
      shipmentData.receiver.name.trim() &&
      shipmentData.receiver.phone.trim() &&
      shipmentData.sender.address.addressLine1.trim() &&
      shipmentData.receiver.address.addressLine1.trim() &&
      shipmentData.parcel.description.trim()
    );
  };

  const handleVehicleSelect = (type) => {
    setShipmentData(prev => ({
      ...prev,
      vehicleType: type,
      cost: calculatedCosts[type] || 0
    }));
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setShipmentData(prev => ({
      ...prev,
      paymentMethod: method
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

  const handleImageUpload = (e) => {
    // console.log('Image upload initiated');
    const files = Array.from(e.target.files);
    // console.log('Files selected:', files);
    
    if (shipmentData.parcel.images.length + files.length > 5) {
      // console.warn('Maximum 5 images allowed');
      setError('You can upload a maximum of 5 images');
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024;
      // console.log(`File validation - ${file.name}:`, {
      //   isImage: file.type.startsWith('image/'),
      //   sizeValid: file.size <= 5 * 1024 * 1024,
      //   isValid
      // });
      return isValid;
    });

    if (validFiles.length !== files.length) {
      // console.warn('Some files were invalid');
      setError('Please upload only images (max 5MB each)');
    }

    if (validFiles.length > 0) {
      // console.log('Adding valid files to state:', validFiles);
      setShipmentData(prev => ({
        ...prev,
        parcel: {
          ...prev.parcel,
          images: [...prev.parcel.images, ...validFiles]
        }
      }));
    }
  };

  const removeImage = (index) => {
    // console.log('Removing image at index:', index);
    setShipmentData(prev => {
      const newImages = [...prev.parcel.images];
      newImages.splice(index, 1);
      return {
        ...prev,
        parcel: {
          ...prev.parcel,
          images: newImages
        }
      };
    });
  };

  const calculateDistance = async (isAutomatic = false) => {
    // console.log('Calculating distance...');
    const { sender, receiver } = shipmentData;

    if (!sender.address.coordinates || !receiver.address.coordinates) {
      // console.warn('Missing coordinates for distance calculation');
      if (!isAutomatic) {
        setError('Please select valid addresses for both sender and receiver');
      }
      return false;
    }

    if (!isAutomatic) setIsSubmitting(true);
    setError(null);

    try {
      // console.log('Sending distance calculation request with:', {
      //   origin: sender.address.coordinates,
      //   destination: receiver.address.coordinates
      // });
      
      const response = await axios.post('https://jio-yatri-user.onrender.com/api/shipments/calculate-distance', {
        origin: sender.address.coordinates,
        destination: receiver.address.coordinates
      });

      // console.log('Distance calculation response:', response.data);
      
      const calculatedDistance = response.data.distance;
      setDistance(calculatedDistance);

      const costs = {};
      vehicleTypes.forEach(vehicle => {
        costs[vehicle.type] = calculatedDistance * vehicle.rate;
      });

      // console.log('Calculated costs:', costs);
      setCalculatedCosts(costs);

      setShipmentData(prev => ({
        ...prev,
        distance: calculatedDistance,
        cost: costs[prev.vehicleType] || 0
      }));

      return true;
    } catch (error) {
      // console.error('Distance calculation failed:', error);
      if (!isAutomatic) {
        setError(error.response?.data?.message || 'Failed to calculate distance');
      }
      return false;
    } finally {
      if (!isAutomatic) setIsSubmitting(false);
    }
  };

  const uploadImagesToServer = async (shipmentId, token) => {
    // console.log('Starting image upload to server for shipment:', shipmentId);
    const formData = new FormData();
    
    // console.log('Preparing FormData with images:', shipmentData.parcel.images);
    shipmentData.parcel.images.forEach((image, index) => {
      if (image instanceof File) {
        // console.log(`Adding file ${index} to FormData:`, image.name);
        formData.append('images', image); // This must match your Multer field name
      } else {
        // console.log(`Skipping non-File item at index ${index}:`, image);
      }
    });

    try {
      // console.log('Sending image upload request to:', 
      //   `${process.env.REACT_APP_API_URL}/api/shipment-images/${shipmentId}/multiple`);
      
      const response = await axios.post(
        `https://jio-yatri-user.onrender.com/api/shipment-images/${shipmentId}/multiple`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // console.log('Image upload successful:', response.data);
      return response.data;
    } catch (error) {
      // console.error('Image upload failed:', {
      //   message: error.message,
      //   response: error.response?.data,
      //   config: error.config,
      //   stack: error.stack
      // });
      throw error;
    }
  };

  const processRazorpayPayment = async (shipmentId) => {
    // console.log('Processing Razorpay payment for shipment:', shipmentId);
    if (!shipmentId) {
      // console.error('Invalid shipment ID');
      setError('Invalid shipment ID');
      return;
    }

    setPaymentProcessing(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      // console.log('Initiating payment for shipment:', shipmentId);

      const orderResponse = await axios.post(
        `https://jio-yatri-user.onrender.com/api/payment/${shipmentId}/initiate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      // console.log('Payment initiation response:', orderResponse.data);
      
      const order = orderResponse.data.data;

      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay not available after script load');
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'MokshaAmbani Logistics',
        description: `Payment for Shipment #${trackingNumber}`,
        order_id: order.id,
        handler: async function (response) {
          // console.log('Razorpay payment handler:', response);
          try {
            const verifyResponse = await axios.post(
              'https://jio-yatri-user.onrender.com/api/payment/verify',
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                shipmentId: shipmentId
              },
              {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
              }
            );
            // console.log('Payment verification response:', verifyResponse.data);
            setSuccess(true);
            setCurrentStep(3);
          } catch (error) {
            // console.error('Payment verification failed:', error);
            setError('Payment verification failed. Please contact support.');
          } finally {
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: shipmentData.sender.name,
          email: shipmentData.sender.email || '',
          contact: shipmentData.sender.phone
        },
        theme: { color: '#3399cc' },
        modal: {
          ondismiss: () => {
            // console.log('Payment modal dismissed');
            setPaymentProcessing(false);
          }
        }
      };

      // console.log('Creating Razorpay instance with options:', options);
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        // console.error('Payment failed:', response);
        setError(`Payment failed: ${response.error.description}`);
        setPaymentProcessing(false);
      });

      rzp.open();

    } catch (error) {
      // console.error('Payment processing error:', error);
      setError(error.response?.data?.message || 'Payment processing failed');
      setPaymentProcessing(false);
    }
  };

  const handleNextStep = () => {
    // console.log('Moving to next step');
    if (!shipmentData.sender.name || !shipmentData.sender.phone ||
      !shipmentData.receiver.name || !shipmentData.receiver.phone) {
      // console.warn('Missing sender/receiver details');
      setError('Please fill all sender and receiver details');
      return;
    }

    if (!shipmentData.sender.address.addressLine1 || !shipmentData.receiver.address.addressLine1) {
      // console.warn('Missing addresses');
      setError('Please select both pickup and delivery locations');
      return;
    }

    if (!shipmentData.parcel.description) {
      // console.warn('Missing parcel description');
      setError('Please describe your parcel');
      return;
    }

    calculateDistance().then(valid => {
      // console.log('Distance calculation result:', valid);
      if (valid) setCurrentStep(2);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log('Form submission started');

    if (!user) {
      // console.log('User not authenticated');
      setError('Please login to create shipments');
      return;
    }

    if (!shipmentData.vehicleType) {
      // console.log('No vehicle type selected');
      setError('Please select a vehicle type');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      // console.log('User token retrieved');

      const payload = {
        sender: {
          name: shipmentData.sender.name,
          phone: shipmentData.sender.phone,
          email: shipmentData.sender.email || '',
          address: {
            addressLine1: shipmentData.sender.address.addressLine1,
            coordinates: shipmentData.sender.address.coordinates
          }
        },
        receiver: {
          name: shipmentData.receiver.name,
          phone: shipmentData.receiver.phone,
          email: shipmentData.receiver.email || '',
          address: {
            addressLine1: shipmentData.receiver.address.addressLine1,
            coordinates: shipmentData.receiver.address.coordinates
          }
        },
        parcel: {
          description: shipmentData.parcel.description
        },
        vehicleType: shipmentData.vehicleType,
        distance: shipmentData.distance,
        cost: shipmentData.cost,
        paymentMethod: shipmentData.paymentMethod,
        shopId: shipmentData.shopId,
        isShopOrder: shipmentData.isShopOrder
      };

      // console.log('Shipment payload:', payload);
      
      // console.log('Creating shipment...');
      const response = await axios.post('https://jio-yatri-user.onrender.com/api/shipments', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const shipmentId = response.data.shipment?._id;
      // console.log('Shipment created with ID:', shipmentId);
      setTrackingNumber(response.data.trackingNumber);

      if (shipmentData.parcel.images.length > 0) {
        // console.log('Starting image upload for', shipmentData.parcel.images.length, 'images');
        await uploadImagesToServer(shipmentId, token);
      } else {
        // console.log('No images to upload');
      }

      if (shipmentData.paymentMethod === 'pay_after') {
        // console.log('Pay after delivery selected, showing success');
        setSuccess(true);
        setCurrentStep(3);
        return;
      }

      // console.log('Processing online payment...');
      await processRazorpayPayment(shipmentId);

    } catch (error) {
      // console.error('Submission error:', {
      //   message: error.message,
      //   response: error.response?.data,
      //   stack: error.stack
      // });
      setError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to submit shipment. Please try again.'
      );
    } finally {
      // console.log('Submission process completed');
      setIsSubmitting(false);
    }
  };

  if (paymentProcessing) {
    return (
      <div className="payment-processing-overlay">
        <div className="payment-processing-content">
          <div className="payment-processing-spinner"></div>
          <h3>Processing Payment...</h3>
          <p>Please wait while we process your payment</p>
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div className="confirmation-page">
        <Header />
        <div className="content-wrap">
          <div className="confirmation-container">
            <div className="success-icon">
              <div className="checkmark-circle">
                <svg className="checkmark-icon" viewBox="0 0 52 52">
                  <circle className="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none" />
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
            </div>
            <h1 className="success-title">Order Confirmed!</h1>
            <p className="success-subtitle">Your shipment has been successfully created</p>
            <div className="order-id">
              <span>Tracking Number: {trackingNumber}</span>
            </div>
            <div className="payment-method-display">
              <span>Payment Method: </span>
              <strong>
                {shipmentData.paymentMethod === 'razorpay'
                  ? 'Online Payment'
                  : 'Pay After Delivery'}
              </strong>
            </div>
            <div className="total-summary">
              <div className="total-label">Total Amount</div>
              <div className="total-amount">₹{shipmentData.cost.toFixed(2)}</div>
            </div>
            <div className="action-buttons">
              <button
                className="btn-secondary"
                onClick={() => {
                  navigate('/home');
                  scrollToTop();
                }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 1) {
    return (
      <>
        <Header />
        <SecondaryNav />
        <SearchBar />
        <div className="shipment-page rapido-style">
          <div className="shipment-container">
            <h2 className="step-title">Enter Sender & Receiver Details</h2>

            <div className="sender-section">
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  value={shipmentData.sender.name}
                  onChange={(e) => handleInputChange(e, 'sender')}
                  placeholder="Sender Name"
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <input
                  type="tel"
                  name="phone"
                  value={shipmentData.sender.phone}
                  onChange={(e) => handleInputChange(e, 'sender')}
                  placeholder="Sender Phone"
                  className="form-input"
                />
              </div>
              <div
                className="address-input"
                onClick={() => navigateToAddressSelection('sender')}
              >
                <div style={{ position: 'relative' }} className='location-icon'>
                  <FaMapMarkerAlt className="address-icon" />
                  <input
                    type="text"
                    value={shipmentData.sender.address.addressLine1 || ''}
                    readOnly
                    placeholder="Parcel Pickup location"
                    className="address-text"
                  />
                </div>
              </div>
            </div>

            <div className="parcel-section">  
              <div className="input-group">
                <textarea
                  name="description"
                  value={shipmentData.parcel.description}
                  onChange={(e) => setShipmentData(prev => ({
                    ...prev,
                    parcel: {
                      ...prev.parcel,
                      description: e.target.value
                    }
                  }))}
                  placeholder="Describe your parcel (contents, special handling instructions)"
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div className="image-upload-section">
                <label className="image-upload-label">
                  Upload Parcel Images (Max 5)
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                
                <div className="image-preview-container">
                  {shipmentData.parcel.images.map((image, index) => (
                    <div key={index} className="image-preview-item">
                      <img 
                        src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
                        alt={`Parcel ${index + 1}`} 
                      />
                      <button 
                        type="button" 
                        onClick={() => removeImage(index)}
                        className="remove-image-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="map-preview">
              <LocationMap
                senderCoordinates={shipmentData.sender.address.coordinates}
                receiverCoordinates={shipmentData.receiver.address.coordinates}
                currentLocation={currentLocation}
              />
            </div>

            <div className="receiver-section">
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  value={shipmentData.receiver.name}
                  onChange={(e) => handleInputChange(e, 'receiver')}
                  placeholder="Receiver Name"
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <input
                  type="tel"
                  name="phone"
                  value={shipmentData.receiver.phone}
                  onChange={(e) => handleInputChange(e, 'receiver')}
                  placeholder="Receiver Phone"
                  className="form-input"
                />
              </div>
              <div
                className="address-input"
                onClick={() => navigateToAddressSelection('receiver')}
              >
                <div style={{ position: 'relative' }} className='location-icon'>
                  <FaMapMarkerAlt className="address-icon" />
                  <input
                    type="text"
                    value={shipmentData.receiver.address.addressLine1 || ''}
                    readOnly
                    placeholder="Parcel Delivery location"
                    className="address-text"
                  />
                </div>
              </div>
            </div>

            <h6 className='services'>Services</h6>
            <div className="vehicle-options-container">
              {vehicleTypes.map((vehicle) => (
                <div
                  key={vehicle.type}
                  className={`vehicle-option ${shipmentData.vehicleType === vehicle.type ? 'selected' : ''} ${!vehicle.available ? 'unavailable' : ''}`}
                  onClick={() => vehicle.available && handleVehicleSelect(vehicle.type)}
                >
                  <div className="vehicle-icons">{vehicle.emoji}</div>
                  <div className="vehicle-info">
                    <div className="vehicle-name">{vehicle.name}</div>
                    <div className="vehicle-capacity">{vehicle.capacity}</div>
                  </div>
                  <div className="vehicle-rate">{vehicle.displayRate}</div>
                  {shipmentData.distance > 0 && (
                    <div className="vehicle-price">₹{(shipmentData.distance * vehicle.rate).toFixed(2)}</div>
                  )}
                  {vehicle.comingSoon && <div className="coming-soon">Coming Soon</div>}
                </div>
              ))}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="next-button"
              onClick={handleNextStep}
              disabled={isSubmitting || !validateStep1()}
            >
              {isSubmitting ? 'Calculating...' : 'Continue'}
            </button>
          </div>
        </div>
      </>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="shipment-page rapido-style">
        <Header />
        <div className="map-preview">
          <LocationMap
            senderCoordinates={shipmentData.sender.address.coordinates}
            receiverCoordinates={shipmentData.receiver.address.coordinates}
            currentLocation={currentLocation}
          />

          <div className="button-group">
            <button className="back-buttons" onClick={handleBackToDetails}>
              ←
            </button>
          </div>
        </div>
        <div className="shipment-container">
          <h2 className="step-title">Select Vehicle & Payment</h2>

          <div className="vehicle-selection-section">
            <h3 className="section-vehicle-title">Choose Your Vehicle</h3>
            <div className="vehicle-options-container">
              {vehicleTypes.map((vehicle) => (
                <div
                  key={vehicle.type}
                  className={`vehicle-option ${shipmentData.vehicleType === vehicle.type ? 'selected' : ''} ${!vehicle.available ? 'unavailable' : ''}`}
                  onClick={() => vehicle.available && handleVehicleSelect(vehicle.type)}
                >
                  <div className="vehicle-icons">{vehicle.emoji}</div>
                  <div className="vehicle-info">
                    <div className="vehicle-name">{vehicle.name}</div>
                    <div className="vehicle-capacity">{vehicle.capacity}</div>
                  </div>
                  {shipmentData.distance > 0 && (
                    <div className="vehicle-price">₹{(shipmentData.distance * vehicle.rate).toFixed(2)}</div>
                  )}
                  {vehicle.comingSoon && <div className="coming-soon">Coming Soon</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-item">
              <span className="summary-label">Distance:</span>
              <span className="summary-value">{shipmentData.distance.toFixed(2)} km</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Vehicle:</span>
              <span className="summary-value">
                {vehicleTypes.find(v => v.type === shipmentData.vehicleType)?.name}
              </span>
            </div>
            <div className="summary-item total">
              <span className="summary-label">Total Cost:</span>
              <span className="summary-value">₹{shipmentData.cost.toFixed(2)}</span>
            </div>
          </div>

          <div className="payment-section">
            <h3 className="section-vehicle-title">Payment Method</h3>

            <div className="dropdown-payment-selector">
              <div
                className="selected-payment"
                onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
              >
                <span className="payment-icon">
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon}
                </span>
                <span className="payment-name">
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                </span>
                <span className={`dropdown-arrow ${isPaymentDropdownOpen ? 'open' : ''}`}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>

              {isPaymentDropdownOpen && (
                <div className="payment-options-dropdown">
                  {paymentMethods.map(method => (
                    <div
                      key={method.id}
                      className={`payment-option ${selectedPaymentMethod === method.id ? 'selected' : ''}`}
                      onClick={() => {
                        handlePaymentMethodSelect(method.id);
                        setIsPaymentDropdownOpen(false);
                      }}
                    >
                      <span className="payment-icon">{method.icon}</span>
                      <span className="payment-name">{method.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="confirm-button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Book Vehicle'}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default ShipmentPage;