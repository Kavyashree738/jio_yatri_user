import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMicrophone } from 'react-icons/fa';
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
  const navigate = useNavigate();

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
    </div>
  );
};

export default SearchBar;
