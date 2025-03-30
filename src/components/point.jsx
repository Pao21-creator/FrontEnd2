import React, { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useSelector } from "../context/selectorContext";

const DibujoMarcadores = ({ onMarkerDrawn, onPolygonDrawn, markerPosition }) => {
  const map = useMap();
  const { PolygonPosition, setPolygonPosition } = useSelector();
  const [drawnItems, setDrawnItems] = useState(null); // Crear estado para el grupo de elementos dibujados
  const [Poly, setPoly] = useState(PolygonPosition); // Estado para el polígono
  const [Mark, setMark] = useState(markerPosition);
  const [polygonArea, setPolygonArea] = useState(null); // Agregar estado para el área
  const saveButtonRef = useRef(null); // Referencia al botón de guardar

  useEffect(() => {
    // Configurar los textos y tooltips en español antes de inicializar el control de dibujo
    L.drawLocal.draw.toolbar.finish.title = "Finalizar dibujo";
    L.drawLocal.draw.toolbar.finish.text = "Finalizar";
    L.drawLocal.draw.toolbar.actions.title = "Cancelar dibujo";
    L.drawLocal.draw.toolbar.actions.text = "Cancelar";
    L.drawLocal.draw.toolbar.undo.title = "Eliminar el último punto dibujado";
    L.drawLocal.draw.toolbar.undo.text = "Eliminar el último punto";
    L.drawLocal.draw.handlers.marker.tooltip.start = "Click sobre el mapa para posicionar el marcador";
    L.drawLocal.draw.handlers.polygon.tooltip.start = "Click para comenzar a dibujar la forma";
    L.drawLocal.draw.handlers.polygon.tooltip.cont = "Click para continuar dibujando la forma";
    L.drawLocal.draw.handlers.polygon.tooltip.end = "Click en el primer punto para cerrar la forma";

    // Inicializamos el grupo de elementos una sola vez
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Configuramos el control de dibujo para agregar tanto marcadores como polígonos
    const drawControl = new L.Control.Draw({
      draw: {
        marker: true,
        polygon: true, // Activamos la opción para dibujar polígonos
        polyline: false,
        rectangle: false,
        circle: false,  // Deshabilitamos la opción para dibujar círculos
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItems, // Usamos 'drawnItems' aquí
      }
    });
    map.addControl(drawControl);

    map.on('draw:editstart', (e) => {
      const layer = e.layer;
      
      // Si el tipo de layer es un polígono o marcador, abrimos el popup.
      if (layer instanceof L.Polygon) {
        const coords = layer.getLatLngs()[0];
        
        const popupContent = `
          <h4>Editar coordenadas del polígono</h4>
          <textarea id="polygonCoords" rows="4" cols="50">${coords.map(coord => `${coord.lat}, ${coord.lng}`).join('\n')}</textarea>
          <br />
          <button id="saveCoords">Guardar cambios</button>
        `;
        

        layer.bindPopup(popupContent).openPopup();
        console.log("Popup abierto para la capa", layer);

        
        // Guardar cambios de las coordenadas cuando se hace clic en "Guardar cambios"
        const saveButton = document.querySelector('#saveCoords');
        saveButton.addEventListener('click', () => {
          const newCoordsText = document.querySelector('#polygonCoords').value;
          const newCoordsArray = newCoordsText.split('\n').map(line => {
            const [lat, lng] = line.split(',').map(Number);
            return L.latLng(lat, lng);
          });

          // Actualizar las coordenadas del polígono
          layer.setLatLngs([newCoordsArray]);
          onPolygonDrawn(layer);
          setPoly(newCoordsArray);

          // Calcular el área del polígono
          const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
          const areaInKm2 = area / 1000000;
          setPolygonArea(areaInKm2);

          // Cerrar el popup
          layer.closePopup();
        });
      }

      // Si el tipo de layer es un marcador, mostrar el popup para editar sus coordenadas
      if (layer instanceof L.Marker) {
        const latlng = layer.getLatLng();
        const popupContent = `
          <h4>Editar marcador</h4>
          <textarea id="markerCoords" rows="2" cols="50">${latlng.lat}, ${latlng.lng}</textarea>
          <br />
          <button id="saveMarkerCoords">Guardar cambios</button>
        `;
        
        layer.bindPopup(popupContent).openPopup();

        // Guardar cambios de las coordenadas del marcador
        const saveButton = document.querySelector('#saveMarkerCoords');
        saveButton.addEventListener('click', () => {
          const newCoordsText = document.querySelector('#markerCoords').value;
          const [newLat, newLng] = newCoordsText.split(',').map(Number);
          const newLatLng = L.latLng(newLat, newLng);

          // Actualizar las coordenadas del marcador
          layer.setLatLng(newLatLng);
          onMarkerDrawn(newLatLng);  
          setMark(newLatLng);

          // Cerrar el popup
          layer.closePopup();
        });
      }
    });


    // Función que elimina todos los elementos en el grupo de dibujos
    const removeAllLayers = () => {
      drawnItems.clearLayers();
    };

    // Evento que se dispara cuando se crea un marcador o polígono
    map.on('draw:created', (e) => {
      const { layer } = e;

      // Limpiar todos los elementos antes de añadir el nuevo marcador o polígono
      removeAllLayers();

      // Si el tipo de layer es un marcador
      if (e.layerType === 'marker') {
        const latlng = layer.getLatLng(); // Coordenadas del marcador
        const { lat, lng } = latlng;
      
        if (lat !== undefined && lng !== undefined) {
          // Añadir el nuevo marcador al grupo
          drawnItems.addLayer(layer);
          onMarkerDrawn(latlng);  
          setMark(latlng); // Actualizar marcador
          setPoly(null); // Limpiar polígono
          setPolygonPosition(null);
          setPolygonArea(null);
        } else {
          console.error('Coordenadas de marcador indefinidas:', lat, lng);
        }
      }

      // Si el tipo de layer es un polígono
      if (e.layerType === 'polygon') {
        const latlngs = layer.getLatLngs(); // Coordenadas del polígono
      
        if (Array.isArray(latlngs) && latlngs.length > 0 && Array.isArray(latlngs[0])) {
          const polygonCoordinates = latlngs[0].map(latlng => [latlng.lat, latlng.lng]);
      
          // Añadir el nuevo polígono al grupo
          drawnItems.addLayer(layer);
          onPolygonDrawn(polygonCoordinates);
          setPoly(polygonCoordinates); // Actualizar polígono

          const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]); // Cálculo en metros cuadrados
          const areaInKm2 = area / 1000000; // Convertir a km²
          setPolygonArea(areaInKm2); // Establecer el área en el estado

          setMark(null); // Limpiar marcador
        } else {
          console.error('Coordenadas del polígono indefinidas o vacías:', latlngs);
        }
      }
    });

    // Si ya tienes una posición de marcador, lo dibujamos en el mapa
    if (Mark && !drawnItems.hasLayer(Mark)) { // Comprobar que no se haya agregado antes
      const existingMarker = L.marker(Mark);
      drawnItems.addLayer(existingMarker); // Agregar el marcador inicial
    }

    // Verificar si PolygonPosition tiene un valor válido
    if (Poly && Array.isArray(Poly) && Poly.length > 0 && !drawnItems.hasLayer(Poly)) {
      const existingPolygon = L.polygon(Poly);
      drawnItems.addLayer(existingPolygon); // Agregar el polígono inicial
    }

    const areaControl = L.control({ position: 'topright' });
    areaControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-control-area');
      div.innerHTML = `<strong>Área del Polígono:</strong> ${polygonArea ? polygonArea.toFixed(2) : '0.00'} km²`;
      return div;
    };
    areaControl.addTo(map);

    // Cleanup: eliminar el control de dibujo cuando el componente se desmonte
    return () => {
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
      map.removeControl(areaControl);  // Limpiar el control del área
    };
  }, [markerPosition, PolygonPosition, onMarkerDrawn, Poly]); // Dependencias actualizadas

  return null; // Este componente no necesita renderizar nada directamente
};

export default DibujoMarcadores;
