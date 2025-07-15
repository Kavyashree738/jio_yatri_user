import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import PhoneInput from 'react-phone-input-2';
import { signInWithCustomToken, signInWithPopup} from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import 'react-phone-input-2/lib/style.css';
import '../../styles/HeroSection.css';
import { useAuth } from '../../context/AuthContext';
import delivery from '../../assets/images/delivery-service.png';


const HeroSection = () => {
  const controls = useAnimation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpComponent, setShowOtpComponent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpResendTime, setOtpResendTime] = useState(0);
  const { user, message, setMessage } = useAuth();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);

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

  useEffect(() => {
    let timer;
    if (user) {
      setShowWelcomeMessage(true);
      timer = setTimeout(() => {
        setShowWelcomeMessage(false);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user]);

  const validatePhoneNumber = (value) => {
    const isValid = /^\+[1-9]\d{1,14}$/.test(value);
    setIsValidPhone(isValid);
    return isValid;
  };

  const handlePhoneChange = (value) => {
    const formattedValue = value.startsWith('+') ? value : `+${value}`;
    setPhoneNumber(formattedValue);
    validatePhoneNumber(formattedValue);
  };

  const startResendTimer = () => {
    setOtpResendTime(30);
    const timer = setInterval(() => {
      setOtpResendTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleApiRequest = async (url, options) => {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Request failed');
    }
    return response.json();
  };

  const sendCode = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setMessage({
        text: 'Please enter a valid international phone number (e.g., +91XXXXXXXXXX)',
        isError: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ text: '', isError: false });

      const data = await handleApiRequest(`https://jio-yatri-user.onrender.com/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      setMessage({
        text: `OTP sent to ${phoneNumber}`,
        isError: false,
      });
      setShowOtpComponent(true);
      startResendTimer();

      if (process.env.NODE_ENV === 'development' && data.otp) {
        console.log(`[DEV] OTP: ${data.otp}`);
      }
    } catch (error) {
      setMessage({
        text: error.message || 'Failed to send OTP',
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setMessage({ text: 'Please enter a 6-digit code', isError: true });
      return;
    }

    try {
      setIsLoading(true);
      const data = await handleApiRequest(`https://jio-yatri-user.onrender.com/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      await signInWithCustomToken(auth, data.token);
      setMessage({ text: 'Verification successful!', isError: false });
      setShowOtpComponent(false);
    } catch (error) {
      setMessage({
        text: error.message || 'OTP verification failed',
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (otpResendTime > 0) return;
    await sendCode();
  };

 const isWebView = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return /wv|WebView|iPhone|iPod|iPad|Android.*Version\/[\d.]+.*Chrome/.test(ua);
};

 const signInWithGoogle = async () => {
  if (isWebView()) {
    // Redirect to a page that handles Google Redirect login
    const loginUrl = `${window.location.origin}/google-login`; // This should be a Route in your React app
    window.location.href = loginUrl;
     window.open(loginUrl, '_blank'); 
    return;
  }

  try {
    setIsLoading(true);
    const result = await signInWithPopup(auth, googleProvider);
    setMessage({ text: 'Google sign-in successful!', isError: false });
  } catch (error) {
    setMessage({
      text: `Google sign-in failed: ${error.message}`,
      isError: true
    });
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
                <PhoneInput
                  country={'in'}
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="+91 9876543210"
                  inputClass={`phone-input ${!isValidPhone && phoneNumber ? 'error' : ''}`}
                  containerClass="phone-input-container"
                />
                {!isValidPhone && phoneNumber && (
                  <p className="phone-error-message">
                    Please enter in international format (e.g., +91XXXXXXXXXX)
                  </p>
                )}
              </div>

              <button
                onClick={sendCode}
                type="button"
                disabled={!isValidPhone || isLoading}
                className={`button ${(!isValidPhone || isLoading) ? 'disabled' : ''}`}
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
          ) : showWelcomeMessage ? (
            <div className="welcome-message">
              <h3>Login Successful!</h3>
              <p>You can now access all features.</p>
            </div>
          ) : (
            <div className="post-login-image">
              <img src={delivery} alt="Welcome to our service" className="login-success-img" />
            </div>
          )}

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
              <p className="otp-subtitle">Sent to {phoneNumber}</p>

              <div className="otp-container">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={otp[index] || ''}
                    onChange={(e) => {
                      const newOtp = otp.split('');
                      newOtp[index] = e.target.value.replace(/\D/g, '');
                      setOtp(newOtp.join('').slice(0, 6));
                      if (e.target.value && index < 5) {
                        document.getElementById(`otp-input-${index + 1}`).focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[index] && index > 0) {
                        document.getElementById(`otp-input-${index - 1}`).focus();
                      }
                    }}
                    className={`otp-input ${otp[index] ? 'filled' : ''}`}
                    id={`otp-input-${index}`}
                    inputMode="numeric"
                  />
                ))}
              </div>

              {message.isError && <div className="otp-error">{message.text}</div>}

              <button
                onClick={verifyOtp}
                disabled={isLoading || otp.length !== 6}
                className={`otp-button ${isLoading || otp.length !== 6 ? 'disabled' : ''}`}
              >
                {isLoading ? <><span className="spinner"></span> Verifying...</> : 'Verify Code'}
              </button>

              <button onClick={resendOtp} disabled={otpResendTime > 0} className="resend-button">
                {otpResendTime > 0 ? `Resend in ${otpResendTime}s` : 'Resend Code'}
              </button>

              <button
                onClick={() => {
                  setShowOtpComponent(false);
                  setOtp('');
                  setMessage({ text: '', isError: false });
                }}
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
