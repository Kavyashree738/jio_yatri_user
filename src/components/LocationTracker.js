import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { debounce } from 'lodash';
import '../styles/LocationTracker.css';
import axios from 'axios';

const calculateDistance = (coord1, coord2) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

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

    directionsRendererRef.current.setMap(mapRef.current); // ✅ attach renderer
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

    // Sender marker
    if (!senderMarkerRef.current) {
      senderMarkerRef.current = new window.google.maps.Marker({
        position: senderLatLng,
        map: mapRef.current,
        label: { text: 'S', color: '#FFFFFF' },
        icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      });
    }

    // Receiver marker
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
          directionsRendererRef.current.setDirections(result);         // draw new
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

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initMap();
        if (driverCoords.length) {
          updateRoute();
        }
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
      />
      <button
        onClick={handleRecenter}
        className="recenter-button"
      >
        📍
      </button>
      <EtaDisplay
        etaToSender={etaToSender}
        etaToReceiver={etaToReceiver}
        distanceToSender={distanceToSender}
        distanceToReceiver={distanceToReceiver}
      />
      {routeError && (
        <p className="error-message">{routeError}</p>
      )}
    </div>
  );
};

export default LocationTracker;
