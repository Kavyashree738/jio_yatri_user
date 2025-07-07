import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ import navigate
import { motion } from 'framer-motion';
import '../../styles/SplashScreen.css';
import logo from '../../assets/images/logo.jpg';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home'); // ✅ redirect after 3 seconds
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <motion.div 
        className="splash-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring',
            stiffness: 100,
            damping: 10
          }}
        >
          <img 
            src={logo} 
            alt="Jio Yatri Logo" 
            className="logo-image"
          />
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            delay: 0.3,
            type: 'spring',
            stiffness: 100
          }}
          className="welcome-text"
        >
          Welcome to Jio Yatri
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="tagline"
        >
          Your trusted delivery partner
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
