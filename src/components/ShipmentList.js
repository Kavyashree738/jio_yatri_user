import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// import '../styles/components.css';

function ShipmentList() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/shipments/user', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setShipments(response.data);
      } catch (error) {
        setError('Failed to load shipments. Please try again.');
        console.error('Error fetching shipments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchShipments();
    }
  }, [user]);

  const handleViewDetails = (trackingNumber) => {
    navigate(`/shipments/${trackingNumber}`);
  };

  if (loading) return <div className="loading">Loading shipments...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="shipment-list-container">
      <h2>Your Shipments</h2>
      
      {shipments.length === 0 ? (
        <p>No shipments found. Create your first shipment!</p>
      ) : (
        <div className="shipment-grid">
          {shipments.map((shipment) => (
            <div key={shipment._id} className="shipment-card">
              <div className="shipment-header">
                <span className="tracking-number">{shipment.trackingNumber}</span>
                <span className={`status ${shipment.status}`}>{shipment.status}</span>
              </div>
              
              <div className="shipment-details">
                <p><strong>From:</strong> {shipment.senderName}</p>
                <p><strong>To:</strong> {shipment.receiverName}</p>
                <p><strong>Vehicle:</strong> {shipment.vehicleType}</p>
                <p><strong>Distance:</strong> {shipment.distance.toFixed(2)} km</p>
                <p><strong>Cost:</strong> ₹{shipment.cost.toFixed(2)}</p>
              </div>
              
              <button 
                onClick={() => handleViewDetails(shipment.trackingNumber)}
                className="btn-primary"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShipmentList;