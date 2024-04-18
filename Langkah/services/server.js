// server.js
const express = require('express');
const { Client } = require('pg');
const app = express();
const port = 3000;

const client = new Client({
    host : 'localhost',
    user : 'postgres',
    port : 5432,
    password : '1234',
    database : 'mapData'
});

client.connect();

app.get('/data', (req, res) => {
    client.query('SELECT * FROM merged_mrt_lrt', (err, result) => {
        if (!err) {
            res.send(result.rows);
        } else {
            console.log(err);
            res.send(err);
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});