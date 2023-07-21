const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'grafibook_api_automotora',
  password: 'api_automotora_pass',
  database: 'grafibook_api_automotora',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function query(queryString, values) {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(queryString, values);
    connection.release();
    return results;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  query,
};

