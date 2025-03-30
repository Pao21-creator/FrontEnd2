import React from 'react';
import Navbar from '../components/Navbar'; 
import Mapa from '../components/inundacion/Mapa';     
import Sidebar from '../components/inundacion/Sidebar';  
import { useSelector } from '../context/selectorContext'; // Importamos el hook
import { useLocation } from 'react-router-dom';

function Inundacion() {
  const { selectedProv, selectedYear, selectedPoint } = useSelector(); // Accedemos al estado global
  const location = useLocation(); // Para obtener la ruta actual

  if(location.pathname === '/inundacion'){
  return (
    <div>
      <Navbar />  

      <div className="main-container">
        {/* Barra lateral */}
        <Sidebar />

        {/* Pasamos los valores seleccionados al mapa */}
        <Mapa prov={selectedProv} year={selectedYear} point={selectedPoint}/>
      </div>
    </div>
  );
} else {
  return 0;
}

}

export default Inundacion;

