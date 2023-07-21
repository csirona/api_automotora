// salesController.js
const db = require('./db');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: 'public/images/sales',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });


// Function to fetch all sales data from the database
const getAllSales = async () => {
  try {
    // Perform a database query to fetch all sales records
    const query = 'SELECT * FROM sales';
    const sales = await db.query(query);
    return sales;
  } catch (error) {
    throw new Error('Error fetching sales data from the database');
  }
};

// Function to create a new sales record in the database
//const createSale = async (saleData) => {
  // Function to create a new sales record in the database
async function createSale(saleData)  { 
    // Extract the properties from the saleData object
    const { title, description, price } = saleData;
    
    // Perform a database query to insert the new sale record
    const query = 'INSERT INTO sales ( image, title, description, price) VALUES ( ?, ?, ?,  ?)';
    const values = [ saleData.image, title, description, price];
    await db.query(query, values);

    // Return the newly created sale object
    return ;  
  
}; 


// Function to delete a sale record from the database
const deleteSale = async (id) => {
  try {
    // Perform a database query to delete the sale record
    const query = 'DELETE FROM sales WHERE id = ?';
    await db.query(query, [id]);
  } catch (error) {
    throw new Error('Error deleting sale record from the database');
  }
};

module.exports = {
  getAllSales,
  createSale,
  deleteSale,
};

