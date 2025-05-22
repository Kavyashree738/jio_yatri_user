import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../../styles/Home.css';
import logo from '../../assets/images/logo.jpg';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className='header'>
      <div className="nav-container">
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>

        <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <a href="#">Home</a>
          <a href="#welcome-section">About Us</a>
          <a href="#service">Services</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </header>
  );
};

export default Header;
