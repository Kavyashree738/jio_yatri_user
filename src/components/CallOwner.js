import React, { useState, useRef, useEffect } from 'react';
import { FaPhone, FaUser } from 'react-icons/fa';
import '../styles/CallOwner.css'; // Your custom CSS

const CallOwner = ({ ownerNumber = '+91 98765 43210', ownerName = 'Support' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 100,
    y: Math.min(window.innerHeight - 100, window.innerHeight - 200), // Safe bottom margin
  });

  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const toggleExpand = () => {
    if (!isDragging.current) {
      setIsExpanded((prev) => !prev);
    }
  };

  const handleCallClick = () => {
    setIsCalling(true);
    setTimeout(() => {
      window.location.href = `tel:${ownerNumber.replace(/\D/g, '')}`;
    }, 1000);
  };

  // Close expanded card only if clicked on card background (not children)
  const handleCardClick = (e) => {
    if (e.target === e.currentTarget) {
      toggleExpand();
    }
  };

  const handleStart = (clientX, clientY) => {
    isDragging.current = false;
    startPos.current = { x: clientX - position.x, y: clientY - position.y };
    document.body.style.userSelect = 'none';
  };

  const handleMove = (clientX, clientY) => {
    const dx = Math.abs(clientX - (position.x + startPos.current.x));
    const dy = Math.abs(clientY - (position.y + startPos.current.y));

    if (dx > 5 || dy > 5) {
      isDragging.current = true;
    }

    if (isDragging.current) {
      const newX = clientX - startPos.current.x;
      const newY = clientY - startPos.current.y;

      const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 80));
      const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 150));

      setPosition({ x: boundedX, y: boundedY });
    }
  };

  const handleEnd = () => {
    document.body.style.userSelect = '';
    if (!isDragging.current) {
      toggleExpand();
    }
    isDragging.current = false;
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    handleEnd();
  };

  const onTouchStart = (e) => {
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };

  const onTouchMove = (e) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const onTouchEnd = () => {
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
    handleEnd();
  };

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 80),
        y: Math.min(prev.y, window.innerHeight - 150),
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`call-owner-container ${isExpanded ? 'expanded' : ''}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        transition: isDragging.current ? 'none' : 'transform 0.2s ease',
        touchAction: 'none',
      }}
    >
      {isExpanded ? (
        <div className="call-card" onClick={handleCardClick}>
          <div className="owner-info">
            <div className="owner-avatar">
              <FaUser />
            </div>
            <div className="owner-details">
              <h4>{ownerName}</h4>
              <p>{ownerNumber}</p>
            </div>
          </div>
          <button
            className={`call-button ${isCalling ? 'calling' : ''}`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent closing on call button click
              handleCallClick();
            }}
            disabled={isCalling}
          >
            <FaPhone className="call-icon" />
            {isCalling ? 'Calling...' : 'Call Now'}
          </button>
        </div>
      ) : (
        <div
          className="fab-wrapper"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <button className="fab">
            <FaPhone className="fab-icon" />
          </button>
          <span className="fab-label">Need Help?</span>
        </div>
      )}
    </div>
  );
};

export default CallOwner;
