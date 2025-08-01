// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import axios from 'axios';
// import Header from './Header';
// import Footer from './Footer';
// import LocationMap from './LocationMap';
// import { FaMapMarkerAlt, FaChevronRight, FaUser, FaPhone, FaExchangeAlt } from 'react-icons/fa';
// import '../../styles/components.css';
// const vehicleTypes = [
//   {
//     type: 'TwoWheeler',
//     name: '2 Wheeler',
//     rate: 20,
//     emoji: '🛵',
//     capacity: 'Up to 8kg',
//     available: true
//   },
//   {
//     type: 'ThreeWheeler',
//     name: '3 Wheeler',
//     rate: 30,
//     emoji: '🛺',
//     capacity: 'Up to 500kg',
//     available: true
//   },
//   {
//     type: 'Truck',
//     name: 'Truck',
//     rate: 40,
//     emoji: '🚚',
//     capacity: 'Up to 1200kg',
//     available: true
//   },
//   {
//     type: 'Pickup9ft',
//     name: 'Pickup (9ft)',
//     rate: 50,
//     emoji: '🛻',
//     capacity: 'Up to 1700kg',
//     available: true,
//   },
//   {
//     type: 'Tata407',
//     name: 'Tata 407',
//     rate: 60,
//     emoji: '🚛',
//     capacity: 'Up to 2500kg',
//     available: true,
//   },
//   {
//     type: 'ContainerTruck',
//     name: 'Container Truck',
//     rate: 80,
//     emoji: '🚒',
//     capacity: 'Up to 5000kg',
//     available: false,
//     comingSoon: true
//   }
// ];

// const paymentMethods = [
//   { id: 'razorpay', name: 'Pay Online', description: 'Secure payment with Razorpay', icon: '💳' },
//   { id: 'pay_after', name: 'Pay After Delivery', description: 'Pay online after delivery is completed', icon: '⏳' }
// ];

// const loadRazorpay = () => {
//   return new Promise((resolve) => {
//     if (window.Razorpay) {
//       resolve(true);
//       return;
//     }

//     const script = document.createElement('script');
//     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//     script.onload = () => resolve(true);
//     script.onerror = () => resolve(false);
//     document.body.appendChild(script);
//   });
// };

// const scrollToTop = () => {
//   window.scrollTo({ top: 0, behavior: 'smooth' });
// };

// function ShipmentPage() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);
//   const [trackingNumber, setTrackingNumber] = useState('');
//   const [calculatedCosts, setCalculatedCosts] = useState({});
//   const [distance, setDistance] = useState(0);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay');
//   const [paymentProcessing, setPaymentProcessing] = useState(false);
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [locationError, setLocationError] = useState(null);
//   const debounceTimer = useRef(null);

//   const [shipmentData, setShipmentData] = useState(() => {
//     const locationState = location.state?.shipmentData;
//     return locationState || {
//       sender: {
//         name: '',
//         phone: '',
//         email: '',
//         address: {
//           addressLine1: '',
//           coordinates: null
//         }
//       },
//       receiver: {
//         name: '',
//         phone: '',
//         email: '',
//         address: {
//           addressLine1: '',
//           coordinates: null
//         }
//       },
//       vehicleType: 'TwoWheeler',
//       distance: 0,
//       cost: 0,
//       paymentMethod: 'razorpay'
//     };
//   });

//   useEffect(() => {
//     scrollToTop();
//   }, [success]);

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           setCurrentLocation({ lat: latitude, lng: longitude });

//           setShipmentData(prev => {
//             if (!prev.sender.address.coordinates) {
//               return {
//                 ...prev,
//                 sender: {
//                   ...prev.sender,
//                   address: {
//                     ...prev.sender.address,
//                     coordinates: { lat: latitude, lng: longitude }
//                   }
//                 }
//               };
//             }
//             return prev;
//           });
//         },
//         (error) => {
//           setLocationError(error.message);
//           console.error('Geolocation error:', error);
//         }
//       );
//     } else {
//       setLocationError('Geolocation is not supported by this browser.');
//     }
//   }, []);

//   useEffect(() => {
//     const { selectedAddress, type } = location.state || {};

//     if (selectedAddress && type) {
//       setShipmentData(prev => ({
//         ...prev,
//         [type]: {
//           ...prev[type],
//           address: {
//             addressLine1: selectedAddress.address,
//             coordinates: selectedAddress.coordinates
//           }
//         }
//       }));

//       navigate(location.pathname, { replace: true, state: {} });
//     }
//   }, [location.state, navigate, location.pathname]);

//   useEffect(() => {
//     const { sender, receiver } = shipmentData;
//     if (sender.address.coordinates && receiver.address.coordinates) {
//       clearTimeout(debounceTimer.current);
//       debounceTimer.current = setTimeout(() => {
//         calculateDistance(true);
//       }, 500);
//     }
//     return () => clearTimeout(debounceTimer.current);
//   }, [shipmentData.sender.address.coordinates, shipmentData.receiver.address.coordinates]);

//   const handleInputChange = (e, type) => {
//     const { name, value } = e.target;
//     setShipmentData(prev => ({
//       ...prev,
//       [type]: {
//         ...prev[type],
//         [name]: value
//       }
//     }));
//   };

//   const handleVehicleSelect = (type) => {
//     setShipmentData(prev => ({
//       ...prev,
//       vehicleType: type,
//       cost: calculatedCosts[type] || 0
//     }));
//   };

//   const handlePaymentMethodSelect = (method) => {
//     setSelectedPaymentMethod(method);
//     setShipmentData(prev => ({
//       ...prev,
//       paymentMethod: method
//     }));
//   };

//   const navigateToAddressSelection = (type) => {
//     navigate('/select-address', {
//       state: {
//         type,
//         currentAddress: shipmentData[type].address,
//         shipmentData: shipmentData
//       }
//     });
//   };

//   const calculateDistance = async (isAutomatic = false) => {
//     const { sender, receiver } = shipmentData;

//     if (!sender.address.coordinates || !receiver.address.coordinates) {
//       if (!isAutomatic) {
//         setError('Please select valid addresses for both sender and receiver');
//       }
//       return false;
//     }

//     if (!isAutomatic) setIsSubmitting(true);
//     setError(null);

//     try {
//       const response = await axios.post('http://localhost:5000/api/shipments/calculate-distance', {
//         origin: sender.address.coordinates,
//         destination: receiver.address.coordinates
//       });

//       const calculatedDistance = response.data.distance;
//       setDistance(calculatedDistance);

//       const costs = {};
//       vehicleTypes.forEach(vehicle => {
//         costs[vehicle.type] = calculatedDistance * vehicle.rate;
//       });

//       setCalculatedCosts(costs);

//       setShipmentData(prev => ({
//         ...prev,
//         distance: calculatedDistance,
//         cost: costs[prev.vehicleType] || 0
//       }));

//       return true;
//     } catch (error) {
//       if (!isAutomatic) {
//         setError(error.response?.data?.message || 'Failed to calculate distance');
//       }
//       return false;
//     } finally {
//       if (!isAutomatic) setIsSubmitting(false);
//     }
//   };

//   const processRazorpayPayment = async (shipmentId) => {
//     if (!shipmentId) {
//       setError('Invalid shipment ID');
//       return;
//     }

//     setPaymentProcessing(true);
//     setError(null);

//     try {
//       const token = await user.getIdToken();

//       const orderResponse = await axios.post(
//         `http://localhost:5000/api/payment/${shipmentId}/initiate`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           withCredentials: true
//         }
//       );

//       const order = orderResponse.data.data;

//       const scriptLoaded = await loadRazorpay();
//       if (!scriptLoaded) {
//         throw new Error('Razorpay SDK failed to load');
//       }

//       if (!window.Razorpay) {
//         throw new Error('Razorpay not available after script load');
//       }

//       const options = {
//         key: process.env.REACT_APP_RAZORPAY_KEY_ID,
//         amount: order.amount,
//         currency: 'INR',
//         name: 'MokshaAmbani Logistics',
//         description: `Payment for Shipment #${trackingNumber}`,
//         order_id: order.id,
//         handler: async function (response) {
//           try {
//             await axios.post(
//               'http://localhost:5000/api/payment/verify',
//               {
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_signature: response.razorpay_signature,
//                 shipmentId: shipmentId
//               },
//               {
//                 headers: { Authorization: `Bearer ${token}` },
//                 withCredentials: true
//               }
//             );
//             setSuccess(true);
//           } catch (error) {
//             setError('Payment verification failed. Please contact support.');
//           } finally {
//             setPaymentProcessing(false);
//           }
//         },
//         prefill: {
//           name: shipmentData.sender.name,
//           email: shipmentData.sender.email || '',
//           contact: shipmentData.sender.phone
//         },
//         theme: { color: '#3399cc' },
//         modal: {
//           ondismiss: () => {
//             setPaymentProcessing(false);
//           }
//         }
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.on('payment.failed', function (response) {
//         setError(`Payment failed: ${response.error.description}`);
//         setPaymentProcessing(false);
//       });

//       rzp.open();

//     } catch (error) {
//       setError(error.response?.data?.message || 'Payment processing failed');
//       setPaymentProcessing(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!user) {
//       setError('Please login to create shipments');
//       return;
//     }

//     if (!shipmentData.sender.name || !shipmentData.sender.phone ||
//       !shipmentData.receiver.name || !shipmentData.receiver.phone) {
//       setError('Please fill all sender and receiver details');
//       return;
//     }

//     if (!shipmentData.sender.address.addressLine1 || !shipmentData.receiver.address.addressLine1) {
//       setError('Please select both pickup and delivery locations');
//       return;
//     }

//     if (!shipmentData.vehicleType) {
//       setError('Please select a vehicle type');
//       return;
//     }

//     setIsSubmitting(true);
//     setError(null);

//     try {
//       const token = await user.getIdToken();
//       const payload = {
//         sender: {
//           name: shipmentData.sender.name,
//           phone: shipmentData.sender.phone,
//           email: shipmentData.sender.email || '',
//           address: {
//             addressLine1: shipmentData.sender.address.addressLine1,
//             coordinates: shipmentData.sender.address.coordinates
//           }
//         },
//         receiver: {
//           name: shipmentData.receiver.name,
//           phone: shipmentData.receiver.phone,
//           email: shipmentData.receiver.email || '',
//           address: {
//             addressLine1: shipmentData.receiver.address.addressLine1,
//             coordinates: shipmentData.receiver.address.coordinates
//           }
//         },
//         vehicleType: shipmentData.vehicleType,
//         distance: shipmentData.distance,
//         cost: shipmentData.cost,
//         paymentMethod: shipmentData.paymentMethod
//       };

//       const response = await axios.post('http://localhost:5000/api/shipments', payload, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       const shipmentId = response.data.shipment?._id;
//       setTrackingNumber(response.data.trackingNumber);

//       if (shipmentData.paymentMethod === 'pay_after') {
//         setSuccess(true);
//         return;
//       }

//       await processRazorpayPayment(shipmentId);

//     } catch (error) {
//       setError(
//         error.response?.data?.message ||
//         error.response?.data?.error ||
//         'Failed to submit shipment. Please try again.'
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (success) {
//     return (
//       <div className="confirmation-page">
//         <Header />
//         <div className="content-wrap">
//           <div className="confirmation-container">
//             <div className="success-icon">
//               <div className="checkmark-circle">
//                 <svg className="checkmark-icon" viewBox="0 0 52 52">
//                   <circle className="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none" />
//                   <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
//                 </svg>
//               </div>
//             </div>
//             <h1 className="success-title">Order Confirmed!</h1>
//             <p className="success-subtitle">Your shipment has been successfully created</p>
//             <div className="order-id">
//               <span>Tracking Number: {trackingNumber}</span>
//             </div>
//             <div className="payment-method-display">
//               <span>Payment Method: </span>
//               <strong>
//                 {shipmentData.paymentMethod === 'razorpay'
//                   ? 'Online Payment'
//                   : 'Pay After Delivery'}
//               </strong>
//             </div>
//             <div className="total-summary">
//               <div className="total-label">Total Amount</div>
//               <div className="total-amount">₹{shipmentData.cost.toFixed(2)}</div>
//             </div>
//             <div className="action-buttons">
//               <button
//                 className="btn-secondary"
//                 onClick={() => {
//                   navigate('/home');
//                   scrollToTop();
//                 }}
//               >
//                 Back to Home
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (paymentProcessing) {
//     return (
//       <div className="payment-processing-overlay">
//         <div className="payment-processing-content">
//           <div className="payment-processing-spinner"></div>
//           <h3>Processing Payment...</h3>
//           <p>Please wait while we process your payment</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="shipment-page rapido-style">
//       <Header />

//       <div className="shipment-container">
//         {/* Sender Section */}
//         <div className="sender-section">
//           <div className="location-marker pickup"></div>
//           <div className="sender-details">
//             <div className="input-group">
//               <input
//                 type="text"
//                 name="name"
//                 value={shipmentData.sender.name}
//                 onChange={(e) => handleInputChange(e, 'sender')}
//                 placeholder="Sender Name"
//                 className="sender-input"
//               />
//             </div>
//             <div className="input-group">
//               <input
//                 type="tel"
//                 name="phone"
//                 value={shipmentData.sender.phone}
//                 onChange={(e) => handleInputChange(e, 'sender')}
//                 placeholder="Sender Phone"
//                 className="sender-input"
//               />
//             </div>
//             <div
//               className="address-input"
//               onClick={() => navigateToAddressSelection('sender')}
//             >
//               <div style={{ position: 'relative' }}>
//                 <FaMapMarkerAlt
//                   style={{
//                     position: 'absolute',
//                     top: '50%',
//                     left: '5px',
//                     transform: 'translateY(-50%)',
//                     color: 'red',
//                     fontSize: '18px'
//                   }}
//                 />
//                 <input
//                   type="text"
//                   value={shipmentData.sender.address.addressLine1 || ''}
//                   readOnly
//                   placeholder="Pickup location"
//                   className="address-text"
//                   style={{ paddingLeft: '30px' }} // adds space for icon
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Map Section */}
//         <div className="map-section">
//           <LocationMap
//             senderCoordinates={shipmentData.sender.address.coordinates}
//             receiverCoordinates={shipmentData.receiver.address.coordinates}
//             currentLocation={currentLocation}
//           />
//           <div className="swap-locations">
//             <button className="swap-button">
//               <FaExchangeAlt />
//             </button>
//           </div>
//         </div>

//         {/* Receiver Section */}
//         <div className="receiver-section">
//           <div className="location-marker drop"></div>
//           <div className="receiver-details">
//             <div className="input-group">
//               <input
//                 type="text"
//                 name="name"
//                 value={shipmentData.receiver.name}
//                 onChange={(e) => handleInputChange(e, 'receiver')}
//                 placeholder="Receiver Name"
//                 className="receiver-input"
//               />
//             </div>
//             <div className="input-group">
//               <input
//                 type="tel"
//                 name="phone"
//                 value={shipmentData.receiver.phone}
//                 onChange={(e) => handleInputChange(e, 'receiver')}
//                 placeholder="Receiver Phone"
//                 className="receiver-input"
//               />
//             </div>
//             <div
//               className="address-input"
//               onClick={() => navigateToAddressSelection('receiver')}
//             >
//               <div style={{ position: 'relative' }}>
//                 <FaMapMarkerAlt
//                   style={{
//                     position: 'absolute',
//                     top: '50%',
//                     left: '5px',
//                     transform: 'translateY(-50%)',
//                     color: 'red',
//                     fontSize: '18px',
//                   }}
//                 />
//                 <input
//                   type="text"
//                   value={shipmentData.receiver.address.addressLine1 || ''}
//                   readOnly
//                   placeholder="Delivery location"
//                   className="address-text"
//                   style={{ paddingLeft: '30px' }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Vehicle Selection Section */}
//         <div className="vehicle-selection-section">
//           <h2 className="vehicle-section-title">Our Services</h2>
//           <div className="vehicle-options-container">
//             {vehicleTypes.map((vehicle) => (
//               <div
//                 key={vehicle.type}
//                 className={`vehicle-option ${shipmentData.vehicleType === vehicle.type ? 'selected' : ''} ${!vehicle.available ? 'unavailable' : ''}`}
//                 onClick={() => vehicle.available && handleVehicleSelect(vehicle.type)}
//               >
//                 <div className="vehicle-icons">{vehicle.emoji}</div>
//                 <div className="vehicle-info">
//                   <div className="vehicle-name">{vehicle.name}</div>
//                   <div className="vehicle-capacity">{vehicle.capacity}</div>
//                 </div>
//                 {shipmentData.distance > 0 && (
//                   <div className="vehicle-price">₹{(shipmentData.distance * vehicle.rate).toFixed(2)}</div>
//                 )}
//                 {vehicle.comingSoon && <div className="coming-soon">Coming Soon</div>}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Summary Section */}
//         <div className="summary-section">
//           <div className="summary-item">
//             <span className="summary-label">Distance:</span>
//             <span className="summary-value">{shipmentData.distance.toFixed(2)} km</span>
//           </div>
//           <div className="summary-item">
//             <span className="summary-label">Vehicle:</span>
//             <span className="summary-value">
//               {vehicleTypes.find(v => v.type === shipmentData.vehicleType)?.name}
//             </span>
//           </div>
//           <div className="summary-item total">
//             <span className="summary-label">Total Cost:</span>
//             <span className="summary-value">₹{shipmentData.cost.toFixed(2)}</span>
//           </div>
//         </div>

//         {/* Payment Section */}
//         <div className="payment-section">
//           <h3 className="payment-title">Select Payment Method</h3>
//           <div className="payment-options">
//             {paymentMethods.map(method => (
//               <div
//                 key={method.id}
//                 className={`payment-option ${selectedPaymentMethod === method.id ? 'selected' : ''}`}
//                 onClick={() => handlePaymentMethodSelect(method.id)}
//               >
//                 <span className="payment-icon">{method.icon}</span>
//                 <span className="payment-name">{method.name}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {error && <div className="error-message">{error}</div>}

//         <button
//           className="vehicle-confirm-button"
//           onClick={handleSubmit}
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? 'Processing...' : 'Confirm Booking'}
//         </button>
//       </div>
//     </div>
//   );
// }

// export default ShipmentPage;


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import LocationMap from './LocationMap';
import { FaMapMarkerAlt, FaChevronRight, FaUser, FaPhone, FaExchangeAlt } from 'react-icons/fa';
import '../../styles/components.css';
import SearchBar from '../pages/SearchBar'
import SecondaryNav from './SecondaryNav';

const vehicleTypes = [
  {
    type: 'TwoWheeler',
    name: 'Bike',
    rate: 10, // per km (used for calculation)
    rateFor2Km: 20, // per 2 km (for display only)
    emoji: '🛵',
    capacity: 'Up to 8kg',
    available: true,
    displayRate: "₹20 per 2 km" // Added for easy display
  },
  {
    type: 'ThreeWheeler',
    name: 'Auto',
    rate: 20, // per km
    rateFor2Km: 40, // per 2 km
    emoji: '🛺',
    capacity: 'Up to 500kg',
    available: true,
    displayRate: "₹40 per 2 km"
  },
  {
    type: 'Truck',
    name: 'Truck',
    rate: 40, // per km
    rateFor2Km: 80, // per 2 km
    emoji: '🚚',
    capacity: 'Up to 1200kg',
    available: true,
    displayRate: "₹80 per 2 km"
  },
  {
    type: 'Pickup9ft',
    name: 'bulara',
    rate: 175, // per km
    rateFor2Km: 350, // per 2 km
    emoji: '🛻',
    capacity: 'Up to 1700kg',
    available: true,
    displayRate: "₹350 per 2 km"
  },
  {
    type: 'Tata407',
    name: 'Tata 407',
    rate: 300, // per km
    rateFor2Km: 600, // per 2 km
    emoji: '🚛',
    capacity: 'Up to 2500kg',
    available: true,
    displayRate: "₹600 per 2 km"
  },
  {
    type: 'ContainerTruck',
    name: 'Container Truck',
    rate: 80, // per km
    rateFor2Km: 160, // per 2 km
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

  const [currentStep, setCurrentStep] = useState(1); // 1: Sender/Receiver, 2: Vehicle/Payment, 3: Confirmation
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
    const shopData = location.state?.shop; // Add this line to get shop data

    // If coming from shop order, pre-fill sender details
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
        vehicleType: 'TwoWheeler',
        distance: 0,
        cost: 0,
        paymentMethod: 'pay_after',
        shopId: shopData._id,        // Add shop reference
        isShopOrder: true            // Mark as shop order
      };
    }

    // Regular shipment initialization
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
      vehicleType: 'TwoWheeler',
      distance: 0,
      cost: 0,
      paymentMethod: 'pay_after',
      isShopOrder: false            // Default to false
    };
  });
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
          console.error('Geolocation error:', error);
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

      // If both addresses are set, move to next step
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




  // Back button handler (Step 2 → Step 1)
  const handleBackToDetails = () => {
    setShouldAutoProgress(false); // Disable auto-progression
    setCurrentStep(1); // Go back to Step 1
  };

  // Example: When an input field changes, re-enable auto-progression
  const handleInputChange = (e, type) => {
    setShouldAutoProgress(true); // Re-enable auto-progression
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
      shipmentData.receiver.address.addressLine1.trim()
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

  const calculateDistance = async (isAutomatic = false) => {
    const { sender, receiver } = shipmentData;

    if (!sender.address.coordinates || !receiver.address.coordinates) {
      if (!isAutomatic) {
        setError('Please select valid addresses for both sender and receiver');
      }
      return false;
    }

    if (!isAutomatic) setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post('https://jio-yatri-user.onrender.com/api/shipments/calculate-distance', {
        origin: sender.address.coordinates,
        destination: receiver.address.coordinates
      });

      const calculatedDistance = response.data.distance;
      setDistance(calculatedDistance);

      const costs = {};
      vehicleTypes.forEach(vehicle => {
        costs[vehicle.type] = calculatedDistance * vehicle.rate;
      });

      setCalculatedCosts(costs);

      setShipmentData(prev => ({
        ...prev,
        distance: calculatedDistance,
        cost: costs[prev.vehicleType] || 0
      }));

      return true;
    } catch (error) {
      if (!isAutomatic) {
        setError(error.response?.data?.message || 'Failed to calculate distance');
      }
      return false;
    } finally {
      if (!isAutomatic) setIsSubmitting(false);
    }
  };

  const processRazorpayPayment = async (shipmentId) => {
    if (!shipmentId) {
      setError('Invalid shipment ID');
      return;
    }

    setPaymentProcessing(true);
    setError(null);

    try {
      const token = await user.getIdToken();

      const orderResponse = await axios.post(
        `https://jio-yatri-user.onrender.com/api/payment/${shipmentId}/initiate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

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
          try {
            await axios.post(
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
            setSuccess(true);
            setCurrentStep(3);
          } catch (error) {
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
            setPaymentProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description}`);
        setPaymentProcessing(false);
      });

      rzp.open();

    } catch (error) {
      setError(error.response?.data?.message || 'Payment processing failed');
      setPaymentProcessing(false);
    }
  };

  const handleNextStep = () => {
    // Validate sender and receiver details before proceeding
    if (!shipmentData.sender.name || !shipmentData.sender.phone ||
      !shipmentData.receiver.name || !shipmentData.receiver.phone) {
      setError('Please fill all sender and receiver details');
      return;
    }

    if (!shipmentData.sender.address.addressLine1 || !shipmentData.receiver.address.addressLine1) {
      setError('Please select both pickup and delivery locations');
      return;
    }

    calculateDistance().then(valid => {
      if (valid) setCurrentStep(2);
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user) {
    setError('Please login to create shipments');
    return;
  }

  if (!shipmentData.vehicleType) {
    setError('Please select a vehicle type');
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
      vehicleType: shipmentData.vehicleType,
      distance: shipmentData.distance,
      cost: shipmentData.cost,
      paymentMethod: shipmentData.paymentMethod,
      shopId: shipmentData.shopId,       // Include shopId if exists
      isShopOrder: shipmentData.isShopOrder // Include isShopOrder flag
    };

    const response = await axios.post('https://jio-yatri-user.onrender.com/api/shipments', payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const shipmentId = response.data.shipment?._id;
    setTrackingNumber(response.data.trackingNumber);

    if (shipmentData.paymentMethod === 'pay_after') {
      setSuccess(true);
      setCurrentStep(3);
      return;
    }

    await processRazorpayPayment(shipmentId);

  } catch (error) {
    setError(
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Failed to submit shipment. Please try again.'
    );
  } finally {
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

  // Step 3: Confirmation Page
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

  // Step 1: Sender and Receiver Details
  if (currentStep === 1) {
    return (
      <>
      <Header/>
      <SecondaryNav/>
      <SearchBar/>
      <div className="shipment-page rapido-style">
        <div className="shipment-container">
          <h2 className="step-title">Enter Sender & Receiver Details</h2>

          {/* Sender Section */}
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

          <div className="map-preview">
            <LocationMap
              senderCoordinates={shipmentData.sender.address.coordinates}
              receiverCoordinates={shipmentData.receiver.address.coordinates}
              currentLocation={currentLocation}
            />
          </div>

          {/* Receiver Section */}
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
                  placeholder="Parcel Delivery  location"
                  className="address-text"
                />
              </div>
            </div>
          </div>

          {/* Map Preview */}
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
      <Footer/>
      </>
    );
  }

  // Step 2: Vehicle Selection and Payment
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

          {/* Vehicle Selection Section */}
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

          {/* Summary Section */}
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

          {/* Payment Section */}
          {/* <div className="payment-section">
            <h3 className="section-vehicle-title">Select Payment Method</h3>
            <div className="payment-options">
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  className={`payment-option ${selectedPaymentMethod === method.id ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodSelect(method.id)}
                >
                  <span className="payment-icon">{method.icon}</span>
                  <span className="payment-name">{method.name}</span>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          <button
            className="back-button"
            onClick={handleBackToDetails} // Use the new handler
          >
            ← Back to Details
          </button>
          <button
            className="confirm-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </button> */}

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

        </div >
      </div >
    );
  }

  return null;
}

export default ShipmentPage;
