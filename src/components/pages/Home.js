import React, { useEffect, useState, useCallback } from 'react';
import Header from './Header'
import axios from 'axios';
import '../../styles/Home.css';
import HeroSection from './HeroSection';
import WelcomeSection from './WelcomeSection';
import TestimonialsSection from './TestimonialsSection';
import Footer from './Footer';
import Contact from './Contact'
import PorterPromo from './PorterPromo';
import NetworkSection from './NetworkSection';
import WhyChoosePorter from './WhyChoosePorter';
import FAQSection from './FAQSection';
import HelpCenter from './HelpCenter';
import HouseShiftingFeatures from './HouseShiftingFeatures';
import UserProfile from '../UserProfile'
import ShipmentPage from './ShipmentPage';
// import FullFlow from '../FullFlow'
import { auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
// import SearchBar from '../pages/SearchBar'
import '../../styles/FrontShipment.css';
import RatingReminder from '../RatingReminder';
const Home = () => {
  const { user } = useAuth();
   const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchShipments = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken(true);
      const response = await axios.get(
        'https://jio-yatri-user.onrender.com/api/shipments/my-shipments',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShipments(response.data || []);
    } catch (err) {
      console.error('❌ Failed to fetch shipments:', err);
      setError('Failed to fetch shipments.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // ✅ Filter only delivered + paid + no rating
  const pendingRatings = shipments.filter(
    (s) => s.status === 'delivered' && s.payment?.status === 'paid' && !s.rating?.value
  );

  return (
    <div className="home-page">
      <Header />
{/* <SearchBar/> */}
       {!user && <HeroSection />}
      <div className="front-shipment-wrapper">
        {user && <ShipmentPage />}

         {user && !loading && (
          <RatingReminder
            pendingRatings={pendingRatings}
            token={user.token}
            refreshShipments={fetchShipments} // ✅ Use the real fetchShipments
          />
        )}
      </div>
      <WelcomeSection />
      <HelpCenter />
      <WhyChoosePorter />
      <PorterPromo />
      <TestimonialsSection />
      <NetworkSection />
      <HouseShiftingFeatures />
      <Contact />
      <FAQSection />
      {/* <UserProfile/> */}
      <Footer />
      {/* <FullFlow/> */}
    </div>
  )
}

export default Home
