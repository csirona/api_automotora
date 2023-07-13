const db = require('./db');
const path = require('path');

async function getAllCars() {
  const query = 'SELECT * FROM car_stock';

  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (error) {
    console.error('Error getting cars:', error);
    throw error;
  }
}

async function getCarById(id) {
  const query = 'SELECT * FROM car_stock WHERE id = $1';
  const values = [id];

  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error getting car by ID:', error);
    throw error;
  }
}

async function createCar(car) {
  const { make, model, year, price, image, color, engine, kms, combustible, description } = car;
  const query = 'INSERT INTO car_stock (make, model, year, price, image, color, engine, kms, combustible, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *, image AS "imageURL"';
  const values = [make, model, year, price, image || null, color, engine, kms, combustible, description];

  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error creating car:', error);
    throw error;
  }
}

async function updateCar(id, car) {
  const { make, model, year, price, color, engine, kms, combustible, description } = car;
  const query = 'UPDATE car_stock SET make = $1, model = $2, year = $3, price = $4, color = $5, engine = $6, kms = $7, combustible = $8, description = $9 WHERE id = $10 RETURNING *';
  const values = [make, model, year, price, color, engine, kms, combustible, description, id];

  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error updating car:', error);
    throw error;
  }
}

async function deleteCar(id) {
  const query = 'DELETE FROM car_stock WHERE id = $1';
  const values = [id];

  try {
    await db.query(query, values);
    return true;
  } catch (error) {
    console.error('Error deleting car:', error);
    throw error;
  }
}

module.exports = {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
};
