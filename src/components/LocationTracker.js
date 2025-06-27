import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/LocationTracker.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL ='http://localhost:5000';

const EtaDisplay = React.memo(({ etaToSender, etaToReceiver, distanceToSender, distanceToReceiver }) => (
  <div className="eta-display">
    {etaToSender && (
      <p><strong>To Sender:</strong> {distanceToSender} - ETA: {etaToSender}</p>
    )}
    {etaToReceiver && (
      <p><strong>To Receiver:</strong> {distanceToReceiver} - ETA: {etaToReceiver}</p>
    )}
  </div>
));

const LocationTracker = ({ shipment }) => {
  const { user } = useAuth();
  const [updatedShipment, setUpdatedShipment] = useState(shipment);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [etaToSender, setEtaToSender] = useState('');
  const [distanceToSender, setDistanceToSender] = useState('');
  const [etaToReceiver, setEtaToReceiver] = useState('');
  const [distanceToReceiver, setDistanceToReceiver] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(5000); // Default 5 seconds

  // Refs for map components
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const senderMarkerRef = useRef(null);
  const receiverMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const googleMapsScriptRef = useRef(null);
  const pollingRef = useRef(null);

  // Extract coordinates from shipment data
  const driverCoords = updatedShipment?.driverLocation?.coordinates || [];
  const senderCoords = updatedShipment?.sender?.address?.coordinates || {};
  const receiverCoords = updatedShipment?.receiver?.address?.coordinates || {};

  // Initialize the map
  const initMap = useCallback(() => {
    if (!mapContainerRef.current || !window.google?.maps) return;

    const center = driverCoords.length 
      ? { lat: driverCoords[1], lng: driverCoords[0] }
      : { lat: 12.9716, lng: 77.5946 }; // Default to Bangalore coordinates

    mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
      zoom: 15,
      center,
      mapTypeId: 'roadmap',
      disableDefaultUI: true,
      zoomControl: true,
    });

    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: {
        strokeColor: '#4285F4',
        strokeWeight: 6,
        strokeOpacity: 0.8,
      },
    });

    directionsRendererRef.current.setMap(mapRef.current);
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    setMapLoaded(true);
  }, [driverCoords]);

  // Update the route and markers on the map
  const updateRoute = useCallback(() => {
    if (!mapRef.current || !window.google?.maps || !updatedShipment) return;

    const driverLatLng = { 
      lat: driverCoords[1], 
      lng: driverCoords[0] 
    };
    const senderLatLng = { 
      lat: senderCoords.lat, 
      lng: senderCoords.lng 
    };
    const receiverLatLng = { 
      lat: receiverCoords.lat, 
      lng: receiverCoords.lng 
    };

    // Validate coordinates
    if (!driverLatLng.lat || !senderLatLng.lat || !receiverLatLng.lat) {
      return;
    }

    // Update or create driver marker
    if (!driverMarkerRef.current) {
      driverMarkerRef.current = new window.google.maps.Marker({
        position: driverLatLng,
        map: mapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#EA4335',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
        },
        title: 'Driver Location',
      });
    } else {
      driverMarkerRef.current.setPosition(driverLatLng);
    }

    // Update or create sender marker
    if (!senderMarkerRef.current) {
      senderMarkerRef.current = new window.google.maps.Marker({
        position: senderLatLng,
        map: mapRef.current,
        label: { text: 'S', color: '#FFFFFF' },
        icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      });
    } else {
      senderMarkerRef.current.setPosition(senderLatLng);
    }

    // Update or create receiver marker
    if (!receiverMarkerRef.current) {
      receiverMarkerRef.current = new window.google.maps.Marker({
        position: receiverLatLng,
        map: mapRef.current,
        label: { text: 'R', color: '#FFFFFF' },
        icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      });
    }

    // Calculate and display route
    directionsServiceRef.current.route(
      {
        origin: driverLatLng,
        destination: receiverLatLng,
        waypoints: [{ location: senderLatLng, stopover: true }],
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      },
      (result, status) => {
        if (status === 'OK') {
          // Clear previous route before drawing new one
          directionsRendererRef.current.setDirections({ routes: [] });
          directionsRendererRef.current.setDirections(result);
          setRouteError(null);

          // Update ETA and distance information
          const legs = result.routes[0].legs;
          if (legs.length === 2) {
            setDistanceToSender(legs[0].distance.text);
            setEtaToSender(legs[0].duration.text);
            setDistanceToReceiver(legs[1].distance.text);
            setEtaToReceiver(legs[1].duration.text);
          }
        } else {
          setRouteError(`Unable to calculate route: ${status}`);
          console.error('Directions request failed:', status);
        }
      }
    );
  }, [updatedShipment, driverCoords, senderCoords, receiverCoords]);

  // Fetch updated shipment data with driver location
  const fetchShipmentData = useCallback(async () => {
    try {
      const token = await user.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/api/shipments/${shipment._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setUpdatedShipment(response.data);
        return true;
      }
    } catch (error) {
      console.error('Failed to update shipment data:', error);
      toast.error('Failed to get driver location updates');
      return false;
    }
  }, [shipment._id, user]);

  // Start polling for driver location updates
  const startPolling = useCallback(() => {
    if (isPolling || !shipment?._id) return;

    setIsPolling(true);
    pollingRef.current = setInterval(async () => {
      const success = await fetchShipmentData();
      if (!success) {
        // If failed, increase interval to reduce load
        setPollingInterval(prev => Math.min(prev * 2, 30000)); // Max 30 seconds
      } else {
        // Reset to default interval on success
        setPollingInterval(5000);
      }
    }, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchShipmentData, isPolling, pollingInterval, shipment?._id]);

  // Stop polling for driver location updates
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!window.google && !googleMapsScriptRef.current) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initMap();
        if (driverCoords.length) {
          updateRoute();
        }
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        toast.error('Failed to load map. Please refresh the page.');
      };
      document.body.appendChild(script);
      googleMapsScriptRef.current = script;
    } else if (!mapRef.current && window.google?.maps) {
      initMap();
    }

    return () => {
      if (googleMapsScriptRef.current) {
        document.body.removeChild(googleMapsScriptRef.current);
      }
    };
  }, [initMap, driverCoords.length, updateRoute]);

  // Update map when data changes
  useEffect(() => {
    if (mapLoaded && driverCoords.length) {
      updateRoute();
    }
  }, [mapLoaded, driverCoords, updateRoute]);

  // Start/stop polling based on shipment status
  useEffect(() => {
    if (shipment?._id && !['delivered', 'cancelled'].includes(shipment.status)) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [shipment?._id, shipment?.status, startPolling, stopPolling]);

  // Adjust polling interval when it changes
  useEffect(() => {
    if (isPolling) {
      stopPolling();
      startPolling();
    }
  }, [pollingInterval, isPolling, startPolling, stopPolling]);

  // Recenter map button handler
  const handleRecenter = () => {
    if (mapRef.current && driverCoords.length) {
      mapRef.current.panTo({ 
        lat: driverCoords[1], 
        lng: driverCoords[0] 
      });
      mapRef.current.setZoom(15);
    }
  };

  if (!shipment) {
    return (
      <div className="no-shipment-map">
        <p>No active shipment selected</p>
      </div>
    );
  }

  return (
    <div className="location-tracker-container">
      <div 
        ref={mapContainerRef} 
        className="map-container" 
        style={{ height: '100%', width: '100%' }}
      />
      
      <button 
        onClick={handleRecenter} 
        className="recenter-button"
        aria-label="Recenter map on driver location"
      >
        📍
      </button>
      
      <div className="map-controls">
        <button 
          onClick={isPolling ? stopPolling : startPolling}
          className={`polling-toggle ${isPolling ? 'active' : ''}`}
        >
          {isPolling ? 'Pause Updates' : 'Resume Updates'}
        </button>
      </div>
      
      <EtaDisplay
        etaToSender={etaToSender}
        etaToReceiver={etaToReceiver}
        distanceToSender={distanceToSender}
        distanceToReceiver={distanceToReceiver}
      />
      
      {routeError && (
        <div className="error-message">
          <p>{routeError}</p>
        </div>
      )}
      
      <div className="status-info">
        <p>Update interval: {pollingInterval / 1000} seconds</p>
        <p>Last update: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default LocationTracker;
