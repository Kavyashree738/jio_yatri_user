// // src/App.js
// import logo from './logo.svg';
// import './App.css';
// import ScrollToTop from "./components/pages/ScrollToTop";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from './components/pages/Home'
// import VehicleDetails from './components/pages/VehicleDetails';
// import HelpDetail from './components/pages/HelpDetail';
// import Enterprise from './components/enterprise/Enterprise';
// import Delivery from './components/delivery_partners/Delivery';
// import FAQSection from './components/pages/FAQSection';
// import FrequentQuestions from './components/delivery_partners/faq/FrequentQuestions';
// import ShipmentPage from './components/pages/ShipmentPage';
// import { AuthProvider } from './context/AuthContext';

// function App() {
//   return (
//     <div className="App">
//       <BrowserRouter>
//         <AuthProvider>
//           <ScrollToTop />
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/vehicle/:type" element={<VehicleDetails />} />
//             <Route path="/help-details" element={<HelpDetail />} />
//             <Route path="/enterprise" element={<Enterprise />} />
//             <Route path="/partners" element={<Delivery/>}/>
//             <Route path="/faq" element={<FrequentQuestions />} />
//             <Route path="/shipment" element={<ShipmentPage/>} />
//           </Routes>
//         </AuthProvider>
//       </BrowserRouter>
//     </div>
//   );
// }

// export default App;

// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import ScrollToTop from "./components/pages/ScrollToTop";
import SplashScreen from './components/pages/SplashScreen'; // ✅ Import SplashScreen

import Home from './components/pages/Home';
import VehicleDetails from './components/pages/VehicleDetails';
import HelpDetail from './components/pages/HelpDetail';
import Enterprise from './components/enterprise/Enterprise';
import Delivery from './components/delivery_partners/Delivery';
import FrequentQuestions from './components/delivery_partners/faq/FrequentQuestions';
import ShipmentPage from './components/pages/ShipmentPage';
import { AuthProvider } from './context/AuthContext';
import UserShipments from './components/UserShipments';
import EnterAddressPage from './components/EnterAddressPage';
import SelectAddressPage from './components/SelectAddressPage';
import UserProfile from './components/UserProfile';

function AppWrapper() {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      navigate("/home"); // 🔁 Redirect to home
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/home" element={<Home />} />
      <Route path="/vehicle/:type" element={<VehicleDetails />} />
      <Route path="/help-details" element={<HelpDetail />} />
      <Route path="/enterprise" element={<Enterprise />} />
      <Route path="/partners" element={<Delivery />} />
      <Route path="/faq" element={<FrequentQuestions />} />
      <Route path="/shipment" element={<ShipmentPage />} />
      <Route path="/orders" element={<UserShipments />} />
      <Route path="/select-address" element={<SelectAddressPage />} />
      <Route path="/profile" element={<UserProfile />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <AppWrapper />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
