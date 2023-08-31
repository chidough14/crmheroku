import {  Box, Button, Chip, CircularProgress, FormControlLabel, InputLabel, MenuItem, OutlinedInput, Select, Snackbar, Switch, TextField, Typography } from '@mui/material'
import React, { useCallback, useRef } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import instance from '../../services/fetchApi';
import { useState } from 'react';
import { addNewMessage, setSendingMessage, updateDraft } from '../../features/MessagesSlice';
import { useEffect } from 'react';
import MuiAlert from '@mui/material/Alert';
import ReactQuill from 'react-quill';
import deltaToString from "delta-to-string-converter"
import 'react-quill/dist/quill.snow.css';
import { DeleteOutlined, FilePresent } from '@mui/icons-material';
import { checkFileType } from '../../services/checkers';


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const style = {
  width: 600,
  bgcolor: 'background.paper',
  //p: 4,
};

const validationSchema = yup.object({
  email: yup
    .string('Enter an email')
    .required('Email is required'),
  subject: yup
    .string('Enter your subject')
    .required('Subject is required'),
  // message: yup
  //   .string('Enter your message')
  //   .required('Message is required'),
});


const ComposeMessage = ({
  replyMode, 
  singleMessage, 
  socket, 
  state, 
  sendingMessage, 
  editMode, 
  singleDraft
}) => {
  const user = useSelector((state) => state.user)
  const [openAlert, setOpenAlert] = useState(false)
  const [text, setText] = useState("")
  const [alertType, setAlertType] = useState("")
  const [checked, setChecked] = useState(false)
  const [usersValue, setUsersValue] = useState([]);
  const [paths, setPaths] = useState([]);
  const [value, setValue] = useState('')
  const [currentFile, setCurrentFile] = useState("")
  const [sending, setSending] = useState(false)
  const dispatch = useDispatch()
  const myInputRef = useRef()
 
  const handleCloseAlert = () => {
    setOpenAlert(false)
  }

  const showAlert = (msg, sev) => {
    setOpenAlert(true)
    setAlertType(sev)
    setText(msg)
  }

  // useEffect(() => {
  //   socket.on('receiveNotification', (message) => {
  //     console.log(`received notification: ${message}`);
  //   });
  // }, [socket])

  const formik = useFormik({
    initialValues: {
      email: '',
      subject: '',
      message: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, {resetForm}) => {
      if (checked && usersValue.length){
        dispatch(setSendingMessage({isSending: true}))

        let ids = usersValue.map((a) => {
          return user?.allUsers?.find((b) => b.email === a)?.id
        })
      
        let body = {
          subject: values.subject,
          message: "testing",
          sender_id: user.id,
          receiver_id: ids,
          quill_message: value,
          files: paths
        }
  
        await instance.post(`messages`, body)
        .then((res) => {
          dispatch(setSendingMessage({isSending: false}))
          for (let i = 0; i < res.data.createdMessages.length; i++) {
             dispatch(addNewMessage({message: res.data.createdMessages[i]}))

             socket.emit('sendNotification', { recipientId: res.data.createdMessages[i].receiver_id, message: "New Message" });
          }
          showAlert("Messages sent", "success")
          setPaths([])
          setValue("")
          resetForm()
          setUsersValue([])

          // socket.emit('sendNotification', { recipientId, message });
        })
        .catch(() => {
          dispatch(setSendingMessage({isSending: false}))
          showAlert("Ooops an error was encountered", "error")
        })
      } else {
        dispatch(setSendingMessage({isSending: true}))

        let receiverId = user?.allUsers?.find((a) => a.email === values.email)?.id
    
        if (receiverId) {
          let body = {
            subject: values.subject,
            message: "testing",
            sender_id: user.id,
            receiver_id: receiverId,
            quill_message: value,
            files: paths
          }
    
          await instance.post(`messages`, body)
          .then((res) => {
            dispatch(setSendingMessage({isSending: false}))
            //dispatch(addNewMessage({message: res.data.createdMessage}))
            setValue("")
            setPaths([])
            showAlert("Message sent", "success")
            resetForm()

            socket.emit('sendNotification', { recipientId: receiverId, message: "New Message" });
          })
          .catch((e) => {
            dispatch(setSendingMessage({isSending: false}))
            showAlert("Ooops an error was encountered", "error")
          })
        } else {
          showAlert("The email does not exist", "error")
        }
      }
     
    },
  });

  const handleChange = (event) => {
    setChecked(event.target.checked)
  }

  const handleChangeValue =  (event) => {
    const {
      target: { value },
    } = event;
   
    setUsersValue(typeof value === 'string' ? value.split(',') : value)
    formik.setFieldValue("email", "gggh")
  }

  useEffect(() => {
    if (replyMode) {
      let userEmail = user?.allUsers?.find((a)=> a.id === singleMessage.sender_id)?.email

      formik.setFieldValue("subject", `Re: ${singleMessage.subject}`)
      formik.setFieldValue("email", userEmail)
    }

  }, [replyMode])

  useEffect(() => {
    if (editMode) {

      formik.setFieldValue("subject", `${singleDraft?.subject}`)

         
      const quill = myInputRef.current.getEditor();

      quill.setContents(quill.clipboard.convert(singleDraft?.message));

      setPaths(singleDraft?.files)
    }

  }, [editMode])

  useEffect(() => {
    if (state?.populateEmail) {
      let userEmail = user?.allUsers?.find((a)=> a.id === parseInt(state?.id))?.email
      formik.setFieldValue("email", userEmail)
    }
    
  }, [state?.populateEmail])

  const saveData = (e) => {
    setValue(e.getContents())
  }

  const saveAsDraft = async () => {
    const quillEditor = myInputRef.current.getEditor();

    const editorContents = quillEditor.getText().trim();

    if (editorContents === "" || !formik.values.subject) {
      showAlert("You need to add a subject and message before saving as draft", "warning")
    } else {
      setSending(true)
      await instance.post(`drafts`, {message: value, subject: formik.values.subject, paths})
      .then(() => {
        setSending(false)
        setValue("")
        setPaths([])
        showAlert("Draft saved", "success")
        formik.resetForm()
      })
    }
  }

  const renderSaveText = () => {
    if (editMode) {
     return "Save"
    } else {
      return "Save as draft"
    }
  }

  const isValidJson = (string) => {
    try {
      JSON.parse(string)
      return true
    } catch (error) {
      return false
    }
  }

  const editDraft = async () => {
    const quillEditor = myInputRef.current.getEditor();

    const editorContents = quillEditor.getText().trim();
    
    if (editorContents === "" || !formik.values.subject) {
      showAlert("You need to add a subject and message before saving as draft", "warning")
    } else {
      setSending(true)
      await instance.patch(`/drafts/${singleDraft.id}`, {subject: formik.values.subject, message: myInputRef.current.getEditor().getContents(), paths})
      .then((res) => {
        let msg = isValidJson(res.data.draft.message) ? deltaToString(JSON.parse(res.data.draft.message).ops) : res.data.draft.message
        res.data.draft.message = msg
  
        dispatch(updateDraft({draft: res.data.draft}))
        setSending(false)
        setValue("")
        setPaths([])
        showAlert("Draft saved", "success")
        formik.resetForm()
      })
    }
   
  }

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*, application/pdf, application/vnd.ms-excel, text/csv'; // Updated accept attribute
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file); // Use a generic 'file' key in FormData
  
        try {
          const response = await instance.post('/upload-files', formData); // Change the endpoint as needed
          const uploadedFilePath = response.data.filePath;

          setPaths(prev => [...prev, uploadedFilePath]);
        
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    };
    input.click();
  }, []);

  const renderFiles = (files, type) => {
    return files.map((a) => {
      const isImage = checkFileType(a) === "image";
  
      return (
        <div
          key={a} // Add a unique key for each rendered element
          style={{
            marginRight: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            marginTop: "40px",
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
                style={{ height: "30px" }}
              />
            ) : (
              <FilePresent />
            )}

            {
              currentFile === a && (
                <span
                  style={{ marginLeft: "6px", color: "red", cursor: "pointer" }}
                  onClick={() => {
                    setPaths(paths.filter((b) => b !== a));
                 
                  }}
                >
                  <DeleteOutlined />
                </span>
              )
            }
         
          </div>
          <p style={{ marginTop: "-7px", fontSize: "14px" }}>{a.replace("files/", "")}</p>
        </div>
      );
    });
  };

  return (
    <div>
      <Box sx={style}>
        <form onSubmit={formik.handleSubmit}>
          <Typography variant='h7' style={{marginBottom: "10px"}}>
            <b>
              {
                editMode ? "Edit Draft" : "Compose Message"
              }
            </b>
          </Typography>
          <p></p>
          {
            !replyMode &&
            <FormControlLabel
              value="end"
              control={
                <Switch 
                  color="primary"
                  checked={checked}
                  onChange={handleChange}
                  inputProps={{ 'aria-label': 'controlled' }}
                  />
              }
              label="Send to multiple users"
              labelPlacement="end"
            />
          }
         
          <div>
           
            {
              checked ? (
                <>
                    <InputLabel id="demo-select-small">Select User</InputLabel>
                    <Select
                      name="user"
                      label="User"
                      size='small'
                      fullWidth
                      labelId="demo-multiple-name-label"
                      id="demo-multiple-name"
                      multiple
                      value={usersValue}
                      onChange={handleChangeValue}
                      input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {
                        user?.allUsers?.filter((a) => a.id !== user.id).map((a, i) => (
                          <MenuItem value={a.email} key={i}>{a.name}</MenuItem>
                        ))
                      }
                    </Select>
                    </>
              ) : (
                <TextField
                  required
                  size='small'
                  fullWidth
                  id="email"
                  name="email"
                  label="Recipient Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              )
            }
          </div>
        
          <p></p>
          <TextField
            required
            size='small'
            fullWidth
            id="subject"
            name="subject"
            label="Subject"
            value={formik.values.subject}
            onChange={formik.handleChange}
            error={formik.touched.subject && Boolean(formik.errors.subject)}
            helperText={formik.touched.subject && formik.errors.subject}
          />
          <p></p>

          <ReactQuill 
            theme="snow" 
            value={value} 
            onChange={(e,f,g,h) => saveData(h)}
            style={{height: "300px"}} 
            ref={myInputRef}
            modules= {
              {
                toolbar: {
                  container: [
                    ['bold', 'italic', 'underline', 'strike', 'link'],
                    [{ 'image': 'Upload Image' }],
                  ],
                  handlers: {
                    image: handleImageUpload, // Directly reference the callback
                  },
                }
              }
            } 
          />

          <p></p>

          {
            paths.length ? (
              <div style={{height: "20px", display: "flex", marginTop: "50px"}}>
                {
                  renderFiles(paths, "normal")
                }
              </div>
            ) : null
          }
        

          <p></p>
          <div style={{display: "flex", justifyContent: "space-between", marginTop: "50px"}}>
            <Button size='small' color="primary" variant="contained"  type="submit" style={{borderRadius: "30px"}}>
              {
                sendingMessage ? (
                  <Box sx={{ display: 'flex' }}>
                    <CircularProgress size={24} color="inherit" />
                  </Box>
                ) : "Send"
              }
            </Button>

            <Button 
              size='small' 
              color="success" 
              variant="contained" 
              onClick={() => {
                if (editMode) {
                   editDraft()
                } else {
                  saveAsDraft()
                }
                
              }}
              style={{borderRadius: "30px"}}
            >
               {
                sending ? (
                  <Box sx={{ display: 'flex' }}>
                    <CircularProgress size={24} color="inherit" />
                  </Box>
                ) : renderSaveText()
              }
            </Button>

            <Button 
              size='small' 
              color="error" 
              variant="contained" 
              onClick={() => {
                formik.resetForm()
                setValue("")
                setPaths([])
              }}
              style={{borderRadius: "30px"}}
            >
              Cancel
            </Button>
          </div>
        
        </form>
      </Box>
      

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alertType} sx={{ width: '100%' }}>
          {text}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default ComposeMessage