import * as React from 'react';
import { useSelector, useDispatch } from "react-redux";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { setOpenDeleteDialog } from '../../features/userSlice';

const DeleteDialog = ({ deleteLabel }) => {
  const { openDeleteDialog, currentLabelId, deletingLabel } = useSelector(state => state.user)
  const dispatch = useDispatch()


  const handleClose = () => {
    dispatch(setOpenDeleteDialog({openDeleteDialog: false}))
  };

  const handleSubmit = () => {
    deleteLabel(currentLabelId);
    dispatch(setOpenDeleteDialog({openDeleteDialog: false}))
  };

  return (
    <div>
      <Dialog
        open={openDeleteDialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete Label
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this label ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={handleSubmit} autoFocus>
            {
              deletingLabel ? (
                <span style={{color: "red"}}>Deleting....</span>
              ) : "Agree"
            }
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DeleteDialog