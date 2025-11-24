import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import PhoneInput from 'react-phone-input-2';
import { signInWithCustomToken ,GoogleAuthProvider,signInWithPopup,
  signInWithCredential } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import 'react-phone-input-2/lib/style.css';
import '../../styles/HeroSection.css';
import { useAuth } from '../../context/AuthContext';
import delivery from '../../assets/images/delivery-service.png';

import { useTranslation } from "react-i18next";

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
  const [referralCode, setReferralCode] = useState('');
  const [showReferralField, setShowReferralField] = useState(false);
  const { ref, inView: isInView } = useInView({ triggerOnce: true });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const TEST_GOOGLE_PHONE = "7777777777"; // only your test number
  const isGoogleTester = phoneNumber.endsWith(TEST_GOOGLE_PHONE);

  const TEST_PHONE = "+911234567898";
  const TEST_OTP = "1234";
  const { t, i18n } = useTranslation();

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
  window.fillOtpFromNative = (otp) => {
    console.log("📩 Auto OTP from mobile:", otp);
    setOtp(otp);
  };
}, []);


   useEffect(() => {
  // Flutter sends Google ID token here
  window.onGoogleLogin = async (googleIdToken) => {
    console.log("🟢 WebView: Received Google Token:", googleIdToken);
    await handleGoogleToken(googleIdToken);   // call handler function
  };

  console.log("📌 window.onGoogleLogin registered");
}, []);

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

   const handlePhoneChange = (value, country) => {
  const formatted = value.startsWith('+') ? value : `+${value}`;
  setPhoneNumber(formatted);

  // Extract digits only
  const digits = formatted.replace(/\D/g, '');

  // If country is India, remove '91' prefix before validating
  let localDigits = digits;
  if (digits.startsWith('91')) {
    localDigits = digits.slice(2);
  }

  const valid = localDigits.length === 10;
  setIsValidPhone(valid);
};


  const startResendTimer = () => {
    setOtpResendTime(300);
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

const handleApiRequest = async (url, options = {}) => {
  // Always get a fresh Firebase ID token (auto refresh if expired)
  const token = auth.currentUser 
    ? await auth.currentUser.getIdToken() 
    : null;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // attach token if available
    },
  });

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

    if (phoneNumber === TEST_PHONE) {
      setMessage({ text: `OTP sent to ${phoneNumber} (Test Mode)`, isError: false });
      setShowOtpComponent(true);
      startResendTimer();
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
        // console.log(`[DEV] OTP: ${data.otp}`);
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
    if (!otp || otp.length !== 4) {
      setMessage({ text: 'Please enter a 6-digit code', isError: true });
      return;
    }
// console.log('Verifying OTP:', otp, 'for phoneNumber:', phoneNumber, 'with referralCode:', referralCode);
    try {
      setIsLoading(true);
      const data = await handleApiRequest(`https://jio-yatri-user.onrender.com/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          otp: phoneNumber === TEST_PHONE ? TEST_OTP : otp,
          referralCode: referralCode || undefined
        }),
      });

      const userCred = await signInWithCustomToken(auth, data.token);
      const freshToken = await userCred.user.getIdToken(true); // forces a new token

      setMessage({ text: 'Verification successful!', isError: false });
      setShowOtpComponent(false);
      setReferralCode('');
    } catch (error) {
      setMessage({
        text: error.message || 'OTP verification failed',
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleGoogleToken = async (googleIdToken) => {
  try {
    setIsLoading(true);

    // 1️⃣ Convert Google token → Firebase credential
    const credential = GoogleAuthProvider.credential(googleIdToken);
    const userCred = await signInWithCredential(auth, credential);

    // 2️⃣ Get Firebase Token
    const firebaseToken = await userCred.user.getIdToken(true);

    // 3️⃣ Send to backend for user creation + custom token
    const response = await fetch("https://jio-yatri-user.onrender.com/api/auth/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebaseToken,
        referralCode: referralCode || null
      }),
    });

    const data = await response.json();
    if (!data.success) {
      setMessage({ text: data.message, isError: true });
      return;
    }

    // 4️⃣ Replace session with backend custom Firebase token
    await signInWithCustomToken(auth, data.firebaseToken);

    setMessage({ text: "Google Login Successful!", isError: false });

  } catch (error) {
    console.error("Google login WebView error:", error);
    setMessage({ text: "Google login failed", isError: true });
  } finally {
    setIsLoading(false);
  }
};

  // ✅ Auto-verify when OTP is fully entered or auto-filled
useEffect(() => {
  // Run only if 4 digits entered, not already loading, and OTP screen is visible
  if (showOtpComponent && otp.length === 4 && !isLoading) {
    
    verifyOtp(); // trigger verification automatically
  }
}, [otp, showOtpComponent]);


  const resendOtp = async () => {
    if (otpResendTime > 0) return;
    await sendCode();
  };

  const isWebView = () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /wv|WebView|iPhone|iPod|iPad|Android.*Version\/[\d.]+.*Chrome/.test(ua);
  };

// const signInWithGoogle = async () => {
//     if (isWebView()) {
//       sessionStorage.setItem('fromApp', 'true');

//       if (window.AndroidApp?.openBrowser) {
//         window.AndroidApp.openBrowser(`${window.location.origin}/google-login?source=app`);
//       } else {
//         window.location.href = `${window.location.origin}/google-login?source=app`;
//       }
//       return;
//     }

//     try {
//       setIsLoading(true);

//       // 1️⃣ Sign in with Google via Firebase
//       const result = await signInWithPopup(auth, googleProvider);

//       // 2️⃣ Get Firebase token
//       const token = await result.user.getIdToken(true);

//       // 3️⃣ CREATE USER IN MONGODB (this was missing!!)
//       await handleApiRequest("https://jio-yatri-user.onrender.com/api/users", {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           uid: result.user.uid,
//           name: result.user.displayName,
//           email: result.user.email,
//           photo: result.user.photoURL,
//           referralCodeEntered: referralCode || null
//         })
//       });

//       // 4️⃣ If referral exists, apply it
//       // if (referralCode) {
//       //   await handleApiRequest("http://localhost:5000/api/users/apply-referral", {
//       //     method: "POST",
//       //     headers: {
//       //       "Authorization": `Bearer ${token}`,
//       //       "Content-Type": "application/json"
//       //     },
//       //     body: JSON.stringify({ referralCode })
//       //   });
//       // }

//       setMessage({ text: "Google Login Successful!", isError: false });
//       setReferralCode("");

//     } catch (error) {
//       console.error("Google login error:", error);
//       setMessage({ text: "Google login failed: " + error.message, isError: true });
//     } finally {
//       setIsLoading(false);
//     }
//   };


const signInWithGoogle = async () => {
  console.log("🔵 Google Login Triggered");

  // 1️⃣ If inside Flutter WebView → call flutter handler
  if (window.flutter_inappwebview) {
    console.log("📱 Login requested inside WebView");
    window.flutter_inappwebview.callHandler("googleLogin");
    return;
  }

  // 2️⃣ Otherwise → normal website Google login
  try {
    setIsLoading(true);
    console.log("🌐 Web browser Google Login");

    // Correct popup login
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Firebase token
    const firebaseToken = await result.user.getIdToken(true);

    // Send to backend
    const response = await fetch("https://jio-yatri-user.onrender.com/api/auth/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebaseToken,
        referralCode: referralCode || null,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      setMessage({ text: data.message, isError: true });
      return;
    }

    // Backend custom token sign-in
    await signInWithCustomToken(auth, data.firebaseToken);

    setMessage({ text: "Google Login Successful!", isError: false });

  } catch (error) {
    console.error("❌ Web Google login error:", error);
    setMessage({ text: "Google login failed", isError: true });
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
            <h1>{t("title_main")}</h1>
            <h2>{t("title_sub")}</h2>
          </div>
          <h2>{t("tagline")}</h2>
          <p>
            {t("description")}
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
              <h3>{t("register_now")}</h3>

              <div className="phone-input-group">
                <PhoneInput
                  country={'in'}
                  enableSearch={true}
                  countryCodeEditable={false}   // ✅ +91 part not editable
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                />


              </div>

                            <div className="form-groups terms-checkbox">
                <label className="terms-label">
                  <input
                    type="checkbox"
                    id="termsCheckbox"
                    checked={acceptedTerms} // optional sync visual
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    required
                  />
                  <span className="terms-text">
                    {t("terms")}&nbsp;
                    <a
                      href="/terms-and-condition"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terms-link"
                    >
                      {t("terms_link")}
                    </a>
                    &nbsp;and&nbsp;
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terms-link"
                    >
                      {t("privacy_link")}
                    </a>
                  </span>
                </label>
              </div>

               <button
                onClick={sendCode}
                type="button"
                disabled={!isValidPhone || isLoading || !acceptedTerms}
                className={`button ${isValidPhone && acceptedTerms && !isLoading ? 'enabled' : 'disabled'}`}
              >
                 {isLoading ? t("sending") : t("send_otp")}
              </button>


              <div className="divider">{t("or")}</div>

              <div className="social-buttons">
                {isGoogleTester && (
                  <button
                    type="button"
                    className={`google-btn ${acceptedTerms ? "enabled" : "disabled"}`}
                    onClick={acceptedTerms ? signInWithGoogle : null}
                    disabled={!acceptedTerms || isLoading}
                  >
                    <FcGoogle className="social-icon" />
                     <span>{t("continue_google")}</span>
                  </button>
                )}


                {/* <button type="button" className="apple-btn" disabled={isLoading}>
                  <FaApple className="social-icon" size={20} />
                  <span>Continue with Apple</span>
                </button>
                <button type="button" className="email-btn" disabled={isLoading}>
                  <MdEmail className="social-icon" size={20} />
                  <span>Continue with Email</span>
                </button> */}
              </div>

              

              <div className="referral-toggle" onClick={() => setShowReferralField(!showReferralField)}>
{showReferralField ? t("hide_referral") : t("have_referral")}

              </div>
              {showReferralField && (
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Enter referral code (optional)"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="referral-input"
                    maxLength="10"
                  />
                </div>
              )}



              {/* <div className="divider">or</div> */}

              {/* <div className="social-buttons">
                <button
                  type="button"
                  className="google-btn"
                  onClick={signInWithGoogle}
                  disabled={isLoading}
                >
                  <FcGoogle className="social-icon" />
                  <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
                </button>
                <button type="button" className="apple-btn" disabled={isLoading}>
                  <FaApple className="social-icon" size={20} />
                  <span>Continue with Apple</span>
                </button>
                <button type="button" className="email-btn" disabled={isLoading}>
                  <MdEmail className="social-icon" size={20} />
                  <span>Continue with Email</span>
                </button>
              </div> */}
            </form>
          ) : showWelcomeMessage ? (
            <div className="welcome-message">
              <h3>{t("login_success")}</h3>
              <p>{t("access_features")}</p>
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
              <h3 className="otp-title">{t("enter_otp_title")}</h3>
              <p className="otp-subtitle">{t("sent_to")} {phoneNumber}</p>

             <div className="otp-container">
  {[...Array(4)].map((_, index) => (
    <input
      key={index}
      type="text"
      maxLength="1"
      value={otp[index] || ''}
      onChange={(e) => {
        const newOtp = otp.split('');
        newOtp[index] = e.target.value.replace(/\D/g, '');
        setOtp(newOtp.join('').slice(0, 4));
        if (e.target.value && index < 3) {
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
      pattern="\d*"                                 // ✅ Helps mobile know it’s numeric
      name={index === 0 ? 'otp' : undefined}        // ✅ Only first box needs name
      autoComplete={index === 0 ? 'one-time-code' : undefined} // ✅ Add only for first box
    />
  ))}
</div>


              {message.isError && <div className="otp-error">{message.text}</div>}

              <button
                onClick={verifyOtp}
                disabled={isLoading || otp.length !== 4}
                className={`otp-button ${isLoading || otp.length !== 4 ? 'disabled' : ''}`}
              >
                {isLoading ? <><span className="spinner"></span>t("verify_code") </> : t("verify_code")}
              </button>

              <button onClick={resendOtp} disabled={otpResendTime > 0} className="resend-button">
                {otpResendTime > 0 ? `${t("resend_code")} ${otpResendTime}s` : t("resend_code")}
              </button>

              <button
                onClick={() => {
                  setShowOtpComponent(false);
                  setOtp('');
                  setMessage({ text: '', isError: false });
                }}
                className="cancell-button"
              >
                 {t("cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;