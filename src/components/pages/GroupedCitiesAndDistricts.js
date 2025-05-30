import React from 'react';
import '../../styles/GroupedCitiesAndDistricts.css';

const citiesAndDistricts = [
  'Bengaluru Urban',
  'Mysuru',
  'Mangaluru',
  'Hubballi-Dharwad',
  'Belagavi',
  'Shivamogga',
  'Tumakuru',
  'Ballari',
  'Davanagere',
  'Vijayapura'
];

const GroupedCitiesAndDistricts = () => {
  const grouped = [];
  let index = 0;
  let groupSize = 5;

  while (index < citiesAndDistricts.length) {
    const group = citiesAndDistricts.slice(index, index + groupSize);
    grouped.push(group);
    index += groupSize;
    groupSize = Math.max(groupSize - 1, 1); // reduce size but not below 1
  }

  return (
    <div className="grouped-container">
      <h2>Karnataka Districts We Are In</h2>
      {grouped.map((group, i) => (
        <div key={i} className="group-row">
          {group.map((name, j) => (
            <div key={j} className="city-box">{name}</div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GroupedCitiesAndDistricts;
