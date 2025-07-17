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

const GoogleRedirectLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const alreadyRedirected = sessionStorage.getItem('googleRedirectStarted');

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const token = await result.user.getIdToken();
          console.log('Google sign-in successful:', token);

          const params = new URLSearchParams(window.location.search);
          const fromApp = params.get('source') === 'app';

          if (fromApp) {
            console.log('Deep link redirecting to app with token:', token);

            if (window.AndroidApp) {
              window.AndroidApp.postMessage(`Redirecting to app with token: ${token}`);
            }

            window.location.href = `jioyatri://auth?token=${encodeURIComponent(token)}`;
            return;
          }

          sessionStorage.removeItem('googleRedirectStarted');
          navigate(location.state?.from || '/');
        } else if (!alreadyRedirected) {
          sessionStorage.setItem('googleRedirectStarted', 'true');
          signInWithRedirect(auth, googleProvider);
        }
      })
      .catch((error) => {
        console.error('Google sign-in failed:', error);
        sessionStorage.removeItem('googleRedirectStarted');
        navigate('/');
      });
  }, [navigate, location]);

  return <p>Logging in with Google... Please wait</p>;
};

export default GoogleRedirectLogin;

