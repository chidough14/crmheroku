import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, CircularProgress, Pagination, Typography } from '@mui/material';
import { OpenInFullOutlined } from '@mui/icons-material';


const OrdersTable = ({invoices, getInvoices, viewInvoice, getSortedInvoices, sortOption, loading}) => {
  const [page, setPage] = React.useState(1)
  React.useEffect(() => {

    setPage(invoices?.current_page)

  }, [invoices?.current_page])

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Invoice No.</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>


      <div style={{marginTop: "50px", marginLeft: "40%"}}>
        <Pagination
          count={ Math.ceil(invoices?.total / invoices?.per_page)}
          page={page}
          onChange={(page, idx) => {
            if (sortOption === "all") {
              getInvoices(idx)
            } else {
              getSortedInvoices(sortOption, idx)
            }
            
          }}
          color="secondary"
          showFirstButton
          showLastButton
        />
      </div>
    </>
  );
}

export default OrdersTable