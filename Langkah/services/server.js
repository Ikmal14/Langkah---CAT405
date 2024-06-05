const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const pool = require('./database');
const { spawn } = require('child_process');

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// Get all locations
app.get('/locations', async (req, res) => {
    try {
        const locations = await pool.query('SELECT * FROM merged_mrt_lrt');
        res.json(locations.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all edges
app.get('/edges', async (req, res) => {
    try {
        const edges = await pool.query('SELECT * FROM edges_lrt_mrt');
        res.json(edges.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get a location by ID
app.get('/locations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const location = await pool.query('SELECT * FROM merged_mrt_lrt WHERE id = $1', [id]);
        res.json(location.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get input stations
app.get('/input-stations', async (req, res) => {
    try {
        const inputStations = await pool.query('SELECT * FROM input_stations');
        res.json(inputStations.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get output stations
app.get('/output-stations', async (req, res) => {
    try {
        const outputStations = await pool.query('SELECT * FROM output_stations');
        res.json(outputStations.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Calculate path
app.post('/calculate-path', async (req, res) => {
  const { origin, destination, avoidBusy } = req.body;  // Receive the checkbox state

  try {
    // Clear the output_stations table before running the path calculation
    await pool.query('DELETE FROM output_stations');
    await pool.query('DELETE FROM input_stations');

    // Insert the new input stations
    await pool.query('INSERT INTO input_stations (origin_station_id, destination_station_id, status, avoid_busy) VALUES ($1, $2, $3, $4)', [origin, destination, 'pending', avoidBusy]);
    
    

    // Spawn a child process to execute the Python script
    const pythonProcess = spawn('python', ['aStar.py', origin, destination, avoidBusy]);  // Pass the parameter to the Python script

    let dataStr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      dataStr += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python script stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        // Parse the output path
        const interval = JSON.parse(dataStr.trim());
        res.status(200).json({ message: 'Path calculated successfully', interval: interval });
      } else {
        res.status(500).json({ message: 'Error calculating path' });
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
