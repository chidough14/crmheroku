import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FormControl, MenuItem, Select, Typography } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

export function DoughnutChart({results, measurement, setMeasurement, showDoughnutGraphLoadingNotification, currencySymbol}) {
  const [keys, setKeys] = useState([])
  const [values, setValues] = useState([])

  useEffect(() => {
    if (results) {
      setKeys(results.map(item => item.name))
      setValues(results.map(item => item.total))
    }
   
  }, [results])
 

  let data = {
    labels: keys,
    datasets: [
      {
        label: `Total sales (${currencySymbol})`,
        data: values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const config = {
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      }
    },
  };

  const handleChange = (event) => {
    setMeasurement(event.target.value);
  };

  return <>
    <Typography variant='h7' ><b>Top Salespersons/Products</b></Typography>
    <div style={{ width: "50%", float: "right"}}>
      <FormControl fullWidth>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={measurement}
          // label="Products Total Sales ($)"
          onChange={handleChange}
          size="small"
          sx={{borderRadius: "30px"}}
        >
          <MenuItem value="salespersons">Sales Persons</MenuItem>
          <MenuItem value="products">Products</MenuItem>
        </Select>
      </FormControl>
    </div>

    {
      showDoughnutGraphLoadingNotification && (<p style={{fontSize: "14px", color: "green"}}>Loading Results...</p>)
    }
    <Doughnut data={data} options={config.options} />
  </>;
}
