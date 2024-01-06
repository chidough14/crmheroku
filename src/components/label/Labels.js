import { AddOutlined, DeleteOutlined, EditOutlined, ExpandLess, ExpandMore, LabelOutlined, OpenInBrowser, OpenInBrowserOutlined } from '@mui/icons-material';
import { Badge, CircularProgress, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react'
import { useSelector, useDispatch } from "react-redux";
import { setCurrentLabelId, setOpenDeleteDialog, setOpenEditLabelModal, setShowDropdown, setShowLabelActions } from '../../features/userSlice';
import EditLabelModal from './EditLabelModal';
import { useNavigate } from 'react-router';
import DeleteDialog from './DeleteDialog';
import "./label.css"

const Labels = ({
  setOpenLabels, 
  openLabels, 
  open, 
  renderSubLabels, 
  renderExpandIcon, 
  setOpenAddLabelModal, 
  deleteLabel
}) => {
  const { labels, labelActions, currentLabelId, labelsLoading } = useSelector(state => state.user)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <>
      <Tooltip title="Add new Label">
        <ListItem 
          disablePadding 
          sx={{ 
            display: 'block',
          }}
        >
          <ListItemButton
            onClick={() => {
              dispatch(setShowDropdown({showDropdown: false}))
              setOpenAddLabelModal(true)
            }}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              {
                open ? (
                  <>
                    <AddOutlined />
                    <ListItemText primary="Add New Label" sx={{ opacity: open ? 1 : 0 }} />
                  </>
                ) : (
                  <AddOutlined />
                )
              }
            </ListItemIcon>
          </ListItemButton>
        </ListItem>  

      </Tooltip>



      {
        open ? (
          <Typography variant='h6' style={{marginLeft: "10px", marginBottom: "10px"}}>
            Labels
          </Typography >
        ) : null
      }

     

      {
        labelsLoading ? (
          <CircularProgress 
            style={{width: "20px", height: "20px", marginTop: "20%", marginLeft: "40%"}} 
          />
        ) : !labels.length ? (
          <Typography variant='h7' style={{marginLeft: "20px"}}>No Labels</Typography>
        ) :
        labels.filter((b) => b.parent === null).map((a) => (
          <Tooltip title={a.name}>
            <ListItem 
              disablePadding 
              sx={{ 
                display: 'block',
              }}
              onMouseEnter={() => {
                dispatch(setCurrentLabelId({currentLabelId: a.id}))
                dispatch(setShowLabelActions({labelActions: true}))
              }}
              onMouseLeave={() => {
                dispatch(setShowLabelActions({labelActions: false}))
              }}
            >
              <ListItemButton
                onClick={() => {
                  setOpenLabels((prevOpenLabels) => ({
                    ...prevOpenLabels,
                    [a.name]: !prevOpenLabels[a.name],
                  }));
                }}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >

                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {
                    open ? (
                      <>
                        <LabelOutlined />
                        <ListItemText primary={a.name} sx={{ opacity: open ? 1 : 0 }} />

                      </>
                    ) :  labels.some(obj => obj.parent === a?.id)  ? (
                        <Badge color="secondary" variant="dot">
                          <LabelOutlined />
                        </Badge>
                    ) : (
                      <LabelOutlined />
                    )
                  }
                </ListItemIcon>

                {
                  open && (labelActions && currentLabelId === a.id) ? (
                    <>
                      <EditOutlined
                        style={{cursor: "pointer", fontSize: "16px", marginRight: "5px"}}
                        onClick={(e) => {
                          e.stopPropagation()
                          dispatch(setOpenEditLabelModal({openEditLabelModal: true}))
                        }}
                      />

                      <DeleteOutlined
                        style={{cursor: "pointer", fontSize: "16px", color: "red", marginRight: "5px"}}
                        onClick={(e) => {
                          e.stopPropagation()
                          dispatch(setOpenDeleteDialog({openDeleteDialog: true}))
                        }}
                      />

                      <OpenInBrowserOutlined
                        style={{cursor: "pointer", fontSize: "16px", color: "green", marginRight: "5px"}}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`labels/${a.id}`)
                        }}
                      />
                    </>
                  ) : null
                }

                {
                  open && labels.some(obj => obj.parent === a?.id) ? renderExpandIcon(openLabels[a.name]) : null
                }
              </ListItemButton>
              {
                renderSubLabels(a)
              }
            </ListItem> 
          </Tooltip>
        ))
      }


      <EditLabelModal />

      <DeleteDialog 
        deleteLabel={deleteLabel}
      />
    </>
  )
}

export default Labels