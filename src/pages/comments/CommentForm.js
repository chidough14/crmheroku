import { Button, TextField } from '@mui/material'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCommentContent } from '../../features/ActivitySlice'

const CommentForm = ({saveComment}) => {
  const { commentContent } = useSelector(state => state.activity)
  const dispatch = useDispatch()

  const handleChange = (e) => {
    dispatch(setCommentContent({content: e.target.value}))
  }

  return (
    <div>
      <TextField
        style={{marginBottom: "12px"}}
        required
        size='small'
        fullWidth
        multiline
        rows={4}
        id="content"
        name="content"
        label="Content"
        value={commentContent}
        onChange={handleChange}
      /> 

      <Button variant='contained' onClick={() => saveComment(commentContent)}>
        Save
      </Button>
    </div>
  )
}

export default CommentForm