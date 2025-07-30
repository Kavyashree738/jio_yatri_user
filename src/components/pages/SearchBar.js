import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMicrophone } from 'react-icons/fa';
import '../../styles/SearchBar.css'
const secondaryNavItems = [
  { name: 'Hotels', path: '/shops/hotel', icon: '🍽️', color: '#FF6B6B' },
  { name: 'Groceries', path: '/shops/grocery', icon: '🛒', color: '#4ECDC4' },
  { name: 'Vegetables', path: '/shops/vegetable', icon: '🥕', color: '#45B7D1' },
  { name: 'Provisions', path: '/shops/provision', icon: '📦', color: '#FFA07A' },
  { name: 'Medical', path: '/shops/medical', icon: '🏥', color: '#98D8C8' }
];

const normalizeText = (text) => text.trim().toLowerCase();

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();

  const handleSearchNavigation = (query) => {
    const normalizedQuery = normalizeText(query);
    const matchedItem = secondaryNavItems.find(item =>
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

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <FaSearch className="search-icon" />
        <form onSubmit={handleSearchSubmit}>
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
    </div>
  );
};

export default SearchBar;