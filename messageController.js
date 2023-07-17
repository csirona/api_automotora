const db = require('./db');

async function getAllMessages() {
  const query = 'SELECT * FROM messages';

  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

async function getMessageById(id) {
  const query = 'SELECT * FROM messages WHERE id = $1';
  const values = [id];

  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error getting message by ID:', error);
    throw error;
  }
}

async function createMessage(message) {
  const { name, email, content } = message;
  const query = 'INSERT INTO messages (name, email, content) VALUES ($1, $2, $3) RETURNING *';
  const values = [name, email, content];

  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}

async function updateMessage(id, message) {
  const { name, email, content } = message;
  const query = 'UPDATE messages SET name = $1, email = $2, content = $3 WHERE id = $4 RETURNING *';
  const values = [name, email, content, id];

  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
}

async function deleteMessage(id) {
  const query = 'DELETE FROM messages WHERE id = $1';
  const values = [id];

  try {
    await db.query(query, values);
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

module.exports = {
  getAllMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
};

