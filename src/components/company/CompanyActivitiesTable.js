import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';


const getInitials = (string) => {
  let names = string?.split(' '),
      initials = names[0].substring(0, 1).toUpperCase();
  
  if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
}

function Row(props) {
  const { row } = props;
  const navigate = useNavigate()
  const {allUsers} = useSelector(state => state.user)

  let image_src = allUsers?.find((a)=> a.id === row.user_id)?.profile_pic

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell component="th" scope="row">
          {row.label}
        </TableCell>
        <TableCell >{row.description}</TableCell>
        <TableCell >{row.assignedTo}</TableCell>
        <TableCell >{row.probability}</TableCell>
        <TableCell >
        
          
          <Tooltip title={allUsers?.find((a)=> a.id === row.user_id)?.name}>
            {
              ( image_src === ""  || image_src === null) ? (
                <div 
                  style={{
                    display: "inline-block",
                    backgroundColor: "gray" ,
                    borderRadius: "50%",
                    cursor: "pointer",
                    // width: "30px",
                    // height: "30px",
                    //margin: "10px",
                  }}
                  onClick={() => navigate(`/profile/${allUsers?.find((a)=> a.id === row.user_id)?.id}`)}
                >
                  <p 
                    style={{
                      color: "white",
                      display: "table-cell",
                      verticalAlign: "middle",
                      textAlign: "center",
                      textDecoration: "none",
                      height: "30px",
                      width: "30px",
                      fontSize: "15px"
                    }}
                  >
                    {getInitials(allUsers?.find((a)=> a.id === row.user_id)?.name)}
                  </p>
                </div>
              ) : (
                <img 
                  width="30px" 
                  height="30px" 
                  src={image_src}  
                  alt='profile_pic' 
                  style={{borderRadius: "50%", cursor: "pointer"}} 
                  onClick={() => navigate(`/profile/${allUsers?.find((a)=> a.id === row.user_id)?.id}`)}
                />
              )
            }
          
          </Tooltip>
          
        </TableCell>
        <TableCell >{row.type}</TableCell>
        <TableCell >
          <Button style={{borderRadius: "30px"}} onClick={() => navigate(`/activities/${row.id}`)}>
          View Activity
          </Button>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    label: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    assignedTo: PropTypes.string.isRequired,
    probability: PropTypes.string.isRequired,
    earningEsimate: PropTypes.number,
    type: PropTypes.string.isRequired,
  }).isRequired,
};

const ComanyActivitiesTable = ({rows}) => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Assigned To</TableCell>
            <TableCell>Probablity</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Type</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows?.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ComanyActivitiesTable