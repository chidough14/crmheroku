import React from 'react'
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-moment';
import moment from 'moment';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const LineChart = ({ data }) => {
  // Extracting movement and created_at values from the data
  const labels = data.map(entry => moment(entry.created_at).format('MMM D h:m:s'));
  const movements = data.map(entry => entry.movement);

  const formattedMovements = movements.map((a) => a.split("-")[1])
  console.log(formattedMovements);

  // Mapping movement values to desired labels
  const movementLabels = {
    Low: 'Low',
    Medium: 'Medium',
    High: 'High',
    Closed: 'Closed',
  };

  // Converting movement data to corresponding numerical values for chart
  const movementData = formattedMovements.map(movement => Object.keys(movementLabels).indexOf(movement));

  const chartData = {
    labels,
    datasets: [
      {
        data: movementData,
        label: 'Movement',
        borderColor: 'blue',
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM D h:m:s',
          },
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        type: 'linear',
        ticks: {
          stepSize: 1,
          callback: (value) => {
            return movementLabels[Object.keys(movementLabels)[value]]
          },
        },
        title: {
          display: true,
          text: 'Movement',
        },
      },
    },
  };

  return <div style={{width: "70%"}}>
    <Line data={chartData} options={chartOptions} />
  </div>
};

export default LineChart;