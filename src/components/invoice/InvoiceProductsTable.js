import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Tooltip, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useState } from 'react';


const InvoiceProductsTable = ({products, editItem, deleteItem}) => {
  const [total, setTotal] = useState(0)

  useEffect(()=> {
    let arr = []
    products.map((a) => {
       let total = a.price * a.pivot.quantity
       arr.push(total)
    })
    setTotal(arr.reduce((a, b) => a + b, 0))
  }, [products])

  return (
    <>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Price ($)</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Tax %</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products?.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>{row.price}</TableCell>
              <TableCell>{row.pivot.quantity}</TableCell>
              <TableCell>{row.tax_percentage}</TableCell>
              <TableCell>{row.active}</TableCell>
              <TableCell>
                <Tooltip title="Edit Quantity" placement="top">
                  <EditOutlined
                    style={{cursor: "pointer"}}
                    onClick={() => editItem(row)}
                  />
                </Tooltip>
                <Tooltip title="Delete" placement="top">
                  <DeleteOutlined
                    style={{cursor: "pointer"}}
                    onClick={() => deleteItem(row)}
                  />
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    <Typography variant='h6' style={{float: "right"}}><b>Total:</b> ${total}</Typography>
    </>
  );
}

export default InvoiceProductsTable