import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  QrCodeScanner,
  Add,
  Update,
  AdminPanelSettings
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const Navbar = ({ userRole, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const { account, disconnectWallet } = useWeb3();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    disconnectWallet();
    navigate('/login');
    handleClose();
  };

  const getRoleBasedMenuItems = () => {
    const commonItems = [
      { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      { label: 'Track Product', icon: <QrCodeScanner />, path: '/track' }
    ];

    const roleSpecificItems = [];

    if (userRole === 'Farmer') {
      roleSpecificItems.push({ label: 'Create Product', icon: <Add />, path: '/create-product' });
    }

    if (['Processor', 'Warehouse', 'Distributor', 'Retailer'].includes(userRole)) {
      roleSpecificItems.push({ label: 'Update Product', icon: <Update />, path: '/update-product' });
    }

    if (userRole === 'Authority') {
      roleSpecificItems.push({ label: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin' });
    }

    return [...commonItems, ...roleSpecificItems];
  };

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Tea Supply Chain - {userRole}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
          {getRoleBasedMenuItems().map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not Connected'}
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;