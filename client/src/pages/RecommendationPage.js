//Note, pulls data from /top3genres, /top3directors, and /recommendbytags routes to
//gather recommendations based on genres, directors, and tags.

import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Box, Card, CardContent, CardMedia, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
const config = require('../config.json');

export default function RecommendationPage() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
    const navigate = useNavigate();

    // Fetch recommendations from different routes
    const fetchRecommendations = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch recommendations by genres
            const genreResponse = await fetch(`http://${config.server_host}:${config.server_port}/top3genres/${userId}`);
            const genreData = await genreResponse.json();
            if (!genreResponse.ok) throw new Error(genreData.error || 'Failed to fetch genre recommendations.');

            // Fetch recommendations by directors
            const directorResponse = await fetch(`http://${config.server_host}:${config.server_port}/top3directors/${userId}`);
            const directorData = await directorResponse.json();
            if (!directorResponse.ok) throw new Error(directorData.error || 'Failed to fetch director recommendations.');

            // Fetch recommendations by tags
            const tagResponse = await fetch(`http://${config.server_host}:${config.server_port}/recommendbytags/${userId}`);
            const tagData = await tagResponse.json();
            if (!tagResponse.ok) throw new Error(tagData.error || 'Failed to fetch tag recommendations.');

            // Combine all recommendations and filter duplicates
            const combinedRecommendations = [...genreData, ...directorData, ...tagData];
            const uniqueRecommendations = combinedRecommendations.filter(
                (movie, index, self) => index === self.findIndex((m) => m.movieid === movie.movieid)
            );
            // Shuffle the array
            const shuffledRecommendations = uniqueRecommendations.sort(() => Math.random() - 0.5);

            // Update state with unique recommendations
            setRecommendations(uniqueRecommendations);
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
        fetchRecommendations();
    }, [userId, navigate, fetchRecommendations]);

    // Function to view movie details
    const handleViewDetails = (movieID) => {
        navigate(`/movie/${movieID}`); // Navigate to movie details page
    };

    return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Typography variant="h4" gutterBottom>
                Recommended Movies For You
            </Typography>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!loading && !error && recommendations.length === 0 && (
                <Typography variant="body1" align="center" sx={{ mt: 4 }}>
                    No recommendations available. Like some movies to get personalized suggestions!
                </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 2 }}>
                {recommendations.map(movie => (
                    <Card key={movie.movieid} sx={{ maxWidth: 200 }}>
                        <CardMedia
                            component="img"
                            height="300"
                            image={
                                movie.poster_link ||
                                'https://media.istockphoto.com/id/1396814518/vector/image-coming-soon-no-photo-no-thumbnail-image-available-vector-illustration.jpg?s=612x612&w=0&k=20&c=hnh2OZgQGhf0b46-J2z7aHbIWwq8HNlSDaNp2wn_iko='
                            } // Placeholder if no poster link
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
                                color="primary"
                                size="small"
                                fullWidth
                                sx={{ mt: 1 }}
                                onClick={() => handleViewDetails(movie.movieid)}
                            >
                                View Details
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Container>
    );
}
