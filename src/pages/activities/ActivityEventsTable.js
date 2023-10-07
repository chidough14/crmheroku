import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';
import moment from 'moment';



const ActivityEventsTable = ({events, editEvent, deleteEvent, activity, user}) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell align="right">Description</TableCell>
            <TableCell align="right">Start</TableCell>
            <TableCell align="right">End</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
          events?.length ?
          events?.map((row) => (
            <TableRow
              key={row.title}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.title}
              </TableCell>
              <TableCell align="right">{row.description}</TableCell>
              <TableCell align="right">{moment(row.start).format("DD-MMM-YYYY, h:mm a")}</TableCell>
              <TableCell align="right">{moment(row.end).format("DD-MMM-YYYY, h:mm a")}</TableCell>
              <TableCell align="right">
               <Tooltip title="Edit Quantity" placement="top">
                  <Button  disabled={activity?.user_id !== user?.id}>
                    <EditOutlined
                      style={{cursor: "pointer"}}
                      onClick={() => editEvent(row)}
                    
                    />
                  </Button>
                </Tooltip>
                <Tooltip title="Delete" placement="top">
                  <Button  disabled={activity?.user_id !== user?.id}>
                    <DeleteOutlined
                        style={{cursor: "pointer"}}
                        onClick={() => deleteEvent(row)}
                      />
                  </Button>
                </Tooltip>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              No upcoming events
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}


export default ActivityEventsTable