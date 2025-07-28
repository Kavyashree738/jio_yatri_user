// import React from 'react';
// import { 
//   FaUserCircle,
//   FaHome, 
//   FaBuilding, 
//   FaTruck, 
//   FaBoxes, 
//   FaShoppingCart 
// } from 'react-icons/fa';
// import { Link, useNavigate } from 'react-router-dom';
// import logo from '../../assets/images/logo.jpg';
// import { useAuth } from '../../context/AuthContext';

// const Header = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const handleProfileClick = () => {
//     navigate('/profile');
//   };

//   return (
//     <>
//       {/* Top Strip - Visible on all screens */}
//       <div className="top-strip">
//         <h1>Mokshambani Tech Services PVT LTD</h1>
//       </div>

//       {/* Desktop Header - Hidden on mobile */}
//       <header className="main-header">
//         <div className="header-container">
//           <div className="logo">
//             <img src={logo} alt="Company Logo" />
//           </div>

//           <nav className="nav-links">
//             <Link to="/home">Home</Link>
//             <Link to="/enterprise">Enterprise</Link>
//             <Link to="/partners">Partners</Link>
//             <Link to="/shipment">Shipment</Link>
//             <Link to="/orders">Orders</Link>
//           </nav>

//           {/* Profile Icon - Desktop Only */}
//           {user && (
//             <button className="profile-icon" onClick={handleProfileClick}>
//               <FaUserCircle size={24} />
//             </button>
//           )}
//         </div>
//       </header>

//       {/* Bottom Nav for Mobile - Only visible on mobile */}
//       <div className="mobile-bottom-nav">
//         <Link to="/home" className="mobile-nav-link">
//           <FaHome className="mobile-nav-icon" />
//           <span>Home</span>
//         </Link>
//         <Link to="/enterprise" className="mobile-nav-link">
//           <FaBuilding className="mobile-nav-icon" />
//           <span>Enterprise</span>
//         </Link>
//         <Link to="/partners" className="mobile-nav-link">
//           <FaTruck className="mobile-nav-icon" />
//           <span>Partners</span>
//         </Link>
//         <Link to="/shipment" className="mobile-nav-link">
//           <FaBoxes className="mobile-nav-icon" />
//           <span>Shipment</span>
//         </Link>
//         <Link to="/orders" className="mobile-nav-link">
//           <FaShoppingCart className="mobile-nav-icon" />
//           <span>Orders</span>
//         </Link>
//         {user && (
//           <button className="mobile-nav-link" onClick={handleProfileClick}>
//             <FaUserCircle className="mobile-nav-icon" />
//             <span>Profile</span>
//           </button>
//         )}
//       </div>
//     </>
//   );
// };

// export default Header;

import React, { useEffect, useRef, useState } from 'react';
import {
  FaUserCircle,
  FaHome,
  FaBuilding,
  FaTruck,
  FaBoxes,
  FaShoppingCart,
  FaUtensils,
  FaCarrot,
  FaMedkit,
  FaStore
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.jpg';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const secondaryNavRef = useRef(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  // Secondary navigation items with colors
  const secondaryNavItems = [
    { name: 'Hotels', path: '/hotel-display', icon: <FaUtensils />, color: '#FF6B6B' },
    { name: 'Groceries', path: '/hotel-display', icon: <FaStore />, color: '#4ECDC4' },
    { name: 'Vegetables', path: '/hotel-display', icon: <FaCarrot />, color: '#45B7D1' },
    { name: 'Provisions', path: '/hotel-display', icon: <FaBoxes />, color: '#FFA07A' },
    { name: 'Medical', path: '/hotel-display', icon: <FaMedkit />, color: '#98D8C8' }
  ];

  // Check if scrolling is needed on mobile
  useEffect(() => {
    const checkScrollNeeded = () => {
      if (window.innerWidth >= 768) {
        setNeedsScroll(false);
        return;
      }

      const container = secondaryNavRef.current;
      if (container) {
        setNeedsScroll(container.scrollWidth > container.clientWidth);
      }
    };

    checkScrollNeeded();
    window.addEventListener('resize', checkScrollNeeded);
    return () => window.removeEventListener('resize', checkScrollNeeded);
  }, []);

  // Auto-scroll effect for mobile
  useEffect(() => {
    if (!needsScroll || !secondaryNavRef.current || !user) return;

    const container = secondaryNavRef.current;
    const items = Array.from(container.children);
    const itemWidth = items[0]?.offsetWidth || 80;
    const gap = 20;
    const scrollDistance = items.length * (itemWidth + gap);

    // Duplicate items for seamless looping
    items.forEach(item => {
      const clone = item.cloneNode(true);
      container.appendChild(clone);
    });

    let animationId;
    let startTime = null;
    const duration = 15000; // 15 seconds for full cycle

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      container.style.transform = `translateX(-${progress * scrollDistance}px)`;
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        // Reset to start when animation completes
        container.style.transform = 'translateX(0)';
        startTime = null;
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [needsScroll, user]);

  return (
    <>
      {/* Top Strip */}
      <div className="top-strip">
        <h1>Mokshambani Tech Services PVT LTD</h1>
      </div>

      {/* Desktop Header */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo">
            <img src={logo} alt="Company Logo" />
          </div>

          <nav className="nav-links">
            <Link to="/home">Home</Link>
            <Link to="/enterprise">Enterprise</Link>
            <Link to="/partners">Partners</Link>
            <Link to="/shipment">Shipment</Link>
            <Link to="/orders">Orders</Link>
          </nav>

          {user && (
            <button className="profile-icon" onClick={handleProfileClick}>
              <FaUserCircle size={24} />
            </button>
          )}
        </div>

        
      </header>

      {/* Secondary Navigation - Desktop - Only show when user is logged in */}
        {user && (
          <div className="secondary-nav">
            <div className="secondary-nav-container">
              {secondaryNavItems.map((item, index) => (
                <Link 
                  key={index} 
                  to={item.path} 
                  className="secondary-nav-item"
                  style={{ backgroundColor: item.color }}
                >
                  <span className="secondary-nav-icon">{item.icon}</span>
                  <span className="secondary-nav-text">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

      {/* Mobile Secondary Navigation - Only show when user is logged in */}
      {user && (
        <div className="mobile-secondary-nav">
          <div 
            className="mobile-secondary-nav-container" 
            ref={secondaryNavRef}
          >
            {secondaryNavItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.path} 
                className="mobile-secondary-nav-item"
                style={{ backgroundColor: item.color }}
              >
                <span className="mobile-secondary-nav-icon">{item.icon}</span>
                <span className="mobile-secondary-nav-text">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <div className="mobile-bottom-nav">
        <Link to="/home" className="mobile-nav-link">
          <FaHome className="mobile-nav-icon" />
          <span>Home</span>
        </Link>
        <Link to="/enterprise" className="mobile-nav-link">
          <FaBuilding className="mobile-nav-icon" />
          <span>Enterprise</span>
        </Link>
        <Link to="/partners" className="mobile-nav-link">
          <FaTruck className="mobile-nav-icon" />
          <span>Partners</span>
        </Link>
        <Link to="/shipment" className="mobile-nav-link">
          <FaBoxes className="mobile-nav-icon" />
          <span>Shipment</span>
        </Link>
        <Link to="/orders" className="mobile-nav-link">
          <FaShoppingCart className="mobile-nav-icon" />
          <span>Orders</span>
        </Link>
        {user && (
          <button className="mobile-nav-link" onClick={handleProfileClick}>
            <FaUserCircle className="mobile-nav-icon" />
            <span>Profile</span>
          </button>
        )}
      </div>
    </>
  );
};

export default Header;
