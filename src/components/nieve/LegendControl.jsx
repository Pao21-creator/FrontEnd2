import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import '../../styles/nieve/Mapa.css';
import '../../styles/legendControl.css';

function LegendControl({ year }) {
  const map = useMap(); 
  useEffect(() => {
   
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend'); 
      const grades = [-1, 40, 80, 120, 160, 200];  
      const labels = ['#eff6f0', '#acdcec', '#68bcf8', '#3480fc', '#121bd1']; 

      div.innerHTML +=  '<div class="legend-title">Referencias</div>';


      
      for (let i = 0; i < grades.length - 1; i++) {
        div.innerHTML +=
          '<i style="background:' + labels[i] + '"></i> ' +
          (grades[i] + 1) + ' - ' + grades[i + 1] + '<br>';
      }

      return div;
    };

    legend.addTo(map); 

   
    const mapContainerYear = document.getElementById('mapYear');
    const mapContainerProm = document.getElementById('mapProm');

    // Solo agregar el texto si no existe ya
    if (mapContainerYear && !mapContainerYear.querySelector('.fixed-text')) {
      const fixedTextYear = document.createElement('div');
      fixedTextYear.classList.add('fixed-text'); // Añadir la clase para estilo
      fixedTextYear.innerHTML = 'Promedio ' + `${year}`; // El texto fijo
      mapContainerYear.appendChild(fixedTextYear);

      // Crear y agregar un tooltip de instrucciones al pasar el mouse sobre el contenedor
      const tooltip = L.tooltip({
        permanent: false,  // No se mantiene visible permanentemente
        direction: 'top',
        offset: [0, -10],
        className: 'tooltip-custom',
      })
        .setContent('Seleccione un año en el selector de la izquierda para cambiar el promedio.') 
        .setLatLng(map.getCenter()); 

      
      mapContainerYear.addEventListener('mouseover', () => {
        tooltip.addTo(map);  // Mostrar el tooltip
      });

      
      mapContainerYear.addEventListener('mouseout', () => {
        tooltip.remove();  // Ocultar el tooltip
      });
    }

    if (mapContainerProm && !mapContainerProm.querySelector('.fixed-text')) {
      const fixedTextProm = document.createElement('div');
      fixedTextProm.classList.add('fixed-text'); // Añadir la clase para estilo
      fixedTextProm.innerHTML = 'Promedio 2001-2024'; // El texto fijo
      mapContainerProm.appendChild(fixedTextProm);
    }

    return () => {
      map.removeControl(legend); // Eliminar la leyenda al desmontar el componente

      // Eliminar los textos fijos al desmontar el componente
      if (mapContainerYear) {
        const fixedTextYear = mapContainerYear.querySelector('.fixed-text');
        if (fixedTextYear) {
          mapContainerYear.removeChild(fixedTextYear);
        }
      }
      if (mapContainerProm) {
        const fixedTextProm = mapContainerProm.querySelector('.fixed-text');
        if (fixedTextProm) {
          mapContainerProm.removeChild(fixedTextProm);
        }
      }
    };
  }, [map, year]);

  return null;
}

export default LegendControl;

