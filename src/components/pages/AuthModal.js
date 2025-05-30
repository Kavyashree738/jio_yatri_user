import React, { useState, useEffect } from 'react';
import { auth, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup, GoogleAuthProvider } from '../../firebase'; // adjust your firebase import
import axios from 'axios';

const AuthModal = ({ onClose }) => {
  const [step, setStep] = useState('phone'); // phone -> otp -> emailPassword
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 'phone') {
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
        callback: () => {}
      }, auth);
    }
  }, [step]);

  const sendOtp = async () => {
    setError('');
    if (!phone.match(/^\+[1-9]\d{9,14}$/)) {
      setError('Enter valid phone number with country code, e.g. +1234567890');
      return;
    }
    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      setStep('otp');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setError('');
    if (!otp) {
      setError('Enter OTP');
      return;
    }
    setLoading(true);
    try {
      const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
      await auth.signInWithCredential(credential);
      setStep('emailPassword');
    } catch (err) {
      setError('Invalid OTP');
    }
    setLoading(false);
  };

  const continueWithGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Call backend to register or login user
      await axios.post('http://localhost:5000/api/register', {
        email: user.email,
        phone: user.phoneNumber || '', // might be null
        password: 'google-oauth', // special marker or handle differently in backend
      });

      onClose();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const registerWithEmailPassword = async () => {
    setError('');
    if (!email || !password) {
      setError('Email and Password are required');
      return;
    }
    setLoading(true);
    try {
      // Call backend to register user with phone from Firebase auth
      const currentUserPhone = auth.currentUser?.phoneNumber || phone;

      await axios.post('http://localhost:5000/api/register', {
        email,
        password,
        phone: currentUserPhone,
      });

      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top:0, left:0, right:0, bottom:0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        width: '320px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 10, right: 10, fontSize: '18px', background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label="Close"
        >
          &times;
        </button>

        {step === 'phone' && (
          <>
            <h3>Enter Phone Number</h3>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1234567890"
              style={{ width: '100%', padding: '8px', margin: '10px 0' }}
            />
            <div id="recaptcha-container"></div>
            <button onClick={sendOtp} disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <h3>Enter OTP</h3>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="Enter OTP"
              style={{ width: '100%', padding: '8px', margin: '10px 0' }}
            />
            <button onClick={verifyOtp} disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </>
        )}

        {step === 'emailPassword' && (
          <>
            <h3>Enter Email and Password</h3>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            />
            <button onClick={registerWithEmailPassword} disabled={loading} style={{ width: '100%', marginBottom: '10px' }}>
              {loading ? 'Registering...' : 'Register'}
            </button>

            <hr style={{ margin: '10px 0' }} />

            <button onClick={continueWithGoogle} disabled={loading} style={{ width: '100%', backgroundColor: '#4285F4', color: 'white' }}>
              Continue with Google
            </button>
          </>
        )}

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    </div>
  );
};

export default AuthModal;
