import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import '../../styles/MapDisplay.css'
const MapDisplay = ({ origin, destination }) => {
  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);

  useEffect(() => {
    if (!window.google || !origin || !destination) return;

    const initializeMap = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 7,
        center: { lat: 20.5937, lng: 78.9629 }, // Default center (India)
      });

      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5,
        },
      });
      directionsRendererRef.current.setMap(map);

      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: new window.google.maps.LatLng(origin[0], origin[1]),
          destination: new window.google.maps.LatLng(destination[0], destination[1]),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === 'OK') {
            directionsRendererRef.current.setDirections(response);
            
            // Add custom markers
            new window.google.maps.Marker({
              position: new window.google.maps.LatLng(origin[0], origin[1]),
              map: map,
              title: 'Pickup Location',
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              },
            });

            new window.google.maps.Marker({
              position: new window.google.maps.LatLng(destination[0], destination[1]),
              map: map,
              title: 'Delivery Location',
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              },
            });
          } else {
            console.error('Directions request failed due to ' + status);
          }
        }
      );
    };

    initializeMap();

    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [origin, destination]);

  return <div ref={mapRef} className="map-container" />;
};

MapDisplay.propTypes = {
  origin: PropTypes.array,
  destination: PropTypes.array,
};

export default MapDisplay;