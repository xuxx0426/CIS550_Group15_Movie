import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Card, CardMedia, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext'; // Access AuthContext for user state
// import { likeMovie } from '../../../server/routes.js';
const config = require('../config.json');

export default function MovieDetailsPage() {
    const { movieID } = useParams(); // Get movieID from URL
    const { authState } = useAuth(); // Get the logged-in user's information
    const navigate = useNavigate();

    const [movieDetails, setMovieDetails] = useState(null);
    const [liked, setLiked] = useState(false); // Track if the movie is liked
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch movie details and check if liked (if logged in)
        const fetchMovieDetails = async () => {
            try {
                // Fetch movie details
                const response = await fetch(`http://${config.server_host}:${config.server_port}/moviedetails/${movieID}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch movie details.');
                }
                const data = await response.json();
                setMovieDetails(data[0]);

                // If the user is logged in, check if the movie is liked
                if (authState.userId) {
                    const likeResponse = await fetch(
                        `http://${config.server_host}:${config.server_port}/likedmovies/${authState.userId}`
                    );
                    if (!likeResponse.ok) {
                        if (likeResponse.status === 200) {
                            // No liked movies, but response is valid
                            setLiked(false);
                        } else {
                            throw new Error('Failed to fetch liked movies.');
                        }
                    } else {
                        const likedMovies = await likeResponse.json();
                        if (Array.isArray(likedMovies)) {
                            setLiked(likedMovies.some((movie) => String(movie.movieid) === String(movieID)));
                        }
                    }
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [movieID, authState.userId]);

    const handleLike = async () => {
        try {
            const response = await fetch(`http://${config.server_host}:${config.server_port}/likemovie`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: authState.userId, movieID }),
            });
            if (!response.ok) {
                throw new Error('Failed to like the movie.');
            }
            setLiked(true);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUnlike = async () => {
        try {
            const response = await fetch(`http://${config.server_host}:${config.server_port}/removelikedmovie`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: authState.userId, movieID }),
            });
            if (!response.ok) {
                throw new Error('Failed to unlike the movie.');
            }
            setLiked(false);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Alert severity="error">{error}</Alert>
                <Button variant="contained" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Button variant="contained" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                Back
            </Button>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                {/* Movie Poster */}
                <Card sx={{ maxWidth: 400 }}>
                    <CardMedia
                        component="img"
                        image={movieDetails.poster_link || 'https://media.istockphoto.com/id/1396814518/vector/image-coming-soon-no-photo-no-thumbnail-image-available-vector-illustration.jpg?s=612x612&w=0&k=20&c=hnh2OZgQGhf0b46-J2z7aHbIWwq8HNlSDaNp2wn_iko='}
                        alt={movieDetails.title}
                        sx={{ objectFit: 'cover' }}
                    />
                </Card>

                {/* Movie Details */}
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" gutterBottom>
                        {movieDetails.title}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Average Rating:</strong> {movieDetails.average_rating ? movieDetails.average_rating.toFixed(1) : 'N/A'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Release Year:</strong> {movieDetails.release_year || 'Unknown'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Director:</strong> {movieDetails.director || 'Unknown'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Language:</strong> {movieDetails.language || 'Unknown'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Genre:</strong> {movieDetails.genre || 'Unknown'}
                    </Typography>

                    {/* Like/Unlike Button */}
                    {authState.userId ? (
                        <Button
                            variant="contained"
                            color={liked ? 'secondary' : 'primary'}
                            onClick={liked ? handleUnlike : handleLike}
                            sx={{ mt: 2 }}
                        >
                            {liked ? 'Unlike' : 'Like'}
                        </Button>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Log in to like this movie.
                        </Typography>
                    )}
                </Box>
            </Box>
        </Container>
    );
}
