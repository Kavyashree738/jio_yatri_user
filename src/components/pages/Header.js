// // src/components/Header.js
// import React, { useState } from 'react';
// import { FaBars, FaTimes } from 'react-icons/fa';
// import '../../styles/Home.css';
// import logo from '../../assets/images/logo.jpg';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { signOut } from 'firebase/auth';
// import { auth } from '../../firebase';

// const Header = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const { user, setMessage } = useAuth();

//   const handleLinkClick = () => setIsMenuOpen(false);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       setMessage({ text: 'Logged out successfully.', isError: false });
//     } catch (error) {
//       setMessage({ text: 'Logout failed: ' + error.message, isError: true });
//     }
//   };

//   return (
//     <>
//       {/* Top Strip Header */}
//       <div className="top-header">
//         <h1>Mokshambani Tech Services PVT LTD</h1>

//       </div>

//       {/* Main Header */}
//       <header className='header'>
//         <div className="nav-container">
//           <div className="logo">
//             <img src={logo} alt="Company Logo" />
//           </div>

//           <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
//             <Link to="/" onClick={handleLinkClick}>Home</Link>
//             <Link to="/enterprise" onClick={handleLinkClick}>Enterprise</Link>
//             <Link to="/partners" onClick={handleLinkClick}>Delivery Partners</Link>
//             <Link to="/shipment" onClick={handleLinkClick}>Shipment</Link>
//             {user && (
//               <div className="user-info">
//                 <button onClick={handleLogout} className="logout-button">
//                   Logout
//                 </button>
//               </div>
//             )}
//           </nav>

//           <div
//             className="hamburger"
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//             aria-label="Toggle navigation menu"
//           >
//             {isMenuOpen ? <FaTimes /> : <FaBars />}
//           </div>
//         </div>
//       </header>
//     </>
//   );
// };

// export default Header;
// src/components/Header.js
import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../../styles/Home.css';
import logo from '../../assets/images/logo.jpg';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, setMessage } = useAuth();

  const handleLinkClick = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMessage({ text: 'Logged out successfully.', isError: false });
    } catch (error) {
      setMessage({ text: 'Logout failed: ' + error.message, isError: true });
    }
  };

  return (
    <>
      {/* Top Strip Header */}
      <div className="top-header">
        <h1>Mokshambani Tech Services PVT LTD</h1>

      </div>

      {/* Main Header */}
      <header className='header'>
        <div className="nav-container">
          <div className="logo">
            <img src={logo} alt="Company Logo" />
          </div>

          <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
            <Link to="/" onClick={handleLinkClick}>Home</Link>
            <Link to="/enterprise" onClick={handleLinkClick}>Enterprise</Link>
            <Link to="/partners" onClick={handleLinkClick}>Delivery Partners</Link>
            <Link to="/shipment" onClick={handleLinkClick}>Shipment</Link>
            <Link to="/orders" onClick={handleLinkClick}>orders</Link>
            {user && (
              <div className="user-info">
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            )}
          </nav>

          <div
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;