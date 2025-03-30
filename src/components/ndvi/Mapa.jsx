import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, LayersControl } from 'react-leaflet'; 
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import '../../styles/ndvi/Mapa.css';
import '../../styles/baseLayer.css';
import Tabs from './Tabs';
import LegendControl from './LegendControl';  
import { useSelector } from "../../context/selectorContext";
import DibujoMarcadores from '../point';  
import CursorCoordinates from '../CursorCoordinates';  

const { BaseLayer } = LayersControl; // Destructure BaseLayer

function Mapa({ prov, year, point }) {
  const { selectedPoint, selectedProv, setSelectedPoint } = useSelector(); // Accedemos a los valores del contexto
  const [mapDataYear, setMapDataYear] = useState(null);
  const [outlineData, setOutlineData] = useState(null);
  const { valoresNdvi, setValoresNdvi } = useSelector();
  const { fechaGrafico, setFechaGrafico } = useSelector();
  const { PolygonPosition, setPolygonPosition } = useSelector();
  const [previousPolygonPosition, setPreviousPolygonPosition] = useState(null);
  const [loading, setLoading] = useState(true);  // Carga general
  const [center, setCenter] = useState([51.505, -0.09]);
  const [markerPosition, setMarkerPosition] = useState(point);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setCenter(selectedPoint); 
  }, [selectedPoint]);  

  useEffect(() => {
    setMarkerPosition(selectedPoint);  
  }, [selectedPoint]);

  useEffect(() => {
    setPolygonPosition(null);  
  }, [selectedProv]);  

  // Usamos un useEffect separado para manejar el cambio de loading cuando se actualiza mapDataYear
  useEffect(() => {
    if (mapDataYear !== null) {
      setLoading(false); // Cambiamos el estado de loading solo después de que mapDataYear se haya actualizado
    }
  }, [mapDataYear]);

  useEffect(() => {
    setLoading(true);  // Iniciar la carga al hacer la solicitud

    const currentPoint = selectedPoint;

    // Realizamos la solicitud para obtener la URL del mapa cuando 'selectedProv' o 'selectedPoint' cambian
    axios
      .post(`${apiUrl}/getMapIdNdvi`, {
        funcion: 'graficoAnual',
        prov: selectedProv,
        año: year,
        point: currentPoint  // Usamos currentPoint
      })
      .then((response) => {
        const data = response.data;
        console.log("Éxito con el mapa en general al modificar point", data);

        // Actualiza los estados con los datos de la respuesta
        setOutlineData(data.outlineUrl); // Obtiene la URL del contorno
        setValoresNdvi(data.valoresNdviPunto);  // Actualiza los valores de nieve
        setFechaGrafico(data.fechaGrafico);  // Actualiza las fechas
        setMapDataYear(data.urlYear); // Actualiza la URL del mapa base
        setPolygonPosition(null);
        
        // Asegurarse de que loading se actualice después de la actualización de mapDataYear
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener el MapID:", error);
        setLoading(false);  // Cambiar loading a false si hay un error
      });
  }, [selectedProv, year]);  // Ahora dependemos también de selectedPoint, selectedProv y year


 /* // Este useEffect solo se ejecutará cuando selectedPoint cambie
  useEffect(() => {
    if (!selectedPoint || selectedPoint === null || selectedPoint === undefined) {
      return;
    }

    setLoading(true);  // Iniciar el estado de carga

    axios
      .post(`${apiUrl}/getPointNdvi`, {
        funcion: 'graficoAnual',
        point: selectedPoint, // Usamos el selectedPoint para obtener los datos del punto
        año: year
      })
      .then((response) => {
        const data = response.data;
        console.log("Éxito con Point", data);

        setValoresNdvi(data.valoresNdviPunto);  // Actualiza los valores de nieve
        setFechaGrafico(data.fechaGrafico);  // Actualiza las fechas
        setLoading(false); // Aquí cambiamos el estado de loading a false una vez que los datos del punto están cargados
      })
      .catch((error) => {
        console.error("Error al obtener el MapID:", error);
        setLoading(false); // Cambiar loading a false si hay un error
      });
  }, [selectedPoint, year]);  // Este efecto depende solo de selectedPoint y year
*/


  const handleMarkerDrawn = (coordinates) => {
    if (coordinates && coordinates.lat !== undefined && coordinates.lng !== undefined) {
      const coordenada = [coordinates.lat, coordinates.lng];
      setMarkerPosition(coordenada);  // Actualizamos el estado con la nueva posición
      setSelectedPoint(coordenada);   // Actualizamos las coordenadas seleccionadas
    } else {
      console.error('Coordenadas no válidas:', coordinates);
    }
  };

  const handlePolygonDrawn = (coordinates) => {
    if (coordinates && coordinates.length > 0 && coordinates[0][0] !== null && coordinates[0][1] !== null) {
      if (JSON.stringify(coordinates) !== JSON.stringify(previousPolygonPosition)) {
        setPolygonPosition(coordinates);  // Guardamos la nueva posición del polígono
        setPreviousPolygonPosition(coordinates); // Actualizamos las coordenadas previas
        setMarkerPosition(null);  // Actualizamos el estado con la nueva posición
        setSelectedPoint(null);   // Actualizamos las coordenadas seleccionadas
      }
    }
  };

  
  const handleBaseLayerChange = (layerName) => {
    console.log(`Capa base seleccionada: ${layerName}`);
  };

  if (loading) {
    return <div className="loading-spinnerMap">
      <div className="spinnerMap"></div>
      <p>Cargando...</p>
    </div>;
  }

  return (
    <div className="mapa-completo-container">
      <div className="mapa-row">
        <div className="mapa-completo">
          <MapContainer
            center={center}
            zoom={7}
            style={{ height: "100%", width: "100%" }}
          >
            <div id="mapYearNdvi"></div>
      {/*  <TileLayer
              url="https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png"
            />  */}


              {/* Control de capas base con LayersControl */}
            <LayersControl position="topright">
              <BaseLayer checked name="OpenStreetMap">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>
              
              <BaseLayer name="Google Maps">
                <TileLayer
                  url="https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png"
                />
              </BaseLayer>
              
              <BaseLayer name="Satélite">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>
            </LayersControl>

            {mapDataYear && (
              <TileLayer
                url={`${mapDataYear}`}
                attribution="Google Earth Engine"
                maxZoom={19}
                opacity={0.7}
                zIndex={1000} 
              />
            )}

            {outlineData && (
              <TileLayer
                url={`${outlineData}`}
                attribution="Google Earth Engine Contorno"
                maxZoom={19}
                opacity={0.7}
              />
            )}

            <LegendControl year={year} />

            <DibujoMarcadores 
              onMarkerDrawn={handleMarkerDrawn} 
              onPolygonDrawn={handlePolygonDrawn} 
              markerPosition={markerPosition}
            />

            <CursorCoordinates />
            
          </MapContainer>
        </div>
      </div>

      <Tabs fechas={fechaGrafico} valores={valoresNdvi} year={year} />
    </div>
  );
}

export default Mapa;
