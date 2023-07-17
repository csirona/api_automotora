const mysql = require('mysql');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'grafibook_api_automotora',
  password: 'api_automotora_pass',
  database: 'grafibook_api_automotora',
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
    pool.query(queryString, values, (error, results, fields) => {
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

