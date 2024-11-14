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
            m.movieID movieID,
            m.title title,
            mr.average_rating average_rating,
            mr.n_rating n_rating
        FROM
            movies as m
        JOIN
            MovieRatings as mr ON m.movieID=mr.movieID
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
}

// 1.2 app.get('/top10bygenre/:genre', routes.top10Genre);
const top10Genre = async function (req, res) {
    connection.query(`
        SELECT
            mg.movieID,
            m.title,
            mg.genre,
            mr.average_rating,
            mr.n_rating
        FROM
            Moviesgenres as mg
        JOIN
            MovieRatings as mr ON mg.movieID=mr.movieID
        JOIN
            movies as m ON mg.movieID=m.movieID
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

// 1.3 app.post("/createuser", routes.createuser)
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


module.exports = {
    top10Movies,
    top10Genre,
    createUser,
    updatePassword,
    likedMovies,

}