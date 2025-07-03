import { useEffect, useState, useRef } from 'react';

const useGoogleMaps = () => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const apiKeyRef = useRef(process.env.REACT_APP_GOOGLE_API_KEY);

  useEffect(() => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script';
    const existingScript = document.getElementById(scriptId);

    const checkApiLoaded = () => {
      if (window.google && window.google.maps) {
        setLoaded(true);
      } else {
        setTimeout(checkApiLoaded, 100);
      }
    };

    if (existingScript) {
      checkApiLoaded();
      return;
    }

    // Create new script
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKeyRef.current}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    let timer;

    const cleanup = () => {
      clearTimeout(timer);
      script.onload = null;
      script.onerror = null;
    };

    script.onload = () => {
      cleanup();
      if (window.google && window.google.maps) {
        setLoaded(true);
      } else {
        setError(new Error('Google Maps API not available'));
      }
    };

    script.onerror = () => {
      cleanup();
      setError(new Error('Failed to load Google Maps'));
    };

    timer = setTimeout(() => {
      cleanup();
      setError(new Error('Loading timed out'));
    }, 10000);

    document.head.appendChild(script);

    return cleanup;
  }, []);

  return { loaded, error };
};

export default useGoogleMaps;
