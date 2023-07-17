const https = require('https');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const carController = require('./carController');
const productController = require('./productController');
const userController = require('./userController');
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


//test 

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

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

app.get('/api/users', async (req, res) => {
  try {
    const users = await userController.getUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

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

// User API routes
//app.get('/api/users', userController.getUsers);

//app.post('/api/login', userController.loginUser);

// Private key and certificate as text
const privateKey = `-----BEGIN EC PRIVATE KEY-----
MIGkAgEBBDApL0AtSvkHHJGagf3l8dDP4nHZPL0YsstWQ/a1eQrN++KGXsEfTvPc
TgrVz29WemugBwYFK4EEACKhZANiAARXPPTrqRLoansZCLUwPJNE6gBuWt24N7fg
cFe9ecK8y6TVr/GVVlNhIqoe3Kxf3dC8PWOX1zbb27DRObBIWAmYY6dKEiR/Nxpo
5fpBXDFw4iN5gWG5qGm+YDgjFcfqvKk=
-----END EC PRIVATE KEY-----`;

const certificate = `-----BEGIN CERTIFICATE-----
MIIE0jCCA7qgAwIBAgISBHnKwSg854aWxXTbrm0UdoXTMA0GCSqGSIb3DQEBCwUA
MDIxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MQswCQYDVQQD
EwJSMzAeFw0yMzA3MTQwMzIxNDlaFw0yMzEwMTIwMzIxNDhaMBcxFTATBgNVBAMT
DGdyYWZpYm9vay5jbDB2MBAGByqGSM49AgEGBSuBBAAiA2IABFc89OupEuhqexkI
tTA8k0TqAG5a3bg3t+BwV715wrzLpNWv8ZVWU2Eiqh7crF/d0Lw9Y5fXNtvbsNE5
sEhYCZhjp0oSJH83Gmjl+kFcMXDiI3mBYbmoab5gOCMVx+q8qaOCAqkwggKlMA4G
A1UdDwEB/wQEAwIHgDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwDAYD
VR0TAQH/BAIwADAdBgNVHQ4EFgQUiNz/HB5Ip/OkOwiZCt6I4mFdaWswHwYDVR0j
BBgwFoAUFC6zF7dYVsuuUAlA5h+vnYsUwsYwVQYIKwYBBQUHAQEESTBHMCEGCCsG
AQUFBzABhhVodHRwOi8vcjMuby5sZW5jci5vcmcwIgYIKwYBBQUHMAKGFmh0dHA6
Ly9yMy5pLmxlbmNyLm9yZy8wgbEGA1UdEQSBqTCBpoIaYXBpYXV0b21vdG9yYS5n
cmFmaWJvb2suY2yCEGZ0cC5ncmFmaWJvb2suY2yCDGdyYWZpYm9vay5jbIIRbWFp
bC5ncmFmaWJvb2suY2yCEHBvcC5ncmFmaWJvb2suY2yCEXNtdHAuZ3JhZmlib29r
LmNsgh53d3cuYXBpYXV0b21vdG9yYS5ncmFmaWJvb2suY2yCEHd3dy5ncmFmaWJv
b2suY2wwEwYDVR0gBAwwCjAIBgZngQwBAgEwggEEBgorBgEEAdZ5AgQCBIH1BIHy
APAAdgC3Pvsk35xNunXyOcW6WPRsXfxCz3qfNcSeHQmBJe20mQAAAYlSojYGAAAE
AwBHMEUCIFkYZEAw6T9eJzthJ8edeg6m36LgnxZ9BkACEYPYCfSHAiEA/BZhYlxr
OstSuyVfGftHoDrFixje7TpUaRePCyXfTjoAdgB6MoxU2LcttiDqOOBSHumEFnAy
E4VNO9IrwTpXo1LrUgAAAYlSojYYAAAEAwBHMEUCIQDsWoWoq+E6HWNvgEyCH5gN
snHPkx3bYi9WA/FkaOT+hQIgBwCfFL4IeXb5iPXIjH0jrdt7Pt5E0rKwzuT4KU4k
T98wDQYJKoZIhvcNAQELBQADggEBAIdNrpklNDFyIS7cntRacso4aac8fsAP3TvP
wFR1q2y6/NN/7LQD/gM0hTgysmUvFWXHSV+hWUxV/nVDlLY8lrygqsbCNXBzJb4b
bKD2X9L8SD9DhE+2ioz96DMYbdQ8mq7oLqDWxpy7OhnY6LMeQfDiM+QSp/aJnHJc
vFoumOobr9bMP5e2P5T+c5QExI6shPo7bM+rbDoWhzGjT0h9PgtcBNE6Psdjz/ss
0vPZMMq7JzcXvo3Xlpii4+C0hBT28KIPrnatR/8jR8fzddrmjONIqE/WGQqdBJYz
Ovzi3ViX5Hip/P33zTE64mf8U8q6r5OzZQtg2sfM5bLFBTrp4WE=
-----END CERTIFICATE-----`;

// Create HTTPS server
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);


// Start the server
httpsServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

