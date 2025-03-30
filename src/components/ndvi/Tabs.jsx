import React, { useState, useEffect } from "react";
import axios from 'axios';
import "../../styles/Tabs.css";
import { useSelector } from "../../context/selectorContext";
import SelectorAnualGrafico from "../selectorAnualGrafico";
import Grafico from "./grafic"; 
import GraficComparador from "./graficComparador";

function Tabs({ fechas, valores, year }) {
  const [activeTab, setActiveTab] = useState(0);
  const {
    selectedYearGrafic,
    handleYearGraficSelectChange,
    selectedProv,
    selectedPoint,
  } = useSelector();
  const [loadingPolygon, setLoadingPolygon] = useState(false); // Carga general
  const { polygonPosition } = useSelector();
  const { valoresNdvi, setValoresNdvi } = useSelector();
  const { fechaGrafico, setFechaGrafico } = useSelector();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [tooltipText, setTooltipText] = useState( "Compara la serie anual del año seleccionado, con el promedio histó- rico de ndvi entre los años 2001 y 2024. Los datos utilizados corres- ponden al promedio del indice de vegetación, obtenidos en intervalos de 16 días, lo que resulta en aproximadamente 22 datos por año.");

  const [tooltipText2, setTooltipText2] = useState( "Compara la serie anual del año seleccionado con los años elegidos en el selector de la derecha. Los datos utilizados corresponden al promedio del índice de vegetación, obtenidos en intervalos de 16 días, lo que genera aproximadamente 22 datos por año.");

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  // Opciones de años como antes
  const yearOptions = [
    { value: 2001, label: "2001" },
    { value: 2002, label: "2002" },
    { value: 2003, label: "2003" },
    { value: 2004, label: "2004" },
    { value: 2005, label: "2005" },
    { value: 2006, label: "2006" },
    { value: 2007, label: "2007" },
    { value: 2008, label: "2008" },
    { value: 2009, label: "2009" },
    { value: 2010, label: "2010" },
    { value: 2011, label: "2011" },
    { value: 2012, label: "2012" },
    { value: 2013, label: "2013" },
    { value: 2014, label: "2014" },
    { value: 2015, label: "2015" },
    { value: 2016, label: "2016" },
    { value: 2017, label: "2017" },
    { value: 2018, label: "2018" },
    { value: 2019, label: "2019" },
    { value: 2020, label: "2020" },
    { value: 2021, label: "2021" },
    { value: 2022, label: "2022" },
    { value: 2023, label: "2023" },
    { value: 2024, label: "2024" },
  ];

  function reformatCoordinates(coords) {
    // Aseguramos que las coordenadas se reformatean correctamente (de [lat, lng] a [lng, lat])
    return coords.map((coord) => {
      if (
        coord &&
        coord.length === 2 &&
        coord[0] !== null &&
        coord[1] !== null
      ) {
        return [coord[1], coord[0]]; // Cambiamos de [lat, lng] a [lng, lat]
      }
      return [null, null]; // Si la coordenada no es válida, devolvemos [null, null]
    });
  }

  useEffect(() => {
    if (
      !polygonPosition ||
      polygonPosition === null ||
      polygonPosition.length === 0
    ) {
      return; // Si el polígono está vacío o si ya se está cargando, no hacemos nada.
    }

    setLoadingPolygon(true); // Iniciar carga

    const reformattedCoordinates = reformatCoordinates(polygonPosition);
    //console.log("Coordenadas reformateadas:", reformattedCoordinates);

    axios
      .post(`${apiUrl}/getPolyNdvi`, {
        funcion: "graficoAnual",
        polygon: reformattedCoordinates, // Enviamos el polígono reformateado
        año: year,
      })
      .then((response) => {
        const data = response.data;
        console.log("Éxito API polygono cambia", data);

        setValoresNdvi(data.valoresNdviPoligono); // Actualiza los valores de NDVI
        setFechaGrafico(data.fechaGrafico); // Actualiza las fechas
        setLoadingPolygon(false); // Finaliza la carga
      })
      .catch((error) => {
        console.error("Error al obtener el MapID:", error);
        setLoadingPolygon(false); // Finaliza la carga en caso de error
      });
  }, [polygonPosition, year]);

  return (
    <div className="tabs-container">
      {/* Pestañas */}
      <div className="tabs">
        <div
          className={`tab ${activeTab === 0 ? "active" : ""}`}
          onClick={() => handleTabClick(0)}
        >
          Serie Anual
        </div>
        <div
          className={`tab ${activeTab === 1 ? "active" : ""}`}
          onClick={() => handleTabClick(1)}
        >
          Comparador de series anuales
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div className="tab-content-container">
        <div className={`tab-content ${activeTab === 0 ? "active" : ""}`}>
          <div className="header-with-tooltip">
            <h3>
            Índice de vegetación (NDVI)
              <span className="info-icon">
                <i className="fas fa-info-circle"></i>
                {/* Tooltip personalizado */}
                <span className="tooltip-text">{tooltipText}</span>
              </span>
            </h3>
          </div>

          {/* Información de coordenadas */}
          <div className="coordinates-info">
            <h4>Coordenadas seleccionadas:</h4>
            {polygonPosition && polygonPosition.length > 0 ? (
              polygonPosition.map((coord, index) => (
                <p key={index}>
                  Latitud: {coord[0]} , Longitud: {coord[1]}
                </p>
              ))
            ) : selectedPoint ? (
              <p>
                Latitud: {selectedPoint[0]}, Longitud: {selectedPoint[1]}
              </p>
            ) : (
              <p>No se ha seleccionado un punto.</p>
            )}
          </div>

          {/* Indicador de carga y Grafico */}
          {loadingPolygon ? (
            <div className="loading-spinnerGraf">
              <div className="spinnerGraf"></div>
              <p> Cargando...</p>
            </div>
          ) : (
            <div id="grafico">
              <Grafico fechas={fechas} valores={valores} year={year} />
            </div>
          )}
        </div>

        <div className={`tab-content ${activeTab === 1 ? "active" : ""}`}>
          <div className="tab-content-header">

            <div className="header-with-tooltip">
            <h3>
            Comparador interanual de índice de vegetación {year} vs{" "} {selectedYearGrafic}
              <span className="info-icon">
                <i className="fas fa-info-circle"></i>
                {/* Tooltip personalizado */}
                <span className="tooltip-text">{tooltipText2}</span>
              </span>
              
            </h3>
          </div>

            <SelectorAnualGrafico
              options={yearOptions}
              value={selectedYearGrafic || 2023}
              onSelectChange={handleYearGraficSelectChange}
              className="Ndvi"
            />
          </div>

          {/* Información de coordenadas */}
          <div className="coordinates-info">
            <h4>Coordenadas seleccionadas:</h4>
            {polygonPosition && polygonPosition.length > 0 ? (
              polygonPosition.map((coord, index) => (
                <p key={index}>
                  Latitud: {coord[0]} , Longitud: {coord[1]}
                </p>
              ))
            ) : selectedPoint ? (
              <p>
                Latitud: {selectedPoint[0]}, Longitud: {selectedPoint[1]}
              </p>
            ) : (
              <p>No se ha seleccionado un punto.</p>
            )}
          </div>

          {/* Indicador de carga y Comparador */}
          {loadingPolygon ? (
            <div className="loading-spinnerGraf">
              <div className="spinnerGraf"></div>
              <p>Cargando...</p>
            </div>
          ) : (
            <div id="grafico">
              <GraficComparador
                fechas={fechas}
                valores={valores}
                year2={selectedYearGrafic}
                year={year}
                prov={selectedProv}
                point={selectedPoint}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tabs;
