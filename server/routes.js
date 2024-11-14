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

// 1.1 Route to display the top 10 highest-rated movies with names and posters
const top10Movies = async function (req, res) {
    connection.query(`
        SELECT
            m.movieID,
            m.title,
            ROUND(AVG(r.rating), 3) AS average_rating,
            COUNT(*) AS n_rating
        FROM
            movies AS m
        JOIN
            ratings AS r ON m.movieID = r.movieID
        GROUP BY
            m.movieID, m.title
        HAVING
            COUNT(*) >= 100
        ORDER BY
            average_rating DESC
        LIMIT 10
        `, (err, data) => {
        if (err) {
            console.log(err);
            res.json({});
        } else {
            res.json(data.rows);
        }
    });
};




// 1.6 Route to find top 3 genres based on liked movies and display the top 10 rated movies in those genres
// Add a new route handler for fetching the top-rated movies in the user's top 3 genres.
const top3GenresUserID = async function (req, res) {
    connection.query(`
        SELECT m.movieID, m.title, mg.genre, mr.average_rating, mr.n_rating
            FROM Movies m
            JOIN MoviesGenres mg ON m.movieID = mg.movieID
            JOIN (
                SELECT mg.genre
                FROM Likes l
                JOIN MoviesGenres mg ON l.movieID = mg.movieID
                WHERE l.userID =  '${req.params.top3genresUserID}' 
                GROUP BY mg.genre
                ORDER BY COUNT(*) DESC
                LIMIT 3
            ) AS TopGenres ON mg.genre = TopGenres.genre
            JOIN MovieRatings mr ON m.movieID = mr.movieID
            WHERE m.movieID NOT IN (SELECT movieID FROM Likes WHERE userID = '${req.params.top3genresUserID}')
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



// 1.7 Route to find top 3 directors based on liked movies and display the top 10 rated movies directed by these directors
const top3DirectorsUserID = async function (req, res) {
    connection.query(`
        WITH TopDirectors AS (
            SELECT ms.director
            FROM Likes l
            JOIN Movies m ON l.movieID = m.movieID
            JOIN MoviesSupplement ms ON m.movieID = CAST(ms.imdb_id AS INT)
            WHERE l.userID = '${req.params.top3genresUserID}'
            GROUP BY ms.director
            ORDER BY COUNT(*) DESC
            LIMIT 3)
        SELECT m.movieID, m.title, ms.director, mr.average_rating, mr.n_rating
        FROM Movies m
        JOIN MoviesSupplement ms ON m.movieID = CAST(ms.imdb_id AS INT)
        JOIN TopDirectors td ON ms.director = td.director
        JOIN MovieRatings mr ON m.movieID = mr.movieID
        WHERE m.movieID NOT IN (SELECT movieID FROM Likes WHERE userID = '${req.params.top3genresUserID}')
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



// 1.8 Route to find tags in liked movies, rank by frequency, and create recommendations based on tags
const recommendByTagsUserID = async function (req, res) {
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
            WHERE m.movieID NOT IN (SELECT movieID FROM Likes WHERE userID = '${req.params.top3genresUserID}')
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

// Combine all handlers in a single export object
module.exports = {
    top10Movies,
    top3GenresUserID,
    top3DirectorsUserID,
    recommendByTagsUserID,
};