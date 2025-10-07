// // src/context/AuthContext.js
// import { createContext, useContext, useState, useEffect } from 'react';
// import { auth } from '../firebase';

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [message, setMessage] = useState({ text: '', isError: false });

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       setUser(user);
//     });
//     return unsubscribe;
//   }, []);

//   const value = {
//     user,
//     message,
//     setMessage,
//     setUser
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }

// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onIdTokenChanged } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(true);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('authToken', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    setMessage({ text: '', isError: false });
  };

  // ✅ Auto-refresh Firebase token
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken(true); // force refresh token
          setUser(currentUser);
          setToken(idToken);
          localStorage.setItem('authToken', idToken);
        } catch (error) {
          console.error('Error refreshing token:', error);
          setMessage({ text: error.message, isError: true });
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Manual refresh function
  const refreshToken = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      const newToken = await currentUser.getIdToken(true);
      setToken(newToken);
      localStorage.setItem('authToken', newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return null;
    }
  };

  const value = {
    user,
    token,
    message,
    login,
    logout,
    setMessage,
    loading,
    refreshToken, // ✅ added
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
