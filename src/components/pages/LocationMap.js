// import React, { useEffect, useRef, useState } from 'react';
// import useGoogleMaps from './useGoogleMaps';

// const LocationMap = ({ senderCoordinates, receiverCoordinates }) => {
//   const mapRef = useRef(null);
//   const [map, setMap] = useState(null);
//   const { loaded, error } = useGoogleMaps();

//   useEffect(() => {
//     if (!loaded || error || !mapRef.current) return;

//     try {
//       // Initialize map
//       const google = window.google;
//       const mapOptions = {
//         zoom: 12,
//         mapTypeId: google.maps.MapTypeId.ROADMAP,
//         center: senderCoordinates || { lat: 0, lng: 0 }
//       };

//       const newMap = new google.maps.Map(mapRef.current, mapOptions);
//       setMap(newMap);

//       // Add markers
//       const markers = [];
      
//       if (senderCoordinates) {
//         markers.push(new google.maps.Marker({
//           position: senderCoordinates,
//           map: newMap,
//           title: 'Sender',
//           icon: {
//             url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
//           }
//         }));
//         newMap.setCenter(senderCoordinates);
//       }

//       if (receiverCoordinates) {
//         markers.push(new google.maps.Marker({
//           position: receiverCoordinates,
//           map: newMap,
//           title: 'Receiver',
//           icon: {
//             url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
//           }
//         }));
//       }

//       // Add directions if both points exist
//       if (senderCoordinates && receiverCoordinates) {
//         const directionsService = new google.maps.DirectionsService();
//         const directionsRenderer = new google.maps.DirectionsRenderer({
//           map: newMap,
//           suppressMarkers: true
//         });

//         directionsService.route({
//           origin: senderCoordinates,
//           destination: receiverCoordinates,
//           travelMode: google.maps.TravelMode.DRIVING
//         }, (response, status) => {
//           if (status === 'OK') {
//             directionsRenderer.setDirections(response);
//           }
//         });
//       }
//     } catch (err) {
//       console.error("Map error:", err);
//     }
//   }, [loaded, error, senderCoordinates, receiverCoordinates]);

//   if (error) {
//     return (
//       <div className="map-error">
//         Map Error: {error.message}
//         <button onClick={() => window.location.reload()}>Retry</button>
//       </div>
//     );
//   }

//   if (!loaded) {
//     return <div className="map-loading">Loading Map...</div>;
//   }

//   return (
//     <div
//       ref={mapRef}
//       style={{
//         height: '400px',
//         width: '100%',
//         backgroundColor: '#e9e9e9',
//         borderRadius: '8px'
//       }}
//     />
//   );
// };

// export default LocationMap;

import React, { useEffect, useRef, useState } from 'react';
import useGoogleMaps from './useGoogleMaps';

const LocationMap = ({ senderCoordinates, receiverCoordinates, currentLocation }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);
  const directionsRenderer = useRef(null);
  const { loaded, error } = useGoogleMaps();

  // // Debugging logs
  // console.log('Map Props:', {
  //   senderCoordinates,
  //   receiverCoordinates,
  //   currentLocation,
  //   loaded,
  //   error
  // });

  const clearMarkers = () => {
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
  };

  const clearDirections = () => {
    if (directionsRenderer.current) {
      directionsRenderer.current.setMap(null);
      directionsRenderer.current = null;
    }
  };

  const initializeMap = () => {
    if (!loaded || error || !mapRef.current) return;
    
    const google = window.google;
    let center = { lat: 20.5937, lng: 78.9629 }; // Default to India center
    
    // Priority for center: sender > current location > default
    if (senderCoordinates) {
      center = senderCoordinates;
    } else if (currentLocation) {
      center = currentLocation;
    }

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 12,
      center,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    updateMapMarkers();
  };

  const updateMapMarkers = () => {
    if (!mapInstance.current || !window.google) return;
    
    const google = window.google;
    clearMarkers();
    clearDirections();

    // Add current location marker (blue) if no sender coordinates
    if (currentLocation && !senderCoordinates) {
      markers.current.push(new google.maps.Marker({
        position: currentLocation,
        map: mapInstance.current,
        title: 'Your Location',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
      }));
      mapInstance.current.setCenter(currentLocation);
    }

    // Add sender marker (green)
    if (senderCoordinates) {
      markers.current.push(new google.maps.Marker({
        position: senderCoordinates,
        map: mapInstance.current,
        title: 'Pickup Location',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        }
      }));
      mapInstance.current.setCenter(senderCoordinates);
    }

    // Add receiver marker (red)
    if (receiverCoordinates) {
      markers.current.push(new google.maps.Marker({
        position: receiverCoordinates,
        map: mapInstance.current,
        title: 'Delivery Location',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
      }));
    }

    // Draw route if both points exist
    if (senderCoordinates && receiverCoordinates) {
      directionsRenderer.current = new google.maps.DirectionsRenderer({
        map: mapInstance.current,
        suppressMarkers: true
      });

      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route({
        origin: senderCoordinates,
        destination: receiverCoordinates,
        travelMode: google.maps.TravelMode.DRIVING
      }, (response, status) => {
        if (status === 'OK') {
          directionsRenderer.current.setDirections(response);
          
          // Adjust viewport to show both locations
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(senderCoordinates);
          bounds.extend(receiverCoordinates);
          mapInstance.current.fitBounds(bounds);
          
          // Add some padding if needed
          mapInstance.current.panToBounds(bounds);
        } else {
          console.error('Directions request failed:', status);
        }
      });
    }
  };

  // Initialize map on first load
  useEffect(() => {
    if (loaded && !error && !mapInstance.current) {
      initializeMap();
    }
  }, [loaded, error]);

  // Update markers when coordinates change
  useEffect(() => {
    if (mapInstance.current) {
      updateMapMarkers();
    }
  }, [senderCoordinates, receiverCoordinates, currentLocation]);

  if (error) {
    return (
      <div className="map-error">
        <p>Failed to load Google Maps: {error.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!loaded) {
    return <div className="map-loading">Loading map...</div>;
  }

  return (
    <div
      ref={mapRef}
      style={{
        height: '100%',
        width: '100%',
        minHeight: '400px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px'
      }}
    />
  );
};

export default LocationMap;
