const pool = require('./db');

async function getServiceById(id) {
  const query = 'SELECT * FROM services WHERE id = ?';
  const  rows  = await pool.query(query, [id]);
  return rows[0];
}

async function getAllServices() {
  const  rows = await pool.query('SELECT * FROM services');
  return rows;
}


async function createService(service) {
  const { name, description, price } = service;
  const insertQuery = 'INSERT INTO services (name, description, price) VALUES (?, ?, ?)';
  const selectQuery = 'SELECT LAST_INSERT_ID() AS id';

  try {
    await pool.query(insertQuery, [name, description, price]);
    const rows  = await pool.query(selectQuery);
    return rows[0].id;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

async function updateService(id, service) {
  const { name, description, price } = service;
  const query = `
    UPDATE services
    SET name = ?, description = ?, price = ?
    WHERE id = ?
  `;
  await pool.query(query, [name, description, price, id]);
}

async function deleteService(id) {
  await pool.query('DELETE FROM services WHERE id = ?', [id]);
}

module.exports = {
  getServiceById,
  getAllServices,
  createService,
  updateService,
  deleteService,
};

