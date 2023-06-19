import { InfoOutlined } from '@mui/icons-material'
import { CircularProgress, Tooltip, Typography } from '@mui/material'
import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import ActivityItem from './ActivityItem'

const ActivityColumn = ({ col: { list, id, total }, loading, socket, showTrash }) => {

  const getInfo = (id) => {
    let text
    if (id === "Low") {
      text = "Amount is calculated based on toal cost of products multiplied by 20%"
    }

    if (id === "Medium") {
      text = "Amount is calculated based on toal cost of products multiplied by 40%"
    }

    if (id === "High") {
      text = "Amount is calculated based on toal cost of products multiplied by 80%"
    }

    if (id === "Closed") {
      text = "Amount is calculated based on toal cost of products in the latest invoice"
    }

    return text
  }

  return (
    <Droppable droppableId={id}>
      {provided => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: "10px",
            backgroundColor: id === "Low" ? ' 	#E8E8E8' :
                            id === "Medium" ? "#DCDCDC" :
                            id === "High" ? "#D3D3D3" : "#C0C0C0"
          }}
        >

          <p style={{textAlign: "center", fontSize: "14px", marginBottom: "20px"}}>
            <b>{id}</b> 
            <Tooltip placement='top' title={getInfo(id)}>
              <InfoOutlined sx={{fontSize: "14px", marginLeft: "10px"}} />
            </Tooltip>
            <br></br> ${total}
          </p>
          

          {
            loading ? (
              <div style={{ marginLeft: "45%", marginTop: "120px" }}>
                {/* <CircularProgress /> */}
                <Typography variant='h7'>
                  <b>Loading...</b>
                </Typography>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '120px',
                }}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {list.map((item, index) => (
                    <ActivityItem  
                      activity={item} 
                      index={index} 
                      socket={socket} 
                      showTrash={showTrash}
                    />
                ))}
                {provided.placeholder}
              </div>
            )
          }
        
        </div>
      )}
    </Droppable>
  )
}

export default ActivityColumn