import React, { useEffect } from 'react';
import L from 'leaflet';
import '../styles/contextMenu.css';

const ContextMenu = ({ layer, map }) => {

  useEffect(() => {
    // Verificar que la capa sea válida
    if (!layer) return;

    // Definir las opciones del menú contextual cuando se hace clic derecho en la capa
    const handleRightClick = (e) => {
      const menuContent = `
        <div class="context-menu">
          <ul>
            <li><a href="#" onClick={() => alert("Ver información")}>Ver información</a></li>
            <li><a href="#" onClick={() => alert("Editar estilos")}>Editar estilos</a></li>
            <li><a href="#" onClick={() => alert("Descargar geometría")}>Descargar geometría</a></li>
            <li><a href="#" onClick={() => alert("Medir")}>Medir</a></li>
            <li><a href="#" onClick={() => map.removeLayer(layer)}>Eliminar geometría</a></li>
          </ul>
        </div>
      `;

      // Crear un DivIcon para el menú contextual
      const contextMenuIcon = L.divIcon({
        className: 'leaflet-context-menu', // Para aplicar un estilo personalizado
        html: menuContent,
        iconSize: [200, 150], // Ajustar tamaño
      });

      // Crear un marcador para mostrar el menú
      const contextMenuMarker = L.marker(e.latlng, {
        icon: contextMenuIcon,
        clickable: false, // No necesitamos que sea clickeable
        zIndexOffset: 1000, // Asegurarnos de que esté encima
      });

      // Agregar el marcador (que contiene el menú) al mapa
      contextMenuMarker.addTo(map);

      // Eliminar el menú contextual cuando se haga clic en cualquier lugar
      const removeMenu = (e) => {
        if (!contextMenuMarker.getBounds().contains(e.latlng)) {
          map.off('click', removeMenu);
          map.removeLayer(contextMenuMarker);
        }
      };

      // Escuchar el clic en cualquier lugar del mapa para cerrar el menú
      map.on('click', removeMenu);
    };

    // Asociar el evento contextmenu a la capa
    layer.on('contextmenu', handleRightClick);

    // Limpiar el evento cuando el componente se desmonte
    return () => {
      layer.off('contextmenu', handleRightClick);
    };
  }, [layer, map]);

  return null;
};

export default ContextMenu;
