import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMicrophone, FaYoutube, FaShareAlt } from 'react-icons/fa';
import '../../styles/SearchBar.css';

const secondaryNavItems = [
  { name: 'Hotels', path: '/shops/hotel', keywords: ['hotel', 'hotels'] },
  { name: 'Groceries', path: '/shops/grocery', keywords: ['grocery', 'groceries'] },
  { name: 'Vegetables', path: '/shops/vegetable', keywords: ['vegetable', 'vegetables', 'veggies'] },
  { name: 'Provisions', path: '/shops/provision', keywords: ['provision', 'provisions'] },
  { name: 'Medical', path: '/shops/medical', keywords: ['medical', 'medicals', 'medicine'] }
];

const normalizeText = (text) => text.trim().toLowerCase();

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [marqueeText, setMarqueeText] = useState('Share');
  const [marqueeActive, setMarqueeActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setMarqueeActive(true);
      setMarqueeText('Earn ₹30 Cashback');
      
      setTimeout(() => {
        setMarqueeActive(false);
        setMarqueeText('Share');
      }, 3000);
    }, 6000); // Full cycle every 6 seconds (3s each text)

    return () => clearInterval(interval);
  }, []);

  const handleSearchNavigation = (query) => {
    const normalizedQuery = normalizeText(query);
    const matchedItem = secondaryNavItems.find(item =>
      item.keywords?.some(keyword => normalizeText(keyword).includes(normalizedQuery)) ||
      normalizeText(item.name).includes(normalizedQuery)
    );

    if (matchedItem) {
      navigate(matchedItem.path);
    } else {
      alert("No matching category found!");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearchNavigation(searchQuery);
  };

  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      setIsListening(true);
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        handleSearchNavigation(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      alert('Voice recognition not supported in this browser');
    }
  };

  const handleYoutubeClick = () => {
    window.open('https://youtube.com/@ambaninewstv?si=PBGWaPOKXdjV-Oa4', '_blank');
  };

  const handleShareClick = () => {
    navigate('/refferal');
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for Hotels, Groceries..."
          />
        </form>
        <button
          type="button"
          className={`voice-search-btn ${isListening ? 'listening' : ''}`}
          onClick={startVoiceSearch}
        >
          <FaMicrophone />
        </button>
      </div>
      <button className="youtube-btn" onClick={handleYoutubeClick}>
        <FaYoutube className='youtube-icon' />
      </button>
      <button className="share-btn" onClick={handleShareClick}>
        <div className={`marquee-text ${marqueeActive ? 'active' : ''}`}>
              {marqueeText}
            </div>
      </button>
    </div>
  );
};

export default SearchBar;