import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/LocationTracker.css';
import axios from 'axios';

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

const LocationTracker = ({ shipment: initialShipment }) => {
  const { user } = useAuth();
  const [shipment, setShipment] = useState(initialShipment);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [etaToSender, setEtaToSender] = useState('');
  const [distanceToSender, setDistanceToSender] = useState('');
  const [etaToReceiver, setEtaToReceiver] = useState('');
  const [distanceToReceiver, setDistanceToReceiver] = useState('');

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const senderMarkerRef = useRef(null);
  const receiverMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const googleMapsScriptRef = useRef(null);

  const driverCoords = shipment?.driverLocation?.coordinates || [];
  const senderCoords = shipment?.sender?.address?.coordinates || {};
  const receiverCoords = shipment?.receiver?.address?.coordinates || {};

  const API_BASE_URL = 'https://jio-yatri-user.onrender.com';

  // POLLING: fetch updated shipment every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!shipment?._id || !user) return;
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${API_BASE_URL}/api/shipments/${shipment._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShipment(res.data); // Update with new coordinates
      } catch (err) {
        console.error("Polling failed:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [shipment?._id, user]);

  const initMap = useCallback(() => {
    if (!mapContainerRef.current || !window.google || !window.google.maps) return;

    const center = driverCoords.length
      ? { lat: driverCoords[1], lng: driverCoords[0] }
      : { lat: 12.9716, lng: 77.5946 };

    mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
      zoom: 15,
      center,
      mapTypeId: 'roadmap'
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

  const updateRoute = useCallback(() => {
    if (!mapRef.current || !window.google || !shipment) return;

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

    if (!senderMarkerRef.current) {
      senderMarkerRef.current = new window.google.maps.Marker({
        position: senderLatLng,
        map: mapRef.current,
        label: { text: 'S', color: '#FFFFFF' },
        icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      });
    }

    if (!receiverMarkerRef.current) {
      receiverMarkerRef.current = new window.google.maps.Marker({
        position: receiverLatLng,
        map: mapRef.current,
        label: { text: 'R', color: '#FFFFFF' },
        icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      });
    }

    directionsServiceRef.current.route(
      {
        origin: driverLatLng,
        destination: receiverLatLng,
        waypoints: [{ location: senderLatLng, stopover: true }],
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections({ routes: [] }); // clear previous
          directionsRendererRef.current.setDirections(result);
          setRouteError(null);

          const legs = result.routes[0].legs;
          if (legs.length === 2) {
            setDistanceToSender(legs[0].distance.text);
            setEtaToSender(legs[0].duration.text);
            setDistanceToReceiver(legs[1].distance.text);
            setEtaToReceiver(legs[1].duration.text);
          }
        } else {
          setRouteError(`Route error: ${status}`);
        }
      }
    );
  }, [shipment, driverCoords, senderCoords, receiverCoords]);

  // Load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initMap();
        if (driverCoords.length) updateRoute();
      };
      document.body.appendChild(script);
      googleMapsScriptRef.current = script;

      return () => {
        if (googleMapsScriptRef.current) {
          document.body.removeChild(googleMapsScriptRef.current);
        }
      };
    } else if (!mapRef.current) {
      initMap();
    }
  }, [initMap]);

  // Update route whenever coordinates change
  useEffect(() => {
    if (mapLoaded && driverCoords.length) {
      updateRoute();
    }
  }, [mapLoaded, driverCoords, updateRoute]);

  const handleRecenter = () => {
    if (mapRef.current && driverCoords.length) {
      mapRef.current.panTo({
        lat: driverCoords[1],
        lng: driverCoords[0]
      });
    }
  };

  if (!shipment) {
    return <div className="no-shipment-map"><p>No active shipment selected</p></div>;
  }

  return (
    <div className="location-tracker-container">
      <div ref={mapContainerRef} className="map-container" style={{ height: '500px', width: '100%' }} />
      <button onClick={handleRecenter} className="recenter-button">📍</button>
      <EtaDisplay
        etaToSender={etaToSender}
        etaToReceiver={etaToReceiver}
        distanceToSender={distanceToSender}
        distanceToReceiver={distanceToReceiver}
      />
      {routeError && <p className="error-message">{routeError}</p>}
    </div>
  );
};

export default LocationTracker;
