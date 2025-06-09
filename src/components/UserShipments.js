// src/components/UserShipments.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/UserShipments.css';
import Header from './pages/Header'
import Footer from './pages/Footer'
const UserShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, token, refreshToken } = useAuth();

  const fetchShipments = async (attempt = 1) => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        'https://jio-yatri-user.onrender.com/api/shipments/my-shipments',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShipments(response.data);
    } catch (err) {
      if (err.response?.status === 401 && attempt < 2) {
        // Token might be expired, try refreshing once
        const freshToken = await refreshToken();
        if (freshToken) {
          return fetchShipments(attempt + 1);
        }
      }

      console.error('Error fetching shipments:', err);
      setError(
        err.response?.data?.message ||
        'Failed to fetch shipments. Please try again.'
      );

      if (err.response?.status === 401) {
        // Redirect to login if still unauthorized after refresh
        setTimeout(() => window.location.href = '/login', 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchShipments();
    }
  }, [user, token]);

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
    <Header/>
    <div className="shipments-container">
      <h2>Your Shipments</h2>
      
      {shipments.length === 0 ? (
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
                {/* <span className="status-badge">{shipment.status || 'Processing'}</span> */}
                <span className="created-date">
                  {new Date(shipment.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              <div className="shipment-details-grid">
                <div className="sender-details">
                  <h4>Sender</h4>
                  <p><strong>Name:</strong> {shipment.senderName}</p>
                  <p><strong>Phone:</strong> {shipment.senderPhone}</p>
                  {shipment.senderEmail && <p><strong>Email:</strong> {shipment.senderEmail}</p>}
                  <p><strong>Address:</strong> {shipment.senderAddressLine1}</p>
                </div>
                
                <div className="receiver-details">
                  <h4>Receiver</h4>
                  <p><strong>Name:</strong> {shipment.receiverName}</p>
                  <p><strong>Phone:</strong> {shipment.receiverPhone}</p>
                  {shipment.receiverEmail && <p><strong>Email:</strong> {shipment.receiverEmail}</p>}
                  <p><strong>Address:</strong> {shipment.receiverAddressLine1}</p>
                </div>
                
                <div className="shipment-meta">
                  <h4>Shipment Details</h4>
                  <p><strong>Vehicle Type:</strong> {shipment.vehicleType}</p>
                  <p><strong>Distance:</strong> {shipment.distance} km</p>
                  <p><strong>Cost:</strong> ₹{shipment.cost?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
    <Footer/>
    </>
  );
};

export default UserShipments;