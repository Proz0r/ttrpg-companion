import React from 'react';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Link,
  Menu,
  MenuItem,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const MainScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleGameMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleGameMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCharacterSelect = () => {
    handleGameMenuClose();
    navigate('/characters');
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Tabs value={location.pathname}>
            <Tab component={Link} to={'/'} label="Main" sx={{ color: 'text.primary' }} />
            <Tab component={Link} to="/books" label="Books" sx={{ color: 'text.primary' }} />
            <Tab
              aria-controls="game-menu"
              aria-haspopup="true"
              onClick={handleGameMenuOpen}
              label="Game"
              sx={{ color: 'text.primary' }}
            />
            <Tab component={Link} to="/about" label="About Us" sx={{ color: 'text.primary' }} />
          </Tabs>
          <Menu
            id="game-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleGameMenuClose}
            MenuListProps={{
              'aria-labelledby': 'game-button',
            }}
          >
            <MenuItem onClick={handleCharacterSelect}>Character Select</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Work in Progress
        </Typography>
      </Box>
    </Box>
  );
};

export default MainScreen;
