const { Pool } = require('pg');
const pgConnectionString = require('pg-connection-string');

const connectionString = 'postgres://car:Cs18@localhost:5432/cardb'; // Correctly formatted connection string

const pgPoolConfig = pgConnectionString.parse(connectionString);
const pool = new Pool(pgPoolConfig);

module.exports = pool;
