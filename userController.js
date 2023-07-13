const pool = require('./db');
const jwt = require('jsonwebtoken');

async function getUsers(req, res) {
  try {
    // Fetch users from the database
    const { rows } = await pool.query('SELECT * FROM users');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function loginUser(req, res) {
  try {
    // User login
    const { username, password } = req.body;

    // Check if the user exists in the database and verify the password
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (rows.length === 0) {
      // User not found
      res.status(401).json({ message: 'Invalid username or password' });
    } else {
      const user = rows[0];

      if (user.password === password) {
        // Successful login
        const token = jwt.generateToken(user); // Generate a JWT token
        res.status(200).json({ message: 'Login successful', token });
      } else {
        // Incorrect password
        res.status(401).json({ message: 'Invalid username or password' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  getUsers,
  loginUser,
};
