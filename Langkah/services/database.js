const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: '1234',
    host: 'localhost',
    port: 5432,
    database: 'mapData',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Time a client must sit idle in the pool before it is disconnected
    connectionTimeoutMillis: 2000, // Time to wait for a new connection before throwing an error
});

// Error handling
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1); // Handle errors gracefully, such as by logging and optionally terminating the process
});

module.exports = pool;
