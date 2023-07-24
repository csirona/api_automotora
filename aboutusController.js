const pool = require('./db');

async function getAboutUs() {
  const query = 'SELECT * FROM about_us';
  const rows = await pool.query(query);
  return rows;
}

async function createAboutUs(aboutUsData) {
  const { title, first_text, subtitle, second_text } = aboutUsData;
  const query = 'INSERT INTO about_us (title, first_text, subtitle, second_text) VALUES (?, ?, ?, ?)';

  try {
    // Pass the data to be inserted into the query function
    const result = await pool.query(query, [title, first_text, subtitle, second_text]);
    // Return the inserted row's id
    return result.insertId;

  } catch (error) {
    console.error('Error creating About Us:', error);
    throw error;
  }
}

async function updateAboutUs(aboutUsData) {
  const { id, title, first_text, subtitle, second_text } = aboutUsData;
  const query = `
    UPDATE about_us
    SET title = ?, first_text = ?, subtitle = ?, second_text = ?
    WHERE id = ?
  `;
  await pool.query(query, [title, first_text, subtitle, second_text, id]);
}


async function deleteAboutUs(id) {
  await pool.query('DELETE FROM about_us WHERE id = ?', [id]);
}

module.exports = {
  getAboutUs,
  createAboutUs,
  updateAboutUs,
  deleteAboutUs,
};

