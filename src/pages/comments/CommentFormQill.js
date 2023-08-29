import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactQuill, { Quill } from 'react-quill';
import "quill-mention";
import 'react-quill/dist/quill.snow.css';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import instance from '../../services/fetchApi';
import { DeleteOutlined, FilePresent } from '@mui/icons-material';
import { checkFileType } from '../../services/checkers';
import { addCommentFile, removeCommentFile } from '../../features/ActivitySlice';

const CommentFormQill = ({ saveComment, allUsers, parentId, editMode, childCommentContent, updateComment, reply, handleClose, setShowForm, mode }) => {
  const [value, setValue] = useState()
  const [openDialog, setOpenDialog] = useState(false)
  const [currentFile, setCurrentFile] = useState("")
  const [paths, setPaths] = useState([])
  const { id } = useSelector(state => state.user)
  const { commentFiles } = useSelector(state => state.activity)
  const dispatch = useDispatch()
  const myInputRef = useRef()

  const saveData = (e,f,g,h) => {
    if (g === 'user') {
      setValue(e);
    }
  }

  const save = (values) => {

    // Get the Quill editor instance from the ref
    const quillEditor = myInputRef.current.getEditor();

    // Get the text content of the editor
    const editorContents = quillEditor.getText().trim();

    if (editorContents === '') {
      // setOpenDialog(true)
      alert("Enter message contents")
    } else {
      // Submit the form or perform your action
      let arr = myInputRef.current.getEditor().getContents().ops

      let names = arr.filter((a) => typeof a.insert === 'object').map((b) => b.insert.mention.value)
  
      saveComment(myInputRef.current.getEditor().getContents(), names, paths, parentId)

      setShowForm(false)
    }


  }

  const update = () => {
    let arr = myInputRef.current.getEditor().getContents().ops

    let names = arr.filter((a) => typeof a.insert === 'object').map((b) => b.insert.mention.value)

    updateComment(myInputRef.current.getEditor().getContents(), names, commentFiles)
  }

  // const isEditorEmpty = value?.trim().length === 0;

  useEffect(() => {
    if (editMode) {
      
      const quill = myInputRef.current.getEditor();
      // const newValue = 'New editor value!';
      quill.setContents(quill.clipboard.convert(childCommentContent));

      setValue(childCommentContent)

      // setPaths(commentFiles)
    }
  }, [editMode])

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
              ],
              handlers: {
                image: handleImageUpload, // Directly reference the callback
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
                    for (let i = 0; i < values.length; i += 1)
                      if (
                        values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
                      )
                        matches.push(`{${values[i]}`);
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
            }
          }
          }
        />
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
          Save
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