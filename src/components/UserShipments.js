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

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Header from './pages/Header';
import Footer from './pages/Footer';
import LocationTracker from './LocationTracker';
import PaymentModal from './pages/PaymentModal';
import '../styles/UserShipments.css';

const UserShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [trackingShipment, setTrackingShipment] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  const { user, token, refreshToken } = useAuth();

  const fetchShipments = async (attempt = 1) => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get('http://localhost:5000/api/shipments/my-shipments', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShipments(response.data);
    } catch (err) {
      if (err.response?.status === 401 && attempt < 2) {
        const freshToken = await refreshToken();
        if (freshToken) return fetchShipments(attempt + 1);
      }

      setError(err.response?.data?.message || 'Failed to fetch shipments. Please try again.');

      if (err.response?.status === 401) {
        setTimeout(() => (window.location.href = '/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchShipments();
  }, [user, token]);

  const handleTrackShipment = (shipment) => {
    setTrackingShipment(shipment);
  };

  const handleStopTracking = () => {
    setTrackingShipment(null);
  };

  const openPaymentModal = (shipment) => {
    setSelectedShipment(shipment);
    setPaymentModalOpen(true);
  };

  if (loading) {
    return (
      <div className="shipments-loading">
        <div className="loader"></div>
        <p>Loading your shipments...</p>
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
        <h2>Your Shipments</h2>

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
        ) : shipments.length === 0 ? (
          <div className="no-shipments">
            <p>No shipments found.</p>
            <a href="/new-shipment">Create your first shipment</a>
          </div>
        ) : (
          <div className="shipments-list">
            {shipments.map((shipment) => (
              <div key={shipment._id} className="shipment-card">
                <div className="shipment-header">
                  <h3>Tracking #: {shipment.trackingNumber}</h3>
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
                    <p><strong>Name:</strong> {shipment.sender.name}</p>
                    <p><strong>Phone:</strong> {shipment.sender.phone}</p>
                    {shipment.sender.email && <p><strong>Email:</strong> {shipment.sender.email}</p>}
                    <p><strong>Address:</strong> {shipment.sender.address?.addressLine1 || 'N/A'}</p>
                  </div>

                  <div className="receiver-details">
                    <h4>Receiver</h4>
                    <p><strong>Name:</strong> {shipment.receiver.name}</p>
                    <p><strong>Phone:</strong> {shipment.receiver.phone}</p>
                    {shipment.receiver.email && <p><strong>Email:</strong> {shipment.receiver.email}</p>}
                    <p><strong>Address:</strong> {shipment.receiver.address?.addressLine1 || 'N/A'}</p>
                  </div>

                  <div className="shipment-meta">
                    <h4>Shipment Details</h4>
                    <p><strong>Vehicle Type:</strong> {shipment.vehicleType}</p>
                    <p><strong>Distance:</strong> {shipment.distance} km</p>
                    <p><strong>Cost:</strong> ₹{shipment.cost?.toFixed(2) || '0.00'}</p>
                    <p><strong>Status:</strong> {shipment.status}</p>
                    {shipment.assignedDriver && (
                      <p><strong>Driver:</strong> {shipment.assignedDriver.name} ({shipment.assignedDriver.vehicleNumber})</p>
                    )}
                  </div>
                </div>

                <div className="shipment-actions">
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

                  {/* ✅ Always show payment status */}
                  <div className="payment-info">
                    <p>
                      <strong>Payment Status:</strong>{' '}
                      <span className={`payment-status ${shipment.payment?.status}`}>
                        {shipment.payment?.status || 'Not Available'}
                      </span>
                    </p>

                    {shipment.payment?.status === 'paid' && (
                      <>
                        <p><strong>Method:</strong> {shipment.payment.method}</p>
                        <p>
                          <strong>Date:</strong>{' '}
                          {shipment.payment.collectedAt
                            ? new Date(shipment.payment.collectedAt).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </>
                    )}
                  </div>
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
      <Footer />
    </>
  );
};

export default UserShipments;
