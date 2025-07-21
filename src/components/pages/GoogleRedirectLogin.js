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
    const handleAuthentication = async () => {
      const params = new URLSearchParams(window.location.search);
      const fromApp = params.get('source') === 'app' || 
                     sessionStorage.getItem('fromApp') === 'true';

      try {
        // Clear any previous attempts
        sessionStorage.removeItem('googleRedirectAttempted');

        const result = await getRedirectResult(auth);
        
        if (result?.user) {
          const token = await result.user.getIdToken();
          
          if (fromApp) {
            // Try Android bridge first
            if (window.AndroidApp?.onLoginSuccess) {
              window.AndroidApp.onLoginSuccess(token);
              return;
            }
            
            // Fallback to deep link
            window.location.href = `jioyatri://auth?token=${encodeURIComponent(token)}`;
            return;
          }

          // Regular web flow
          navigate('/', { replace: true });
        } else {
          // No result - initiate sign-in
          if (!sessionStorage.getItem('googleRedirectAttempted')) {
            sessionStorage.setItem('googleRedirectAttempted', 'true');
            sessionStorage.setItem('fromApp', fromApp ? 'true' : 'false');
            await signInWithRedirect(auth, googleProvider);
          } else {
            console.warn('Redirect loop prevented');
            navigate('/home', { replace: true });
          }
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        sessionStorage.removeItem('fromApp');
        sessionStorage.removeItem('googleRedirectAttempted');
        navigate('/home', { replace: true });
      }
    };

    handleAuthentication();
  }, [navigate, location]);

  return (
    <div className="loading-container">
      <p>Completing Google login...</p>
    </div>
  );
};

export default GoogleRedirectLogin;

