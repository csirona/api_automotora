const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const carController = require('./carController');
const productController = require('./productController');
const userController = require('./userController');
const serviceController = require('./serviceController');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000; // Choose an appropriate port number

// Enable CORS
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files from the "public" directory
app.use(express.static('public'));

// Configure Multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'images', 'cars')); // Provide the correct absolute path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Set the desired file name
  },
});

const storage_products = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'images', 'products')); // Provide the correct absolute path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Set the desired file name
  },
});

const upload = multer({ storage });
const upload_products = multer({ storage: storage_products });

// Car API routes
app.get('/api/car-stock', async (req, res) => {
  try {
    const cars = await carController.getAllCars();
    res.status(200).json(cars);
  } catch (error) {
    console.error('Error fetching car data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/car-stock/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const car = await carController.getCarById(id);

    if (!car) {
      res.status(404).json({ message: 'Car not found' });
    } else {
      res.status(200).json(car);
    }
  } catch (error) {
    console.error('Error fetching car data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Handle the car creation route with image upload
app.post('/api/car-stock', upload.single('image'), async (req, res) => {
  const { make, model, year, price, color, engine, kms, combustible, description } = req.body;

  try {
    // Here, you can save the image URL or key to your database
    const imageURL = req.file.path; // Example: save the image path as URL

    const car = await carController.createCar({
      make,
      model,
      year,
      price,
      image: imageURL,
      color,
      engine,
      kms,
      combustible,
      description,
    });
    res.status(201).json(car);
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/api/car-stock/:id', async (req, res) => {
  const { id } = req.params;
  const { make, model, year, price, color, engine, kms, combustible, description } = req.body;

  try {
    const car = await carController.updateCar(id, {
      make,
      model,
      year,
      price,
      color,
      engine,
      kms,
      combustible,
      description,
    });

    if (!car) {
      res.status(404).json({ message: 'Car not found' });
    } else {
      res.status(200).json(car);
    }
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.delete('/api/car-stock/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await carController.deleteCar(id);
    res.status(200).json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Product API routes
app.get('/api/product-stock', async (req, res) => {
  try {
    const products = await productController.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching product data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/product-stock/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await productController.getProductById(id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.status(200).json(product);
    }
  } catch (error) {
    console.error('Error fetching product data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/product-stock', upload_products.single('image'), async (req, res) => {
  console.log(req.body);
  console.log(req.file);

  const { name, description, price } = req.body;
  const image = req.file ? req.file.path : null; // Set the image path if it exists

  try {
    const product = await productController.createProduct({ name, description, price, image });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.put('/api/product-stock/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  try {
    const product = await productController.updateProduct(id, { name, description, price });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.status(200).json(product);
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.delete('/api/product-stock/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await productController.deleteProduct(id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// User API routes
app.get('/api/users/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await userController.getUserByUsername(username);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await userController.loginUser(username, password);
    if (result.error) {
      res.status(401).json({ message: 'Authentication failed' });
    } else {
      res.status(200).json(result);
      
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//Services
app.get('/api/services', async (req, res) => {
  try {
    const services = await serviceController.getAllServices();
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching service data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/services/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const service = await serviceController.getServiceById(id);

    if (!service) {
      res.status(404).json({ message: 'Service not found' });
    } else {
      res.status(200).json(service);
    }
  } catch (error) {
    console.error('Error fetching service data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/services', async (req, res) => {
  const { name, description, price } = req.body;

  try {
    const serviceId = await serviceController.createService({ name, description, price });
    res.status(201).json({ id: serviceId, name, description, price });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  try {
    await serviceController.updateService(id, { name, description, price });
    res.status(200).json({ id, name, description, price });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await serviceController.deleteService(id);
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
