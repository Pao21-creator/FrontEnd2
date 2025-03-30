// src/components/MobileMessage.jsx
import React, { useState, useEffect } from 'react';
import '../styles/movilSize.css'; // Asegúrate de importar el archivo CSS

function MovilMessage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Función para verificar el tamaño de la ventana
    const checkMobileView = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    // Llama a la función al cargar y redimensionar la ventana
    checkMobileView();
    window.addEventListener('resize', checkMobileView);

    // Limpiar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  // Si la pantalla no es móvil o tablet, no mostramos nada.
  if (!isMobile) return null;

  return (
    <div className="mobile-message">
      <h1>Formato celular y tablet en desarrollo</h1>
      <p>Por favor, intente abrir la aplicación en un PC para una mejor experiencia.</p>
    </div>
  );
}


export default MovilMessage;
