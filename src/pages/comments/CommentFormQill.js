import React, { useEffect, useRef, useState } from 'react'
import ReactQuill, { Quill } from 'react-quill';
import "quill-mention";
import 'react-quill/dist/quill.snow.css';
import { Button } from '@mui/material';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import { useSelector } from 'react-redux';

const CommentFormQill = ({ saveComment, allUsers, parentId, editMode, childCommentContent, updateComment, reply, handleClose }) => {
  const [value, setValue] = useState()
  const [users, setUsers] = useState([])
  const { id } = useSelector(state => state.user)
  const myInputRef = useRef()

  const saveData = (e,f,g,h) => {
    // console.log(h.getContents())
    // setValue(h.getContents())
    // setQuillValue(h.getContents())
  }

  const save = (values) => {
    let arr = myInputRef.current.getEditor().getContents().ops

    let names = arr.filter((a) => typeof a.insert === 'object').map((b) => b.insert.mention.value)

    saveComment(myInputRef.current.getEditor().getContents(), names, parentId)
  }

  const update = () => {
    let arr = myInputRef.current.getEditor().getContents().ops

    let names = arr.filter((a) => typeof a.insert === 'object').map((b) => b.insert.mention.value)

    updateComment(myInputRef.current.getEditor().getContents(), names)
  }

  useEffect(() => {
    if (editMode) {
      
      const quill = myInputRef.current.getEditor();
      console.log(childCommentContent, quill.clipboard.convert(childCommentContent));
      const newValue = 'New editor value!';
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
              source: function(searchTerm, renderList, mentionChar) {
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
    </>
  )
}

export default CommentFormQill