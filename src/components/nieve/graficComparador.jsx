import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js'; // Importamos todo lo necesario
import DownloadCSVButton from '../downloadCSVButton'; // Importamos el botón de CSV
import DownloadPNGButton from '../downloadPNGButton'; // Importamos el botón de PNG
import Papa from 'papaparse';
import '../../styles/button.css'

Chart.register(...registerables); // Registramos todos los componentes de Chart.js, incluidas las escalas

const GraficComparador = ({ fechas, valores, year2, year, cuenca }) => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({ labels: [], data: [], apiData: [], apiLabels: [] });
  const [chartReady, setChartReady] = useState(false);
  const [chartInstance, setChartInstance] = useState(null); // Guardar la instancia del gráfico
  const fields = ['Fecha', 'Promedio de Nieve', `Cobertura de Nieve`, 'Cobertura de Nieve2'];
  const [valoresDeNievePorFecha, setValoresDeNievePorFecha] = useState([]);
  const [fechaGrafico, setFechaGrafico] = useState([]);  
  const [loadingGraph, setLoadingGraph] = useState(false); 
  const apiUrl = import.meta.env.VITE_API_URL;


  const cleanDate = (fechaStr) => {
  return fechaStr.trim(); // Eliminar posibles espacios adicionales
};
  
  const isValidDate = (fechaStr) => {
  // Validar que la fecha tenga el formato dd/mm
  const regex = /^\d{2}\/\d{2}$/;
  return regex.test(fechaStr);
};

 useEffect(() => {
  fetch('/data/PromedioNieve2001_2024.csv')
    .then((response) => response.text())
    .then((csvText) => {
      Papa.parse(csvText, {
        complete: (result) => {
          const data = result.data;
          const labels = [];
          const dataValues = [];

          data.slice(1).forEach((row, index) => { 
            let fechaStr = cleanDate(row[0]);
            if (isValidDate(fechaStr)) {
              const [day, month] = fechaStr.split('/');
              const promedioNieve = parseFloat(row[1]); 
              labels.push(fechaStr);
              dataValues.push(promedioNieve); 
            } else {
              console.warn(`Fecha mal formada o vacía en la fila ${index + 1}: ${fechaStr}`);
            }
          });

          setChartData({ 
            labels, 
            data: dataValues, 
            apiData: valores, 
            apiLabels: fechas 
          });
        },
        header: false,
        skipEmptyLines: true,
      });
    });
}, []); 




  useEffect(() => {
    setLoadingGraph(true);
    axios
      .post(`${apiUrl}/getCuencaYearComparador`, {
        funcion : 'graficoComparativo',
        cuenca : cuenca,
        año: year2
      })
      .then((response) => {
        const data = response.data;
        console.log("Exitos con la comunicación a la API", data);
  
        setValoresDeNievePorFecha(data.valoresDeNievePorFecha);  
        setFechaGrafico(data.fechaGrafico);
        setLoadingGraph(false); 
      })
      .catch((error) => {
        console.log("error es", error);
        setLoadingGraph(false); 
      });
  }, [cuenca, year2]); 
  


  useEffect(() => {
    if (chartRef.current) { 
      const ctx = chartRef.current.getContext('2d');
      
      if (window.chartInstance) {
        window.chartInstance.destroy(); 
      }
      window.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'Promedio de Nieve 2001-2024',
              data: chartData.data,
              fill: false,
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              tension: 0.4,
            },
            {
              label: `Cobertura de nieve ${year}`,
              data: chartData.apiData,
              fill: false,
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              tension: 0.4,
            },
            {
              label: `Cobertura de nieve ${year2}`,
              data: valoresDeNievePorFecha,
              fill: false,
              borderColor: 'rgba(138, 43, 226, 1)',
              borderWidth: 2,
              tension: 0.4,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Fecha'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Porcentaje de Nieve (%)'
              },
              beginAtZero: true,
            }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                font: {
                  size: 14,
                },
                boxWidth: 20,
              },
              offset: 10,
            },
          },
        }
      });

      setChartInstance( window.chartInstance);
      setChartReady(true); 

    }
  }, [chartData, valoresDeNievePorFecha]); 
  
  

  return (
    <div style={{ width: '100%', height: 'auto' }}>
 
      <div className="download-buttons-container">
        <DownloadCSVButton chartData={chartData} chartYear={valoresDeNievePorFecha} fields={fields} filename="datos_nieve.csv"/>
        <DownloadPNGButton chartRef={chartRef} chartReady={chartReady} chartInstance={chartInstance} />
      </div>
  
 
      {loadingGraph ? (
        <div>Cargando Gráfico...</div>

      ) : (
      
        <div style={{ position: 'relative', height: '300px' }}>
          <canvas ref={chartRef} style={{ height: '100%', width: '100%' }}></canvas>
        </div>
      )}
    </div>
  );
  
}
export default GraficComparador;
