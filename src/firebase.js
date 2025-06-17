import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signInWithCustomToken,
  signOut,  // ✅ you were missing this import!
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCGj9Pe7wntlvo0oRcIzGAsMdGIAlcjQG0",
  authDomain: "authentication-e6bd0.firebaseapp.com",
  projectId: "authentication-e6bd0",
  storageBucket: "authentication-e6bd0.firebasestorage.app",
  messagingSenderId: "677308686776",
  appId: "1:677308686776:web:1b2f3d1c665328a516af4d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  signInWithCustomToken,
  RecaptchaVerifier,
  signOut,
};
