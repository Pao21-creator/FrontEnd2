import React, { useState } from 'react';
import PropTypes from 'prop-types';  // Para añadir validación de tipos de datos
import '../styles/selectorAño.css';  // Asegúrate de importar el archivo CSS

function SelectorAño({ options, value, onSelectChange, className }) {
  const [selectedOption, setSelectedOption] = useState(value || options[0].value);

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue);
    onSelectChange(selectedValue);  // Llamamos a la función onSelectChange pasada como prop
  };

  return (
    <div className={`selector-containerAño ${className || ''}`}>
      <label htmlFor="Años-options">Seleccione un año:</label>
      <select id="Años-options" value={selectedOption} onChange={handleSelectChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Añadir validación de las props
SelectorAño.propTypes = {
  options: PropTypes.array.isRequired,  
  value: PropTypes.string.isRequired,   
  onSelectChange: PropTypes.func.isRequired,  
  className: PropTypes.string          
};

export default SelectorAño;
