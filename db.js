const { Pool } = require('pg');

const pool = new Pool({
  user: 'car',
  password: 'Cs18',
  host: 'localhost',
  database: 'cardb',
  port: 5432, // Change the port if necessary
  jsonb: true, // Add this line to enable JSONB support

});

function getConnection() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting database connection:', err);
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
}

function query(queryString, values) {
  return new Promise((resolve, reject) => {
    const clonedValues = Array.isArray(values) ? [...values] : values;
    pool.query(queryString, clonedValues, (error, results, fields) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = {
  getConnection,
  query,
};