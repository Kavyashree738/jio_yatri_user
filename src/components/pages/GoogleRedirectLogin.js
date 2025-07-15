// // src/components/GoogleRedirectLogin.jsx
// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { auth, googleProvider } from '../../firebase';
// import { signInWithRedirect, getRedirectResult } from 'firebase/auth';
// import { useAuth } from '../../context/AuthContext';

// const GoogleRedirectLogin = () => {
//   const navigate = useNavigate();
//   const { setMessage } = useAuth();

//   useEffect(() => {
//     getRedirectResult(auth)
//       .then((result) => {
//         if (result?.user) {
//           setMessage({ text: 'Google sign-in successful!', isError: false });
//           navigate('/');
//         } else {
//           // No result yet, start redirect
//           signInWithRedirect(auth, googleProvider);
//         }
//       })
//       .catch((error) => {
//         setMessage({
//           text: `Google sign-in failed: ${error.message}`,
//           isError: true,
//         });
//         navigate('/');
//       });
//   }, [navigate, setMessage]);

//   return <p>Logging in with Google...</p>;
// };

// export default GoogleRedirectLogin;

// src/pages/GoogleLoginPage.js
import React, { useEffect } from 'react';
import { GoogleAuthProvider, getRedirectResult, signInWithRedirect } from 'firebase/auth';
import { auth } from '../../firebase';

const GoogleLoginPage = () => {
  useEffect(() => {
    // This checks if we're returning from Google
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // ✅ Sign-in successful
          const idToken = result.user.accessToken;
          localStorage.setItem("firebase_token", idToken);
          // Redirect to home page after login
          window.location.href = "/home";
        } else {
          // 🚀 First time - start the Google Sign-In redirect
          const provider = new GoogleAuthProvider();
          signInWithRedirect(auth, provider);
        }
      })
      .catch((error) => {
        console.error("Redirect error", error);
        alert("Google Sign-In failed. Please try again.");
      });
  }, []);

  return <p>Redirecting to Google...</p>;
};

export default GoogleLoginPage;
