import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { NavLink } from 'react-router-dom';

// Custom helper function for navigation links
function NavItem({ to, text }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        textDecoration: 'none',
        color: isActive ? '#9eb3ba' : 'inherit', // Highlight active link
        marginRight: '20px',
        fontWeight: isActive ? 'bold' : 'normal',
      })}
    >
      {text}
    </NavLink>
  );
}

export default function NavBar() {
  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#708090' }}>
      <Container maxWidth="xl">
        <Toolbar>
          {/* Logo */}
          <Typography
            variant="h5"
            noWrap
            sx={{
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <NavLink to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Filmix
            </NavLink>
          </Typography>

          {/* Navigation Links */}
          <NavItem to="/" text="Home" />
          <NavItem to="/search" text="Search" />
          <NavItem to="/recommendations" text="Recommendations" />
          <NavItem to="/mylist" text="My List" />

          {/* Login/Signup Button */}
          <Button color="inherit" component={NavLink} to="/login">
            Login / Signup
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
