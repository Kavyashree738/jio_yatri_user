import React, { useEffect, useRef, useState } from 'react';
import useGoogleMaps from './useGoogleMaps';

const LocationMap = ({ senderCoordinates, receiverCoordinates }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const { loaded, error } = useGoogleMaps();

  useEffect(() => {
    if (!loaded || error || !mapRef.current) return;

    try {
      // Initialize map
      const google = window.google;
      const mapOptions = {
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: senderCoordinates || { lat: 0, lng: 0 }
      };

      const newMap = new google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);

      // Add markers
      const markers = [];
      
      if (senderCoordinates) {
        markers.push(new google.maps.Marker({
          position: senderCoordinates,
          map: newMap,
          title: 'Sender',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
          }
        }));
        newMap.setCenter(senderCoordinates);
      }

      if (receiverCoordinates) {
        markers.push(new google.maps.Marker({
          position: receiverCoordinates,
          map: newMap,
          title: 'Receiver',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }
        }));
      }

      // Add directions if both points exist
      if (senderCoordinates && receiverCoordinates) {
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map: newMap,
          suppressMarkers: true
        });

        directionsService.route({
          origin: senderCoordinates,
          destination: receiverCoordinates,
          travelMode: google.maps.TravelMode.DRIVING
        }, (response, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(response);
          }
        });
      }
    } catch (err) {
      console.error("Map error:", err);
    }
  }, [loaded, error, senderCoordinates, receiverCoordinates]);

  if (error) {
    return (
      <div className="map-error">
        Map Error: {error.message}
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!loaded) {
    return <div className="map-loading">Loading Map...</div>;
  }

  return (
    <div
      ref={mapRef}
      style={{
        height: '400px',
        width: '100%',
        backgroundColor: '#e9e9e9',
        borderRadius: '8px'
      }}
    />
  );
};

export default LocationMap;