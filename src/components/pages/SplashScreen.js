import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../../styles/SplashScreen.css';
import logo from '../../assets/images/logo.jpg';
import ownerImage from '../../assets/images/owner-image.jpeg'

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
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
        {/* Logo container - now smaller */}
        <motion.div
          className="logo-container"
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

        {/* Owner image with nice styling */}
        <motion.div
          className="owner-container"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <img
            src={ownerImage}
            alt="Owner"
            className="owner-image"
          />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.6,
            type: 'spring',
            stiffness: 100
          }}
          className="welcome-text"
        >
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            transition={{
              delay: 0.7,
              type: 'spring',
              stiffness: 120,
              damping: 8,
              repeat: 1,
              repeatType: 'reverse'
            }}
            className="highlight-word"
          >
            Welcome
          </motion.span>
          &nbsp;to Jio Yatri
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="tagline"
        >
          Your trusted delivery partner
        </motion.p>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="loading-indicator"
        />
      </motion.div>
    </div>
  );
};

export default SplashScreen;
