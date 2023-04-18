import * as React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { Chip, CircularProgress, Pagination, Snackbar, TableHead, Tooltip, Typography } from '@mui/material';
import { ContentPasteOff, DeleteOutlined, EditOutlined, ReadMoreOutlined } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import DeleteDialog from './DeleteDialog';
import instance from '../../services/fetchApi';
import { removeMessage } from '../../features/MessagesSlice';
import MuiAlert from '@mui/material/Alert';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

const UserMessagesTable = ({messages, isInbox, getInboxMessages, getOutboxMessages, loading}) => {

  const [page, setPage] = React.useState(1);
  const {allUsers} = useSelector(state => state.user)
  const navigate = useNavigate()
  const [openDialog, setOpenDialog] = React.useState(false);
  const [messageId, setMessageId] = React.useState();
  const dispatch = useDispatch()
  const [openAlert, setOpenAlert] = React.useState(false)
  const [severity, setSeverity] = React.useState("")
  const [text, setText] = React.useState("")

  // React.useEffect(() => {
  //   setPage(messages?.current_page)
  // }, [messages?.current_page])

  React.useEffect(() => {
     if(isInbox){
      getInboxMessages(page)
    } else {
      getOutboxMessages(page)
    }
    // if(isInbox === "inbox"){
    //   getInboxMessages(page)
    // } 
    // if (isInbox === "outbox") {
    //   getOutboxMessages(page)
    // }
  }, [page])


  const handleCloseAlert = () => {
    setOpenAlert(false)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  };

  const deleteMessage = (message) => {
    setOpenDialog(true)
    setMessageId(message?.id)
  };

  const showAlert = (message, severity) => {
    setOpenAlert(true)
    setSeverity(severity)
    setText(message)
  };

  const handleDelete = async () => {
    await instance.delete(`messages/${messageId}`)
    .then(() => {
     
      showAlert("Message deleted","success")
      dispatch(removeMessage({messageId: messageId}))
      setOpenDialog(false)
    })
    .catch(() => {
      showAlert("Ooops an error was encountered","error")
    })
  };

  const getInitials = (string) => {
    let names = string?.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  }

  const getImage = (row) => {

    let image_src = allUsers?.find((a)=> a.id === row.sender_id)?.profile_pic

    if ( image_src === ""  || image_src === null) {
      return (
        <div 
          style={{
            display: "inline-block",
            backgroundColor: "gray" ,
            borderRadius: "50%",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/profile/${allUsers?.find((a)=> a.id === row.sender_id)?.id}`)}
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
            {getInitials(allUsers?.find((a)=> a.id === row.sender_id)?.name)}
          </p>
        </div>
      )
    } else {
      if (!image_src) {
         return (
          <p>Auto Generated</p>
         )
      } else {
        return (
          <img 
            width="30px" 
            height="30px" 
            src={image_src}  
            alt='profile_pic' 
            style={{borderRadius: "50%", cursor: "pointer"}} 
            onClick={() => navigate(`/profile/${allUsers?.find((a)=> a.id === row.sender_id)?.id}`)}
          />
        )
      }
    }
  }



  return (
    <>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="custom pagination table">
        <TableHead>
            <TableRow>
              <TableCell >Subject</TableCell>

              {isInbox && <TableCell >Sent By</TableCell>}
              {!isInbox && <TableCell >Recipient</TableCell>}
              {isInbox && <TableCell >Message</TableCell>}
              <TableCell >Date Sent</TableCell>
              <TableCell >Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              !messages?.data?.length ? (
                <div style={{marginTop: "50px", marginLeft: "150%"}}>
                  <ContentPasteOff sx={{fontSize: "64px"}}/>
                  <Typography variant='h7' sx={{display: "flex", width: "150px"}}>No Messages</Typography>
                </div>
              ) : (
                <>
                 {
                    loading ? (
                      <div style={{ marginLeft: "200%", marginTop: "70px" }}>
                        <Typography variant='h7'>
                            <b>Loading...</b>
                          </Typography>
                      </div>
                    ) :
                    messages?.data?.map((row) => (
                      <TableRow key={row.name} sx={{backgroundColor: (isInbox && row.isRead) ? "lightgrey" : null}}>
                        <TableCell component="th" scope="row">
                          {row.subject}
                        </TableCell>

                        {
                          isInbox &&
                          <TableCell style={{ width: 160 }} >
                            {/* {allUsers?.find((a) => a.id === row.sender_id)?.name} */}
                            <Tooltip title={allUsers?.find((a)=> a.id === row.sender_id)?.name}>
                              {getImage(row)}
                            </Tooltip>
                          </TableCell>
                        }
                      
                        {
                          !isInbox &&
                          <TableCell style={{ width: 160 }} >
                            {allUsers?.find((a) => a.id === row.receiver_id)?.name}
                          </TableCell>
                        }

                        { isInbox &&
                          <TableCell style={{ width: 160 }} >
                            {
                              row.message.length > 15 ?
                              `${row.message.substring(0, 15)}.....` :
                              row.message
                            }
                          </TableCell>
                        }
                      
                        <TableCell style={{ width: 160 }} >
                          {moment(row.created_at).format("MMMM Do YYYY")}
                        </TableCell>
                        <TableCell style={{ width: 160 }} >
                          <div style={{display: "flex", justifyContent: "space-between"}}>
                            <ReadMoreOutlined
                              style={{cursor: "pointer"}}
                              onClick={()=> navigate(`/messages/${row.id}`, {state: {isInbox, isRead: row.isRead, auto: !row.sender_id ? true : false}})}
                            />

                            {
                              !isInbox &&
                              <DeleteOutlined
                                style={{cursor: "pointer"}}
                                onClick={()=> deleteMessage(row)}
                              />
                            }
                          
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </>
              )
            }
           
          </TableBody>
      </Table>
    </TableContainer>


    <div style={{marginTop: "20px"}}>
      <Pagination
        count={ Math.ceil(messages?.total / messages?.per_page)}
        page={page}
        onChange={(page, idx) => {
          handleChangePage(page, idx)
        }}
        color="secondary"
        showFirstButton
        showLastButton
      />
    </div>

    <DeleteDialog
      open={openDialog}
      setOpen={setOpenDialog}
      handleDelete={handleDelete}
    />

    <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
      <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
        { text }
      </Alert>
    </Snackbar>
    </>
  );
}

export default UserMessagesTable