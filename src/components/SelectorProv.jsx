import React, { useState } from 'react';
import '../styles/selectorProv.css';

function SelectorProv({ options, value, onSelectChange, customClass }) {
  const [selectedOption, setSelectedOption] = useState(value || options[0].value);

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue);
    onSelectChange(selectedValue);  // Llamamos a la función onSelectChange pasada como prop
  };

  return (
    <div className={`selector-containerProv ${customClass}`}>
      <label htmlFor="map-options">Seleccione una provincia:</label>
      <select id="map-options" value={selectedOption} onChange={handleSelectChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectorProv;
