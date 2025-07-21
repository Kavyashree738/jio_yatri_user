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
    // Clear any previous authentication flags immediately
    sessionStorage.removeItem('auth_redirecting');
    sessionStorage.removeItem('auth_attempted');

    const handleAuthFlow = async () => {
      const isRedirecting = sessionStorage.getItem('auth_redirecting') === 'true';
      const wasAttempted = sessionStorage.getItem('auth_attempted') === 'true';
      const fromApp = new URLSearchParams(window.location.search).get('source') === 'app';

      try {
        // First, try to get the redirect result
        const result = await getRedirectResult(auth);

        if (result?.user) {
          // Successful authentication
          const token = await result.user.getIdToken();
          
          if (fromApp) {
            // For app - use bridge or deep link
            if (window.AndroidApp?.onLoginSuccess) {
              window.AndroidApp.onLoginSuccess(token);
            } else {
              window.location.href = `jioyatri://auth?token=${encodeURIComponent(token)}`;
            }
            return;
          }

          // For web - proceed normally
          navigate('/', { replace: true });
          return;
        }

        // If no result and not mid-flow, start new auth
        if (!isRedirecting && !wasAttempted) {
          sessionStorage.setItem('auth_redirecting', 'true');
          sessionStorage.setItem('auth_attempted', 'true');
          
          if (fromApp) {
            sessionStorage.setItem('fromApp', 'true');
          }

          await signInWithRedirect(auth, googleProvider);
          return;
        }

        // If we get here, something went wrong - break the loop
        console.error('Auth loop detected - redirecting home');
        navigate('/home', { replace: true });

      } catch (error) {
        console.error('Authentication error:', error);
        sessionStorage.clear();
        navigate('/home', { replace: true });
      } finally {
        sessionStorage.removeItem('auth_redirecting');
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

