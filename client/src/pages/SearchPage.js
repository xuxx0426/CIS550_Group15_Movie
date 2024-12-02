import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, TextField, Button, Card, CardContent, CardMedia, Alert, CircularProgress } from '@mui/material';
const config = require('../config.json');

export default function SearchPage() {
    const [searchParams, setSearchParams] = useState({
        title: '',
        tag: '',
        genre: '',
        director: '',
        language: '',
        release_year: '',
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Handle input change
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setSearchParams(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        setResults([]);

        try {
            const query = new URLSearchParams(searchParams).toString(); // Serialize parameters
            const response = await fetch(`http://${config.server_host}:${config.server_port}/searchmovies?${query}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch search results.');
            }

            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (movieID) => {
        navigate(`/movie/${movieID}`);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Typography variant="h4" gutterBottom>
                Search Movies
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    mb: 4,
                }}
            >
                <TextField
                    label="Title"
                    name="title"
                    value={searchParams.title}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                />
                <TextField
                    label="Tag"
                    name="tag"
                    value={searchParams.tag}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                />
                <TextField
                    label="Genre"
                    name="genre"
                    value={searchParams.genre}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                />
                <TextField
                    label="Director"
                    name="director"
                    value={searchParams.director}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                />
                <TextField
                    label="Language"
                    name="language"
                    value={searchParams.language}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                />
                <TextField
                    label="Release Year"
                    name="release_year"
                    value={searchParams.release_year}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    type="number"
                />
                <Button variant="contained" color="primary" onClick={handleSearch}>
                    Search
                </Button>
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!loading && results.length === 0 && !error && (
                <Typography variant="body1" align="center" sx={{ mt: 4 }}>
                    No results found. Try refining your search.
                </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 2 }}>
                {results.map(movie => (
                    <Card
                        key={movie.movieid}
                        sx={{ minWidth: 200, cursor: 'pointer', }}
                        onClick={() => handleCardClick(movie.movieid)}>
                        <CardMedia
                            component="img"
                            height="300"
                            image={
                                movie.poster_link ||
                                'https://media.istockphoto.com/id/1396814518/vector/image-coming-soon-no-photo-no-thumbnail-image-available-vector-illustration.jpg?s=612x612&w=0&k=20&c=hnh2OZgQGhf0b46-J2z7aHbIWwq8HNlSDaNp2wn_iko='
                            } // Fallback placeholder image
                            alt={movie.title}
                            sx={{
                                objectFit: 'cover', // Ensures consistent poster display
                            }}
                        />
                        <CardContent>
                            <Typography variant="h6" noWrap>
                                {movie.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Director: {movie.director || 'Unknown'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Rating: {movie.average_rating ? parseFloat(movie.average_rating).toFixed(1) : 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Release Year: {movie.release_year || 'N/A'}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Container>
    );
}
