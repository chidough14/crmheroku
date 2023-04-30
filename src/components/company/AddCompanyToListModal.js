import { Box, Button,  Modal,  Typography, Snackbar,Paper, FormControl, Select, MenuItem, InputLabel, CircularProgress } from '@mui/material'
import MuiAlert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react'
import instance from '../../services/fetchApi';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: 60,
  width: "100%",
  lineHeight: '60px',
}));

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const AddCompanyToListModal = ({ open, setOpen, companyId}) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severity, setSeverity] = useState("");
  const [listId, setListId] = useState(undefined);
  const [listWithCompanies, setListWithCompanies] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [addingList, setAddingList] = useState(false);

  const showAlert = (msg, sev) => {
    setOpenAlert(true)
    setAlertMessage(msg)
    setSeverity(sev)
  }

 

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  const handleClose = () => {
    setOpen(false)
    setListId(undefined)
  }

  const selectList = (id) => {
    setListId(id)
    
  }

  const addToList = async () => {
    setAddingList(true)
    
   await instance.post(`companies/${companyId}/lists`, {listId: listId})
   .then((res) => {
    handleClose()
    showAlert("Company added to list", "success")
    setListId(undefined)
    setAddingList(false)
   })
   .catch(()=> {
    showAlert("Ooops an error was encountered", "error")
    setListId(undefined)
    setAddingList(false)
   })
  }

  useEffect(() => {
    const getUserLists = async () => {
      setLoadingList(true)
      await instance.get(`userListsAndCompanies`)
      .then((res) => {
       setListWithCompanies(res.data.lists)
       setLoadingList(false)
      })
      .catch(()=> {
        showAlert("Ooops an error was encountered", "error")
        setLoadingList(false)
      })
    }


    if(open) {
      getUserLists();
    }
  }, [open])

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        >
        <Box sx={style}>
          
            <Typography variant='h6' style={{marginBottom: "10px"}}>
              Add Company To List
            </Typography>
          

            <FormControl fullWidth  style={{marginBottom: "10px"}}>
              <InputLabel id="demo-select-small">Select List</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={listId}
                onChange={(e)=> selectList(e.target.value)}
                size="medium"
                sx={{borderRadius: "30px"}}
              >

                {
                  listWithCompanies?.map((list, i) => {
                    let ids = list.companies.map((a) => a.id)
                  
                    if (ids.includes(parseInt(companyId))){

                    } else {
                      return (
                        <MenuItem value={list.id}>{list.name}</MenuItem>
                      )
                    }
                  
                  })
                }
              </Select>
            </FormControl>

           {
            loadingList ? (
              <p style={{marginTop: "-10px", fontSize: "13px", color: "green"}}>Loading lists...</p>
            ) : null
           }
            

            <p></p>
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <Button 
                size='small' 
                color="primary" 
                variant="contained"  
                type="submit"
                onClick={() => {
                  addToList()
                }}
                style={{borderRadius: "30px"}}
                disabled={!listId}
              >
                {
                  addingList ? (
                    <Box sx={{ display: 'flex' }}>
                      <CircularProgress size={24} color="inherit" />
                    </Box>
                  ) : "Add"
                }
              </Button>

              <Button 
                size='small' 
                color="error" 
                variant="contained" 
                onClick={() => {
                  handleClose()
                }}
                style={{borderRadius: "30px"}}
              >
                Cancel
              </Button>
            </div>

        </Box>
      </Modal>

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
         {alertMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default AddCompanyToListModal