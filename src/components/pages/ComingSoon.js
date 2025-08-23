import React from 'react';
import '../../styles/ComingSoon.css'; // Make sure this CSS file exists
import Header from './Header';
import Footer from './Footer';
import SecondaryNav from './SecondaryNav';
const ComingSoon = () => {
  return (
    <>
    <Header/>
    <SecondaryNav/>
    <div className="coming-soon-container">
      <h1 className="coming-soon-title">Coming Soon</h1>
      <p className="coming-soon-message">This feature will be available soon. Stay tuned!</p>
    </div>
    <Footer/>
    </>
  );
};

export default ComingSoon;
