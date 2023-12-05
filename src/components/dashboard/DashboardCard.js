import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {
  Calendar as ReactCalendar,
  Views,
  momentLocalizer,
} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import "./index.css"
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ViewEventModal from '../../components/events/ViewEventModal';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

const bull = (
  <Box
    component="span"
    sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
  >
    •
  </Box>
);
const localizer = momentLocalizer(moment);

export default function DashboardCard({type, events, list, eventsLoading, listsLoading}) {
  const navigate = useNavigate()
  const [openViewEventModal, setOpenViewEventModal] = useState(false)
  const [eventObj, setEventObj] = useState()
  const { activities, activitiesLoading } = useSelector((state) => state.activity) 
  const [lowActivities, setLowActivities] = useState({count: 0, amount: 0})
  const [mediumActivities, setMediumActivities] = useState({count: 0, amount: 0})
  const [highActivities, setHighActivities] = useState({count: 0, amount: 0})
  const [closedActivities, setClosedActivities] = useState({count: 0, amount: 0})
  const { id, setting, exchangeRates } = useSelector(state => state.user)
  const [currencySymbol, setCurrencySymbol] = useState("$")

  useEffect(() => {
    if (setting?.currency_mode === "USD" || setting?.currency_mode === null) {
      setCurrencySymbol("$")
      if(activities && activities.length) {

        let low = activities.filter((a) => a.probability === "Low")
        let medium = activities.filter((a) => a.probability === "Medium")
        let high = activities.filter((a) => a.probability === "High")
        let closed = activities.filter((a) => a.probability === "Closed")
        
        setLowActivities({
          count: low?.length,
          amount: low?.map((a) => a.total).reduce((prev, curr) => prev + curr, 0) * 0.2
        })
    
        setMediumActivities({
          count:  medium?.length,
          amount:  medium?.map((a) => a.total).reduce((prev, curr) => prev + curr, 0) * 0.4
        })
    
        setHighActivities({
          count:  high?.length,
          amount:  high?.map((a) => a.total).reduce((prev, curr) => prev + curr, 0) * 0.8
        })
    
        setClosedActivities({
          count:  closed?.length,
          amount:  closed?.map((a) => a.total).reduce((prev, curr) => prev + curr, 0)
        })
      }
    } else {
      if (setting?.currency_mode === "EUR") {
        setCurrencySymbol("€")
      }

      if (setting?.currency_mode === "GBP") {
        setCurrencySymbol("£")
      }
      let rate = exchangeRates[setting?.currency_mode]

      if(activities && activities.length) {
        let activitiesWithCurrencyConverted = activities.map((a) => {
          return {
            ...a,
            total: a.total * rate
          }
        })

        let low = activitiesWithCurrencyConverted.filter((a) => a.probability === "Low")
        let medium = activitiesWithCurrencyConverted.filter((a) => a.probability === "Medium")
        let high = activitiesWithCurrencyConverted.filter((a) => a.probability === "High")
        let closed = activitiesWithCurrencyConverted.filter((a) => a.probability === "Closed")

        // let low = activities.filter((a) => a.probability === "Low")
        // let medium = activities.filter((a) => a.probability === "Medium")
        // let high = activities.filter((a) => a.probability === "High")
        // let closed = activities.filter((a) => a.probability === "Closed")
        
        setLowActivities({
          count: low?.length,
          amount: low?.map((a) => a.total).reduce((prev, curr) => prev + curr, 0) * 0.2
        })
    
        setMediumActivities({
          count:  medium?.length,
          amount:  medium?.map((a) => a.total).reduce((prev, curr) => prev + curr, 0) * 0.4
        })
    
        setHighActivities({
          count:  high?.length,
          amount:  high?.map((a) => a.total).reduce((prev, curr) => prev + curr, 0) * 0.8
        })
    
        setClosedActivities({
          count:  closed?.length,
          amount:  closed?.map((a) => a.total).reduce((prev, curr) => prev + curr, 0)
        })
      }
    }
  
    
  }, [activities, exchangeRates])

  const renderTableRow = (td1, td2) => {
    return  <tr>
              <td style={{textAlign: "left"}}>{td1}</td>
              <td style={{textAlign: "right"}}>
                {`${td2.count} (${currencySymbol}${td2.amount.toFixed(1)})`}
              </td>
            </tr>
  }

  return (
    <>
    <Card sx={{ minWidth: 275, height: "100%" }}>
      <CardContent>
        {
          type === "event"  && (
            <div style={{display: "flex", justifyContent: "space-between", marginTop: "-10px"}}>
              <div style={{color: "black", width: "200px"}}>
                <p>Next Event</p>
                {
                  events?.length ? 
                  <p style={{fontWeight: "bolder"}}>{moment(events[0].start).format('h:mm:a')} - {events[0].title}</p> : 
                  <p>No Events today</p>
                }

                <Button type='primary' size='small' onClick={()=> navigate("/events")}>View Calendar</Button>
              </div>

              <div className="my-calendar" style={{ width: "70%", height: "200px", borderRadius: "15px", marginTop: "-20px"}}>
                <p style={{textAlign: "center", color: "black", fontWeight: "bolder", marginBottom: "-30px"}}>{moment().format('dddd MM/DD/YYYY')}</p>

                <ReactCalendar
                  localizer={localizer}
                  style={{marginBottom: "-10px"}}
                  events={events}
                  onSelectEvent={(e) => {
                    setEventObj(e)
                    setOpenViewEventModal(true)
                  }}
                  defaultView="day"
                  components={{
                    toolbar: props => (
                      <p></p>
                    ),
                  }}
                  eventPropGetter={
                    (event, start, end, isSelected) => {
                      let newStyle = {
                        backgroundColor: "#DDA0DD",
                        color: 'black',
                        borderRadius: "0px",
                        border: "none"
                      };
                
                      if (event.user_id !== id){
                        newStyle.backgroundColor = "lightgreen"
                      }
                
                      return {
                        className: "",
                        style: newStyle
                      };
                    }
                  }
                />
                
                {
                  eventsLoading ? <span style={{fontSize: "14px", color: "green"}}>Loading...</span> : null
                }
              </div>
            </div>
          
          )
        }

        {
           type === "list"  && (
            <>
              <p style={{fontWeight: "bolder"}}>{list?.name}</p>

              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "40px"}}>
                <Button type='default' onClick={()=> navigate(`/lists`)}>My Lists</Button>
                <Button type='primary' onClick={()=> navigate(`/listsview/${list?.id}`)}>Resume Work</Button>
              </div>

              {
                listsLoading ? <span style={{fontSize: "14px", color: "green"}}>Loading...</span> : null
              }
          </>
          )
        }

        
        {
           type === "activity"  && (
            <>
              <table style={{width: "100%", margin: "auto"}}>
                <tbody>
                  {renderTableRow("Low Probability Activities:", lowActivities)}
                  {renderTableRow("Medium Probability Activities:", mediumActivities)}
                  {renderTableRow("High Probability Activities:", highActivities)}
                  {renderTableRow("Closed Activities:", closedActivities)}
                </tbody>
              </table>
              <Button type="primary" onClick={()=> navigate("/activities")}>View Activities</Button>

              {
                activitiesLoading ? 
                <div style={{float: "right", marginTop: "30px"}}>
                  <span style={{fontSize: "14px", color: "green"}}>Loading...</span>
                </div> : null
              }
            </>
          )
        }
       
      </CardContent>

    </Card>

    <ViewEventModal
      open={openViewEventModal}
      setOpen={setOpenViewEventModal}
      event={eventObj}
      relatedActivity={activities.find((a) => a.id === eventObj?.activity_id)}
      dashboard={true}
    />
    </>
  );
}