import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import FileUpload from "react-mui-fileuploader"
import instance from '../../services/fetchApi';
import { useDispatch } from 'react-redux';
import { addList } from '../../features/listSlice';
import Papa from "papaparse";
import {  Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));



function BootstrapDialogTitle(props) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

export default function UploadModal({open, setOpen}) {

  const [filesToUpload, setFilesToUpload] = React.useState([])
  const [showWarning, setShowWarning] = React.useState(false)
  const dispatch = useDispatch()
  const [openAlert, setOpenAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");
  const [severity, setSeverity] = React.useState("");

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

  const parseJsonFile = async (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.onload = event => resolve(JSON.parse(event.target.result))
      fileReader.onerror = error => reject(error)
      fileReader.readAsText(file)
    })
  }

  const handleFilesChange = (files) => {
    setFilesToUpload([ ...files ])
  };

  const uploadList = async (arr) => {
    let body = {
      name: filesToUpload[0].name,
      companies: arr
    }
    await instance.post(`upload-list`, body)
    .then((res) => {
       dispatch(addList({list: res.data.list}))
      
       showAlert("List uploaded", "success")
       handleClose()
    })
    .catch(()=> {
      showAlert("Oops an error was encountered", "error")
    })
  }

  const uploadFiles = async () => {
    if (filesToUpload.length > 1) {
      setShowWarning(true)
    } else {
      if (filesToUpload[0].type === "text/csv") {
        Papa.parse(filesToUpload[0], {
          complete: (results) => {
            let arr = []
  
            let xx = results.data.map((a) => {
              return a.filter((b)=> b !== "")
            })
            .filter((c)=> c.length)
  
            
            xx.map((d) => {
              arr.push({
                name: d[0],
                email: d[1]
              })
            })

            arr.shift()

            uploadList(arr)
          }}
        )
        
      } else {
        const object = await parseJsonFile(filesToUpload[0])
        
        uploadList(object)
      }  
    }

  
  }

  const handleClose = () => {
    setOpen(false);
    setShowWarning(false)
  };

  return (
    <div>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
        maxWidth="sm"
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
          Upload List
        </BootstrapDialogTitle>
        {
          showWarning && <Typography variant='h7' color="error" style={{margin: "auto"}}><b>You can upload one file at a time!</b></Typography>
        }
        
        <DialogContent dividers>
          <FileUpload
            multiFile={false}
            onFilesChange={handleFilesChange}
            onContextReady={(context) => {}}
            title="File types: .csv, .json, .vnd.ms-excel"
            allowedExtensions={['csv', 'json', 'vnd.ms-excel']}
            maxUploadFiles={1}
          />
        </DialogContent>
        <DialogActions>
          <div style={{margin: "auto", display: "flex", justifyContent: "space-between", width: "90%"}}>
            <Button 
              autoFocus 
              onClick={() => {
                uploadFiles()
              }}
              variant="contained" 
              size='small' 
              style={{borderRadius: "30px"}}
              disabled={!filesToUpload.length}
            >
              Save 
            </Button>


            <Button
              onClick={handleClose}
              variant="contained" 
              size='small' 
              style={{borderRadius: "30px"}}
              color="error" 
            >
              Cancel 
            </Button>
          </div>
        
        </DialogActions>
      </BootstrapDialog>


      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={severity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}