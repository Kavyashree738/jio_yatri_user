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
import HelpCenter from './HelpCenter';
import HouseShiftingFeatures from './HouseShiftingFeatures';
import UserProfile from '../UserProfile'
import ShipmentPage from './ShipmentPage';
import FrontendShipment from './FrontendShipment'
import { auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
const Home = () => {
  const { user } = useAuth();
  return (
    <div className="home-page">
      <Header/>
      
     {!user && <HeroSection />}
     {user && <ShipmentPage />}
      <WelcomeSection/>
       <ServiceSection/>
       <HelpCenter/>
       <WhyChoosePorter/>
       <PorterPromo/>
      <TestimonialsSection/>
      <NetworkSection/>
      <HouseShiftingFeatures/>
      <Contact/>
      <FAQSection/>
      {/* <UserProfile/> */}
      <Footer/> 
       
    </div>
  )
}

export default Home
