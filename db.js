const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'grafibook_api_automotora',
  password: 'api_automotora_pass',
  database: 'grafibook_api_automotora',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = connection;
