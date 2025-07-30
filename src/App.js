import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import ScrollToTop from "./components/pages/ScrollToTop";
import SplashScreen from './components/pages/SplashScreen';
import GoogleRedirectLogin from './components/pages/GoogleRedirectLogin';
import Home from './components/pages/Home';
import VehicleDetails from './components/pages/VehicleDetails';
import HelpDetail from './components/pages/HelpDetail';
import Enterprise from './components/enterprise/Enterprise';
import Delivery from './components/delivery_partners/Delivery';
import FrequentQuestions from './components/delivery_partners/faq/FrequentQuestions';
import ShipmentPage from './components/pages/ShipmentPage';
import { AuthProvider } from './context/AuthContext';
import UserShipments from './components/UserShipments';
import SelectAddressPage from './components/SelectAddressPage';
import UserProfile from './components/UserProfile';
// import HotelRegistration from './components/hotels/HotelRegistration';
// import HotelsDisplay from './components/hotels/HotelsDisplay';
// import HotelDetails from './components/hotels/HotelDetails';
// import EditHotel from './components/hotels/EditHotel';
// import HotelShipment from './components/hotels/HotelShipment'
import CategoryRegistration from './components/CategoryRegistration';
import ShopDisplay from './components/ShopDisplay';
import ShopDetails from './components/ShopDetails'
import ShopOrder from './components/ShopOrder';
function AppWrapper() {

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
      <Route path="/google-login" element={<GoogleRedirectLogin />} />
      <Route path="/register" element={<CategoryRegistration />} />
      <Route path="/shops/:category" element={<ShopDisplay />} />
      <Route path="/shop/:id" element={<ShopDetails />} />
      <Route path="/shop-order/:shopId" element={<ShopOrder />} />

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