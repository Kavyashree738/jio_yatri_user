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
import EstimateForm from './EstimateForm';
import HelpCenter from './HelpCenter';
const Home = () => {
  return (
    <div>
      <Header/>
     <HeroSection/> 
      <WelcomeSection/>
       <ServiceSection/>
       <HelpCenter/>
       <EstimateForm/>
       <WhyChoosePorter/>
       <PorterPromo/>
       <BookingPorterSection/>
      <TestimonialsSection/>
      <NetworkSection/>
      <Contact/>
      <FAQSection/>
      <Footer/> 
       
    </div>
  )
}

export default Home
