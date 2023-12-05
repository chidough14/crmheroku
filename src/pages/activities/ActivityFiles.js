import React, { useCallback, useState } from 'react'
import { checkFileType } from '../../services/checkers';
import {  DeleteOutlined, DownloadOutlined, FilePresent, UploadFileOutlined } from '@mui/icons-material';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import instance from '../../services/fetchApi';
import { useDispatch, useSelector } from 'react-redux';
import { setSingleActivity } from '../../features/ActivitySlice';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const ActivityFiles = ({files, activityUserId, socket}) => {
  const [currentFile, setCurrentFile] = useState("")
  const [uploadFile, setUploadFile] = useState("")
  const [loading, setLoading] = useState(false)
  const [showDeleteNotification, setShowDeleteNotification] = useState(false)
  const [open, setOpen] = useState(false)
  const { activity } = useSelector(state => state.activity)
  const { id } = useSelector(state => state.user)
  const dispatch = useDispatch()

  const handleCloseDialog = () => {
    setOpen(false)
    setUploadFile("")
  }

  const downloadFile = async (filename) => {
    try {
      const response = await instance.get(`download-file/${filename}`, {
        responseType: 'blob', // Important for binary data
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Change the filename as needed
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const deleteFile = async (file) => {
    setShowDeleteNotification(true)
    let xx = files.filter((a) => a !== file)
 
    await instance.patch(`activities/${activity.id}`, {files: xx})
    .then((res) => {
       dispatch(setSingleActivity({activity: res.data.activity}))
       handleCloseDialog()
       setShowDeleteNotification(false)
    })
  }

  const handleFileUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*, application/pdf, application/vnd.ms-excel, text/csv'; // Updated accept attribute
    input.onchange = async (e) => {
      setLoading(true)

      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file); // Use a generic 'file' key in FormData
  
        try {
          const response = await instance.post(`/upload-files-and-save/${activity.id}`, formData); // Change the endpoint as needed
          setLoading(false)
          // const uploadedFilePath = response.data.filePath;

          
          socket.emit("file_upload", { 
            message: "File Upload", 
            sender_id: id,
            activityId: activity.id 
          })

          dispatch(setSingleActivity({activity: response.data.activity}))
        
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    };
    input.click();
  }, []);

  const renderFiles = (files, type) => {
    return files?.map((a) => {
      const isImage = checkFileType(a) === "image";
  
      return (
        <>
          <div
            key={a} // Add a unique key for each rendered element
            style={{
              marginRight: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              marginTop: "40px",
              flex: "1 1 calc(25% - 20px)"
            }}
            onMouseEnter={() => {
              setCurrentFile(a)
            }}
            onMouseLeave={() => {
              setCurrentFile("")
            }}
          >
            <div>
              {isImage ? (
                <img
                  src={`${process.env.REACT_APP_BASE_URL}${a}`}
                  alt="Image"
                  style={{ height: "100px" }}
                />
              ) : (
                <FilePresent />
              )}


              {
                currentFile === a && (
                  <span
                    style={{ marginLeft: "6px", color: "lightgreen", cursor: "pointer" }}
                    onClick={() => {
                      console.log(a);
                      downloadFile(a.replace("files/", ""))
                    }}
                  >
                    <DownloadOutlined />
                  </span> 
                )
              }

              {
                (currentFile === a && activityUserId === id) && (
                  <>
                    <span
                      style={{ marginLeft: "6px", color: "red", cursor: "pointer" }}
                      onClick={() => {
                        setOpen(true)
                        setUploadFile(a)
                      }}
                      >
                      <DeleteOutlined />
                    </span>
                  </>
                )
              }
            
            </div>
            <p>{a.replace("files/", "")}</p>
          </div>
        </>
      );
    });
  };

  return (
    <>
      <div style={{display: "flex"}}>
        {
          activityUserId === id && (
            <UploadFileOutlined
              style={{fontSize: "28px", cursor: "pointer"}}
              onClick={() => handleFileUpload()}
            />
          )
        }
      

   
        {
          loading && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
            </Box>
          )
        }
      </div>
    

      <div
        style={{display: "flex", flexWrap: "wrap", justifyContent: "space-between"}}
      >

        {
          files?.length ? renderFiles(files) : (
            <div>You have no attachments</div>
          )
        }
      </div>


      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete File
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this file?
          </DialogContentText>

          <DialogContentText id="alert-dialog-description" sx={{textAlign: "center", color: "red"}}>
            {
              showDeleteNotification && "Deleting..."
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>
          <Button onClick={() => deleteFile(uploadFile)} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ActivityFiles