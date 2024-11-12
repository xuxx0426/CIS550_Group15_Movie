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
}



module.exports = {
    top10Movies,
}