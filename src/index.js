import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import "./i18n";

window.addEventListener('push', (e) => {
  const { data, fromTap } = e.detail || {};
  console.log('📩 Bridged push into WebView:', data, 'fromTap:', fromTap);

  if (data?.shipmentId) {
    // Example deep link
    window.history.pushState({}, '', `/orders/${data.shipmentId}`);
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// // ✅ Enable service worker for PWA support
// serviceWorkerRegistration.register();

reportWebVitals();
