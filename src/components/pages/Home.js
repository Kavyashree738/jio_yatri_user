import React from 'react'
import Header from './Header'
import '../../styles/Home.css';
import HeroSection from './HeroSection';
import WelcomeSection from './WelcomeSection';
import ServiceSection from './ServiceSection';
import TestimonialsSection from './TestimonialsSection';
import Footer from './Footer';
import Contact from './Contact'
import PorterPromo from './PorterPromo';
import NetworkSection from './NetworkSection';
import WhyChoosePorter from './WhyChoosePorter';
import FAQSection from './FAQSection';
import BookingPorterSection from './BookingPorterSection';
import HelpCenter from './HelpCenter';
import HouseShiftingFeatures from './HouseShiftingFeatures';
import UserProfile from '../UserProfile'
import ShipmentPage from './ShipmentPage';
// import FullFlow from '../FullFlow'
import { auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import FrontShipment from './FrontShipment'
// import SearchBar from '../pages/SearchBar'
import '../../styles/FrontShipment.css';
const Home = () => {
  const { user } = useAuth();
  return (
    <div className="home-page">
      <Header />
{/* <SearchBar/> */}
       {!user && <HeroSection />}
      <div className="front-shipment-wrapper">
        {user && <ShipmentPage />}
      </div>
      <WelcomeSection />
      <ServiceSection />
      <HelpCenter />
      <WhyChoosePorter />
      <PorterPromo />
      <BookingPorterSection />
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
