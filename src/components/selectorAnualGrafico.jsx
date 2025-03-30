import React, { useState } from 'react';
import '../styles/selectorAnualGrafic.css';

function SelectorAnualGrafico({ options, value, onSelectChange, className }) {
  const [selectedOption, setSelectedOption] = useState(options[0].value);

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue);
    onSelectChange(selectedValue);  // Llamamos a la función onSelectChange pasada como prop
  };

  return (
    <div className= {`selector-ContainerAnualG ${className || ''}`}>
      
      <label htmlFor="Años-options-grafic">Seleccione los años:</label>
      <select id="Años-options-grafic" value={value} onChange={handleSelectChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectorAnualGrafico;
