import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SelectorProvider } from './context/selectorContext'; 
import Focos from './pages/Focos.jsx';
import Nieve from './pages/Nieve.jsx';
import Ndvi from './pages/Ndvi.jsx';
import Inundacion from './pages/Inundacion.jsx';
import Nevadas from './pages/Nevadas.jsx';
import Home from './pages/Home'; 
import './styles/App.css';
import MovilMessage from './components/MovilMessage.jsx'; 

function App() {
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [retryCount, setRetryCount] = useState(0);  // Para contar los intentos de reintento
  const maxRetries = 5;  // Número máximo de reintentos
  const apiUrl = import.meta.env.VITE_API_URL;

  // Función que verifica el estado del backend
  const checkBackendStatus = async () => {
    try {
      const response = await axios.get(`${apiUrl}/status`); 
      if (response.status === 200) {
        setIsBackendAvailable(true);
      }
    } catch (err) {
      setError('No se pudo conectar con el backend');
      // Si no se conecta, aumenta el contador de intentos
      if (retryCount < maxRetries) {
        setRetryCount(retryCount + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBackendStatus(); // Ejecutar la verificación cuando el componente se monta

    const checkMobileView = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    checkMobileView(); // Inicializamos el valor
    window.addEventListener('resize', checkMobileView); 

    // Intervalo para reintentar la conexión con el backend cada 5 segundos
    const retryInterval = setInterval(() => {
      if (!isBackendAvailable && retryCount < maxRetries) {
        setLoading(true);  // Muestra que está verificando nuevamente
        checkBackendStatus();
      }
    }, 5000); // Reintenta cada 5 segundos

    return () => {
      window.removeEventListener('resize', checkMobileView);
      clearInterval(retryInterval); // Limpiar el intervalo al desmontarse el componente
    };
  }, [isBackendAvailable, retryCount]); // Dependencias actualizadas

  if (loading) {
    return <div>Verificando el servidor...</div>;
  }

  if (error && retryCount < maxRetries) {
    return (
      <div>
        <p>{error}</p>
        <p>Intentando conectar nuevamente...</p>
      </div>
    );
  }

  if (retryCount >= maxRetries) {
    return (
      <div>
        <p>{error}</p>
        <p>No se pudo conectar al servidor después de {maxRetries} intentos. Por favor, intente más tarde.</p>
      </div>
    );
  }

  if (!isBackendAvailable) {
    return <div>El servidor no está disponible. Por favor, intente más tarde.</div>;
  }

  if (isMobile) {
    return <MovilMessage />;
  }

  return (
    <Router>
      <SelectorProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nieve" element={<Nieve />} />
          <Route path="/focos" element={<Focos />} />  
          <Route path="/nevadas" element={<Nevadas />} /> 
          <Route path="/inundacion" element={<Inundacion />} />
          <Route path="/ndvi" element={<Ndvi />} />  
        </Routes>
      </SelectorProvider>
    </Router>
  );
}

export default App;
