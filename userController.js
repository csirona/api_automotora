const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET || 'Q6Yj6NNNDcdGHfm5JcXXwHGSRJRfXKHhTTUABh6c7vk';

async function getUsers() {
  try {
    const query = 'SELECT * FROM users';
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const query = 'SELECT * FROM users WHERE username = $1';
    const { rows } = await pool.query(query, [username]);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

async function createUser(user) {
  const { username, password } = user;
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = 'INSERT INTO users (username, password) VALUES ($1, $2)';
  await pool.query(query, [username, hashedPassword]);
}

async function loginUser(username, password) {
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return { error: 'User not found' };
    }

    //const passwordMatch = await bcrypt.compare(password, user.password);
     // Perform the password comparison without using bcrypt
     const passwordMatch = password === user.password;

    if (!passwordMatch) {
      return { error: 'Incorrect password' };
    }

    const payload = {
      id: user.id,
      username: user.username,
      // Add any additional user information you want to include in the token
    };

    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

    return { token };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getUsers,
  getUserByUsername,
  createUser,
  loginUser,
};
