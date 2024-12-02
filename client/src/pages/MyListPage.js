import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Box, Card, CardContent, CardMedia, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const config = require('../config.json');


export default function MyListPage() {
    const { authState } = useAuth();
    const [likedMovies, setLikedMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
    const navigate = useNavigate();

    // Fetch liked movies
    const fetchLikedMovies = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://${config.server_host}:${config.server_port}/likedmovies/${userId}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch liked movies.');
            }
            setLikedMovies(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) {
            navigate('/login'); // Redirect to login if user is not logged in
            return;
        }
        fetchLikedMovies();
    }, [userId, navigate, fetchLikedMovies]);

    const handleRemove = async (movieID) => {
        const payload = { userID: authState.userId || localStorage.getItem('userId'), movieID }; // Define the payload
        console.log('Payload sent to the server:', payload); // Debugging

        try {
            const response = await fetch(`http://${config.server_host}:${config.server_port}/removelikedmovie`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });


            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to remove the movie.');
            }
            // console.log('Movie removed successfully:', data);
            setLikedMovies(likedMovies.filter(movie => String(movie.movieid) !== String(movieID))); // Update state
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleCardClick = (movieID) => {
        navigate(`/movie/${movieID}`);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Typography variant="h4" gutterBottom>
                My Liked Movies
            </Typography>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!loading && !error && likedMovies.length === 0 && (
                <Typography variant="body1" align="center" sx={{ mt: 4 }}>
                    No liked movies found. Start liking some movies!
                </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 2 }}>
                {likedMovies.map((movie) => (
                    <Card
                        key={movie.movieid}
                        sx={{ maxWidth: 200, cursor: 'pointer', }}
                        onClick={() => handleCardClick(movie.movieid)}>
                        <CardMedia
                            component="img"
                            height="300"
                            image={movie.poster_link || 'https://media.istockphoto.com/id/1396814518/vector/image-coming-soon-no-photo-no-thumbnail-image-available-vector-illustration.jpg?s=612x612&w=0&k=20&c=hnh2OZgQGhf0b46-J2z7aHbIWwq8HNlSDaNp2wn_iko='} // Placeholder if no poster link
                            alt={movie.title}
                            sx={{
                                objectFit: 'cover', // Ensures the poster covers the container without distortion
                            }}
                        />
                        <CardContent>
                            <Typography variant="h6" component="div" noWrap>
                                {movie.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Rating: {movie.average_rating ? parseFloat(movie.average_rating).toFixed(1) : 'N/A'}
                            </Typography>
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                fullWidth
                                sx={{ mt: 1 }}
                                onClick={() => handleRemove(movie.movieid)} // Correctly scoped movie variable
                            >
                                Remove
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Container>
    );
}
