import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Typography } from '@mui/material';
import { useDispatch } from 'react-redux'
import moment from 'moment';
import { setBarSelect, setOwner } from '../../features/userSlice';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
    },
    title: {
      display: true,
      text: '',
    },
  },
};

export function BarChart({results, owner, showBarGraphLoadingNotification, currencySymbol}) {

  const dispatch = useDispatch()

  const handleChange = (event) => {
    dispatch(setBarSelect({barSelect: true}))
    dispatch(setOwner({owner: event.target.value}))
  };

 
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  
  const result = {};
  
  results.forEach(d => {
    const [month, year] = Object.keys(d)[0].split("-");
    if (!result[year]) {
      result[year] = {};
      months.forEach(m => {
        result[year][`${m}-${year}`] = 0;
      });
    }
    result[year][`${month}-${year}`] = d[Object.keys(d)[0]];
  });
  
  const finalResult = [];
  
  Object.keys(result).forEach(year => {
    const yearArray = [];
    months.forEach(month => {
      yearArray.push(result[year][`${month}-${year}`]);
    });
    finalResult.push(yearArray);
  });

  let lastYear = finalResult[finalResult.length - 2]
  let thisYear = finalResult[finalResult.length - 1]

  let data = {
    labels: months,
    datasets: [
      {
        label: moment().subtract(1, 'year').format('YYYY'),
        data: lastYear,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: moment().format('YYYY'),
        data:  thisYear,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  }

  return <>
    <Typography variant="h7"><b>Products Total Sales ({`${currencySymbol}`})</b></Typography>
    <div style={{ width: "50%", float: "right"}}>
      <FormControl fullWidth>
        {/* <InputLabel id="demo-simple-select-label">Products Total Sales ($)</InputLabel> */}
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={owner}
          // label="Products Total Sales ($)"
          onChange={handleChange}
          size="small"
          sx={{borderRadius: "30px"}}
        >
          <MenuItem value="allusers">All Users</MenuItem>
          <MenuItem value="mine">Mine</MenuItem>
        </Select>
      </FormControl>
    </div>
    {
      showBarGraphLoadingNotification && (<p style={{fontSize: "14px", color: "green"}}>Loading Results...</p>)
    }
    <Bar options={options} data={data} />
  
  </>;
}