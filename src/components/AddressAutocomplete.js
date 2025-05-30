import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/components.css';

function AddressAutocomplete({ onSelect }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (query.length > 2) {
            const timer = setTimeout(() => {
                axios.get('http://localhost:5000/api/address/autocomplete', {
                    params: {
                        input: query,
                        country: 'in' // Optional: restrict to India
                    }
                })
                    .then(res => {
                        setSuggestions(res.data.predictions || []);
                        setShowDropdown(true);
                    })
                    .catch(err => console.error('Autocomplete error:', err));
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setSuggestions([]);
            setShowDropdown(false);
        }
    }, [query]);

    const handleSelect = async (suggestion) => {
        setQuery(suggestion.description);
        setShowDropdown(false);

        try {
            const response = await axios.get('http://localhost:5000/api/address/geocode', {
                params: {
                    place_id: suggestion.place_id
                }
            });

            console.log('Geocode API response:', response.data);

            // Check if result exists and has geometry data
            if (response.data.result && response.data.result.geometry && response.data.result.geometry.location) {
                const location = response.data.result.geometry.location;

                onSelect({
                    address: suggestion.description,
                    coordinates: {
                        lat: location.lat,
                        lng: location.lng
                    }
                });
            } else {
                console.warn('No geocoding results found for place_id:', suggestion.place_id);
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
    };
    return (
        <div className="autocomplete">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter address..."
                required
            />

            {showDropdown && suggestions.length > 0 && (
                <div className="autocomplete-dropdown">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className="dropdown-item"
                            onClick={() => handleSelect(suggestion)}
                        >
                            {suggestion.description}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AddressAutocomplete;