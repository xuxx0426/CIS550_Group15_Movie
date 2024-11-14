import { useEffect, useState } from 'react';
import { Container } from '@mui/material';

import LazyTable from '../components/LazyTable';
const config = require('../config.json');

export default function Top3Genres() {
  // State to persist fetched data and column configuration
  const [selectedMovieId, setSelectedMovieId] = useState([]);

  // Define the columns for the "Top 3 Genres" table
  const genreColumns = [
    {
      field: 'movieID',
      headerName: 'Movie ID',
    },
    {
      field: 'title',
      headerName: 'Movie Title',
      // Uncomment this to allow navigation or interactivity
      // renderCell: (row) => <Link onClick={() => setSelectedMovieId(row.movieID)}>{row.title}</Link>
    },
    {
      field: 'genre',
      headerName: 'Genre',
    },
    {
      field: 'average_rating',
      headerName: 'Average Rating',
    },
    {
      field: 'n_rating',
      headerName: 'Number of Ratings',
    },
  ];

  return (
    <Container>
      <h2>Top Movies in Your Favorite Genres</h2>
      <LazyTable
        route={`http://${config.server_host}:${config.server_port}/top3genres?userID=Group15`}
        columns={genreColumns}
      />
    </Container>
  );
};
