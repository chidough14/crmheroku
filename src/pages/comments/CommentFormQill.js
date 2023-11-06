import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactQuill, { Quill, Delta } from 'react-quill';
import 'react-quill-emoji';
import "quill-mention";
import 'react-quill/dist/quill.snow.css';
import 'react-quill-emoji/dist/quill-emoji.css';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import instance from '../../services/fetchApi';
import { DeleteOutlined, FilePresent } from '@mui/icons-material';
import { checkFileType } from '../../services/checkers';
import { addCommentFile, removeCommentFile } from '../../features/ActivitySlice';

const CommentFormQill = ({ 
  saveComment, 
  allUsers, 
  parentId, 
  editMode, 
  childCommentContent, 
  updateComment, 
  reply, 
  handleClose, 
  setShowForm, 
  mode,
  socket,
  params,
  activityId,
  commentId 
}) => {
  const [value, setValue] = useState()
  const [openDialog, setOpenDialog] = useState(false)
  const [currentFile, setCurrentFile] = useState("")
  const [paths, setPaths] = useState([])
  const [usersTyping, setUsersTyping] = useState([]);
  const { id, name } = useSelector(state => state.user)
  const { commentFiles } = useSelector(state => state.activity)
  const [sendingComment, setSendingComment] = useState(false)
  const dispatch = useDispatch()
  const myInputRef = useRef()

  const saveData = (e,f,g,h) => {
    if (g === 'user') {
      setValue(e);
    }
  }

  const save = async (values) => {
    setSendingComment(true)

    const quillEditor = myInputRef.current.getEditor();
    const editorContents = quillEditor.getText().trim();
  
    if (editorContents === '') {
      alert("Enter message contents");
    } else {
      let arr = myInputRef.current.getEditor().getContents().ops;

      let names = arr
      .filter((a) => typeof a.insert === 'object' && a.insert.mention)
      .map((b) => b.insert.mention.value);
  
      // Use async/await to wait for saveComment to finish
      try {
        await saveComment(myInputRef.current.getEditor().getContents(), names, paths, parentId);

        if (mode === "normal") {
          setShowForm(false)
        } else {
          handleClose()
        }
       
        setSendingComment(false)
      } catch (error) {
        // Handle any errors from saveComment if needed
        console.error(error);
      }
  
      handleStoppedTyping();
    }
  }
  

  const update = () => {
    let arr = myInputRef.current.getEditor().getContents().ops

    let names = arr.filter((a) => typeof a.insert === 'object').map((b) => {
      if (b.insert.mention) {
        return b.insert.mention.value
      }
    })

    updateComment(myInputRef.current.getEditor().getContents(), names, commentFiles)
  }

  // const isEditorEmpty = value?.trim().length === 0;

  // useEffect(() => {
  //   if (editMode) {
      
  //     const quill = myInputRef.current.getEditor();
  //     console.log(childCommentContent, quill.clipboard.convert(childCommentContent));
   
  //     quill.setContents(quill.clipboard.convert(childCommentContent));

  //     setValue(childCommentContent)
  //   }
  // }, [editMode])
  
  useEffect(() => {
    if (editMode) {
      const quill = myInputRef.current.getEditor();
  
      // Parse the HTML content into a Delta
      const delta = quill.clipboard.convert(childCommentContent);
  
      // Extract content inside <p> tags and remove paragraph tags
      const contentInsidePTags = childCommentContent.replace(/<\/?p>/g, '');
  
      // Initialize an array to store the individual ops
      const ops = [];
      let currentAttributes = {}; // Track the current attributes
  
      // Split the content into text and emoji components
      const components = contentInsidePTags.split(/(<em-emoji.*?<\/em-emoji>|<\/?(?:strong|em|u)>)/);
  
      // Iterate over the components and construct ops
      components.forEach((component) => {
        if (component.startsWith("<em-emoji")) {
          // Extract shortcode and size from the custom component
          const shortcodeMatch = component.match(/shortcodes="(.*?)"/);
          const sizeMatch = component.match(/size={(.*?)}/);
  
          if (shortcodeMatch && sizeMatch) {
            const shortcode = shortcodeMatch[1].slice(1, -1); // remove beginning and ending colons
            const size = sizeMatch[1];
  
            // Insert the emoji as a custom insert
            ops.push({
              insert: {
                emoji: shortcode,
              },
            });
          }
        } else if (component === '<strong>') {
          // Set the currentAttributes to bold
          currentAttributes = { ...currentAttributes, bold: true };
        } else if (component === '</strong>') {
          // Remove the bold attribute
          currentAttributes = { ...currentAttributes, bold: undefined };
        } else if (component === '<em>') {
          // Set the currentAttributes to italic
          currentAttributes = { ...currentAttributes, italic: true };
        } else if (component === '</em>') {
          // Remove the italic attribute
          currentAttributes = { ...currentAttributes, italic: undefined };
        } else if (component === '<u>') {
          // Set the currentAttributes to underline
          currentAttributes = { ...currentAttributes, underline: true };
        } else if (component === '</u>') {
          // Remove the underline attribute
          currentAttributes = { ...currentAttributes, underline: undefined };
        } else {
          // Insert text as a regular insert with currentAttributes
          ops.push({
            attributes: currentAttributes,
            insert: component,
          });
        }
      });
  
      // Create a new delta with the constructed ops
      const newDelta = {
        ops,
      };
  
      // Set the contents of the Quill editor
      quill.setContents(newDelta);
  
      // Optionally, update the state with the Delta
      setValue(newDelta);
    }
  }, [editMode]);
  
  
  

  // const atValues = [
  //   { id: 1, value: "Fredrik Sundqvist" },
  //   { id: 2, value: "Patrik Sjölin" }
  // ];

  const atValues = allUsers.filter((b) => b.id !== id).map((a, i) => {
    return {
      id: i,
      value: a.name
    }
  
  });

  const hashValues = [
    { id: 3, value: "Fredrik Sundqvist 2" },
    { id: 4, value: "Patrik Sjölin 2" }
  ];

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
          if (mode === "normal") {
            setPaths(prev => [...prev, uploadedFilePath]); // Update the file path state
          } else {
            if(editMode) {
              dispatch(addCommentFile({file: uploadedFilePath}))
            } else {
              setPaths(prev => [...prev, uploadedFilePath]);
            }
         
          }
        
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    };
    input.click();
  }, []);

  const handleSelectEmoji = useCallback(() => {
  
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
                    if (type === "normal") {
                      setPaths(paths.filter((b) => b !== a));
                    } else {
                      dispatch(removeCommentFile({ file: a }));
                    }
                  }}
                >
                  <DeleteOutlined />
                </span>
              )
            }
         
          </div>
          <p>{a.replace("files/", "")}</p>
        </div>
      );
    });
  };

  const usersTypingSet = new Set(usersTyping);

  useEffect(() => {
    // Listen for 'user typing' events from the server
    socket.on('user typing', (data) => {
      if (parseInt(params.id) === data.activityId) {
        if (!usersTypingSet.has(data.name)) {
          usersTypingSet.add(data.name);
          // Convert the Set back to an array and update the state
          setUsersTyping(Array.from(usersTypingSet));
        }
      }
   

    });
  
    // Listen for 'user stopped typing' events from the server
    socket.on('user stopped typing', (data) => {
      if (parseInt(params.id) === data.activityId) {
        usersTypingSet.delete(data.name);
        // Convert the Set back to an array and update the state
        setUsersTyping(Array.from(usersTypingSet));
      }
    
    });
  
    // Clean up event listeners when the component unmounts
    return () => {
      socket.off('user typing');
      socket.off('user stopped typing');
    };
  }, []);
  
  const handleTyping = () => {
    if (mode === "modal") {
      socket.emit('user typing reply', {name, commentId});
    } else {
      socket.emit('user typing', {name, activityId}); // Replace 'Fred' with the user's name
    }
   
  };
  
  const handleStoppedTyping = () => {
    if (mode === "modal") {
      socket.emit('user stopped typing reply',  {name, commentId}); 
    } else {
      socket.emit('user stopped typing',  {name, activityId}); // Replace 'Fred' with the user's name
    }
  
  };
  
  return (
    <>
      <div style={{marginBottom: "50px"}}>
        <ReactQuill 
          theme="snow" 
          value={value} 
          onChange={saveData}
          style={{height: "300px"}} 
          ref={myInputRef} 
          modules= {
          {
            toolbar: {
              container: [
                ['bold', 'italic', 'underline', 'strike', 'link'],
                [{ 'image': 'Upload Image' }],
                ['emoji'], 
              ],
              handlers: {
                image: handleImageUpload, // Directly reference the callback
                'emoji': handleSelectEmoji
              },
            },
            mention: {
              allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
              mentionDenotationChars: ["@", "#"],
              source: useCallback(
                (searchTerm, renderList, mentionChar) => {
                  let values;
                  if (mentionChar === "@") {
                    values = atValues;
                  } else {
                    values = hashValues;
                  }
         
                  if (searchTerm.length === 0) {
                    renderList(values, searchTerm);
                  } else if (values) {
                    const matches = [];
                    for (let i = 0; i < values.length; i += 1) {
                      if (values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0) {
                        // matches.push(`{${values[i]}`);
                        matches.push(values[i]);
                      }
                    }

                    renderList(matches, searchTerm);
                  }
                },
                []
              ),
              // renderItem: useCallback(
              //   (item, searchTerm) => {
              //     return (
              //       <ListItem button>
              //         <ListItemText primary={item.value} />
              //       </ListItem>
              //     );
              //   },
              //   []
              // )
            },
            "emoji-toolbar": true,
            "emoji-textarea": true,
            "emoji-shortname": true,
          }
          }
          onKeyUp={handleTyping}
          onBlur={handleStoppedTyping}
        />
      </div>

      <div>
        {usersTyping?.length && usersTyping.map((user) => (
          <p key={user}>{user} is typing...</p>
        ))}
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <Button 
          size='small' 
          color="primary" 
          variant="contained" 
          // disabled={isEditorEmpty}
          onClick={() => {
            if (editMode) {
              update()
            } else {
              save()
            }
        
          }}
          style={{borderRadius: "30px"}}
        >
          {
            sendingComment ? (
              <Box sx={{ display: 'flex' }}>
                <CircularProgress size={24} color="inherit" />
              </Box>
            ): "Save"
          }
        </Button>

        
        <div style={{height: "20px", display: "flex"}}>
          {
            editMode ? renderFiles(commentFiles, "modal") : renderFiles(paths, "normal")
          }
        </div>

        <Button 
          size='small' 
          color="warning" 
          variant="contained" 
          onClick={() => {
          
           
            if (mode === "normal") {
              setShowForm(false)
            } else {
              handleClose()
            }
          }}
          style={{borderRadius: "30px"}}
        >
          Cancel
        </Button>
      </div>



      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Empty Content!
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You have to add a message before submiting!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CommentFormQill