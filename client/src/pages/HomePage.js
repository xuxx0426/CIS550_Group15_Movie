import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Divider, Tab, Tabs, Typography, Grid, Card, CardMedia, CardContent } from '@mui/material';
const config = require('../config.json');

export default function HomePage() {
  const [topMovies, setTopMovies] = useState([]);
  const [genres, setGenres] = useState(['All', 'Action', 'Adventure', 'Animation', 'Children', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Fantasy', 'Film-Noir', 'Horror', 'IMAX', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western']);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const scrollableContainerRef = useRef(null);

  // Fetch the top 10 movies or movies by genre
  const fetchMovies = async (genre) => {
    const route =
      genre === 'All'
        ? `http://${config.server_host}:${config.server_port}/top10movies`
        : `http://${config.server_host}:${config.server_port}/top10bygenre/${genre}`;

    try {
      const response = await fetch(route);

      if (!response.ok) {
        throw new Error('Error fetching movies');
      }
      const data = await response.json();

      // Validate that the response is an array
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: Expected an array.');
      }

      // Fetch posters for each movie
      const moviesWithPosters = await Promise.all(
        data.map(async (movie) => {
          if (movie.tmdbid) {
            try {
              const tmdbResponse = await fetch(
                `https://api.themoviedb.org/3/movie/${Math.trunc(movie.tmdbid)}?api_key=${config.TMDB_API_KEY}`
              );
              const tmdbData = await tmdbResponse.json();

              if (tmdbData.poster_path) {
                movie.poster_link = `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`;
              }
            } catch (err) {
              console.log(`Error fetching poster for TMDB ID ${movie.tmdbid}:`, err);
            }
          }
          return movie;
        })
      );
      setTopMovies(moviesWithPosters);
      setError(null);
    } catch (err) {
      setError('Error fetching movies');
      console.error(err);
    };
  }

  // Fetch movies on component mount or when the selected genre changes
  useEffect(() => {
    setTopMovies([]); // Clear previous state
    fetchMovies(selectedGenre);
    // Reset scroll position to the start
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollLeft = 0;
    }
  }, [selectedGenre]);

  const handleGenreChange = (event, newValue) => {
    setSelectedGenre(newValue);
  };

  const handleCardClick = (movieID) => {
    navigate(`/movie/${movieID}`);
  };

  return (
    <Box
      sx={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1615383915140-a893a0e95d32?q=80&w=2045&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        color: 'LightSlateGray',
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
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mt: 4,
            color: 'darkgrey', // Default tab color
            '& .MuiTab-root': {
              color: 'darkgrey', // Inactive tab color
              '&.Mui-selected': {
                color: 'white', // Active tab color
                fontWeight: 'bold', // Bold for the selected tab
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'white', // Indicator color
            },
          }}
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
          ref={scrollableContainerRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 2,
            padding: 2,
            '&::-webkit-scrollbar': {
              display: 'one',
            },
          }}
        >
          {topMovies.length > 0 ? (
            topMovies.map((movie) => (
              <Card
                key={movie.movieid}
                sx={{
                  minWidth: 300,
                  cursor: 'pointer',
                }}
                onClick={() => handleCardClick(movie.movieid)}
              >
                {/* Movie Poster */}
                <CardMedia
                  component="img"
                  height="300"
                  image={movie.poster_link || 'https://media.istockphoto.com/id/1396814518/vector/image-coming-soon-no-photo-no-thumbnail-image-available-vector-illustration.jpg?s=612x612&w=0&k=20&c=hnh2OZgQGhf0b46-J2z7aHbIWwq8HNlSDaNp2wn_iko='} // Placeholder if no poster link
                  alt={movie.title}
                  sx={{
                    objectFit: 'cover', // Ensures the poster covers the container without distortion
                    width: '100%', // Make sure the width fits the container
                  }}
                />

                {/* <CardContent>
                  <Typography variant="h6">{movie.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rating: {movie.average_rating ? parseFloat(movie.average_rating).toFixed(1) : 'N/A'}
                  </Typography>
                </CardContent> */}

                <CardContent>
                  <Typography variant="h6"
                    sx={{ borderRadius: '5px', textAlign: 'center' }}>{movie.title}</Typography>
                  <Typography variant="body2" color="text.secondary"
                    sx={{ borderRadius: '5px', textAlign: 'center' }}>
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

