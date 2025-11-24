import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMicrophone, FaYoutube, FaShareAlt } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import '../../styles/SearchBar.css';

const secondaryNavItems = [
  { name: 'Hotels', path: '/shops/hotel', keywords: ['hotel', 'hotels'] },
  { name: 'Groceries', path: '/shops/grocery', keywords: ['grocery', 'groceries'] },
  { name: 'Vegetables', path: '/shops/vegetable', keywords: ['vegetable', 'vegetables', 'veggies'] },
  { name: 'Provisions', path: '/shops/provision', keywords: ['provision', 'provisions'] },
  { name: 'Medical', path: '/shops/medical', keywords: ['medical', 'medicals', 'medicine'] },
  { name: 'Bakery', path: '/shops/bakery', keywords: ['bakery', 'bakeries', 'cakes', 'pastry', 'bread'] },
  { name: 'Cafe', path: '/shops/cafe', keywords: ['cafe', 'coffee', 'tea', 'snacks'] },
];

const normalizeText = (text) => text.trim().toLowerCase();

const SearchBar = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [marqueeText, setMarqueeText] = useState(t("share"));
  const [marqueeActive, setMarqueeActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setMarqueeActive(true);
      setMarqueeText(t("earn_cashback"));
      
      setTimeout(() => {
        setMarqueeActive(false);
        setMarqueeText(t("share"));
      }, 3000);
    }, 6000);

    return () => clearInterval(interval);
  }, [t]);

  const handleSearchNavigation = (query) => {
    const normalizedQuery = normalizeText(query);
    const matchedItem = secondaryNavItems.find(item =>
      item.keywords?.some(keyword => normalizeText(keyword).includes(normalizedQuery)) ||
      normalizeText(item.name).includes(normalizedQuery)
    );

    if (matchedItem) {
      navigate(matchedItem.path);
    } else {
      alert(t("no_category_found"));
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
      alert(t("voice_not_supported"));
    }
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search_placeholder")}
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

      <button className="youtube-btn" onClick={() => window.open('https://youtube.com/@ambaninewstv', '_blank')}>
        <FaYoutube className='youtube-icon' />
      </button>

      <button className="share-btn" onClick={() => navigate('/refferal')}>
        <div className={`marquee-text ${marqueeActive ? 'active' : ''}`}>
          {marqueeText}
        </div>
      </button>
    </div>
  );
};

export default SearchBar;
