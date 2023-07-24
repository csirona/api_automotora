const pool = require('./db');

async function getTeamMembers() {
  const query = 'SELECT * FROM team';
  const rows = await pool.query(query);
  return rows;
}

async function createTeamMember(memberData) {
  const { name, position } = memberData;
  const insertQuery = 'INSERT INTO team (name, position) VALUES (?, ?)';
  const selectQuery = 'SELECT LAST_INSERT_ID() AS id';

  try {
    await pool.query(insertQuery, [name, position]);
    const rows = await pool.query(selectQuery);
    return rows[0].id;
  } catch (error) {
    console.error('Error creating Team Member:', error);
    throw error;
  }
}

async function updateTeamMember(memberData) {
  const { id, name, position } = memberData;
  const query = `
    UPDATE team
    SET name = ?, position = ?
    WHERE id = ?
  `;
  await pool.query(query, [name, position, id]);
}

async function deleteTeamMember(id) {
  await pool.query('DELETE FROM team WHERE id = ?', [id]);
}

module.exports = {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};

