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
import { auth, googleProvider } from '../../firebase';
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';

const GoogleRedirectLogin = () => {
  useEffect(() => {
    const alreadyRedirected = sessionStorage.getItem('googleRedirectStarted');

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const token = await result.user.getIdToken();
          localStorage.setItem('firebase_token', token);

          const params = new URLSearchParams(window.location.search);
          const fromApp = params.get('source') === 'app';

          if (fromApp) {
            // ✅ Send token back to Android app
            window.location.href = `jioyatri://auth?token=${encodeURIComponent(token)}`;
            return;
          }

          window.location.href = '/'; // For normal web users
        } else if (!alreadyRedirected) {
          sessionStorage.setItem('googleRedirectStarted', 'true');
          signInWithRedirect(auth, googleProvider);
        } else {
          window.location.href = '/';
        }
      })
      .catch((error) => {
        console.error('Google sign-in failed:', error);
        window.location.href = '/';
      });
  }, []);

  return <p>Logging in with Google... Please wait</p>;
};

export default GoogleRedirectLogin;
