import React from 'react';
import axios from 'axios';
import '../styles/components.css';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
function Summary({ shipmentData, onBack, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const handleSubmit = async () => {
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
          email: shipmentData.sender.email,
          address: { addressLine1: shipmentData.sender.address.addressLine1 }
        },
        receiver: {
          name: shipmentData.receiver.name,
          phone: shipmentData.receiver.phone,
          email: shipmentData.receiver.email,
          address: { addressLine1: shipmentData.receiver.address.addressLine1 }
        },
        vehicleType: shipmentData.vehicleType,
        distance: shipmentData.distance,
        cost: shipmentData.cost
      };
      console.log('Token being sent:', token); // Add this before the axios call
      const response = await axios.post('https://jio-yatri-user.onrender.com/api/shipments', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
        }
      });
      console.log(response)
      console.log(token)
      setSuccess(true);
      onSubmit();
    } catch (error) {
      setError('Failed to submit shipment. Please try again.');
      console.error('Shipment creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="summary-container">
        <h2>Order Confirmed!</h2>
        <p>Your shipment has been successfully created.</p>
        <div className="confirmation-details">
          <p>Tracking Number: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
          <p>Estimated Delivery: 2-3 business days</p>
        </div>
      </div>
    );
  }

  return (
    <div className="summary-container">
      <h2>Order Summary</h2>

      <div className="summary-grid">
        <div className="summary-section">
          <h3>Sender</h3>
          <p>{shipmentData.sender.name}</p>
          <p>{shipmentData.sender.phone}</p>
          <p>{shipmentData.sender.email}</p>
          <p>{shipmentData.sender.address?.addressLine1}</p>
          {/* <p>{shipmentData.sender.address?.city}, {shipmentData.sender.address?.state}</p>
          <p>{shipmentData.sender.address?.postalCode}, {shipmentData.sender.address?.country}</p> */}
        </div>

        <div className="summary-section">
          <h3>Receiver</h3>
          <p>{shipmentData.receiver.name}</p>
          <p>{shipmentData.receiver.phone}</p>
          <p>{shipmentData.receiver.email}</p>
          <p>{shipmentData.receiver.address?.addressLine1}</p>
          {/* <p>{shipmentData.receiver.address?.city}, {shipmentData.receiver.address?.state}</p>
          <p>{shipmentData.receiver.address?.postalCode}, {shipmentData.receiver.address?.country}</p> */}
        </div>
      </div>

      <div className="summary-details">
        <div className="detail-row">
          <span>Vehicle Type:</span>
          <span>{shipmentData.vehicleType}</span>
        </div>
        <div className="detail-row">
          <span>Distance:</span>
          <span>{shipmentData.distance.toFixed(2)} km</span>
        </div>
        <div className="detail-row total">
          <span>Total Cost:</span>
          <span>₹{shipmentData.cost.toFixed(2)}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onBack}
          disabled={isSubmitting}
        >
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
  );
}

export default Summary;