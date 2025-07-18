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
    const params = new URLSearchParams(window.location.search);
    const fromApp = params.get('source') === 'app';

    const alreadyAttempted = sessionStorage.getItem('googleRedirectAttempted');

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const token = await result.user.getIdToken();

          if (fromApp) {
            // Deep link back to app
            window.location.href = `jioyatri://auth?token=${encodeURIComponent(token)}`;
            return;
          }

          navigate('/');
        } else if (!alreadyAttempted) {
          // First time → try redirect
          sessionStorage.setItem('googleRedirectAttempted', 'true');
          signInWithRedirect(auth, googleProvider);
        } else {
          console.warn('Redirect loop prevented.');
          navigate('/home');
        }
      })
      .catch((err) => {
        console.error('Google sign-in failed', err);
        navigate('/home');
      });
  }, [navigate, location]);

  return <p>Logging in with Google...</p>;
};

export default GoogleRedirectLogin;

