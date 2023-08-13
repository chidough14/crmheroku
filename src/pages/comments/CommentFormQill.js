import React, { useEffect, useRef, useState } from 'react'
import ReactQuill, { Quill } from 'react-quill';
import "quill-mention";
import 'react-quill/dist/quill.snow.css';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import { useSelector } from 'react-redux';

const CommentFormQill = ({ saveComment, allUsers, parentId, editMode, childCommentContent, updateComment, reply, handleClose, setShowForm }) => {
  const [value, setValue] = useState()
  const [quillValue, setQuillValue] = useState(undefined)
  const [users, setUsers] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const { id } = useSelector(state => state.user)
  const myInputRef = useRef()

  const saveData = (e,f,g,h) => {
    // console.log(h.getContents())
    // setValue(e)
    //setQuillValue(h.getContents())
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
  
      saveComment(myInputRef.current.getEditor().getContents(), names, parentId)

      setShowForm(false)
    }


  }

  const update = () => {
    let arr = myInputRef.current.getEditor().getContents().ops

    let names = arr.filter((a) => typeof a.insert === 'object').map((b) => b.insert.mention.value)

    updateComment(myInputRef.current.getEditor().getContents(), names)
  }

  // const isEditorEmpty = value?.trim().length === 0;

  useEffect(() => {
    if (editMode) {
      
      const quill = myInputRef.current.getEditor();
      // const newValue = 'New editor value!';
      quill.setContents(quill.clipboard.convert(childCommentContent));

      
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
            toolbar: [
              ['bold', 'italic', 'underline', 'strike', 'link']
            ],
            mention: {
              allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
              mentionDenotationChars: ["@", "#"],
              source: (searchTerm, renderList, mentionChar) => {
                let values;
        
                if (mentionChar === "@") {
                  values = atValues;
                } else {
                  values = hashValues;
                }
        
                if (searchTerm.length === 0) {
                  renderList(values, searchTerm);
                } else {
                  const matches = [];
                  for (let i = 0; i < values.length; i++)
                    if (
                      ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
                    )
                      matches.push(values[i]);
                  renderList(matches, searchTerm);
                }
              }
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
        
        { 
          reply &&
          <Button 
            size='small' 
            color="warning" 
            variant="contained" 
            onClick={() => {
              handleClose()
            }}
            style={{borderRadius: "30px"}}
          >
            Cancel
          </Button>
        }
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