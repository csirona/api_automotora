const pool = require('./db');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: 'public/images/products',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

async function getProductById(id) {
  try {
    const query = 'SELECT * FROM product_stock WHERE id = ?';
    const [rows] = await pool.query(query, id);
    return rows;
  } catch (error) {
    throw error;
  }
}


async function getAllProducts() {
  try {
    const query = 'SELECT * FROM product_stock';
    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function createProduct(product) {
  const { name, description, price } = product;
  const query = `
    INSERT INTO product_stock (name, description, price, image)
    VALUES (?, ?, ?, ?)
  `;
  await pool.query(query, [name, description, price, product.image]);

  // Add the return statement
  return;
}

async function deleteProduct(id) {
  await pool.query('DELETE FROM product_stock WHERE id = ?', [id]);
}

module.exports = {
  getProductById,
  getAllProducts,
  createProduct,
  deleteProduct,
  upload,
};

