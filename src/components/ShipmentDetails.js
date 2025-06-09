import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import '../styles/components.css';

function ShipmentDetails() {
  const { trackingNumber } = useParams();
  const { user } = useAuth();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShipmentDetails = async () => {
      try {
        const response = await axios.get(
          `https://jio-yatri-user.onrender.com/api/shipments/${trackingNumber}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          }
        );
        setShipment(response.data);
      } catch (error) {
        setError('Failed to load shipment details. Please try again.');
        console.error('Error fetching shipment details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchShipmentDetails();
    }
  }, [trackingNumber, user]);

  if (loading) return <div className="loading">Loading shipment details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!shipment) return <div>Shipment not found</div>;

  return (
    <div className="shipment-details-container">
      <h2>Shipment Details</h2>
      
      <div className="details-grid">
        <div className="details-section">
          <h3>Sender Information</h3>
          <p><strong>Name:</strong> {shipment.senderName}</p>
          <p><strong>Phone:</strong> {shipment.senderPhone}</p>
          <p><strong>Email:</strong> {shipment.senderEmail || 'N/A'}</p>
          <p><strong>Address:</strong> {shipment.senderAddressLine1}</p>
        </div>
        
        <div className="details-section">
          <h3>Receiver Information</h3>
          <p><strong>Name:</strong> {shipment.receiverName}</p>
          <p><strong>Phone:</strong> {shipment.receiverPhone}</p>
          <p><strong>Email:</strong> {shipment.receiverEmail || 'N/A'}</p>
          <p><strong>Address:</strong> {shipment.receiverAddressLine1}</p>
        </div>
      </div>
      
      <div className="shipment-info">
        <h3>Shipment Information</h3>
        <p><strong>Tracking Number:</strong> {shipment.trackingNumber}</p>
        <p><strong>Status:</strong> <span className={`status ${shipment.status}`}>{shipment.status}</span></p>
        <p><strong>Vehicle Type:</strong> {shipment.vehicleType}</p>
        <p><strong>Distance:</strong> {shipment.distance.toFixed(2)} km</p>
        <p><strong>Total Cost:</strong>₹{shipment.cost.toFixed(2)}</p>
        <p><strong>Created At:</strong> {new Date(shipment.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}

export default ShipmentDetails;