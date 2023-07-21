const db = require('./db');
const path = require('path');

async function getAllCars() {
  const query = 'SELECT * FROM car_stock';

  try {
    const  rows  = await db.query(query);
    return rows;
  } catch (error) {
    console.error('Error getting cars:', error);
    throw error;
  }
}

async function getCarById(id) {
  const query = 'SELECT * FROM car_stock WHERE id = ?';
  const values = [id];

  try {
    const rows  = await db.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error getting car by ID:', error);
    throw error;
  }
}

async function createCar(car) {
  const { make, model, year, price, image, color, engine, kms, combustible, description, additional_images } = car;
  const query = 'INSERT INTO car_stock (make, model, year, price, image, color, engine, kms, combustible, description, additional_images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [make, model, year, price, image || null, color, engine, kms, combustible, description, additional_images];

  try {
    // Insert the car into the database
    await db.query(query, values);

    // Fetch the newly inserted car by its ID
    const insertedCarQuery = 'SELECT * FROM car_stock ORDER BY id DESC LIMIT 1';
    const rows = await db.query(insertedCarQuery);
    return rows[0];
  } catch (error) {
    console.error('Error creating car:', error);
    throw error;
  }
}



async function updateCar(id, car) {
  const { make, model, year, price, color, engine, kms, combustible, description } = car;
  const query = 'UPDATE car_stock SET make = ?, model = ?, year = ?, price = ?, color = ?, engine = ?, kms = ?,combustible = ?, description = ? WHERE id = ? RETURNING *';
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
  const query = 'DELETE FROM car_stock WHERE id = ?';
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

