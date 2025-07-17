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
    const params = new URLSearchParams(window.location.search);
    const fromApp = params.get('source') === 'app';

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const token = await result.user.getIdToken();

          if (fromApp) {
            // ✅ Deep link back to app with token
            window.location.replace(`jioyatri://auth?token=${encodeURIComponent(token)}`);
            return;
          }

          // ✅ Normal web flow
          window.location.replace('/');
        } else if (!fromApp) {
          // ✅ Only trigger sign-in on WEB, not when called from APP
          signInWithRedirect(auth, googleProvider);
        } else {
          // ✅ From app but no result → Show message, don't loop
          document.body.innerHTML = "<h3>Waiting for app to complete login...</h3>";
        }
      })
      .catch((err) => {
        console.error('Google login error', err);
        window.location.replace('/');
      });
  }, []);

  return <p>Logging in with Google..........…</p>;
};

export default GoogleRedirectLogin;
