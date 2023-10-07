import React, { useEffect, useState } from 'react'
import { Card, CardContent, Typography, Divider, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import CommentForm from './CommentForm';
import instance from '../../services/fetchApi';
import { addComments, editComment, editDownVotes, editUpVotes, setChildCommentContent, setCommentContent, setCommentFiles } from '../../features/ActivitySlice';
import { DeleteOutline, DownloadOutlined, EditOutlined, FilePresent, ReplyOutlined, ThumbDown, ThumbUp } from '@mui/icons-material';
import AddCommentModal from './AddCommentModal';
import { useNavigate } from 'react-router';
import { Box } from '@mui/system';
import CommentFormQill from './CommentFormQill';
import { DeltaToStringConverter } from '../../services/DeltaToStringConverter';
import Popover from '@mui/material/Popover';
import { checkFileType } from '../../services/checkers';
import { init } from 'emoji-mart'
import emojiData from '@emoji-mart/data'
import deltaToStringConverter from 'delta-to-string-converter';

init({ emojiData })


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
  downvotes,
  setShowForm,
  socket 
}) => {
  const navigate = useNavigate()

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPath, setCurrentPath] = useState("");
  const [usersTyping, setUsersTyping] = useState([]);

  const usersTypingSet = new Set(usersTyping);

  useEffect(() => {
    // Listen for 'user typing' events from the server
    socket.on('user typing reply', (data) => {
      if (comment.id === data.commentId) {
        if (!usersTypingSet.has(data.name)) {
          usersTypingSet.add(data.name);
          // Convert the Set back to an array and update the state
          setUsersTyping(Array.from(usersTypingSet));
        }
      }
   

    });
  
    // Listen for 'user stopped typing' events from the server
    socket.on('user stopped typing reply', (data) => {

      if (comment.id === data.commentId) {
        usersTypingSet.delete(data.name);
        // Convert the Set back to an array and update the state
        setUsersTyping(Array.from(usersTypingSet));
      }
    
    });
  
    // Clean up event listeners when the component unmounts
    return () => {
      socket.off('user typing reply');
      socket.off('user stopped typing reply');
    };
  }, []);

  const handlePopoverOpen = (event) => {
    if (!comment.likers.length) {

    } else {
      setAnchorEl(event.currentTarget);
     // setShowForm(false)
    }
  
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

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
      return  <Button
                onClick={() => {
                  if (hide === comment.id) {
                    setHide(null)
                  } else {
                    setHide(comment.id)
                  }
                }}
              >
                {
                  hide === comment.id ? `Show ${comment.numReplies} Replies` : `Hide ${comment.numReplies} replies`
                }
              </Button>
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
      <div dangerouslySetInnerHTML={{ __html: comment.content }} />
    )
  }

  const renderProfileImage = (row) => {
    if (row.profile_pic === "" || row.profile_pic === null) {
      return (
        <div 
          style={{
            display: "inline-block",
            backgroundColor: "gray" ,
            borderRadius: "50%",
            cursor: "pointer",
            marginRight: "10px"
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
      )
    } else {
       return (
        <img 
          width="30px" 
          height="30px" 
          src={row.profile_pic}  
          alt='profile_pic' 
          style={{borderRadius: "50%", cursor: "pointer", marginRight: "10px"}} 
          onClick={() => navigate(`/profile/${row?.id}`)}
        />
       )
    }
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
  

  return (
   
    <Card sx={{marginBottom: "20px", borderLeft: "4px solid grey"}}>
      <CardContent>
        {
          comment?.isDeleted === "Yes" ? (
            <Typography variant="body1">Comment deleted</Typography>
          ) : (
            <>
              {
                renderCommentContent(comment)
              }
              
              {
                comment?.files?.length ?
                <div style={{display: "flex"}}>
                  {
                    comment.files.map((a) => {
                      if (checkFileType(a) === "image") {
                        return  (
                          <div 
                            style={{
                              marginRight: "20px", 
                              display: "flex", 
                              justifyContent: "center", 
                              alignItems: "center", 
                              flexDirection: "column", 
                              marginTop: "40px",
                              cursor: "pointer"
                            }}
                            onClick={() => downloadFile(a.replace("files/", ""))}
                            onMouseEnter={() => {
                              setCurrentPath(a)
                            }}
                            onMouseLeave={() => {
                              setCurrentPath("")
                            }}
                          >
                            
                              <div>
                                <img src={`${process.env.REACT_APP_BASE_URL}${a}`} alt="Image" style={{height: "30px"}} />
                                {
                                  currentPath === a && (
                                    <span style={{marginLeft: "6px", color: "lightblue"}}>
                                      <DownloadOutlined />
                                    </span>
                                  )
                                }
                              </div>
                              <p>{a.replace("files/", "")}</p>
                          </div>
                        )
                      
                      } else {
                        return (
                          <div 
                            style={{
                              marginRight: "20px", 
                              display: "flex", 
                              justifyContent: "center", 
                              alignItems: "center", 
                              flexDirection: "column", 
                              marginTop: "40px",
                              cursor: "pointer"
                            }}
                            onClick={() => downloadFile(a.replace("files/", ""))}
                            onMouseEnter={() => {
                              setCurrentPath(a)
                            }}
                            onMouseLeave={() => {
                              setCurrentPath("")
                            }}
                          >
                              <div>
                                <FilePresent />  
                                {
                                  currentPath === a && (
                                    <span style={{marginLeft: "6px", color: "lightblue"}}>
                                      <DownloadOutlined />
                                    </span>
                                  )
                                }
                              </div>
                              <p>{a.replace("files/", "")}</p>
                          </div>
                        )
                      }
                    })
                  }
                </div> : null
              }
          
              <div style={{display: "flex", justifyContent: "space-between"}}>
                <Typography variant="caption" color="textSecondary">
                  {
                    renderProfileImage(row)
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
                    <IconButton 
                      color={upvotes.includes(comment.id) ? "warning" : "primary"} 
                      onClick={() => {
                        handleUpvote(comment.id)
                        // setShowForm(false)
                      }}
                      onMouseEnter={handlePopoverOpen}
                      onMouseLeave={handlePopoverClose}
                    >
                      <ThumbUp />
                    </IconButton>
                    <Popover
                      id="mouse-over-popover"
                      sx={{
                        pointerEvents: 'none',
                      }}
                      open={open}
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                      onClose={handlePopoverClose}
                      disableRestoreFocus
                    >
                       &nbsp;Liked by &nbsp; &nbsp;
                      {
                        comment?.likers?.slice(0, 3).map((a) => renderProfileImage(a))
                      }

                      {
                        comment?.likers?.length > 3 ? (
                          <span>... and {comment?.likers?.length - 3} others</span>
                        ) : null
                      }
                    </Popover>
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
                      setCommentId(comment.id)
                      setOpenModal(true)
                      setShowForm(false)
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
                          dispatch(setCommentFiles({commentFiles: comment.files}))
                          setShowForm(false)
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
                          setShowForm(false)
                        }}
                      >
                        <DeleteOutline />
                      </Button>
                    )
                  }
                </div>

                {
                  usersTyping?.length ? (
                   <div>
                     {
                        usersTyping.map((user) => (
                          <p key={user}>{user} is typing a reply...</p>
                        ))
                     }
                   </div>
                  ) : null
                }
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
              setShowForm={setShowForm}
              socket={socket}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

const Comments = ({comments, activityId, socket, params}) => {
  const { allUsers, id, name } = useSelector(state => state.user)
  const { upvotes, downvotes } = useSelector(state => state.activity)
  const dispatch = useDispatch()
  const [openModal, setOpenModal] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [parentId, setParentId] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [hide, setHide] = useState()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [commentId, setCommentId] = useState(null)
  
  const createNestedStructure = (comments, parentId = null) => {
    const nestedComments = [];
  
    for (let i = 0; i < comments?.length; i++) {

      if (comments[i].parent_id === parentId) {
        const childComments = createNestedStructure(comments, comments[i].id);
        const totalNumReplies =
          childComments.reduce((total, childComment) => total + childComment.numReplies, 0) +
          childComments.length;
  
        const comment = {
          ...comments[i],
          children: childComments,
          numReplies: totalNumReplies,
        };
  
        nestedComments.push(comment);
      }

     
    }
  
    return nestedComments;
  };

  const handleUpvote = async (id) => {
    await instance.get(`comment/${id}/upvote`)
    .then((res) => {
      // res.data.comment.content = DeltaToStringConverter(res.data.comment.content.ops)
      res.data.comment.content = deltaToStringConverter(res.data.comment.content.ops)
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
  

  const saveComment2 = async (content, names, paths, parent_id = null) => {


    let body = {
      content,
      activity_id: activityId,
      parent_id,
      mentions: names,
      paths
    }

    
    await instance.post(`comment`, body)
    .then((res) => {

      // const formattedHtml = DeltaToStringConverter(res.data.comment.content.ops);
      const formattedHtml = deltaToStringConverter(res.data.comment.content.ops);

      res.data.comment.content = formattedHtml

      dispatch(addComments({comment: res.data.comment}))


      socket.emit('comment_added', { activityId, comment: JSON.stringify(res.data.comment) });
     
      dispatch(setCommentContent({content: ""}))
      dispatch(setChildCommentContent({content: ""}))
      setOpenModal(false)
      setCommentId(null)
      setParentId(null)

      for (let i=0; i<names.length; i++) {
        let username = names[i] 

        let userInfo  = allUsers?.find((a) => a.name === username)
        socket.emit('sendNotification', { recipientId: userInfo.id, message: `You were mentioned by ${name}` });  
      }
      
    })
  }


  const updateComment = async (content, names, paths) => {
    // let names = extractNames(content)

    let body = {
      content,
      mentions: names,
      paths
    }

    await instance.patch(`comment/${commentId}`, body)
    .then((res) => {

      res.data.comment.content = deltaToStringConverter(res.data.comment.content.ops)
      // res.data.comment.content = DeltaToStringConverter(res.data.comment.content.ops)

      socket.emit('comment_edited', { activityId, comment: JSON.stringify(res.data.comment) });

      dispatch(editComment({comment: res.data.comment}))
      dispatch(setChildCommentContent({content: ""}))
      setCommentId(null)
      setOpenModal(false)
      setParentId(null)

      for (let i=0; i<names.length; i++) {
        let username = names[i] 

        let userInfo  = allUsers?.find((a) => a.name === username)
        socket.emit('sendNotification', { recipientId: userInfo.id, message: `You were mentioned by ${name}` });  
      }
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
          setShowForm={setShowForm}
          socket={socket}
        />
      ))}

      {/* <CommentForm
        saveComment={saveComment}
      />  */}
      
      {
        showForm && (
          <CommentFormQill
            saveComment={saveComment2}
            allUsers={allUsers}
            setShowForm={setShowForm}
            mode="normal"
            socket={socket}
            activityId={activityId}
            params={params}
          />
        )
      }
    
      {
        !showForm && (
          <Button
            variant='contained' 
            onClick={() => setShowForm(true)}
            style={{marginTop: "10px"}}
          >
            Add Comment
          </Button>
        )
      }
   

      <AddCommentModal
        open={openModal}
        setOpen={setOpenModal}
        parentId={parentId}
        activityId={activityId}
        saveComment={saveComment2}
        // saveComment={saveComment}
        updateComment={updateComment}
        dispatch={dispatch}
        editMode={editMode}
        commentId={commentId}
        socket={socket}
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