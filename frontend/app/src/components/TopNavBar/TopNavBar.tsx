import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  InputBase,
  Menu,
  MenuItem,
  ListSubheader,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { menuItems } from '@/config/menuConfig';
import { Link as RouterLink } from 'react-router-dom';
import { logout } from '@/utils/auth';

const TopNavBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // User menu handlers
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
    >
      <Toolbar sx={{ minHeight: 64, px: 3 }}>
        {/* Left: Menu Icon */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuOpen}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          keepMounted
        >
          {menuItems.map((item, idx) => [
            <ListSubheader key={`header-${item.label}`}>
              {item.label}
            </ListSubheader>,
            ...item.submenu.map(sub => (
              <MenuItem
                key={`${item.label}-${sub.text}`}
                component={RouterLink}
                to={sub.link}
                onClick={handleMenuClose}
              >
                {sub.text}
              </MenuItem>
            )),
            idx < menuItems.length - 1 && (
              <Divider key={`divider-${item.label}`} />
            ),
          ])}
        </Menu>
        {/* Center: App Name/Logo */}
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: 700, textAlign: 'center' }}
        >
          AppName
        </Typography>
        {/* Center: Search */}
        <Box sx={{ flexGrow: 2, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              position: 'relative',
              borderRadius: 1,
              backgroundColor: '#f1f3f4',
              px: 2,
              py: 0.5,
              width: 300,
            }}
          >
            <SearchIcon
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'grey.500',
              }}
            />
            <InputBase
              placeholder="Buscar…"
              sx={{ pl: 4, width: '100%' }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </Box>
        </Box>
        {/* Right: Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="primary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={handleUserMenuOpen}>
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            keepMounted
          >
            <MenuItem
              component={RouterLink}
              to="/profile"
              onClick={handleUserMenuClose}
            >
              Perfil
            </MenuItem>
            <MenuItem
              component={RouterLink}
              to="/process/list"
              onClick={handleUserMenuClose}
            >
              Procesos
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavBar;
