import React from 'react';
import PropTypes from 'prop-types';
import '../styles/textDescriptivo.css'; // Estilo común

function TextoDescriptivo({ title, description, description2, customClass }) {
  return (
    <div className={`text-container ${customClass}`}>
      <h2>{title}</h2>
      <br />
      <p>{description}</p>
      <br />
      <p>{description2}</p>
    </div>
  );
}

// PropTypes para definir las propiedades que acepta el componente
TextoDescriptivo.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  description2: PropTypes.string.isRequired,
  customClass: PropTypes.string,  // Prop opcional para agregar clases personalizadas
};


export default TextoDescriptivo;
