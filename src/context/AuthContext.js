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

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(true); // NEW loading state

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          setUser(currentUser);
          setToken(idToken);
          localStorage.setItem('authToken', idToken);
        } catch (error) {
          setMessage({ text: error.message, isError: true });
          logout();
        }
      } else {
        logout();
      }
      setLoading(false); // Auth state finished loading
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    token,
    message,
    login,
    logout,
    setMessage,
    loading, // expose loading state
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
