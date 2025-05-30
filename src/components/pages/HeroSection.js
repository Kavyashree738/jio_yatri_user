// src/components/HeroSection.js
import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import 'react-phone-input-2/lib/style.css';
import '../../styles/HeroSection.css';
import { useAuth } from '../../context/AuthContext';

const HeroSection = () => {
  const controls = useAnimation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpComponent, setShowOtpComponent] = useState(false);
  const [otp, setOtp] = useState('');
  const { user, message, setMessage } = useAuth();

  const { ref, inView: isInView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const initializeRecaptcha = () => {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA verified');
          },
          'expired-callback': () => {
            setMessage({ text: 'Security check expired. Please try again.', isError: true });
            resetRecaptcha();
          },
        });
      }
    } catch (error) {
      console.error('reCAPTCHA initialization failed:', error);
      setMessage({
        text: 'Failed to initialize security check. Please refresh the page.',
        isError: true,
      });
    }
  };

  const resetRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      } catch (error) {
        console.error('Error resetting reCAPTCHA:', error);
      }
    }
    initializeRecaptcha();
  };

  useEffect(() => {
    initializeRecaptcha();
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (error) {
          console.error('Error cleaning up reCAPTCHA:', error);
        }
      }
    };
  }, []);

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setMessage({ text: 'Please enter a 6-digit code.', isError: true });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ text: 'Verifying code...', isError: false });

      await confirmationResult.confirm(otp);
      setMessage({ text: 'Verification successful!', isError: false });
      setShowOtpComponent(false);
      setPhoneNumber('');
      setOtp('');
    } catch (error) {
      setMessage({ text: 'Verification failed: ' + error.message, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const sendCode = async () => {
    try {
      setIsLoading(true);
      setMessage({ text: 'Sending verification code...', isError: false });

      const formattedPhoneNumber = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+91${phoneNumber.replace(/\D/g, '')}`;

      if (formattedPhoneNumber.length < 12) {
        throw new Error('Please enter a valid phone number');
      }

      if (!window.recaptchaVerifier) {
        initializeRecaptcha();
      }

      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, window.recaptchaVerifier);
      setConfirmationResult(confirmation);

      setMessage({ text: `Verification code sent to ${formattedPhoneNumber}`, isError: false });
      setShowOtpComponent(true);
    } catch (error) {
      console.error('Error sending code:', error);
      setMessage({ text: `Failed to send code: ${error.message}`, isError: true });
      resetRecaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
      setMessage({ text: 'Google sign-in successful!', isError: false });
    } catch (error) {
      console.error('Google sign-in error:', error);
      setMessage({ text: `Google sign-in failed: ${error.message}`, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="hero-section" id="hero">
      <div className="hero-bg-blur" />
      <div className="hero-content-wrapper" ref={ref}>
        <motion.div
          className="hero-text"
          initial="hidden"
          animate={controls}
          variants={variants}
          transition={{ duration: 0.8 }}
        >
          <div className="text">
            <h1>JIO YATRI</h1>
            <h2>Delivery</h2>
          </div>
          <h2>Door-to-Door Intercity Courier from Bangalore</h2>
          <p>
            Connect with 19,000+ destinations across India through our smooth and affordable courier service.
          </p>
        </motion.div>

        <motion.div
          className="hero-image"
          initial="hidden"
          animate={controls}
          variants={variants}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {!user ? (
            <form className="registration-form hero-form" onSubmit={(e) => e.preventDefault()}>
              <h3>Register Now</h3>

              <div className="phone-input-group">
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`input ${message.isError ? 'error' : ''}`}
                />
              </div>

              <button
                onClick={sendCode}
                type="button"
                disabled={!phoneNumber || isLoading}
                className={`button ${(!phoneNumber || isLoading) ? 'disabled' : ''}`}
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>

              <div className="divider">or</div>

              <div className="social-buttons">
                <button type="button" className="google-btn" onClick={signInWithGoogle}>
                  <FcGoogle className="social-icon" />
                  <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
                </button>
                <button type="button" className="apple-btn">
                  <FaApple className="social-icon" size={20} />
                  <span>Continue with Apple</span>
                </button>
                <button type="button" className="email-btn">
                  <MdEmail className="social-icon" size={20} />
                  <span>Continue with Email</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="welcome-message">
              <h3>Login Successful!</h3>
              <p>You can now access all features.</p>
            </div>
          )}

          <div id="recaptcha-container" style={{ visibility: 'hidden' }}></div>

          {message.text && (
            <div className={`message ${message.isError ? 'error' : 'success'}`}>
              {message.text}
            </div>
          )}
        </motion.div>

        {showOtpComponent && (
          <div className="otp-overlay">
            <div className="otp-modal">
              <h3 className="otp-title">Enter Verification Code</h3>
              <input
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="otp-input"
                maxLength={6}
              />
              <button
                onClick={verifyOtp}
                disabled={isLoading}
                className={`otp-button ${isLoading ? 'disabled' : ''}`}
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button
                onClick={() => setShowOtpComponent(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;