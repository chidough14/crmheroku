import { Button, Grid } from '@mui/material'
import moment from 'moment'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import { useNavigate, useParams } from 'react-router-dom'
import instance from '../../services/fetchApi'


//zego email tpsimu20@gmail.com (@Fusion14) 

const JoinMeeting = () => {
  const user = useSelector((state) => state.user) 
  const navigate = useNavigate()
  const params = useParams()
  const [userLoaded, setUserLoaded] = useState(false)
  const [isAllowed, setIsAllowed] = useState(false)

  useEffect(() => {
    const getMeetingData = async () => {
      await instance.get(`meeting/join/${params?.id}`)
      .then((res) => {
          if (res.data.meeting) {
            let isCreator = (res.data.meeting.user_id === user.id)

            if (res.data.meeting.meetingType === "1-on-1") {
              if (res.data.meeting.invitedUsers[0] === user?.email || isCreator) {
                if (res.data.meeting.meetingDate === moment().format("L")) {
                  setIsAllowed(true)
                } else if (moment(res.data.meeting.meetingDate).isBefore(moment().format("L"))) {
                  alert("Meeting has ended")
                  navigate(user ? "/" : "/login")
                } else if (moment(res.data.meeting.meetingDate).isAfter()) {
                  alert(`Meeting is on ${res.data.meeting.meetingDate}`)
                  navigate(user ? "/" : "/login")
                }
  
              } else navigate("/login")
            } else if (res.data.meeting.meetingType == "Conference") {
              const index = res.data.meeting.invitedUsers.findIndex((a) => a === user?.email)
              if (index !== -1 || isCreator) {
                if (res.data.meeting.meetingDate === moment().format("L")) {
                  setIsAllowed(true)
                } else if (moment(res.data.meeting.meetingDate).isBefore(moment().format("L"))) {
                  alert(`Meeting has ended`)
                  navigate(user ? "/" : "/login")
                } else if (moment(res.data.meeting.meetingDate).isAfter()) {
                  alert(`Meeting is on ${res.data.meeting.meetingDate}`)
                }
  
              } else {
                alert(`You are not invited to the meeting`)
                navigate(user ? "/" : "/login")
              }
            } else {
              setIsAllowed(true)
            }

          } else {
            navigate("/mymeetings")
          }
      })
    }

    if (params.id) {
      getMeetingData()
    }
  }, [user])

  const generateMeetingId = () => {
    let meetingID = "";
    const chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
    const maxPos = chars.length;
  
    for (let i = 0; i < 8; i++) {
      meetingID += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return meetingID;
  }

  const appId = 623442053
  const serverSecret = 'adcef43052a3692789e3b26d33049801'

  const myMeeting = async (element) => {
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appId, 
      serverSecret, 
      params.id, 
      user.email ? user.email : generateMeetingId(),
      user.name ? user.name : generateMeetingId()
    )

    const zp = ZegoUIKitPrebuilt.create(kitToken)
    zp.joinRoom({
      container: element,
      maxUsers: 50,
      sharedLinks: [
        {
          name: "Personal link",
          url: window.location.origin
        }
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference
      }
    })
  }

  return (
    <Grid container sx={{ height: '90vh', marginTop: "60px" }}>
      {
        isAllowed && (
          <>
          <Button 
            variant='contained' 
            type='primary' 
            onClick={() => {
              navigate("/mymeetings")
              window.location.reload()
            }}
          >
            Leave room
          </Button>
            <div 
              className='myCallContainer' 
              ref={myMeeting} 
              style={{width: "100%", height: "100vh"}}
            ></div>
          </>
        
        )
      }
    </Grid>
  )
}

export default JoinMeeting