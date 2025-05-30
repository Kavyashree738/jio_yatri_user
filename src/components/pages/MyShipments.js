import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function MyShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await axios.get('/api/shipments/my-shipments', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setShipments(response.data.shipments);
      } catch (error) {
        console.error('Error fetching shipments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchShipments();
    }
  }, [user]);

  if (loading) return <div>Loading your shipments...</div>;

  return (
    <div className="shipments-container">
      <h2>My Shipments ({shipments.length})</h2>
      
      {shipments.length === 0 ? (
        <p>You haven't created any shipments yet.</p>
      ) : (
        <div className="shipments-list">
          {shipments.map(shipment => (
            <div key={shipment._id} className="shipment-card">
              <h3>Tracking #: {shipment.trackingNumber}</h3>
              <p>Status: {shipment.status || 'Processing'}</p>
              <p>From: {shipment.senderName}</p>
              <p>To: {shipment.receiverName}</p>
              <p>Cost: ${shipment.cost.toFixed(2)}</p>
              <p>Created: {new Date(shipment.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyShipments;