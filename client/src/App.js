import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material';
import { indigo, amber } from '@mui/material/colors';
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import LoginSignupPage from './pages/LoginSignupPage';
import AccountPage from './pages/AccountPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import MyListPage from './pages/MyListPage';
import SearchPage from './pages/SearchPage';
import RecommendationPage from './pages/RecommendationPage';
import { useAuth } from './context/AuthContext';


export const theme = createTheme({
  palette: {
    primary: indigo,
    secondary: amber,
  },
});

export default function App() {
  const { authState } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginSignupPage />} />
          <Route path="/account" element={<AccountPage userId={authState.userId} />} />
          <Route path="/movie/:movieID" element={<MovieDetailsPage />} />
          <Route path="/mylist" element={<MyListPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/recommendations" element={<RecommendationPage />} /> {/* Add this route */}

          <Route path="*" element={<HomePage />} /> {/* Fallback Route */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
