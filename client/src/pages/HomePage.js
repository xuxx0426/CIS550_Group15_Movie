import { useEffect, useState } from 'react';
import { Container, Box, Divider, Tab, Tabs, Typography, Grid, Card, CardMedia, CardContent } from '@mui/material';
const config = require('../config.json');

export default function HomePage() {
  const [topMovies, setTopMovies] = useState([]);
  const [genres, setGenres] = useState(['All', 'Action', 'Adventure', 'Animation', 'Children', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Fantasy', 'Film-Noir', 'Horror', 'IMAX', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western']); // Example genres
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [error, setError] = useState(null);

  // Fetch the top 10 movies or movies by genre
  const fetchMovies = (genre) => {
    const route =
      genre === 'All'
        ? `http://${config.server_host}:${config.server_port}/top10movies`
        : `http://${config.server_host}:${config.server_port}/top10bygenre/${genre}`;

    fetch(route)
      .then((res) => res.json())
      .then((data) => {
        setTopMovies(data);
        setError(null);
      })
      .catch((err) => {
        setError('Error fetching movies');
        console.error(err);
      });
  };

  // Fetch movies on component mount or when the selected genre changes
  useEffect(() => {
    fetchMovies(selectedGenre);
  }, [selectedGenre]);

  const handleGenreChange = (event, newValue) => {
    setSelectedGenre(newValue);
  };

  return (
    <Box
      sx={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1615383915140-a893a0e95d32?q=80&w=2045&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        color: 'white',
        padding: 4,
      }}
    >
      <Container>
        {/* Hero Section */}
        <Typography variant="h3" gutterBottom align="center" sx={{ mt: 4 }}>
          Discover Your Next Favorite Movie
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
          Explore top-rated movies and personalized recommendations.
        </Typography>

        {/* Genre Tabs */}
        <Tabs
          value={selectedGenre}
          onChange={handleGenreChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mt: 4 }}
        >
          {genres.map((genre) => (
            <Tab key={genre} label={genre} value={genre} />
          ))}
        </Tabs>

        {/* Horizontal Scrollable Movies Section */}
        <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
          Top 10 Movies {selectedGenre !== 'All' && `in ${selectedGenre}`}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 5,
            padding: 2,
            '&::-webkit-scrollbar': {
              display: 'one', // Hide scrollbar for a cleaner look
            },
          }}
        >
          {topMovies.length > 0 ? (
            topMovies.map((movie) => (
              <Card
                key={movie.movieID}
                sx={{
                  minWidth: 200,
                  flexShrink: 0, // Prevent cards from shrinking in the flex container
                }}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={movie.poster_link || '/placeholder.png'} // Placeholder if no poster link
                  alt={movie.title}
                />
                <CardContent>
                  <Typography variant="h6">{movie.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rating: {movie.average_rating ? parseFloat(movie.average_rating).toFixed(1) : 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>{error || 'Loading top movies...'}</Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
}
