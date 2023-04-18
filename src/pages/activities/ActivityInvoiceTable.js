import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { DeleteOutlined, EditOutlined, OpenInFullOutlined, ViewAgendaOutlined } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';


const ActivityInvoiceTable = ({invoices, showInvoice, showDeleteDialog, activity, user}) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Invoice No</TableCell>
            <TableCell>Reference</TableCell>
            <TableCell>status</TableCell>
            <TableCell>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices?.map((row) => (
            <TableRow
              key={row.invoice_no}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
              {row.invoice_no}
              </TableCell>
              <TableCell>{row.reference}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell>
                <Button>
                  <Tooltip title="View Invoice" placement="top">
                    <OpenInFullOutlined 
                      style={{cursor: "pointer"}}
                      onClick={() => showInvoice(row)}
                    />
                  </Tooltip>
                </Button>
              
                <Button disabled={activity?.user_id !== user?.id}>
                  <Tooltip title="Delete" placement="top">
                    <DeleteOutlined
                      style={{cursor: "pointer"}}
                      onClick={() => showDeleteDialog(row)}
                    />
                  </Tooltip>
                </Button>
               
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ActivityInvoiceTable