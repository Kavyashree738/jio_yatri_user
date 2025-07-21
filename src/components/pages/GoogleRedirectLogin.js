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
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider } from '../../firebase';
import { getRedirectResult, signInWithRedirect } from 'firebase/auth';

const GoogleRedirectLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthFlow = async () => {
      const fromApp = new URLSearchParams(window.location.search).get('source') === 'app';
      const wasAttempted = sessionStorage.getItem('auth_attempted') === 'true';

      try {
        // **Step 1: Check if we have a redirect result**
        const result = await getRedirectResult(auth);

        if (result?.user) {
          const token = await result.user.getIdToken();
          console.log("Google login success, token:", token);

          // Clear flags after success
          sessionStorage.removeItem('auth_attempted');

          if (fromApp) {
            if (window.AndroidApp?.onLoginSuccess) {
              window.AndroidApp.onLoginSuccess(token);
            } else {
              window.location.href = `jioyatri://auth?token=${encodeURIComponent(token)}`;
            }
            return;
          }

          navigate('/', { replace: true });
          return;
        }

        // **Step 2: Start redirect only if not already attempted**
        if (!wasAttempted) {
          sessionStorage.setItem('auth_attempted', 'true');
          console.log("Starting Google redirect login...");
          await signInWithRedirect(auth, googleProvider);
          return;
        }

        // **Step 3: If we get here, no result and already attempted - fallback**
        console.error("Google login failed or cancelled, redirecting home...");
        sessionStorage.removeItem('auth_attempted');
        navigate('/home', { replace: true });

      } catch (error) {
        console.error('Authentication error:', error);
        sessionStorage.removeItem('auth_attempted');
        navigate('/home', { replace: true });
      }
    };

    handleAuthFlow();
  }, [navigate, location]);

  return (
    <div className="auth-loading">
      <p>Redirecting to Google authentication...</p>
    </div>
  );
};

export default GoogleRedirectLogin;


