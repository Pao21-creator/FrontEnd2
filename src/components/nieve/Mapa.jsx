import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import '../../styles/nieve/Mapa.css';
import Tabs from './Tabs';
import L from 'leaflet';
import LegendControl from './LegendControl';  

// Componente para el mapa con Earth Engine
function Mapa({ cuenca, year }) {
  const [mapDataProm, setMapDataProm] = useState(null); 
  const [mapDataYear, setMapDataYear] = useState(null);
  const [outlineData, setOutlineData] = useState(null);
  const [valoresDeNievePorFecha, setValoresDeNievePorFecha] = useState([]);
  const [fechaGrafico, setFechaGrafico] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState([51.505, -0.09]);
  const apiUrl = import.meta.env.VITE_API_URL;
  
  let cuencas = 'barrancasygrande';
  let titulo = 'Río Colorado';
  const año = 2008;

  useEffect(() => {
    setLoading(true);

    axios
      .post(`${apiUrl}/getMapIdCuenca`, {
        funcion : 'graficoAnual',
        cuenca : cuenca,
        año: year
      })
      .then((response) => {
        const data = response.data;
        console.log("Exitos con la comunicación a la API", data);

        // Actualiza los estados con los datos de la respuesta
        setMapDataYear(data.urlYear);
        setMapDataProm(data.urlProm);
        setOutlineData(data.outlineUrl); 
        setValoresDeNievePorFecha(data.valoresDeNievePorFecha);  
        setFechaGrafico(data.fechaGrafico);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener el MapID:", error);
        setLoading(false);
      });
  }, [cuenca, year]);

  useEffect(() => {
   
    const centers = {
      'barrancasygrande': [-36, -69.7600], // Londres
      'type2': [40.7128, -74.0060], // Nueva York
      'default': [34.0522, -118.2437], // Los Angeles
    };

    setCenter(centers[cuencas] || centers['default']);
  }, [cuencas]);

  if (loading) {
    return <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Cargando...</p>
  </div>;
  }

  return (
    <div className="mapa-container">
   
      <h2 className="map-title">{cuenca ? `Cuenca del ${titulo}` : 'Cuenca no definida'}</h2>

      <div className="mapa-row">
        <div className="mapa">
          <MapContainer
            center={center}
            zoom={7}
            style={{ height: "100%", width: "100%" }}
          >
            <div id="mapYear" ></div>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
            />

            {mapDataYear && (
              <TileLayer
                url={`${mapDataYear}`}
                attribution="Google Earth Engine"
                maxZoom={19}
                opacity={0.8}
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

            <LegendControl year={year}/>
          </MapContainer>
        </div>

        <div className="mapa">
          <MapContainer 
            center={center}
            zoom={7}
            style={{ height: "100%", width: "100%" }}
          >
              <div id="mapProm" ></div>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
            />

            {mapDataProm && (
              <TileLayer
                url={`${mapDataProm}`}
                attribution="Google Earth Engine"
                maxZoom={19}
                opacity={0.8}
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

            <LegendControl year={year}/>
          </MapContainer>
        </div>
      </div>

    
      <Tabs 
        fechas={fechaGrafico} 
        valores={valoresDeNievePorFecha} 
        year = {year}
      />
    </div>
  );
}

export default Mapa;
