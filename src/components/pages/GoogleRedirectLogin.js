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

const GoogleRedirectLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setMessage } = useAuth();

  useEffect(() => {
    const alreadyRedirected = sessionStorage.getItem('googleRedirectStarted') === 'true';

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          // ✅ Got user after Google sign-in
          const token = await result.user.getIdToken();
          localStorage.setItem('firebase_token', token);

          // ✅ Check if login started from app
          const params = new URLSearchParams(window.location.search);
          const fromApp = params.get('source') === 'app';

          if (fromApp) {
            // ✅ Send token back to Android app via deep link
            window.location.href = `jioyatri://auth?token=${encodeURIComponent(token)}`;
            return;
          }

          // ✅ For normal web login
          setMessage({ text: 'Google sign-in successful!', isError: false });
          sessionStorage.removeItem('googleRedirectStarted');
          navigate(location.state?.from || '/');
        } else {
          // ✅ If no result and not redirected yet, start redirect
          if (alreadyRedirected) {
            console.warn('No redirect result after Google. Not retrying.');
            setMessage({ text: 'Login failed. Please try again.', isError: true });
            return;
          }

          sessionStorage.setItem('googleRedirectStarted', 'true');
          signInWithRedirect(auth, googleProvider);
        }
      })
      .catch((error) => {
        console.error('Google sign-in failed:', error);
        sessionStorage.removeItem('googleRedirectStarted');
        setMessage({
          text: `Google sign-in failed: ${error.message}`,
          isError: true,
        });
        navigate('/');
      });
  }, [navigate, location, setMessage]);

  return (
    <p style={{ textAlign: 'center', marginTop: '20px' }}>
      Logging in with Google... <br />
      <small>Please wait</small>
    </p>
  );
};

export default GoogleRedirectLogin;

