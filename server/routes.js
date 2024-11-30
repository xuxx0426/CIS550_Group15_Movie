const { Pool, types } = require('pg');
const config = require('./config.json')

// Override the default parsing for BIGINT (PostgreSQL type ID 20)
types.setTypeParser(20, val => parseInt(val, 10)); //DO NOT DELETE THIS

// Create PostgreSQL connection using database credentials provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = new Pool({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db,
    ssl: {
        rejectUnauthorized: false,
    },
});
connection.connect((err) => err && console.log(err));



/******************
 * WARM UP ROUTES *
 ******************/

// 1.1 app.get('/top10movies', routes.top10Movies);
const top10Movies = async function (req, res) {
    connection.query(`
        SELECT
            m.movieID,
            m.title,
            mr.average_rating,
            mr.n_rating,
            ms.poster_link
        FROM
            movies as m
        LEFT JOIN links k ON m.movieID=k.movieID
        LEFT JOIN MoviesSupplement ms ON k. imdb_id = ms.imdb_id
        LEFT JOIN Movieratings mr ON m.movieID = mr.movieID
        WHERE mr.n_rating>=100 
            AND mr.average_rating IS NOT NULL
        ORDER BY mr.average_rating DESC
        LIMIT 10;
        `, (err, data) => {
        if (err) {
            console.log(err);
            res.json({});
        } else {
            res.json(data.rows);
        }
    });
};



// 1.2 app.get('/top10bygenre/:genre', routes.top10Genre);
const top10Genre = async function (req, res) {
    connection.query(`
        SELECT
            mg.movieID,
            m.title,
            mg.genre,
            mr.average_rating,
            mr.n_rating,
            ms.poster_link
        FROM
            Moviesgenres as mg
        JOIN
            movies as m ON mg.movieID=m.movieID
        LEFT JOIN links k ON m.movieID=k.movieID
        LEFT JOIN MoviesSupplement ms ON k. imdb_id = ms.imdb_id
        LEFT JOIN Movieratings mr ON m.movieID = mr.movieID
        WHERE mg.genre in ('${req.params.genre}')
            AND mr.average_rating IS NOT NULL
            AND mr.n_rating >=100
        ORDER BY
            mr.average_rating DESC
        LIMIT 10;
        `, (err, data) => {
        if (err) {
            console.log(err);
            res.json({});
        } else {
            res.json(data.rows);
        }
    });
}



// 1.3 app.post("/createuser", routes.createUser)
const createUser = async (req, res) => {
    const { userid, password } = req.body;

    // Validate input
    if (!userid || !password) {
        return res.status(400).json({ error: 'User ID and password are required.' });
    }

    // Insert new user into the users table
    try {
        const query = `
            INSERT INTO users (userid, password)
            VALUES ($1, $2)
            RETURNING userid
        `;
        const result = await connection.query(query, [userid, password]);

        res.status(201).json({ message: 'User created successfully', userId: result.rows[0].userid });
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === '23505') { // Unique violation error code for PostgreSQL
            res.status(409).json({ error: 'User ID already exists.' });
        } else {
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
};



// 1.4 app.post("/updatepassword", routes.updatePassword)
const updatePassword = async (req, res) => {
    const { userid, currentPassword, newPassword } = req.body;

    // Validate input
    if (!userid || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'User ID, current password, and new password are required.' });
    }

    try {
        // Step 1: Verify the current password
        const checkPasswordQuery = `
            SELECT password FROM users
            WHERE userid = $1
        `;
        const checkResult = await connection.query(checkPasswordQuery, [userid]);

        // If user not found, return error
        if (checkResult.rowCount === 0) {
            return res.status(404).json({ error: 'User ID not found.' });
        }

        // Check if the current password matches
        const existingPassword = checkResult.rows[0].password;
        if (existingPassword !== currentPassword) {
            return res.status(403).json({ error: 'Current password is incorrect.' });
        }

        // Step 2: Update the password if current password is correct
        const updatePasswordQuery = `
            UPDATE users
            SET password = $1
            WHERE userid = $2
            RETURNING userid
        `;
        const updateResult = await connection.query(updatePasswordQuery, [newPassword, userid]);

        res.status(200).json({ message: 'Password updated successfully', userId: updateResult.rows[0].userid });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};



// 1.5 app.get("/likedmovies/:userID", routes.likedmovies)
const likedMovies = async (req, res) => {
    const { userID } = req.params;

    // Validate input
    if (!userID) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        const query = `
            SELECT
                m.title,
                ms.poster_link,
                mr.average_rating,
                mr.n_rating
            FROM Movies m
                JOIN likes l ON m.movieID = l.movieID
            LEFT JOIN MoviesSupplement ms
                ON m.movieID = CAST(ms.imdb_id AS INT)
            LEFT JOIN Movieratings mr
                ON m.movieID = mr.movieID
            WHERE l.userID = $1
            ORDER BY mr.average_rating;
        `;

        const result = await connection.query(query, [userID]);

        if (result.rowCount === 0) {
            res.status(404).json({ message: 'No liked movies found for this user.' });
        } else {
            res.status(200).json(result.rows);
        }
    } catch (error) {
        console.error('Error fetching liked movies:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};



// 1.6 app.get("/top3genres/:userID", routes.top3Genres)
const top3Genres = async function (req, res) {
    connection.query(`
        SELECT m.movieID, m.title, mg.genre, mr.average_rating, mr.n_rating
            FROM Movies m
            JOIN MoviesGenres mg ON m.movieID = mg.movieID
            JOIN (
                SELECT mg.genre
                FROM Likes l
                JOIN MoviesGenres mg ON l.movieID = mg.movieID
                WHERE l.userID =  '${req.params.userID}'
                GROUP BY mg.genre
                ORDER BY COUNT(*) DESC
                LIMIT 3
            ) AS TopGenres ON mg.genre = TopGenres.genre
            JOIN MovieRatings mr ON m.movieID = mr.movieID
            WHERE m.movieID NOT IN (SELECT movieID FROM Likes WHERE userID = '${req.params.userID}')
            AND mr.n_rating > 1000
            ORDER BY mr.average_rating DESC
            LIMIT 10;
    `, (err, data) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'An error occurred while fetching the data.' });
        } else {
            res.json(data.rows);
        }
    });
};



// 1.7 app.get("/top3directors/:userID", routes.top3Directors)
const top3Directors = async function (req, res) {
    connection.query(`
        WITH TopDirectors AS (
            SELECT ms.director
            FROM Likes l
            JOIN Movies m ON l.movieID = m.movieID
            JOIN MoviesSupplement ms ON m.movieID = CAST(ms.imdb_id AS INT)
            WHERE l.userID = '${req.params.userID}'
            GROUP BY ms.director
            ORDER BY COUNT(*) DESC
            LIMIT 3)
        SELECT m.movieID, m.title, ms.director, mr.average_rating, mr.n_rating
        FROM Movies m
        JOIN MoviesSupplement ms ON m.movieID = CAST(ms.imdb_id AS INT)
        JOIN TopDirectors td ON ms.director = td.director
        JOIN MovieRatings mr ON m.movieID = mr.movieID
        WHERE m.movieID NOT IN (SELECT movieID FROM Likes WHERE userID = '${req.params.userID}')
        /*AND mr.n_rating > 1000*/
        ORDER BY mr.average_rating DESC
        LIMIT 10;
    `, (err, data) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'An error occurred while fetching the data.' });
        } else {
            res.json(data.rows);
        }
    });
};



// 1.8 app.get("/recommendbytags/:userID", routes.recommendByTags)
const recommendByTags = async function (req, res) {
    connection.query(`
        WITH top_tags as (
            SELECT
                /*tag*/
                Tagid/*,
                count(*) as n_liked_tags*/
            FROM (
                SELECT
                    l.*,
                    gs.tagid,
                    gs.relevance,
                    gt.tag
                FROM likes l
                LEFT JOIN genomescores gs ON l.movieID=gs.movieID
                LEFT JOIN genometags gt ON gs.tagid=gt.tagid
                WHERE relevance>=0.5 /*we can change this threshold*/
                ORDER BY l.movieID, gs.relevance DESC) ttt
                GROUP BY /*tag,*/tagid
                ORDER BY count(*) DESC
                LIMIT 10)
            SELECT
                gs.movieID,
                /*m.movieID, */
                m.title,
                mr.average_rating,
                mr.n_rating
            FROM (SELECT DISTINCT movieID
                  FROM genomescores gm
                  JOIN top_tags tt ON gm.tagid=tt.tagid
                  WHERE relevance>0.5) gs
            JOIN Movies m ON gs.movieid=m.movieid
            JOIN MoviesSupplement ms ON m.movieID = CAST(ms.imdb_id AS INT)
            JOIN MovieRatings mr ON m.movieID = mr.movieID
            WHERE m.movieID NOT IN (SELECT movieID FROM Likes WHERE userID = '${req.params.userID}')
            /*AND mr.n_rating > 1000*/
            ORDER BY mr.average_rating DESC
            LIMIT 10;

    `, (err, data) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'An error occurred while fetching the data.' });
        } else {
            res.json(data.rows);
        }
    });
};



// 1.9 app.get("/searchmovies", routes.searchMovies)
const searchMovies = async (req, res) => {
    const { title, genre, release_year, director, language, tag } = req.query;

    // Base query with joins
    let query = `
        SELECT DISTINCT m.movieID, m.title, ms.release_year, ms.director, ms.language, mr.average_rating
        FROM Movies m
        JOIN MoviesSupplement ms ON m.movieID = CAST(ms.imdb_id AS INT)
        LEFT JOIN MoviesGenres mg ON m.movieID = mg.movieID
        LEFT JOIN GenomeScores gs ON m.movieID = gs.movieID
        LEFT JOIN GenomeTags gt ON gs.tagID = gt.tagID
        LEFT JOIN MovieRatings mr ON m.movieID = mr.movieID
        WHERE 1=1`;

    // Parameters array to safely insert values
    const queryParams = [];

    // Add conditions dynamically based on provided parameters
    if (title) {
        queryParams.push(`%${title}%`);
        query += ` AND m.title ILIKE $${queryParams.length}`;
    }
    if (tag) {
        queryParams.push(`%${tag}%`);
        query += ` AND gt.tag ILIKE $${queryParams.length}`;
    }
    if (genre) {
        queryParams.push(`%${genre}%`);
        query += ` AND mg.genre ILIKE $${queryParams.length}`;
    }
    if (director) {
        queryParams.push(`%${director}%`);
        query += ` AND ms.director ILIKE $${queryParams.length}`;
    }
    if (language) {
        queryParams.push(`%${language}%`);
        query += ` AND ms.language ILIKE $${queryParams.length}`;
    }
    if (release_year) {
        const releaseYearInt = parseInt(release_year, 10); // Parse release year as integer
        if (!isNaN(releaseYearInt)) {
            queryParams.push(releaseYearInt);
            query += ` AND ms.release_year = $${queryParams.length}`;
        }
    }

    // Order by average rating and release year
    query += ` ORDER BY mr.average_rating DESC, ms.release_year DESC`;
    console.log(query);
    console.log(queryParams);

    // Execute the query with parameters
    try {
        const result = await connection.query(query, queryParams);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred while searching for movies' });
    }
};



// 1.10 app.get('/moviedetails/:movieID', routes.movieDetails);
const movieDetails = async (req, res) => {
    const { movieID } = req.params;

    try {
        const query = `
            SELECT
                m.movieID,
                m.title,
                ms.release_year,
                ms.director,
                ms.language,
                mg.genre,
                ms.poster_link,
                mr.average_rating
            FROM Movies m
            LEFT JOIN MoviesSupplement ms ON m.movieID = CAST(ms.imdb_id AS INT)
            LEFT JOIN (SELECT movieid, STRING_AGG(genre, ',') AS genre FROM moviesgenres GROUP BY movieid) mg
                ON m.movieID = mg.movieID
            LEFT JOIN MovieRatings mr ON m.movieID = mr.movieID
            WHERE m.movieID = $1;
        `;

        const result = await connection.query(query, [movieID]);

        if (result.rowCount === 0) {
            res.status(404).json({ message: 'Movie not found' });
        } else {
            res.status(200).json(result.rows);
        }
    } catch (error) {
        console.error('Error fetching movie details:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};



// 1.11 app.post('/likemovie', routes.likeMovie);
const likeMovie = async (req, res) => {
    const { userID, movieID } = req.body; // Get userID and movieID from the request body

    if (!userID || !movieID) {
        return res.status(400).json({ error: 'Both userID and movieID are required' });
    }

    const query = `
        INSERT INTO likes (userID, movieID)
        VALUES ($1, $2)
        RETURNING *;
    `;

    try {
        const result = await connection.query(query, [userID, movieID]);
        res.status(201).json({
            message: 'Movie liked successfully!',
            likedMovie: result.rows[0], // Return the inserted record
        });
    } catch (err) {
        console.error('Database query error:', err);
        if (err.code === '23505') { // Unique violation
            res.status(409).json({ error: 'This movie is already liked by the user.' });
        } else {
            res.status(500).json({ error: 'An error occurred while liking the movie' });
        }
    }
};



// 1.12 app.delete('/removelikedmovie', routes.removeLikedMovie);
const removeLikedMovie = async (req, res) => {
    const { userID, movieID } = req.body; // Get userID and movieID from the request body

    if (!userID || !movieID) {
        return res.status(400).json({ error: 'Both userID and movieID are required' });
    }

    const query = `
        DELETE FROM likes
        WHERE userID = $1 AND movieID = $2
        RETURNING *;
    `;

    try {
        const result = await connection.query(query, [userID, movieID]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Like not found' });
        }
        res.json({
            message: 'Movie removed from liked list successfully!',
            removedLike: result.rows[0], // Return the removed like record
        });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred while removing the movie from liked list' });
    }
};


// 1.13 app.post('/login', routes.loginUser);
const loginUser = async (req, res) => {
  const { userid, password } = req.body;

  // Validate input
  if (!userid || !password) {
    return res.status(400).json({ error: 'User ID and password are required.' });
  }

  try {
    // Query to check if the user exists and fetch the password
    const query = `
      SELECT password FROM users
      WHERE userid = $1
    `;
    const result = await connection.query(query, [userid]);

    if (result.rowCount === 0) {
      // User does not exist
      return res.status(404).json({ error: 'User ID does not exist.' });
    }

    // Check if the provided password matches the stored password
    const storedPassword = result.rows[0].password;
    if (storedPassword !== password) {
      return res.status(403).json({ error: 'Incorrect password.' });
    }

    // Login successful
    res.status(200).json({ message: 'Login successful', userId: userid });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Combine all handlers in a single export object
module.exports = {
    top10Movies,
    top10Genre,
    createUser,
    updatePassword,
    likedMovies,
    top3Genres,
    top3Directors,
    recommendByTags,
    searchMovies,
    movieDetails,
    likeMovie,
    removeLikedMovie,
    loginUser,
}
