import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrdersList = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/shipments');
        setShipments(response.data.shipments);
      } catch (err) {
        console.error('Error fetching shipments:', err);
        setError('Failed to load shipments');
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  if (loading) return <p>Loading shipments...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>All Shipments</h2>
      {shipments.length === 0 ? (
        <p>No shipments found.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Tracking Number</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Vehicle</th>
              <th>Distance (km)</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment._id}>
                <td>{shipment.trackingNumber}</td>
                <td>{shipment.senderName}</td>
                <td>{shipment.receiverName}</td>
                <td>{shipment.vehicleType}</td>
                <td>{shipment.distance}</td>
                <td>{shipment.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersList;
