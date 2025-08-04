// // src/components/UserShipments.js
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';
// import '../styles/UserShipments.css';
// import Header from './pages/Header';
// import Footer from './pages/Footer';

// const UserShipments = () => {
//   const [shipments, setShipments] = useState([]);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const { user, token, refreshToken } = useAuth();

//   const fetchShipments = async (attempt = 1) => {
//     try {
//       setLoading(true);
//       setError('');

//       const response = await axios.get(
//         'http://localhost:5000/api/shipments/my-shipments',
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log(response.data)
//       setShipments(response.data);
//     } catch (err) {
//       if (err.response?.status === 401 && attempt < 2) {
//         // Token might be expired, try refreshing once
//         const freshToken = await refreshToken();
//         if (freshToken) {
//           return fetchShipments(attempt + 1);
//         }
//       }

//       console.error('Error fetching shipments:', err);
//       setError(
//         err.response?.data?.message ||
//         'Failed to fetch shipments. Please try again.'
//       );

//       if (err.response?.status === 401) {
//         // Redirect to login if still unauthorized after refresh
//         setTimeout(() => window.location.href = '/login', 2000);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       fetchShipments();
//     }
//   }, [user, token]);

//   if (loading) {
//     return (
//       <div className="shipments-loading">
//         <div className="loader"></div>
//         <p>Loading your shipments...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="shipments-error">
//         <p>{error}</p>
//         <button onClick={() => fetchShipments()}>Retry</button>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Header />
//       <div className="shipments-container">
//         <h2>Your Shipments</h2>
        
//         {shipments.length === 0 ? (
//           <div className="no-shipments">
//             <p>No shipments found.</p>
//             <a href="/new-shipment">Create your first shipment</a>
//           </div>
//         ) : (
//           <div className="shipments-list">
//             {shipments.map((shipment) => (
//               <div key={shipment._id} className="shipment-card">
//                 <div className="shipment-header">
//                   <h3>Tracking #: {shipment.trackingNumber}</h3>
//                   <span className="created-date">
//                     {new Date(shipment.createdAt).toLocaleDateString('en-US', {
//                       year: 'numeric',
//                       month: 'short',
//                       day: 'numeric',
//                       hour: '2-digit',
//                       minute: '2-digit'
//                     })}
//                   </span>
//                 </div>
                
//                 <div className="shipment-details-grid">
//                   <div className="sender-details">
//                     <h4>Sender</h4>
//                     <p><strong>Name:</strong> {shipment.sender.name}</p>
//                     <p><strong>Phone:</strong> {shipment.sender.phone}</p>
//                     {shipment.sender.email && <p><strong>Email:</strong> {shipment.sender.email}</p>}
//                     <p><strong>Address:</strong> {shipment.sender.address?.addressLine1 || 'N/A'}</p>
//                   </div>
                  
//                   <div className="receiver-details">
//                     <h4>Receiver</h4>
//                     <p><strong>Name:</strong> {shipment.receiver.name}</p>
//                     <p><strong>Phone:</strong> {shipment.receiver.phone}</p>
//                     {shipment.receiver.email && <p><strong>Email:</strong> {shipment.receiver.email}</p>}
//                     <p><strong>Address:</strong> {shipment.receiver.address?.addressLine1 || 'N/A'}</p>
//                   </div>
                  
//                   <div className="shipment-meta">
//                     <h4>Shipment Details</h4>
//                     <p><strong>Vehicle Type:</strong> {shipment.vehicleType}</p>
//                     <p><strong>Distance:</strong> {shipment.distance} km</p>
//                     <p><strong>Cost:</strong> ₹{shipment.cost?.toFixed(2) || '0.00'}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default UserShipments;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';
// import Header from './pages/Header';
// import Footer from './pages/Footer';
// import LocationTracker from './LocationTracker';
// import PaymentModal from './pages/PaymentModal';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import '../styles/UserShipments.css';

// const UserShipments = () => {
//   const [shipments, setShipments] = useState([]);
//   const [filteredShipments, setFilteredShipments] = useState([]);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [trackingShipment, setTrackingShipment] = useState(null);
//   const [paymentModalOpen, setPaymentModalOpen] = useState(false);
//   const [selectedShipment, setSelectedShipment] = useState(null);
//   const [pollingInterval, setPollingInterval] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
  
//   // Rating related state
//   const [ratingModalOpen, setRatingModalOpen] = useState(false);
//   const [currentShipmentForRating, setCurrentShipmentForRating] = useState(null);
//   const [rating, setRating] = useState(5);
//   const [feedback, setFeedback] = useState('');
//   const [isSubmittingRating, setIsSubmittingRating] = useState(false);

//   const { user, token, refreshToken } = useAuth();

//   const fetchShipments = async (attempt = 1) => {
//     try {
//       setLoading(true);
//       setError('');

//       const response = await axios.get(
//         `https://jio-yatri-user.onrender.com/api/shipments/my-shipments`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           timeout: 10000
//         }
//       );

//       setShipments(response.data);
//       setFilteredShipments(response.data);
//     } catch (err) {
//       if (err.code === 'ECONNREFUSED') {
//         setError('Backend server is not responding. Please try again later.');
//       } else if (err.response?.status === 401 && attempt < 2) {
//         const freshToken = await refreshToken();
//         if (freshToken) return fetchShipments(attempt + 1);
//       } else {
//         setError(
//           err.response?.data?.message ||
//           'Failed to fetch shipments. Please try again.'
//         );
//       }

//       if (err.response?.status === 401) {
//         setTimeout(() => (window.location.href = '/login'), 2000);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (term) => {
//     setSearchTerm(term);
//     if (!term) {
//       setFilteredShipments(shipments);
//       return;
//     }

//     const filtered = shipments.filter((shipment) => {
//       const searchLower = term.toLowerCase();
//       return (
//         shipment.trackingNumber.toLowerCase().includes(searchLower) ||
//         shipment.status.toLowerCase().includes(searchLower) ||
//         (shipment.assignedDriver?.name?.toLowerCase().includes(searchLower)) ||
//         shipment.sender.name.toLowerCase().includes(searchLower) ||
//         shipment.receiver.name.toLowerCase().includes(searchLower) ||
//         shipment.vehicleType.toLowerCase().includes(searchLower) ||
//         (shipment.payment?.method?.toLowerCase().includes(searchLower))
//       );
//     });
//     setFilteredShipments(filtered);
//   };

//   const startPolling = (intervalTime = 10000) => {
//     if (pollingInterval) {
//       clearInterval(pollingInterval);
//     }

//     fetchShipments();

//     const interval = setInterval(fetchShipments, intervalTime);
//     setPollingInterval(interval);

//     return interval;
//   };

//   useEffect(() => {
//     if (user) {
//       startPolling();

//       return () => {
//         if (pollingInterval) {
//           clearInterval(pollingInterval);
//         }
//       };
//     }
//   }, [user, token]);

//   useEffect(() => {
//     handleSearch(searchTerm);
//   }, [shipments]);

//   const handleTrackShipment = (shipment) => {
//     setTrackingShipment(shipment);
//     startPolling(5000);
//   };

//   const handleStopTracking = () => {
//     setTrackingShipment(null);
//     startPolling(10000);
//   };

//   const openPaymentModal = (shipment) => {
//     setSelectedShipment(shipment);
//     setPaymentModalOpen(true);
//   };

//   const handleCancelShipment = async (shipmentId) => {
//     try {
//       await axios.put(
//         `https://jio-yatri-user.onrender.com/api/shipments/${shipmentId}/cancel`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       toast.success('Shipment cancelled successfully');
//       fetchShipments();
//     } catch (err) {
//       console.error('Cancel error:', err);
//       toast.error(err.response?.data?.error || 'Failed to cancel shipment');
//     }
//   };

//   const handleOpenRatingModal = (shipment) => {
//     setCurrentShipmentForRating(shipment);
//     setRatingModalOpen(true);
//   };

//   const handleCloseRatingModal = () => {
//     setRatingModalOpen(false);
//     setRating(5);
//     setFeedback('');
//   };

//   const handleSubmitRating = async () => {
//   console.log('[Frontend] Starting rating submission...');
//   console.log('Current shipment:', currentShipmentForRating);
//   console.log('Rating:', rating);
//   console.log('Feedback:', feedback);

//   if (!currentShipmentForRating) {
//     console.error('[Frontend] No shipment selected for rating');
//     toast.error('No shipment selected');
//     return;
//   }

//   if (rating < 1 || rating > 5) {
//     console.error('[Frontend] Invalid rating value:', rating);
//     toast.error('Please select a rating between 1 and 5 stars');
//     return;
//   }

//   setIsSubmittingRating(true);
//   try {
//     const apiUrl = `https://jio-yatri-user.onrender.com/api/ratings`;
//     console.log('[Frontend] Sending POST request to:', apiUrl);
//     console.log('Request payload:', {
//       shipmentId: currentShipmentForRating._id,
//       rating,
//       feedback: feedback.trim()
//     });

//     const response = await axios.post(
//       apiUrl,
//       {
//         shipmentId: currentShipmentForRating._id,
//         rating,
//         feedback: feedback.trim()
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     console.log('[Frontend] Rating submission successful:', response.data);
//     toast.success('Rating submitted successfully!');
//     handleCloseRatingModal();
//     fetchShipments();
//   } catch (err) {
//     console.error('[Frontend] Rating submission error:', err);
//     console.error('Error details:', {
//       message: err.message,
//       response: err.response?.data,
//       status: err.response?.status,
//       headers: err.response?.headers,
//       config: err.config
//     });

//     toast.error(
//       err.response?.data?.error || 
//       'Failed to submit rating. Please try again later.'
//     );
//   } finally {
//     setIsSubmittingRating(false);
//   }
// };

//   const highlightText = (text) => {
//     if (!searchTerm || !text) return text;

//     const regex = new RegExp(`(${searchTerm})`, 'gi');
//     return text.toString().split(regex).map((part, i) =>
//       part.toLowerCase() === searchTerm.toLowerCase() ? (
//         <span key={i} className="highlight">{part}</span>
//       ) : (
//         part
//       )
//     );
//   };

//   if (loading && shipments.length === 0) {
//     return (
//       <div className="shipments-loading">
//         <div className="loader">
//           <div className="loader-circle"></div>
//           <div className="loader-circle"></div>
//           <div className="loader-circle"></div>
//         </div>
//         <div className="loading-text">Loading shipments</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="shipments-error">
//         <p>{error}</p>
//         <button onClick={() => fetchShipments()}>Retry</button>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Header />
//       <div className="shipments-container">
//         <h4>Your Shipments</h4>

//         <div className="search-container">
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => handleSearch(e.target.value)}
//             className="search-input"
//             placeholder="Search shipments..."
//           />
//           <button className="search-button">
//             <i className="search-icon">🔍</i>
//           </button>
//           {searchTerm && (
//             <button
//               className="clear-search-button"
//               onClick={() => handleSearch('')}
//             >
//               ✕
//             </button>
//           )}
//         </div>

//         {trackingShipment ? (
//           <div className="tracking-view">
//             <div className="tracking-header">
//               <h3>Tracking Shipment: {trackingShipment.trackingNumber}</h3>
//               <button onClick={handleStopTracking} className="stop-tracking-btn">
//                 Back to Shipments
//               </button>
//             </div>
//             <LocationTracker shipment={trackingShipment} />
//           </div>
//         ) : filteredShipments.length === 0 ? (
//           <div className="no-shipments">
//             {searchTerm ? (
//               <p>No shipments match your search criteria.</p>
//             ) : (
//               <p>No shipments found.</p>
//             )}
//             <a href="/shipment">Create your first shipment</a>
//           </div>
//         ) : (
//           <div className="shipments-list">
//             {filteredShipments.map((shipment) => (
//               <div key={shipment._id} className="shipment-card">
//                 <div className="shipment-header">
//                   <h3>Tracking #: {highlightText(shipment.trackingNumber)}</h3>
//                   <span className="created-date">
//                     {new Date(shipment.createdAt).toLocaleDateString('en-US', {
//                       year: 'numeric',
//                       month: 'short',
//                       day: 'numeric',
//                       hour: '2-digit',
//                       minute: '2-digit',
//                     })}
//                   </span>
//                 </div>

//                 <div className="shipment-details-grid">
//                   <div className="sender-details">
//                     <h4>Sender</h4>
//                     <p><strong>Name:</strong> {highlightText(shipment.sender.name)}</p>
//                     <p><strong>Phone:</strong> {shipment.sender.phone}</p>
//                     {shipment.sender.email && <p><strong>Email:</strong> {shipment.sender.email}</p>}
//                     <p><strong>Address:</strong> {shipment.sender.address?.addressLine1 || 'N/A'}</p>
//                   </div>

//                   <div className="receiver-details">
//                     <h4>Receiver</h4>
//                     <p><strong>Name:</strong> {highlightText(shipment.receiver.name)}</p>
//                     <p><strong>Phone:</strong> {shipment.receiver.phone}</p>
//                     {shipment.receiver.email && <p><strong>Email:</strong> {shipment.receiver.email}</p>}
//                     <p><strong>Address:</strong> {shipment.receiver.address?.addressLine1 || 'N/A'}</p>
//                   </div>

//                   <div className="shipment-meta">
//                     <h4>Shipment Details</h4>
//                     <p><strong>Vehicle Type:</strong> {highlightText(shipment.vehicleType)}</p>
//                     <p><strong>Distance:</strong> {shipment.distance} km</p>
//                     <p><strong>Cost:</strong> ₹{shipment.cost?.toFixed(2) || '0.00'}</p>
//                     <p><strong>Status:</strong> {highlightText(shipment.status)}</p>
//                     {shipment.status === 'cancelled' && shipment.cancellationReason && (
//                       <p><strong>Cancellation Reason:</strong> {shipment.cancellationReason}</p>
//                     )}
//                     {shipment.assignedDriver && (
//                       <p><strong>Driver:</strong> {highlightText(shipment.assignedDriver.name)} ({shipment.assignedDriver.vehicleNumber})</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="shipment-actions">
//                   {(shipment.status === 'pending' || shipment.status === 'assigned') && (
//                     <button onClick={() => handleCancelShipment(shipment._id)} className="cancel-btn">
//                       Cancel Shipment
//                     </button>
//                   )}

//                   {shipment.status === 'assigned' && (
//                     <button onClick={() => handleTrackShipment(shipment)} className="track-shipment-btn">
//                       Track Shipment
//                     </button>
//                   )}

//                   {shipment.status === 'delivered' && shipment.payment?.status === 'pending' && (
//                     <button onClick={() => openPaymentModal(shipment)} className="pay-now-btn">
//                       Complete Payment
//                     </button>
//                   )}

//                   {shipment.status === 'delivered' && shipment.payment?.status === 'paid' && (
//                     <div className="shipment-rating-section">
//                       {shipment.rating ? (
//                         <div className="rating-submitted">
//                           <span>Your rating: {shipment.rating.value} ★</span>
//                           {shipment.rating.feedback && (
//                             <p className="rating-feedback-text">"{shipment.rating.feedback}"</p>
//                           )}
//                         </div>
//                       ) : (
//                         <button
//                           className="rate-driver-btn"
//                           onClick={() => handleOpenRatingModal(shipment)}
//                         >
//                           Rate This Driver
//                         </button>
//                       )}
//                     </div>
//                   )}

//                   {shipment.status !== 'cancelled' && (
//                     <div className="payment-info">
//                       <p>
//                         <strong>Payment Status:</strong>{' '}
//                         <span className={`payment-status ${shipment.payment?.status}`}>
//                           {highlightText(shipment.payment?.status || 'Not Available')}
//                         </span>
//                       </p>

//                       {shipment.payment?.status === 'paid' && (
//                         <>
//                           <p><strong>Method:</strong> {highlightText(shipment.payment.method)}</p>
//                           <p>
//                             <strong>Date:</strong>{' '}
//                             {shipment.payment.collectedAt
//                               ? new Date(shipment.payment.collectedAt).toLocaleDateString()
//                               : 'N/A'}
//                           </p>
//                         </>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {paymentModalOpen && selectedShipment && (
//         <PaymentModal
//           shipment={selectedShipment}
//           onClose={() => setPaymentModalOpen(false)}
//           refreshShipments={fetchShipments}
//         />
//       )}

//       {ratingModalOpen && (
//         <div className="rating-modal-overlay">
//           <div className="rating-modal">
//             <h3>Rate Your Driver</h3>
//             <p>How was your experience with {currentShipmentForRating?.assignedDriver?.name}?</p>
            
//             <div className="rating-stars">
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <span
//                   key={star}
//                   className={star <= rating ? 'star-filled' : 'star-empty'}
//                   onClick={() => setRating(star)}
//                 >
//                   ★
//                 </span>
//               ))}
//             </div>
            
//             <textarea
//               placeholder="Optional feedback (what went well, what could improve?)"
//               value={feedback}
//               onChange={(e) => setFeedback(e.target.value)}
//               className="rating-feedback"
//               maxLength={500}
//             />
//             <div className="feedback-counter">{feedback.length}/500</div>
            
//             <div className="rating-modal-actions">
//               <button 
//                 className="cancel-rating"
//                 onClick={handleCloseRatingModal}
//                 disabled={isSubmittingRating}
//               >
//                 Cancel
//               </button>
//               <button 
//                 className="submit-rating"
//                 onClick={handleSubmitRating}
//                 disabled={isSubmittingRating}
//               >
//                 {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <Footer />
//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />
//     </>
//   );
// };

// export default UserShipments;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './pages/Header';
import Footer from './pages/Footer';
import LocationTracker from './LocationTracker';
import PaymentModal from './pages/PaymentModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/UserShipments.css';

const UserShipments = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [trackingShipment, setTrackingShipment] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Rating related state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [currentShipmentForRating, setCurrentShipmentForRating] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const { user, token, refreshToken } = useAuth();

  const fetchShipments = async (attempt = 1) => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        `http://localhost:5000/api/shipments/my-shipments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000
        }
      );

      setShipments(response.data);
      setFilteredShipments(response.data);
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        setError('Backend server is not responding. Please try again later.');
      } else if (err.response?.status === 401 && attempt < 2) {
        const freshToken = await refreshToken();
        if (freshToken) return fetchShipments(attempt + 1);
      } else {
        setError(
          err.response?.data?.message ||
          'Failed to fetch shipments. Please try again.'
        );
      }

      if (err.response?.status === 401) {
        setTimeout(() => (window.location.href = '/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredShipments(shipments);
      return;
    }

    const filtered = shipments.filter((shipment) => {
      const searchLower = term.toLowerCase();
      return (
        shipment.trackingNumber.toLowerCase().includes(searchLower) ||
        shipment.status.toLowerCase().includes(searchLower) ||
        (shipment.assignedDriver?.name?.toLowerCase().includes(searchLower)) ||
        shipment.sender.name.toLowerCase().includes(searchLower) ||
        shipment.receiver.name.toLowerCase().includes(searchLower) ||
        shipment.vehicleType.toLowerCase().includes(searchLower) ||
        (shipment.payment?.method?.toLowerCase().includes(searchLower))
      );
    });
    setFilteredShipments(filtered);
  };

  const startPolling = (intervalTime = 10000) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    fetchShipments();

    const interval = setInterval(fetchShipments, intervalTime);
    setPollingInterval(interval);

    return interval;
  };

  useEffect(() => {
    if (user) {
      startPolling();

      return () => {
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      };
    }
  }, [user, token]);

  useEffect(() => {
    if (user) {
      handleSearch(searchTerm);
    }
  }, [shipments, user]);

  const handleTrackShipment = (shipment) => {
    setTrackingShipment(shipment);
    startPolling(5000);
  };

  const handleStopTracking = () => {
    setTrackingShipment(null);
    startPolling(10000);
  };

  const openPaymentModal = (shipment) => {
    setSelectedShipment(shipment);
    setPaymentModalOpen(true);
  };

  const handleCancelShipment = async (shipmentId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/shipments/${shipmentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('Shipment cancelled successfully', { autoClose: 5000 });
      fetchShipments();
    } catch (err) {
      console.error('Cancel error:', err);
      toast.error(err.response?.data?.error || 'Failed to cancel shipment', { autoClose: 5000 });
    }
  };

  const handleOpenRatingModal = (shipment) => {
    setCurrentShipmentForRating(shipment);
    setRatingModalOpen(true);
  };

  const handleCloseRatingModal = () => {
    setRatingModalOpen(false);
    setRating(5);
    setFeedback('');
  };

  const handleSubmitRating = async () => {
    if (!currentShipmentForRating) {
      toast.error('No shipment selected', { autoClose: 5000 });
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars', { autoClose: 5000 });
      return;
    }

    setIsSubmittingRating(true);
    try {
      await axios.post(
        `http://localhost:5000/api/ratings`,
        {
          shipmentId: currentShipmentForRating._id,
          rating,
          feedback: feedback.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('Rating submitted successfully!', { autoClose: 5000 });
      handleCloseRatingModal();
      fetchShipments();
    } catch (err) {
      console.error('Rating error:', err);
      toast.error(
        err.response?.data?.error || 
        'Failed to submit rating. Please try again later.'
      , { autoClose: 5000 });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const highlightText = (text) => {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.toString().split(regex).map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={i} className="highlight">{part}</span>
      ) : (
        part
      )
    );
  };

  // Early return if user is not logged in
  if (!user) {
    return (
      <>
      <Header/>
      <div className="shipments-container">
        <div className="no-shipments">
          <h4>Your Shipments</h4>
          <p>Please log in to view or create shipments</p>
         <button 
              onClick={() => navigate('/home')}
              className="sign-in-button"
            >
              Sign in
            </button>
        </div>
      </div>
      <Footer/>
      </>
    );
  }

  if (loading && shipments.length === 0) {
    return (
      <div className="shipments-loading">
        <div className="loader">
          <div className="loader-circle"></div>
          <div className="loader-circle"></div>
          <div className="loader-circle"></div>
        </div>
        <div className="loading-text">Loading shipments</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shipments-error">
        <p>{error}</p>
        <button onClick={() => fetchShipments()}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="shipments-container">
        <h4>Your Shipments</h4>

        <div className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
            placeholder="Search shipments..."
          />
          <button className="search-button">
            <i className="search-icon">🔍</i>
          </button>
          {searchTerm && (
            <button
              className="clear-search-button"
              onClick={() => handleSearch('')}
            >
              ✕
            </button>
          )}
        </div>

        {trackingShipment ? (
          <div className="tracking-view">
            <div className="tracking-header">
              <h3>Tracking Shipment: {trackingShipment.trackingNumber}</h3>
              <button onClick={handleStopTracking} className="stop-tracking-btn">
                Back to Shipments
              </button>
            </div>
            <LocationTracker shipment={trackingShipment} />
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="no-shipments">
            {searchTerm ? (
              <p>No shipments match your search criteria.</p>
            ) : (
              <p>No shipments found.</p>
            )}
            <a href="/shipment">Create your first shipment</a>
          </div>
        ) : (
          <div className="shipments-list">
            {filteredShipments.map((shipment) => (
              <div key={shipment._id} className="shipment-card">
                <div className="shipment-header">
                  <h3>Tracking #: {highlightText(shipment.trackingNumber)}</h3>
                  <span className="created-date">
                    {new Date(shipment.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="shipment-details-grid">
                  <div className="sender-details">
                    <h4>Sender</h4>
                    <p><strong>Name:</strong> {highlightText(shipment.sender.name)}</p>
                    <p><strong>Phone:</strong> {shipment.sender.phone}</p>
                    {shipment.sender.email && <p><strong>Email:</strong> {shipment.sender.email}</p>}
                    <p><strong>Address:</strong> {shipment.sender.address?.addressLine1 || 'N/A'}</p>
                  </div>

                  <div className="receiver-details">
                    <h4>Receiver</h4>
                    <p><strong>Name:</strong> {highlightText(shipment.receiver.name)}</p>
                    <p><strong>Phone:</strong> {shipment.receiver.phone}</p>
                    {shipment.receiver.email && <p><strong>Email:</strong> {shipment.receiver.email}</p>}
                    <p><strong>Address:</strong> {shipment.receiver.address?.addressLine1 || 'N/A'}</p>
                  </div>

                  <div className="shipment-meta">
                    <h4>Shipment Details</h4>
                    <p><strong>Vehicle Type:</strong> {highlightText(shipment.vehicleType)}</p>
                    <p><strong>Distance:</strong> {shipment.distance} km</p>
                    <p><strong>Cost:</strong> ₹{shipment.cost?.toFixed(2) || '0.00'}</p>
                    <p><strong>Status:</strong> {highlightText(shipment.status)}</p>
                    {shipment.status === 'cancelled' && shipment.cancellationReason && (
                      <p><strong>Cancellation Reason:</strong> {shipment.cancellationReason}</p>
                    )}
                    {shipment.assignedDriver && (
                      <p><strong>Driver:</strong> {highlightText(shipment.assignedDriver.name)} ({shipment.assignedDriver.vehicleNumber})</p>
                    )}
                  </div>
                </div>

                <div className="shipment-actions">
                  {(shipment.status === 'pending' || shipment.status === 'assigned') && (
                    <button onClick={() => handleCancelShipment(shipment._id)} className="cancel-btn">
                      Cancel Shipment
                    </button>
                  )}

                  {shipment.status === 'assigned' && (
                    <button onClick={() => handleTrackShipment(shipment)} className="track-shipment-btn">
                      Track Shipment
                    </button>
                  )}

                  {shipment.status === 'delivered' && shipment.payment?.status === 'pending' && (
                    <button onClick={() => openPaymentModal(shipment)} className="pay-now-btn">
                      Complete Payment
                    </button>
                  )}

                  {shipment.status === 'delivered' && shipment.payment?.status === 'paid' && (
                    <div className="shipment-rating-section">
                      {shipment.rating ? (
                        <div className="rating-submitted">
                          <span>Your rating: {shipment.rating.value} ★</span>
                          {shipment.rating.feedback && (
                            <p className="rating-feedback-text">"{shipment.rating.feedback}"</p>
                          )}
                        </div>
                      ) : (
                        <button
                          className="rate-driver-btn"
                          onClick={() => handleOpenRatingModal(shipment)}
                        >
                          Rate This Driver
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {paymentModalOpen && selectedShipment && (
        <PaymentModal
          shipment={selectedShipment}
          onClose={() => setPaymentModalOpen(false)}
          refreshShipments={fetchShipments}
        />
      )}

      {ratingModalOpen && (
        <div className="rating-modal-overlay">
          <div className="rating-modal">
            <h3>Rate Your Driver</h3>
            <p>How was your experience with {currentShipmentForRating?.assignedDriver?.name}?</p>
            
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= rating ? 'star-filled' : 'star-empty'}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            
            <textarea
              placeholder="Optional feedback (what went well, what could improve?)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="rating-feedback"
              maxLength={500}
            />
            <div className="feedback-counter">{feedback.length}/500</div>
            
            <div className="rating-modal-actions">
              <button 
                className="cancel-rating"
                onClick={handleCloseRatingModal}
                disabled={isSubmittingRating}
              >
                Cancel
              </button>
              <button 
                className="submit-rating"
                onClick={handleSubmitRating}
                disabled={isSubmittingRating}
              >
                {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}

    
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Footer/>
    </>
  );
};

export default UserShipments;
