import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const config = require('../config.json');

export default function AccountPage({ userId }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { authState, setAuthState } = useAuth();
    const navigate = useNavigate();

    const handlePasswordUpdate = async () => {
        setSuccessMessage('');
        setErrorMessage('');

        if (!currentPassword || !newPassword) {
            setErrorMessage('Both current and new passwords are required.');
            return;
        }

        try {
            const response = await fetch(`http://${config.server_host}:${config.server_port}/updatepassword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userid: userId,
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'An error occurred while updating the password.');
            }

            setSuccessMessage('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const handleLogout = () => {
        // Clear user ID from localStorage
        localStorage.removeItem('userId');

        // Reset AuthContext
        setAuthState({ userId: null });

        // Redirect to login page
        navigate('/login');
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Typography variant="h4" gutterBottom>
                Account Information
            </Typography>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6">User ID:</Typography>
                <Typography variant="body1">{userId || 'Not logged in'}</Typography>
            </Box>

            <Typography variant="h5" gutterBottom>
                Update Password
            </Typography>

            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
            {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Current Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <TextField
                    label="New Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={handlePasswordUpdate}>
                    Save Changes
                </Button>
            </Box>

            {/* Logout Button */}
            <Button variant="contained" color="secondary" onClick={handleLogout}>
                Logout
            </Button>

        </Container>
    );
}
