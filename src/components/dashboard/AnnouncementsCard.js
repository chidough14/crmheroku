import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import { CardHeader } from '@mui/material';
import moment from 'moment';
import { Link } from 'react-router-dom';

const AnnouncementsCard = ({announcements, showAnnouncementsLoading}) => {
  return (
    <>
       <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
            <nav aria-label="main mailbox folders">
              <Typography variant='h6'>
                Latest Announcements
                {
                  showAnnouncementsLoading && (<span style={{color: "green", marginLeft: "10px", fontSize: "16px"}}>Loading...</span>)
                }
              </Typography>
              <List>
                {
                  announcements?.map((a) => (
                    <>
                      <ListItem disablePadding sx={{height: "45px"}}>
                        {
                          a.link ? (
                              <Typography variant='h7'>
                                {moment(a.created_at).format("MMMM DD")} &nbsp;&nbsp;
                                <span>
                                  <a  href={`${a.link}`}>
                                    {a.message}
                                  </a>
                                </span>
                              </Typography>
                          ) : (
                            <Typography variant='h7'>
                              {moment(a.created_at).format("MMMM DD")}  &nbsp;&nbsp; {a.message}
                            </Typography>
                          )
                        }
                      
                      </ListItem>
                      <Divider />
                    </>
                  ))
                }
               
               
              </List>
            </nav>
          </Box>
        </CardContent>
        <CardActions>
          <Button size="small">View all announcements</Button>
        </CardActions>
      </Card>
    </>
  )
}

export default AnnouncementsCard