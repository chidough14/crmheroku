import React, {useEffect, useState} from 'react'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, CircularProgress, Pagination, Typography } from '@mui/material';
import { OpenInFullOutlined } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import moment from 'moment';

const StripePaymentsTable = ({stripeOrders, getStripePayments}) => {
  const [page, setPage] = useState(1)
  const { activities } = useSelector(state => state.activity)

  useEffect(() => {

    setPage(stripeOrders?.current_page)

  }, [stripeOrders?.current_page])

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Activity</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Delivery Status</TableCell>
              <TableCell>Products</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Sub Total</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>

            {
              stripeOrders?.data?.map((row, i) => (
                <TableRow
                  key={i}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {
                      activities?.find((a) => a.id === row.activity_id)?.label
                    }
                  </TableCell>
                  <TableCell>{row.payment_status}</TableCell>
                  <TableCell>{row.delivery_status}</TableCell>
                  <TableCell>
                    {
                      row.products.map((a, i) => (
                        <Typography key={i}>
                          {a.name} Price: {a.price} Qty: {a.qty}
                        </Typography>
                      ))
                    }
                  </TableCell>
                  <TableCell>
                    {
                      moment(row.created_at).format('DD MMMM YYYY')
                    }
                    {/* <Typography>
                      {
                        `${row.shipping.name} Address: ${row.shipping.address.city}, ${row.shipping.address.country}, ${row.shipping.address.postal_code}`
                      }
                    </Typography> */}
                  </TableCell>
                  <TableCell>{row.subtotal}</TableCell>
                  <TableCell>{row.total}</TableCell>
                </TableRow>
              ))
            }

            {/* {
             loading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ display: 'flex', marginLeft: "45%" }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
             
             ) : 
            !invoices?.data.length ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ display: 'flex', marginLeft: "45%" }}>
                    <Typography variant='h5'>No Invoices</Typography>
                  </Box>
                </TableCell>
              </TableRow>
             
            ) :
            invoices?.data?.map((row) => (
              <TableRow
                key={row.invoice_no}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.invoice_no}
                </TableCell>
                <TableCell>{row.payment_method}</TableCell>
                <TableCell>{row.reference}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.activity?.label}</TableCell>
                <TableCell>
                  <OpenInFullOutlined 
                    style={{cursor: "pointer"}}
                    onClick={()=> viewInvoice(row)}
                  />
                </TableCell>
              </TableRow>
            ))} */}
          </TableBody>
        </Table>
      </TableContainer>


      <div style={{marginTop: "50px", marginLeft: "40%"}}>
        <Pagination
          count={ Math.ceil(stripeOrders?.total / stripeOrders?.per_page)}
          page={page}
          onChange={(page, idx) => {
            getStripePayments(idx)
            // if (sortOption === "all") {
            //   getInvoices(idx)
            // } else {
            //   getSortedInvoices(sortOption, idx)
            // }
            
          }}
          color="secondary"
          showFirstButton
          showLastButton
        />
      </div>
    </>
  )
}

export default StripePaymentsTable