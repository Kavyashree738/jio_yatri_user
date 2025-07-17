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
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';

const APP_SCHEME = 'jioyatri://auth';

const GoogleRedirectLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setMessage } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromAppQuery = params.get('source') === 'app';
    const alreadyRedirected = sessionStorage.getItem('googleRedirectStarted') === 'true';

    // ✅ If opened from app, remember it
    if (fromAppQuery) {
      sessionStorage.setItem('fromApp', 'true');
    }
    const fromAppStored = sessionStorage.getItem('fromApp') === 'true';

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const token = await result.user.getIdToken();
          localStorage.setItem('firebase_token', token);

          if (fromAppQuery || fromAppStored) {
            sessionStorage.removeItem('googleRedirectStarted');
            sessionStorage.removeItem('fromApp');

            // ✅ Redirect back to app via deep link
            window.location.replace(`${APP_SCHEME}?token=${encodeURIComponent(token)}`);
            return;
          }

          // ✅ Normal web flow
          setMessage({ text: 'Google sign-in successful!', isError: false });
          sessionStorage.removeItem('googleRedirectStarted');
          navigate(location.state?.from || '/');
        } else if (!alreadyRedirected) {
          sessionStorage.setItem('googleRedirectStarted', 'true');
          signInWithRedirect(auth, googleProvider);
        } else {
          setMessage({ text: 'Google login canceled.', isError: true });
          navigate('/');
        }
      })
      .catch((error) => {
        console.error('Google sign-in failed:', error);
        sessionStorage.removeItem('googleRedirectStarted');
        sessionStorage.removeItem('fromApp');
        setMessage({
          text: `Google sign-in failed: ${error.message}`,
          isError: true,
        });
        navigate('/');
      });
  }, [navigate, location, setMessage]);

  return <p>Logging in with Google... Please wait</p>;
};

export default GoogleRedirectLogin;





