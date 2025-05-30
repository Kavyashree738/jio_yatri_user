import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ShipmentContext = createContext();

export const ShipmentProvider = ({ children }) => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const { user } = useAuth();

  const fetchShipments = async (page = 1, limit = 10, status = '') => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.get(
        `/api/shipments/user?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`,
        config
      );

      setShipments(response.data.shipments);
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch shipments');
      console.error('Fetch shipments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createShipment = async (shipmentData) => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.post('/api/shipments', shipmentData, config);
      
      // Add the new shipment to the beginning of the list
      setShipments(prev => [response.data.shipment, ...prev]);
      
      return {
        success: true,
        trackingNumber: response.data.trackingNumber,
        shipment: response.data.shipment
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shipment');
      console.error('Create shipment error:', err);
      return { success: false, error: err.response?.data };
    } finally {
      setLoading(false);
    }
  };

  const cancelShipment = async (shipmentId) => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.put(
        `/api/shipments/${shipmentId}/cancel`,
        {},
        config
      );

      // Update the shipment in the list
      setShipments(prev =>
        prev.map(shipment =>
          shipment._id === shipmentId ? response.data.shipment : shipment
        )
      );

      return { success: true, shipment: response.data.shipment };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel shipment');
      console.error('Cancel shipment error:', err);
      return { success: false, error: err.response?.data };
    } finally {
      setLoading(false);
    }
  };

  // Fetch shipments on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchShipments();
    }
  }, [user]);

  return (
    <ShipmentContext.Provider
      value={{
        shipments,
        loading,
        error,
        pagination,
        fetchShipments,
        createShipment,
        cancelShipment
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
};

export const useShipments = () => useContext(ShipmentContext);