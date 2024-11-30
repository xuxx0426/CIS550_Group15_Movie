const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
    origin: '*',
}));

app.use(express.json());

// We use express to define our various  API endpointsand
// provide their handlers that we implemented in routes.js

// 1.1 Route to display the top 10 highest-rated movies with names and ratings
app.get('/top10movies', routes.top10Movies);

// 1.2 Route to display the top 10 highest-rated movies for a specific genre
app.get('/top10bygenre/:genre', routes.top10Genre);

// 1.3 Route to create a new user account (need both userid and password)
app.post("/createuser", routes.createUser)

// 1.4 Route to update a user's password
app.post("/updatepassword", routes.updatePassword)

// 1.5 Route to display liked movies of the logged-in user
app.get("/likedmovies/:userID", routes.likedMovies)

// 1.6 Route to find top 3 genres based on liked movies and display the top 10 rated movies in those genres
app.get("/top3genres/:userID", routes.top3Genres)

// 1.7 Route to find top 3 directors based on liked movies and display the top 10 rated movies directed by these directors
app.get("/top3directors/:userID", routes.top3Directors)

// 1.8 Route to find tags in liked movies, rank by frequency, and create recommendations based on tags
app.get("/recommendbytags/:userID", routes.recommendByTags)

// 1.9 Route to search movies by title, tag, genre, director, language, or release year
app.get("/searchmovies", routes.searchMovies);

// 1.10 Route to display comprehensive movie details
app.get('/moviedetails/:movieID', routes.movieDetails);

// 1.11 Route to like a movie and add the user’s ID and movie to the Like table
app.post('/likemovie', routes.likeMovie);

// 1.12 Route to remove a movie from the Like table
app.delete('/removelikedmovie', routes.removeLikedMovie);

// 1.13 Route to Login
app.post('/login', routes.loginUser);


app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
