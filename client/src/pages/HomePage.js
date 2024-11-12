import { useEffect, useState } from 'react';
import { Container, Divider, Link } from '@mui/material';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
const config = require('../config.json');

export default function HomePage() {
  // We use the setState hook to persist information across renders (such as the result of our API calls)
  const [selectedMovieId, setSelectedMovieId] = useState([]);

  // Here, we define the columns of the "Top Movies" table. The movieColumns variable is an array (in order)
  // of objects with each object representing a column. Each object has a "field" property representing
  // what data field to display from the raw data, "headerName" property representing the column label,
  // and an optional renderCell property which given a row returns a custom JSX element to display in the cell.
  const movieColumns = [
    {
      field: 'title',
      headerName: 'Movie Title',
      // renderCell: (row) => <Link onClick={() => setSelectedMovieId(row.movieID)}>{row.title}</Link> // A Link component is used just for formatting purposes
    },
    {
      field: 'average_rating',
      headerName: 'Rating',
      // renderCell: (row) => <Link onClick={() => setSelectedMovieId(row.movieID)}>{row.average_rating}</Link>
    },
  ];


  return (
    <Container>
      <h2>Top Movies</h2>
      <LazyTable route={`http://${config.server_host}:${config.server_port}/top10movies`} columns={movieColumns} />
    </Container>
  );
};