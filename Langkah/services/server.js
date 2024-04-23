// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const pool = require('./database');


//middleware
app.use(cors());
app.use(express.json());



//ROUTES

//get all locations
app.get('/locations', async (req, res) => {
    try {
        const locations = await pool.query('SELECT * FROM merged_mrt_lrt');
        res.json(locations.rows);
    } catch (err) {
        console.error(err.message);
    }
});


// get a location
app.get('/locations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        console.log(req.params);
    } catch (err) {
        console.error(err.message);
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});