// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import axios from 'axios';
// import Header from './Header';
// import Footer from './Footer';
// import '../../styles/components.css';
// import { FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';

// const vehicleTypes = [
//   { type: 'TwoWheeler', name: '2 Wheeler', rate: 20, emoji: '🛵', capacity: 'Up to 8kg' },
//   { type: 'ThreeWheeler', name: '3 Wheeler', rate: 30, emoji: '🛺', capacity: 'Up to 500kg' },
//   { type: 'Truck', name: 'Truck', rate: 40, emoji: '🚚', capacity: 'Up to 1200kg' }
// ];

// function ShipmentPage() {
//   const [showSummary, setShowSummary] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);
//   const [trackingNumber, setTrackingNumber] = useState('');
//   const [calculatedCosts, setCalculatedCosts] = useState({});
//   const [distance, setDistance] = useState(0);
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();


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
//       vehicleType: 'two-wheeler',
//       distance: 0,
//       cost: 0
//     };
//   });

//   useEffect(() => {
//     if (location.state?.selectedAddress && location.state?.type) {
//       const { type, selectedAddress } = location.state;
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

//       // Clear state to prevent duplicate updates
//       navigate(location.pathname, { replace: true, state: {} });
//     }
//   }, [location.state, navigate, location.pathname]);

//   useEffect(() => {
//   if (success) {
//     // Confetti effect
//     const canvas = document.getElementById('confetti-canvas');
//     if (canvas) {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;

//       const ctx = canvas.getContext('2d');
//       const pieces = [];
//       const numberOfPieces = 150;

//       // Confetti colors
//       const colors = ['#10b981', '#34d399', '#a7f3d0', '#6a11cb', '#2575fc', '#f59e0b', '#f97316'];

//       // Create confetti pieces
//       for (let i = 0; i < numberOfPieces; i++) {
//         pieces.push({
//           x: Math.random() * canvas.width,
//           y: Math.random() * canvas.height - canvas.height,
//           rotation: Math.random() * 360,
//           size: Math.random() * 10 + 5,
//           color: colors[Math.floor(Math.random() * colors.length)],
//           speed: Math.random() * 3 + 2,
//           oscillation: Math.random() * 10,
//           angle: Math.random() * 360
//         });
//       }

//       // Animation loop
//       function update() {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         pieces.forEach(p => {
//           ctx.save();
//           ctx.translate(p.x, p.y);
//           ctx.rotate(p.rotation * Math.PI / 180);

//           ctx.fillStyle = p.color;
//           ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);

//           ctx.restore();

//           p.y += p.speed;
//           p.rotation += p.speed / 5;
//           p.x += Math.sin(p.angle * Math.PI / 180) * p.oscillation;
//           p.angle += 1;

//           if (p.y > canvas.height) {
//             p.y = -10;
//             p.x = Math.random() * canvas.width;
//           }
//         });

//         requestAnimationFrame(update);
//       }

//       update();
//     }
//   }
// }, [success]);

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

//   const navigateToAddressSelection = (type) => {
//     navigate('/select-address', {
//       state: {
//         type,
//         currentAddress: shipmentData[type].address,
//         shipmentData: shipmentData
//       }
//     });
//   };

//   const calculateDistance = async () => {
//     const { sender, receiver } = shipmentData;

//     if (!sender.address.coordinates || !receiver.address.coordinates) {
//       setError('Please select valid addresses for both sender and receiver');
//       return false;
//     }

//     setIsSubmitting(true);
//     setError(null);

//     try {
//       const response = await axios.post('http://localhost:5000/api/shipments/calculate-distance', {
//         origin: sender.address.coordinates,
//         destination: receiver.address.coordinates
//       });

//       const calculatedDistance = response.data.distance;
//       setDistance(calculatedDistance);

//       // Calculate cost for all vehicle types
//       const costs = {};
//       vehicleTypes.forEach(vehicle => {
//         costs[vehicle.type] = calculatedDistance * vehicle.rate;
//       });

//       setCalculatedCosts(costs);

//       // Update the current cost for selected vehicle
//       setShipmentData(prev => ({
//         ...prev,
//         distance: calculatedDistance,
//         cost: costs[prev.vehicleType]
//       }));

//       return true;
//     } catch (error) {
//       setError(error.response?.data?.message || 'Failed to calculate distance');
//       return false;
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!showSummary) {
//       const success = await calculateDistance();
//       if (success) {
//         setShowSummary(true);
//       }
//     } else {
//       if (!user) {
//         setError('Please login to create shipments');
//         return;
//       }

//       setIsSubmitting(true);
//       setError(null);

//       try {
//         const token = await user.getIdToken();
//         const payload = {
//           sender: {
//             name: shipmentData.sender.name,
//             phone: shipmentData.sender.phone,
//             email: shipmentData.sender.email || '', // Include email
//             address: {
//               addressLine1: shipmentData.sender.address.addressLine1,
//               coordinates: shipmentData.sender.address.coordinates
//             }
//           },
//           receiver: {
//             name: shipmentData.receiver.name,
//             phone: shipmentData.receiver.phone,
//             email: shipmentData.receiver.email || '', // Include email
//             address: {
//               addressLine1: shipmentData.receiver.address.addressLine1,
//               coordinates: shipmentData.receiver.address.coordinates
//             }
//           },
//           vehicleType: shipmentData.vehicleType,
//           distance: shipmentData.distance,
//           cost: shipmentData.cost
//         };
//         console.log(payload)
//         const response = await axios.post('http://localhost:5000/api/shipments', payload, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });

//         setTrackingNumber(response.data.trackingNumber);
//         setSuccess(true);
//       } catch (error) {
//         console.error("Error details:", error.response?.data);
//         setError(
//           error.response?.data?.message ||
//           error.response?.data?.error ||
//           'Failed to submit shipment. Please try again.'
//         );
//       } finally {
//         setIsSubmitting(false);
//       }
//     }
//   };

//   const handleBack = () => {
//     setShowSummary(false);
//   };
// if (success) {
//   return (
//     <div className="confirmation-page">
//       <Header />
//       <div className="content-wrap">
//         <div className="confirmation-container">
//           {/* Animated Checkmark */}
//           <div className="success-icon">
//             <div className="checkmark-circle">
//               <svg className="checkmark-icon" viewBox="0 0 52 52">
//                 <circle className="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none"/>
//                 <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
//               </svg>

//               {/* Sparkles */}
//               <div className="sparkle sparkle-1"></div>
//               <div className="sparkle sparkle-2"></div>
//               <div className="sparkle sparkle-3"></div>
//               <div className="sparkle sparkle-4"></div>
//             </div>
//           </div>

//           <h1 className="success-title">Order Confirmed!</h1>
//           <p className="success-subtitle">Your shipment has been successfully created and is being processed</p>

//           {/* Confetti Canvas (will be populated by JS) */}
//           <canvas id="confetti-canvas" className="confetti-canvas"></canvas>

//            <div className="order-id">
//               <span>Tracking Number: {trackingNumber}</span>
//             </div>

//           {/* Price Summary */}
//           <div className="total-summary">
//             <div className="total-label">Total Amount</div>
//             <div className="total-amount">₹{shipmentData.cost.toFixed(2)}</div>
//           </div>

//           {/* Action Buttons */}
//           <div className="action-buttons">
//             {/* <button 
//               className="btn-primary"
//               onClick={() => navigate('/track', { state: { trackingNumber } })}
//             >
//               Track Shipment
//             </button> */}
//             <button 
//               className="btn-secondary"
//               onClick={() => navigate('/')}
//             >
//               Back to Home
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Floating Decorations */}
//       <div className="decoration decoration-1"></div>
//       <div className="decoration decoration-2"></div>
//       <div className="decoration decoration-3"></div>

//       <Footer />
//     </div>
//   );
// }
//   if (showSummary) {
//     return (
//       <div className="page-container">
//         <Header />
//         <div className="content-wrap">
//           <div className="summary-container">
//             <h2>Order Summary</h2>
//             <div className="summary-grid">
//               <div className="summary-section">
//                 <h3>Sender</h3>
//                 <p>{shipmentData.sender.name}</p>
//                 <p>{shipmentData.sender.phone}</p>
//                 <p>{shipmentData.sender.email}</p>
//                 <p>{shipmentData.sender.address.addressLine1}</p>
//               </div>
//               <div className="summary-section">
//                 <h3>Receiver</h3>
//                 <p>{shipmentData.receiver.name}</p>
//                 <p>{shipmentData.receiver.phone}</p>
//                 <p>{shipmentData.receiver.email}</p>
//                 <p>{shipmentData.receiver.address.addressLine1}</p>
//               </div>
//             </div>
//             <div className="summary-details">
//               <div className="detail-row">
//                 <span>Vehicle Type:</span>
//                 <span>{vehicleTypes.find(v => v.type === shipmentData.vehicleType)?.name}</span>
//               </div>
//               <div className="detail-row">
//                 <span>Distance:</span>
//                 <span>{shipmentData.distance.toFixed(2)} km</span>
//               </div>
//               <div className="detail-row">
//                 <span>Rate:</span>
//                 <span>₹{vehicleTypes.find(v => v.type === shipmentData.vehicleType)?.rate}/km</span>
//               </div>
//               <div className="detail-row total">
//                 <span>Total Cost:</span>
//                 <span>₹{shipmentData.cost.toFixed(2)}</span>
//               </div>
//             </div>
//             {error && <div className="error-message">{error}</div>}
//             <div className="form-actions">
//               <button type="button" className="btn-secondary" onClick={handleBack}>
//                 Back
//               </button>
//               <button
//                 type="button"
//                 className="btn-primary"
//                 onClick={handleSubmit}
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? 'Submitting...' : 'Confirm Order'}
//               </button>
//             </div>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="page-container">
//       <Header />
//       <div className="content-wrap">
//         <form className="form" onSubmit={handleSubmit}>
//           <h2>Sender Information</h2>
//           <div className="form-group">
//             <div className="form-row">
//               <div className="form-col">
//                 <label>Full Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={shipmentData.sender.name}
//                   onChange={(e) => handleInputChange(e, 'sender')}
//                   placeholder="Name"
//                   required
//                 />
//               </div>
//               <div className="form-col">
//                 <label>Phone Number</label>
//                 <div className="phone-input-container">
//                   <span className="phone-prefix">+91</span>
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={shipmentData.sender.phone}
//                     onChange={(e) => handleInputChange(e, 'sender')}
//                     placeholder="Phone Number"
//                     required
//                     pattern="[0-9]{10}"
//                     className="phone-input"
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="form-row">
//               <label>Sender Address</label>
//               <div className="address-input-container">
//                 <span className="address-icon">
//                   <FaMapMarkerAlt />
//                 </span>
//                 <input
//                   type="text"
//                   value={shipmentData.sender.address.addressLine1}
//                   onClick={() => navigateToAddressSelection('sender')}
//                   readOnly
//                   placeholder="Select sender address"
//                   required
//                   className="address-input"
//                 />
//                 <span className="address-arrow">
//                   <FaChevronRight />
//                 </span>
//               </div>
//             </div>
//           </div>

//           <h2>Receiver Information</h2>
//           <div className="form-group">
//             <div className="form-row">
//               <div className="form-col">
//                 <label>Full Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={shipmentData.receiver.name}
//                   onChange={(e) => handleInputChange(e, 'receiver')}
//                   placeholder="Name"
//                   required
//                 />
//               </div>
//               <div className="form-col">
//                 <label>Phone Number</label>
//                 <div className="phone-input-container">
//                   <span className="phone-prefix">+91</span>
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={shipmentData.receiver.phone}
//                     onChange={(e) => handleInputChange(e, 'receiver')}
//                     placeholder="Phone number"
//                     required
//                     pattern="[0-9]{10}"
//                     className="phone-input"
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="form-row">
//               <label>Receiver Address</label>
//               <div className="address-input-container">
//                 <span className="address-icon">
//                   <FaMapMarkerAlt />
//                 </span>
//                 <input
//                   type="text"
//                   value={shipmentData.receiver.address.addressLine1}
//                   onClick={() => navigateToAddressSelection('receiver')}
//                   readOnly
//                   placeholder="Select receiver address"
//                   required
//                   className="address-input"
//                 />
//                 <span className="address-arrow">
//                   <FaChevronRight />
//                 </span>
//               </div>
//             </div>
//           </div>

//           <h2>Select Vehicle Type</h2>
//           <div className="vehicle-container">
//             {vehicleTypes.map((vehicle) => (
//               <div
//                 key={vehicle.type}
//                 className={`vehicle-card ${shipmentData.vehicleType === vehicle.type ? 'selected' : ''}`}
//                 onClick={() => handleVehicleSelect(vehicle.type)}
//               >
//                 <div className="vehicle-content">
//                   <div className="vehicle-main-info">
//                     <span className="vehicle-emoji">{vehicle.emoji}</span>
//                     <div className="vehicle-text">
//                       <h3 className="vehicle-name">{vehicle.name}</h3>
//                       <p className="vehicle-capacity">{vehicle.capacity}</p>
//                     </div>
//                   </div>
//                   <div className="vehicle-pricing">
//                     <p className="vehicle-rate">₹{vehicle.rate}/km</p>
//                     {distance > 0 && (
//                       <p className="estimated-cost">₹{(distance * vehicle.rate).toFixed(2)}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//           {error && <div className="error-message">{error}</div>}

//           <div className="form-actions">
//             <button
//               type="submit"
//               className="btn-primary"
//               disabled={
//                 !shipmentData.sender.name ||
//                 !shipmentData.sender.phone ||
//                 !shipmentData.sender.address.addressLine1 ||
//                 !shipmentData.receiver.name ||
//                 !shipmentData.receiver.phone ||
//                 !shipmentData.receiver.address.addressLine1 ||
//                 isSubmitting
//               }
//             >
//               {isSubmitting ? 'Calculating...' : 'Next'}
//             </button>
//           </div>
//         </form>
//       </div>
//       {/* <Footer /> */}
//     </div>
//   );
// }

// export default ShipmentPage;



// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import axios from 'axios';
// import Header from './Header';
// import Footer from './Footer';
// import LocationMap from './LocationMap';
// import { FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';
// import '../../styles/components.css';

// const vehicleTypes = [
//   { type: 'TwoWheeler', name: '2 Wheeler', rate: 20, emoji: '🛵', capacity: 'Up to 8kg' },
//   { type: 'ThreeWheeler', name: '3 Wheeler', rate: 30, emoji: '🛺', capacity: 'Up to 500kg' },
//   { type: 'Truck', name: 'Truck', rate: 40, emoji: '🚚', capacity: 'Up to 1200kg' }
// ];

// const paymentMethods = [
//   { id: 'razorpay', name: 'Pay Online', description: 'Secure payment with Razorpay', icon: '💳' },
//   { id: 'pay_after', name: 'Pay After Delivery', description: 'Pay online after delivery is completed', icon: '⏳' }
// ];

// const loadRazorpay = () => {
//   return new Promise((resolve) => {
//     if (window.Razorpay) {
//       console.log('Razorpay already loaded');
//       resolve(true);
//       return;
//     }

//     const script = document.createElement('script');
//     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//     script.onload = () => {
//       console.log('Razorpay script loaded successfully');
//       resolve(true);
//     };
//     script.onerror = () => {
//       console.error('Failed to load Razorpay script');
//       resolve(false);
//     };
//     document.body.appendChild(script);
//   });
// };

// const scrollToTop = () => {
//   window.scrollTo({ top: 0, behavior: 'smooth' });
// };

// function ShipmentPage() {
//   const [showSummary, setShowSummary] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);
//   const [trackingNumber, setTrackingNumber] = useState('');
//   const [calculatedCosts, setCalculatedCosts] = useState({});
//   const [distance, setDistance] = useState(0);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay');
//   const [paymentProcessing, setPaymentProcessing] = useState(false);
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
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
//   }, [showSummary, success]);

//   useEffect(() => {
//     if (location.state?.selectedAddress && location.state?.type) {
//       const { type, selectedAddress } = location.state;
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
//     return () => {
//       clearTimeout(debounceTimer.current);
//     };
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
//     scrollToTop();
//   };

//   const calculateDistance = async (isAutomatic = false) => {
//     const { sender, receiver } = shipmentData;

//     if (!sender.address.coordinates || !receiver.address.coordinates) {
//       if (!isAutomatic) {
//         setError('Please select valid addresses for both sender and receiver');
//       }
//       return false;
//     }

//     if (!isAutomatic) {
//       setIsSubmitting(true);
//     }
//     setError(null);

//     try {
//       const response = await axios.post('https://jio-yatri-user.onrender.com/api/shipments/calculate-distance', {
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
//       if (!isAutomatic) {
//         setIsSubmitting(false);
//       }
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
//         `https://jio-yatri-user.onrender.com/api/payment/${shipmentId}/initiate`,
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
//               'https://jio-yatri-user.onrender.com/api/payment/verify',
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

//     if (!showSummary) {
//       if (shipmentData.distance > 0) {
//         setShowSummary(true);
//       } else {
//         const success = await calculateDistance();
//         if (success) {
//           setShowSummary(true);
//         }
//       }
//       return;
//     }

//     if (!user) {
//       setError('Please login to create shipments');
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

//       const response = await axios.post('https://jio-yatri-user.onrender.com/api/shipments', payload, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       const shipmentId = response.data.shipment?._id;
//       setTrackingNumber(response.data.trackingNumber);

//       // Skip payment processing for Pay After Delivery option
//       if (shipmentData.paymentMethod === 'pay_after') {
//         setSuccess(true);
//         return;
//       }

//       // Only Razorpay payment remains
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

//   const handleBack = () => {
//     setShowSummary(false);
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
//                   navigate('/');
//                   scrollToTop();
//                 }}
//               >
//                 Back to Home
//               </button>
//             </div>
//           </div>
//         </div>
//         <Footer />
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

//   if (showSummary) {
//     return (
//       <div className="page-container">
//         <Header />
//         <div className="content-wrap">
//           <div className="review-booking-container">
//             <h2 className="review-title">📋 Review Booking</h2>

//             <div className="address-cards-container">
//               <div className="address-card sender-card">
//                 <div className="address-card-header">
//                   <span className="address-card-icon">📤</span>
//                   <h3 className="address-card-title">Sender Details</h3>
//                 </div>
//                 <div className="address-card-body">
//                   <div className="address-detail">
//                     <span className="detail-label">Name:</span>
//                     <span className="detail-value">{shipmentData.sender.name}</span>
//                   </div>
//                   <div className="address-detail">
//                     <span className="detail-label">Phone:</span>
//                     <span className="detail-value">{shipmentData.sender.phone}</span>
//                   </div>
//                   {shipmentData.sender.email && (
//                     <div className="address-detail">
//                       <span className="detail-label">Email:</span>
//                       <span className="detail-value">{shipmentData.sender.email}</span>
//                     </div>
//                   )}
//                   <div className="address-detail address-line">
//                     <span className="detail-label">Address:</span>
//                     <span className="detail-value">{shipmentData.sender.address.addressLine1}</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="address-card receiver-card">
//                 <div className="address-card-header">
//                   <span className="address-card-icon">📥</span>
//                   <h3 className="address-card-title">Receiver Details</h3>
//                 </div>
//                 <div className="address-card-body">
//                   <div className="address-detail">
//                     <span className="detail-label">Name:</span>
//                     <span className="detail-value">{shipmentData.receiver.name}</span>
//                   </div>
//                   <div className="address-detail">
//                     <span className="detail-label">Phone:</span>
//                     <span className="detail-value">{shipmentData.receiver.phone}</span>
//                   </div>
//                   {shipmentData.receiver.email && (
//                     <div className="address-detail">
//                       <span className="detail-label">Email:</span>
//                       <span className="detail-value">{shipmentData.receiver.email}</span>
//                     </div>
//                   )}
//                   <div className="address-detail address-line">
//                     <span className="detail-label">Address:</span>
//                     <span className="detail-value">{shipmentData.receiver.address.addressLine1}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="booking-map-container">
//               <LocationMap
//                 senderCoordinates={shipmentData.sender.address.coordinates}
//                 receiverCoordinates={shipmentData.receiver.address.coordinates}
//               />
//             </div>

//             <div className="booking-details">
//               <div className="booking-detail-item vehicle-detail">
//                 <span className="detail-icon">
//                   {vehicleTypes.find(v => v.type === shipmentData.vehicleType)?.emoji}
//                 </span>
//                 <div className="detail-content">
//                   <span className="detail-label">Selected Vehicle</span>
//                   <span className="detail-value">
//                     {vehicleTypes.find(v => v.type === shipmentData.vehicleType)?.name}
//                   </span>
//                 </div>
//               </div>

//               <div className="booking-detail-item">
//                 <span className="detail-icon">📏</span>
//                 <div className="detail-content">
//                   <span className="detail-label">Distance</span>
//                   <span className="detail-value">{shipmentData.distance.toFixed(2)} km</span>
//                 </div>
//               </div>

//               <div className="booking-detail-item">
//                 <span className="detail-icon">💰</span>
//                 <div className="detail-content">
//                   <span className="detail-label">Rate</span>
//                   <span className="detail-value">
//                     ₹{vehicleTypes.find(v => v.type === shipmentData.vehicleType)?.rate}/km
//                   </span>
//                 </div>
//               </div>

//               <div className="booking-detail-item total-detail">
//                 <span className="detail-icon">💵</span>
//                 <div className="detail-content">
//                   <span className="detail-label">Total Cost</span>
//                   <span className="detail-value">₹{shipmentData.cost.toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="payment-method-section">
//               <h3 className="payment-method-title">💳 Payment Method</h3>
//               <div className="payment-methods-container">
//                 {paymentMethods.map(method => (
//                   <div
//                     key={method.id}
//                     className={`payment-method-card ${selectedPaymentMethod === method.id ? 'selected' : ''}`}
//                     onClick={() => handlePaymentMethodSelect(method.id)}
//                     data-method={method.id}
//                   >
//                     <div className="payment-method-icon">{method.icon}</div>
//                     <div className="payment-method-info">
//                       <h4 className="payment-method-name">{method.name}</h4>
//                       <p className="payment-method-description">{method.description}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {error && <div className="error-message">{error}</div>}

//             <div className="form-actions">
//               <button
//                 type="button"
//                 className="btn-secondary"
//                 onClick={() => {
//                   handleBack();
//                   scrollToTop();
//                 }}
//               >
//                 Back
//               </button>
//               <button
//                 type="button"
//                 className="btn-primary"
//                 onClick={(e) => {
//                   handleSubmit(e);
//                   scrollToTop();
//                 }}
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
//               </button>
//             </div>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="page-container">
//       <Header />
//       <div className="content-wrap">
//         <form className="shipment-form" onSubmit={(e) => {
//           handleSubmit(e);
//           scrollToTop();
//         }}>
//           <div className="form-section">
//             <h2>Sender Information</h2>
//             <div className="form-group">
//               <div className="form-row">
//                 <div className="form-col">
//                   <label>Full Name</label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={shipmentData.sender.name}
//                     onChange={(e) => handleInputChange(e, 'sender')}
//                     placeholder="Name"
//                     required
//                   />
//                 </div>
//                 <div className="form-col">
//                   <label>Phone Number</label>
//                   <div className="phone-input-container">
//                     <span className="phone-prefix">+91</span>
//                     <input
//                       type="tel"
//                       name="phone"
//                       value={shipmentData.sender.phone}
//                       onChange={(e) => handleInputChange(e, 'sender')}
//                       placeholder="Phone Number"
//                       required
//                       pattern="[0-9]{10}"
//                       className="phone-input"
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="form-row">
//                 <label>Sender Address</label>
//                 <div className="address-input-container">
//                   <span className="address-icon">
//                     <FaMapMarkerAlt />
//                   </span>
//                   <input
//                     type="text"
//                     value={shipmentData.sender.address.addressLine1}
//                     onClick={() => navigateToAddressSelection('sender')}
//                     readOnly
//                     placeholder="Select sender address"
//                     required
//                     className="address-input"
//                   />
//                   <span className="address-arrow">
//                     <FaChevronRight />
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="form-section">
//             <h2>Receiver Information</h2>
//             <div className="form-group">
//               <div className="form-row">
//                 <div className="form-col">
//                   <label>Full Name</label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={shipmentData.receiver.name}
//                     onChange={(e) => handleInputChange(e, 'receiver')}
//                     placeholder="Name"
//                     required
//                   />
//                 </div>
//                 <div className="form-col">
//                   <label>Phone Number</label>
//                   <div className="phone-input-container">
//                     <span className="phone-prefix">+91</span>
//                     <input
//                       type="tel"
//                       name="phone"
//                       value={shipmentData.receiver.phone}
//                       onChange={(e) => handleInputChange(e, 'receiver')}
//                       placeholder="Phone number"
//                       required
//                       pattern="[0-9]{10}"
//                       className="phone-input"
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="form-row">
//                 <label>Receiver Address</label>
//                 <div className="address-input-container">
//                   <span className="address-icon">
//                     <FaMapMarkerAlt />
//                   </span>
//                   <input
//                     type="text"
//                     value={shipmentData.receiver.address.addressLine1}
//                     onClick={() => navigateToAddressSelection('receiver')}
//                     readOnly
//                     placeholder="Select receiver address"
//                     required
//                     className="address-input"
//                   />
//                   <span className="address-arrow">
//                     <FaChevronRight />
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="form-section">
//             <h2>Select Vehicle Type</h2>
//             <div className="vehicle-container">
//               {vehicleTypes.map((vehicle) => (
//                 <div
//                   key={vehicle.type}
//                   className={`vehicle-card ${shipmentData.vehicleType === vehicle.type ? 'selected' : ''}`}
//                   onClick={() => handleVehicleSelect(vehicle.type)}
//                 >
//                   <div className="vehicle-content">
//                     <div className="vehicle-main-info">
//                       <span className="vehicle-emoji">{vehicle.emoji}</span>
//                       <div className="vehicle-text">
//                         <h3 className="vehicle-name">{vehicle.name}</h3>
//                         <p className="vehicle-capacity">{vehicle.capacity}</p>
//                       </div>
//                     </div>
//                     <div className="vehicle-pricing">
//                       <p className="vehicle-rate">₹{vehicle.rate}/km</p>
//                       {shipmentData.distance > 0 && (
//                         <p className="estimated-cost">₹{(shipmentData.distance * vehicle.rate).toFixed(2)}</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {error && <div className="error-message">{error}</div>}

//           <div className="form-actions">
//             <button
//               type="submit"
//               className="btn-primary"
//               disabled={
//                 !shipmentData.sender.name ||
//                 !shipmentData.sender.phone ||
//                 !shipmentData.sender.address.addressLine1 ||
//                 !shipmentData.receiver.name ||
//                 !shipmentData.receiver.phone ||
//                 !shipmentData.receiver.address.addressLine1 ||
//                 isSubmitting
//               }
//             >
//               {isSubmitting ? 'Calculating...' : 'Book'}
//             </button>
//           </div>
//         </form>
//       </div>
//       <Footer />
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
import { FaMapMarkerAlt, FaChevronRight, FaUser, FaPhone, FaMapMarkedAlt } from 'react-icons/fa';
import '../../styles/FrontendShipment.css';

const vehicleTypes = [
  {
    type: 'TwoWheeler',
    name: '2 Wheeler',
    rate: 20,
    emoji: '🛵',
    capacity: 'Up to 8kg',
    available: true
  },
  {
    type: 'ThreeWheeler',
    name: '3 Wheeler',
    rate: 30,
    emoji: '🛺',
    capacity: 'Up to 500kg',
    available: true
  },
  {
    type: 'Truck',
    name: 'Truck',
    rate: 40,
    emoji: '🚚',
    capacity: 'Up to 1200kg',
    available: true
  },
  {
    type: 'Pickup9ft',
    name: 'Pickup (9ft)',
    rate: 50,
    emoji: '🛻',
    capacity: 'Up to 1700kg',
    available: true,
    // comingSoon: true
  },
  {
    type: 'Tata407',
    name: 'Tata 407',
    rate: 60,
    emoji: '🚛',
    capacity: 'Up to 2500kg',
    available: true,
    // comingSoon: true
  },
  {
    type: 'ContainerTruck',
    name: 'Container Truck',
    rate: 80,
    emoji: '🚒',
    capacity: 'Up to 5000kg',
    available: false,
    comingSoon: true
  }
];

const paymentMethods = [
  { id: 'razorpay', name: 'Pay Online', description: 'Secure payment with Razorpay', icon: '💳' },
  { id: 'pay_after', name: 'Pay After Delivery', description: 'Pay online after delivery is completed', icon: '⏳' }
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



function ShipmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(location.state?.currentStep || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [calculatedCosts, setCalculatedCosts] = useState({});
  const [distance, setDistance] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const debounceTimer = useRef(null);

  const steps = [
    { id: 1, title: "Sender/Receiver" },
    { id: 2, title: "Addresses" },
    { id: 3, title: "Vehicle" },
    { id: 4, title: "Summary" }
  ];

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
      vehicleType: 'TwoWheeler',
      distance: 0,
      cost: 0,
      paymentMethod: 'razorpay'
    };
  });


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
    const { selectedAddress, type, currentStep: stepFromState } = location.state || {};

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

      if (stepFromState) {
        setCurrentStep(stepFromState);
      } else {
        setCurrentStep(2);
      }

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

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
        shipmentData: shipmentData,
        currentStep: currentStep
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only proceed with payment if we're on the final step
    if (currentStep < steps.length) {
      return;
    }

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
        paymentMethod: shipmentData.paymentMethod
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

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!shipmentData.sender.name || !shipmentData.sender.phone ||
        !shipmentData.receiver.name || !shipmentData.receiver.phone) {
        setError('Please fill all sender and receiver details');
        return;
      }
    } else if (currentStep === 2) {
      if (!shipmentData.sender.address.addressLine1 || !shipmentData.receiver.address.addressLine1) {
        setError('Please select both pickup and delivery locations');
        return;
      }
    } else if (currentStep === 3) {
      if (!shipmentData.vehicleType) {
        setError('Please select a vehicle type');
        return;
      }
    }

    setError(null);
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="sender-receiver-section">
            {/* Map Background for Step 1 */}
            <div className="map-background">
              <LocationMap
                senderCoordinates={shipmentData.sender.address.coordinates}
                receiverCoordinates={shipmentData.receiver.address.coordinates}
                currentLocation={currentLocation}
              />
            </div>

            <div className="address-section">
              <div className="section-header">
                <h3 className="section-titles">Sender Information</h3>
              </div>
              <div className="input-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  name="name"
                  value={shipmentData.sender.name}
                  onChange={(e) => handleInputChange(e, 'sender')}
                  placeholder="Name"
                  required
                  className="transparent-input"
                />
              </div>
              <div className="input-group">
                <FaPhone className="input-icon" />
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
                    className="transparent-input phone-input"
                  />
                </div>
              </div>
            </div>

            <div className="address-section">
              <div className="section-header">
                <h3 className="section-titles">Receiver Information</h3>
              </div>
              <div className="input-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  name="name"
                  value={shipmentData.receiver.name}
                  onChange={(e) => handleInputChange(e, 'receiver')}
                  placeholder="Name"
                  required
                  className="transparent-input"
                />
              </div>
              <div className="input-group">
                <FaPhone className="input-icon" />
                <div className="phone-input-container">
                  <span className="phone-prefix">+91</span>
                  <input
                    type="tel"
                    name="phone"
                    value={shipmentData.receiver.phone}
                    onChange={(e) => handleInputChange(e, 'receiver')}
                    placeholder="Phone Number"
                    required
                    pattern="[0-9]{10}"
                    className="transparent-input phone-input"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <>
            <div className="address-overlay">
              <div className="sender-address-input">
                <FaMapMarkerAlt className="address-icon" />
                <input
                  type="text"
                  value={shipmentData.sender.address.addressLine1 || ''}
                  onClick={() => navigateToAddressSelection('sender')}
                  readOnly
                  placeholder="Pickup location"
                  className="address-text"
                />
                <FaChevronRight className="address-arrow" />
              </div>

              <div className="receiver-address-input">
                <FaMapMarkerAlt className="address-icon" />
                <input
                  type="text"
                  value={shipmentData.receiver.address.addressLine1 || ''}
                  onClick={() => navigateToAddressSelection('receiver')}
                  readOnly
                  placeholder="Delivery location"
                  className="address-text"
                />
                <FaChevronRight className="address-arrow" />
              </div>
            </div>

            <div className="map-navigation-buttons">
              <button
                type="button"
                className="map-nav-button button-secondary"
                onClick={handlePrevStep}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                type="button"
                className="map-nav-button button-primary"
                onClick={handleNextStep}
                disabled={isSubmitting}
              >
                Next
              </button>
            </div>
          </>
        );
      case 3:
        return (
          <div className="vehicle-selection-section">
            <div className="section-header">
              <div className="section-icon">🚚</div>
              <h3 className="section-titles">Select Vehicle</h3>
            </div>
            <div className="vehicle-options">
              {vehicleTypes.map((vehicle) => (
                <div
                  key={vehicle.type}
                  className={`vehicle-option ${shipmentData.vehicleType === vehicle.type ? 'selected' : ''} ${!vehicle.available ? 'unavailable' : ''}`}
                  onClick={() => vehicle.available && handleVehicleSelect(vehicle.type)}
                >
                  <span className="vehicle-emoji">{vehicle.emoji}</span>
                  <span className="vehicle-name">
                    {vehicle.name}
                    {vehicle.comingSoon && <span className="coming-soon-badge">Coming Soon</span>}
                  </span>
                  <span className="vehicle-capacity">{vehicle.capacity}</span>
                  {shipmentData.distance > 0 && (
                    <span className="vehicle-price">₹{(shipmentData.distance * vehicle.rate).toFixed(2)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="summary-section">
            <div className="section-header">
              <div className="section-icon">📋</div>
              <h3 className="section-titles">Order Summary</h3>
            </div>

            <div className="summary-item">
              <span className="summary-label">Sender:</span>
              <span className="summary-value">{shipmentData.sender.name}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Receiver:</span>
              <span className="summary-value">{shipmentData.receiver.name}</span>
            </div>
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
            <div className="summary-item">
              <span className="summary-label">Total Cost:</span>
              <span className="summary-value">₹{shipmentData.cost.toFixed(2)}</span>
            </div>

            <div className="payment-method-section">
              <h3 className="payment-method-title">💳 Payment Method</h3>
              <div className="payment-methods-container">
                {paymentMethods.map(method => (
                  <div
                    key={method.id}
                    className={`payment-method-card ${selectedPaymentMethod === method.id ? 'selected' : ''}`}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                    data-method={method.id}
                  >
                    <div className="payment-method-icon">{method.icon}</div>
                    <div className="payment-method-info">
                      <h4 className="payment-method-name">{method.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (success) {
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

  return (
    <div className="shipment-page">
      <Header />

      <div className="step-indicator">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`step ${currentStep > step.id ? 'completed' : ''} ${currentStep === step.id ? 'active' : ''}`}
          >
            {index > 0 && <div className="step-connector"></div>}
            <div className="step-number">{step.id}</div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>

      {currentStep === 2 && (
        <div className="map-background">
          <LocationMap
            senderCoordinates={shipmentData.sender.address.coordinates}
            receiverCoordinates={shipmentData.receiver.address.coordinates}
            currentLocation={currentLocation}
          />
        </div>
      )}

      <div className={`form-containers ${currentStep === 2 ? 'with-map-background' : ''}`}>
        {error && <div className="error-message">{error}</div>}

        {currentStep === 4 ? (
          <form onSubmit={handleSubmit} className="step-content active">
            {renderStepContent()}
            <div className="navigation-buttons">
              <button
                type="button"
                className="nav-button button-secondary"
                onClick={handlePrevStep}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                type="submit"
                className="nav-button button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        ) : (
          <div className="step-content active">
            {renderStepContent()}
            <div className="navigation-buttons">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="nav-button button-secondary"
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                >
                  Back
                </button>
              )}
              <button
                type="button"
                className="nav-button button-primary"
                onClick={handleNextStep}
                disabled={isSubmitting}
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ShipmentPage;