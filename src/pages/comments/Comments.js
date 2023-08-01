import React, { useState } from 'react'
import { Card, CardContent, Typography, Divider, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import CommentForm from './CommentForm';
import instance from '../../services/fetchApi';
import { addComments, editComment, editDownVotes, editUpVotes, setChildCommentContent, setCommentContent } from '../../features/ActivitySlice';
import { DeleteOutline, EditOutlined, ReplyOutlined, ThumbDown, ThumbUp } from '@mui/icons-material';
import AddCommentModal from './AddCommentModal';
import { useNavigate } from 'react-router';
import { Box } from '@mui/system';


const Comment = ({ 
  comment, 
  allUsers, 
  setOpenModal, 
  setParentId, 
  userId, 
  dispatch, 
  editMode, 
  setEditMode, 
  setCommentId, 
  setOpenDeleteDialog,
  setHide,
  hide,
  handleDownvote,
  handleUpvote,
  upvotes,
  downvotes 
}) => {
  const navigate = useNavigate()

  let row = allUsers?.find((a) => a.id === comment?.user_id)

  const getInitials = (string) => {
    let names = string?.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();
    
    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  }

  const renderShowHideReplies = (hide, comment) => {
    if (comment.children && comment.children.length) {
      if (hide === comment.id) {
        return  <Button
                  onClick={() => {
                    setHide(null)
                  }}
                >
                  Show Replies
                </Button>
      } else {
        return  <Button
                  onClick={() => {
                    setHide(comment.id)
                  }}
                >
                  Hide Replies
                </Button>
      }
    } else {
      return null
    }
  }

  const replaceUsernames = (input) => {
    const regex = /@\[([^)]+)\]\([^)]+\)/g;
    return input.replace(regex, (match, username) => username);
  }

  const renderCommentContent = (comment) => {
    return (
      <Typography variant="body1">{replaceUsernames(comment.content)}</Typography>
    )
  }

  return (
   
    <Card sx={{marginBottom: "20px"}}>
      <CardContent>
        {
          comment?.isDeleted === "Yes" ? (
            <Typography variant="body1">Comment deleted</Typography>
          ) : (
            <>
              {
                renderCommentContent(comment)
              }
          
              <div style={{display: "flex", justifyContent: "space-between"}}>
                <Typography variant="caption" color="textSecondary">
                  {
                    (row.profile_pic === "" || row.profile_pic === null) ? (
                    <div 
                      style={{
                        display: "inline-block",
                        backgroundColor: "gray" ,
                        borderRadius: "50%",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/profile/${row?.id}`)}
                    >
                      <p 
                        style={{
                          color: "white",
                          display: "table-cell",
                          verticalAlign: "middle",
                          textAlign: "center",
                          textDecoration: "none",
                          height: "30px",
                          width: "30px",
                          fontSize: "15px"
                        }}
                      >
                        {getInitials(row?.name)}
                      </p>
                    </div>
                    ) : (
                      <img 
                        width="30px" 
                        height="30px" 
                        src={row.profile_pic}  
                        alt='profile_pic' 
                        style={{borderRadius: "50%", cursor: "pointer"}} 
                        onClick={() => navigate(`/profile/${row?.id}`)}
                      />
                    )
                  }
      
                  {
                    allUsers?.find((a) => a.id === comment.user_id)?.name
                  } 
                  • 
                  { 
                    moment(comment.updated_at).format("DD MMMM YYYY h:m") 
                  }
                </Typography>
      
                <div style={{display: "flex"}}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <span>{comment.upvotes}</span>
                    <IconButton color={upvotes.includes(comment.id) ? "warning" : "primary"} onClick={() => handleUpvote(comment.id)}>
                      <ThumbUp />
                    </IconButton>
                    {/* <Typography variant="body1">
                      {comment.upvotes - comment.downvotes}
                    </Typography>
                    <span>{comment.downvotes}</span>
                    <IconButton color={downvotes.includes(comment.id) ? "warning" : "primary"} onClick={() => handleDownvote(comment.id)}>
                      <ThumbDown />
                    </IconButton> */}
                  </Box>


                  { renderShowHideReplies(hide, comment) }
                 

                  <Button
                    onClick={() => {
                      setEditMode(false)
                      setParentId(comment.id)
                      setOpenModal(true)
                    }}
                  >
                    <ReplyOutlined />
                  </Button>
      
                  {
                    comment.user_id === userId && (
                      <Button
                        onClick={() => {
                          setCommentId(comment.id)
                          setEditMode(true)
                          setOpenModal(true)
                          dispatch(setChildCommentContent({content: comment.content}))
                        }}
                      >
                        <EditOutlined />
                      </Button>
                    )
                  }
      
                  {
                    comment.user_id === userId && (
                      <Button
                        onClick={() => {
                          setCommentId(comment.id)
                          setOpenDeleteDialog(true)
                        }}
                      >
                        <DeleteOutline />
                      </Button>
                    )
                  }
                </div>
              </div>
            </>
          )
        }
      
      </CardContent>
      {hide !== comment.id && comment.children && comment.children.length > 0 && (
        <div style={{marginLeft: "40px"}}>
          <Divider />
          {comment.children.map((childComment) => (
            <Comment 
              key={childComment.id} 
              comment={childComment}   
              allUsers={allUsers}
              setOpenModal={setOpenModal}
              setParentId={setParentId}
              userId={userId}
              dispatch={dispatch}
              setEditMode={setEditMode}
              editMode={editMode}
              setCommentId={setCommentId}
              setOpenDeleteDialog={setOpenDeleteDialog}
              setHide={setHide}
              hide={hide}
              handleDownvote={handleDownvote}
              handleUpvote={handleUpvote}
              upvotes={upvotes}
              downvotes={downvotes}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

const Comments = ({comments, activityId, socket}) => {
  const { allUsers, id, name } = useSelector(state => state.user)
  const { upvotes, downvotes } = useSelector(state => state.activity)
  const dispatch = useDispatch()
  const [openModal, setOpenModal] = useState(false)
  const [parentId, setParentId] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [hide, setHide] = useState()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [commentId, setCommentId] = useState(null)
  
  const createNestedStructure = (comments, parentId = null) => {
    const nestedComments = [];
  
    for (let i = 0; i < comments?.length; i++) {

      if (comments[i].parent_id === parentId) {
        const comment = {
          ...comments[i],
          children: createNestedStructure(comments, comments[i].id),
        };
        nestedComments.push(comment);
      }

     
    }
  
    return nestedComments;
  };

  const handleUpvote = async (id) => {
    await instance.get(`comment/${id}/upvote`)
    .then((res) => {
      socket.emit('comment_upvoted', { activityId, comment: JSON.stringify(res.data.comment) });
      dispatch(editComment({comment: res.data.comment}))
      dispatch(editUpVotes({id: res.data.comment.id}))
    })
  };

  const handleDownvote = async (id) => {
    await instance.get(`comment/${id}/downvote`)
    .then((res) => {
      dispatch(editComment({comment: res.data.comment}))
      dispatch(editDownVotes({id: res.data.comment.id}))
    })
  };

  const extractNames = (input) => {
    const regex = /\(([^)]+)\)/g; // Regular expression to match text inside normal brackets
    const namesArray = [];
    let match;
    
    while ((match = regex.exec(input)) !== null) {
      namesArray.push(match[1]);
    }
  
    return namesArray;
  };

  const replaceUsernames = (input) => {
    const regex = /@\[([^)]+)\]\([^)]+\)/g;
    return input.replace(regex, (match, username) => username);
  }



  const saveComment = async (content, parent_id = null) => {
    let names = extractNames(content)

    let body = {
      content,
      activity_id: activityId,
      parent_id,
      mentions: names
    }
    
    await instance.post(`comment`, body)
    .then((res) => {
      socket.emit('comment_added', { activityId, comment: JSON.stringify(res.data.comment) });

      if(names.length > 0) {
        let data = {
          ...res.data.comment,
          content: replaceUsernames(res.data.comment.content)
        }
        dispatch(addComments({comment: data}))
      } else {
        dispatch(addComments({comment: res.data.comment}))
      }
     
      dispatch(setCommentContent({content: ""}))
      dispatch(setChildCommentContent({content: ""}))
      setOpenModal(false)

      for (let i=0; i<names.length; i++) {
        let username = names[i] 

        let userInfo  = allUsers?.find((a) => a.name === username)
        socket.emit('sendNotification', { recipientId: userInfo.id, message: `You were mentioned by ${name}` });  
      }
      
    })
  }

  const updateComment = async (content) => {
    let names = extractNames(content)

    let body = {
      content,
      mentions: names
    }

    await instance.patch(`comment/${commentId}`, body)
    .then((res) => {
    
      socket.emit('comment_edited', { activityId, comment: JSON.stringify(res.data.comment) });

      if(names.length > 0) {
        let data = {
          ...res.data.comment,
          content: replaceUsernames(res.data.comment.content)
        }
        dispatch(editComment({comment: data}))
      } else {
        dispatch(editComment({comment: res.data.comment}))
      }

      // dispatch(editComment({comment: res.data.comment}))
      dispatch(setChildCommentContent({content: ""}))
      setCommentId(null)
      setOpenModal(false)
    })
  }

  const deleteComment = async () => {
    await instance.delete(`comment/${commentId}`)
    .then((res) => {
      socket.emit('comment_deleted', { activityId, comment: JSON.stringify(res.data.comment) });
      setCommentId(null)
      dispatch(editComment({comment: res.data.comment}))
      setOpenDeleteDialog(false)
    })
  }

  return (
    <div>
      {createNestedStructure(comments).map((comment) => (
        <Comment 
          key={comment.id} 
          comment={comment} 
          allUsers={allUsers}
          setOpenModal={setOpenModal}
          setParentId={setParentId}
          userId={id}
          dispatch={dispatch}
          setEditMode={setEditMode}
          editMode={editMode}
          setCommentId={setCommentId}
          setOpenDeleteDialog={setOpenDeleteDialog}
          setHide={setHide}
          hide={hide}
          handleDownvote={handleDownvote}
          handleUpvote={handleUpvote}
          upvotes={upvotes}
          downvotes={downvotes}
        />
      ))}

      <CommentForm
        saveComment={saveComment}
      /> 

      {/* <CommentMentions /> */}

      <AddCommentModal
        open={openModal}
        setOpen={setOpenModal}
        parentId={parentId}
        activityId={activityId}
        saveComment={saveComment}
        updateComment={updateComment}
        dispatch={dispatch}
        editMode={editMode}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete comment
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this comment ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>No</Button>
          <Button onClick={() => deleteComment()} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Comments