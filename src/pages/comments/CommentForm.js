import { Button, TextField } from '@mui/material'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCommentContent } from '../../features/ActivitySlice'
import '@draft-js-plugins/mention/lib/plugin.css'
import { MentionsInput, Mention } from 'react-mentions'
import defaultMentionStyles from './defaultMentionStyles'
import defaultStyle from './defaultStyle'

const CommentForm = ({saveComment}) => {

  const { commentContent } = useSelector(state => state.activity)
  const [mentions, setMentions] = useState([]);

  const dispatch = useDispatch()

  const handleChange = (e) => {
    const value = e.target.value;
    dispatch(setCommentContent({content: value}))

    // Extract mentions from the input
    const regex = /@(\w+)/g;
    const matchedMentions = value.match(regex);
    if (matchedMentions) {
      const uniqueMentions = [...new Set(matchedMentions)];
      setMentions(uniqueMentions);
    }
  }

  const { allUsers } = useSelector(state => state.user)

  // const onChange = (e) => {
  //   console.log("onChange", e);
  //   setValue(e.target.value);
  // };

  const fetchUsers = (query, callback) => {
    if (!query) return;
  
    setTimeout(() => {
      const filteredUsers = allUsers.map((a) => {
        return {
          id: a.name,
          display: a.name
        }
      }).
      filter((user) =>
        user.display.toLowerCase().includes(query)
      );

      callback(filteredUsers);
    }, 1000);
  };



  return (
    <div>
      {/* <TextField
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
      />  */}
       <MentionsInput 
          style={defaultStyle} 
          value={commentContent}
          onChange={handleChange}
          placeholder={"Mention people using '@'"}
          a11ySuggestionsListLabel={"Suggested mentions"}
        >
          <Mention
            trigger="@"
            style={defaultMentionStyles}
            data={fetchUsers}
          />
        </MentionsInput>

      <Button variant='contained' onClick={() => saveComment(commentContent, mentions)}>
        Save
      </Button>
    </div>
  )
}

export default CommentForm