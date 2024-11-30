import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
const config = require('../config.json');

export default function LoginSignupPage() {
    const [isSignup, setIsSignup] = useState(false); // Toggle between login and signup
    const [userID, setUserID] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleToggle = () => {
        setIsSignup(!isSignup);
        setError(null); // Clear errors on toggle
    };

    const handleSubmit = async () => {
        const route = isSignup ? '/createuser' : '/login';
        const payload = { userid: userID, password };

        try {
            const response = await fetch(`http://${config.server_host}:${config.server_port}${route}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'An error occurred');
            }

            if (isSignup) {
                alert('Account created successfully! Please log in.');
                setIsSignup(false);
            } else {
                alert('Login successful!');
                navigate('/'); // Redirect to home or personalized page
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
                {isSignup ? 'Sign Up' : 'Login'}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="User ID"
                    variant="outlined"
                    fullWidth
                    value={userID}
                    onChange={(e) => setUserID(e.target.value)}
                />
                <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    {isSignup ? 'Sign Up' : 'Login'}
                </Button>
                <Button color="secondary" onClick={handleToggle}>
                    {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
                </Button>
            </Box>
        </Container>
    );
}
