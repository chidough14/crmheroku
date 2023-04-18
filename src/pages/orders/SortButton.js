import * as React from 'react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { SortOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';

const items = [
  {
    name: "All",
    argument: "all"
  },
  {
    name: "Past Month",
    argument: "1month"
  },
  {
    name: "Past 3 Months",
    argument: "3months"
  },
  {
    name: "Past Year",
    argument: "12months"
  }
]

const style = {
  backgroundColor: "#DDA0DD",
  borderRadius: "13px"
}

const SortButton = ({ setSortOption, sortOption, title, closeSearch }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    
    if (closeSearch) {
      closeSearch()
    }
  
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title={title}>
          <Button
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            variant="contained"
            style={{borderRadius: "30px"}}
          >
             <SortOutlined />
          </Button>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >

        {
          items.map((a) => (
            <MenuItem
              key={a.name}
              onClick={() => setSortOption(a.argument)}
              style={sortOption === a.argument ? style : null}
            >
              {a.name}
             
            </MenuItem>
          ))
        }
      </Menu>
    </React.Fragment>
  );
}

export default SortButton