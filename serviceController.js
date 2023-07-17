const pool = require('./db');

async function getServiceById(id) {
  const query = 'SELECT * FROM services WHERE id = $1';
  const { rows } = await pool.query(query, [id]);
  return rows[0];
}

async function getAllServices() {
  const { rows } = await pool.query('SELECT * FROM services');
  return rows;
}

async function createService(service) {
  const { name, description, price } = service;
  const query = `
    INSERT INTO services (name, description, price)
    VALUES ($1, $2, $3)
    RETURNING id
  `;
  const { rows } = await pool.query(query, [name, description, price]);
  return rows[0].id;
}

async function updateService(id, service) {
  const { name, description, price } = service;
  const query = `
    UPDATE services
    SET name = $1, description = $2, price = $3
    WHERE id = $4
  `;
  await pool.query(query, [name, description, price, id]);
}

async function deleteService(id) {
  await pool.query('DELETE FROM services WHERE id = $1', [id]);
}

module.exports = {
  getServiceById,
  getAllServices,
  createService,
  updateService,
  deleteService,
};
