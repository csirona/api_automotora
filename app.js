const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');
const carController = require('./carController');
const productController = require('./productController');
const userController = require('./userController');
const serviceController = require('./serviceController');
const aboutusController = require('./aboutusController');
const teamController = require('./teamController');
const cors = require('cors');
const path = require('path');
const salesController = require('./salesController');

const nodemailer = require('nodemailer');

require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = 3006; // Choose an appropriate port number

// Enable CORS
app.use(cors());

// Middleware
// Middleware for uploading sales images

const storage_sales = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'images', 'sales')); // Provide the correct absolute path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Set the desired file name
  },
});


// Middleware for uploading the sales image (only one image)
const uploadSalesImage = multer({
  storage: storage_sales,
}).single('image');


const storage_products = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'images', 'products')); // Provide the correct absolute path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Set the desired file name
  },
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware for parsing JSON data in the request body
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// File filter function for additional images
const fileFilterAdditionalImages = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif'
  ) {
    // Accept a file if it's an image (JPEG, PNG, or GIF)
    cb(null, true);
  } else {
    // Reject the file if it's not an image
    cb(new Error('Only JPEG, PNG, and GIF images are allowed!'), false);
  }
};


// Set storage for additional images
const additionalImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/cars/additional');
  },
  filename: function (req, file, cb) {
    cb(null, 'additional_' + Date.now() + path.extname(file.originalname));
  },
});



// Middleware for uploading additional images
const uploadAdditionalImages = multer({
  storage: additionalImageStorage,
}).array('additional_images', 10);


// Route to post a new car with images
app.post('/api/car-stock', (req, res) => {
  
    uploadAdditionalImages(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading additional images
        return res.status(500).json({ error: 'A Multer error occurred when uploading additional images' });
      } else if (err) {
        // An unknown error occurred when uploading additional images
        return res.status(500).json({ error: 'n unknown error occurred when uploading additional images'});
      }

      try {
        // Now, handle the rest of the form data and save the car to the database
        const { make, model, year, price, color, engine, kms, combustible, description } = req.body;

        // Console log to check req.files array
      console.log(req.files);

    // Additional images are now available in req.files
    let additionalImages = [];
    if (req.files && req.files.length > 0) {
      additionalImages = req.files.map((file) => file.path);
    }
        const car = {
          make,
          model,
          year,
          price,
          color,
          engine,
          kms,
          combustible,
          description,
          additionalImages, // Add the additional image paths to the car object
        };

        // Save the new car data to the database
        const savedCar = await carController.createCar(car);

        res.status(201).json(savedCar);
      } catch (error) {
        console.log('Error creating car:', error);
        res.status(500).json({ error: error });
      }
   
  });
});


const upload_products = multer({ storage: storage_products });
const upload_sales = multer({ storage: storage_sales });


// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'This is a test route!' });
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

// Services
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

// Sales API routes
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await salesController.getAllSales();
    res.status(200).json(sales);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/sales',upload_sales.single('image'),  async (req, res) => {
  console.log(req.body);
  console.log(req.file);

  const { title, description, price } = req.body;
  const image = req.file ? req.file.path : null; // Set the image path if it exists

  try {
    // Create a new sale record in the database
    const sale = await salesController.createSale({ image, title, description, price });
    res.status(201).json(sale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Route to delete a sale by ID
app.delete('/api/sales/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Call the deleteSale function from the salesController to delete the sale record
    await salesController.deleteSale(id);
    res.status(200).json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// About Us API routes
app.get('/api/aboutus', async (req, res) => {
  try {
    const aboutUsData = await aboutusController.getAboutUs();
    res.status(200).json(aboutUsData);
  } catch (error) {
    console.error('Error fetching About Us data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/aboutus', async (req, res) => {
  const { title, first_text, subtitle, second_text } = req.body;

  try {
    const aboutUsId = await aboutusController.createAboutUs({
      title,
      first_text,
      subtitle,
      second_text,
    });
    res.status(201).json({ aboutUsId });
  } catch (error) {
    console.error('Error creating About Us data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/api/aboutus/:id', async (req, res) => {
  const { id } = req.params;
  const { title, first_text, subtitle, second_text } = req.body;

  try {
    await aboutusController.updateAboutUs({
      id,
      title,
      first_text,
      subtitle,
      second_text
    });
    res.status(200).json({ id, title, first_text, subtitle, second_text });
  } catch (error) {
    console.error('Error updating About Us data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Team API routes
app.get('/api/team', async (req, res) => {
  try {
    const teamMembers = await teamController.getTeamMembers();
    res.status(200).json(teamMembers);
  } catch (error) {
    console.error('Error fetching Team data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/team', async (req, res) => {
  const { name, position } = req.body;

  try {
    const memberId = await teamController.createTeamMember({ name, position });
    res.status(201).json({ id: memberId, name, position });
  } catch (error) {
    console.error('Error creating Team data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/api/team/:id', async (req, res) => {
  const { id } = req.params;
  const { name, position } = req.body;

  try {
    await teamController.updateTeamMember({ id, name, position });
    res.status(200).json({ id, name, position });
  } catch (error) {
    console.error('Error updating Team data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.delete('/api/team/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await teamController.deleteTeamMember(id);
    res.status(200).json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting Team data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


const privateKey = `-----BEGIN EC PRIVATE KEY-----
MIGkAgEBBDDxNjWbPF9DiakV9sjUysuTPyJzSRnXhDLYU9pzlhB/Vawb9RcfockR
RP0bJrQW9Y6gBwYFK4EEACKhZANiAATvF2TEzLQ6tyWxu8Jpr8BYk+5v2pq90w1n
P31cQHrw2dfChZDdsWfceaZyGzx2epRCLwUedCpdVdb/OiNdlPbOcpR8XxaHfpS3
Ug+9cOjlOuHwEbDJwJuF8VMI3b7Om0w=
-----END EC PRIVATE KEY-----
`;

const certificate = `-----BEGIN CERTIFICATE-----
MIIE/TCCA+WgAwIBAgISBIhB8FeM/OV8wSNSb10abjZwMA0GCSqGSIb3DQEBCwUA
MDIxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MQswCQYDVQQD
EwJSMzAeFw0yMzA3MjExMjQxMTJaFw0yMzEwMTkxMjQxMTFaMBcxFTATBgNVBAMT
DGdyYWZpYm9vay5jbDB2MBAGByqGSM49AgEGBSuBBAAiA2IABO8XZMTMtDq3JbG7
wmmvwFiT7m/amr3TDWc/fVxAevDZ18KFkN2xZ9x5pnIbPHZ6lEIvBR50Kl1V1v86
I12U9s5ylHxfFod+lLdSD71w6OU64fARsMnAm4XxUwjdvs6bTKOCAtQwggLQMA4G
A1UdDwEB/wQEAwIHgDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwDAYD
VR0TAQH/BAIwADAdBgNVHQ4EFgQUxZanfXJhGPiCI/DJVt0cZO+5ee0wHwYDVR0j
BBgwFoAUFC6zF7dYVsuuUAlA5h+vnYsUwsYwVQYIKwYBBQUHAQEESTBHMCEGCCsG
AQUFBzABhhVodHRwOi8vcjMuby5sZW5jci5vcmcwIgYIKwYBBQUHMAKGFmh0dHA6
Ly9yMy5pLmxlbmNyLm9yZy8wgd0GA1UdEQSB1TCB0oIaYXBpYXV0b21vdG9yYS5n
cmFmaWJvb2suY2yCEGZ0cC5ncmFmaWJvb2suY2yCDGdyYWZpYm9vay5jbIIRbWFp
bC5ncmFmaWJvb2suY2yCEHBvcC5ncmFmaWJvb2suY2yCEXNtdHAuZ3JhZmlib29r
LmNsghJzdG9jay5ncmFmaWJvb2suY2yCHnd3dy5hcGlhdXRvbW90b3JhLmdyYWZp
Ym9vay5jbIIQd3d3LmdyYWZpYm9vay5jbIIWd3d3LnN0b2NrLmdyYWZpYm9vay5j
bDATBgNVHSAEDDAKMAgGBmeBDAECATCCAQMGCisGAQQB1nkCBAIEgfQEgfEA7wB2
ALc++yTfnE26dfI5xbpY9Gxd/ELPep81xJ4dCYEl7bSZAAABiXiu26IAAAQDAEcw
RQIgOvc/5DTsrDP/PA81lkVn+KxNhXPFqXV0J/ZnS+NVvc8CIQDyr/ovHAv7Dm3/
h4w777jZrwBQjPMlxXpTlRxnZ1XdlAB1AK33vvp8/xDIi509nB4+GGq0Zyldz7EM
JMqFhjTr3IKKAAABiXiu29YAAAQDAEYwRAIgfFuYI/HNjwcchiYzGmIjMrp8J1wJ
a2DPAbOjqAyQsS4CIDUp1fKNY9gjjNEV+R2pPFQj0KvBkPnLZguykbfa9tflMA0G
CSqGSIb3DQEBCwUAA4IBAQAbewJsV4UONG2ELcFxeTIS25xBNEyCwMToeEReAip4
lLtO6xP/2Xvt+3gkfmGyHGRokbaKiGjEgTHw7uAxId5PirLR11o/Frr16fx8B+TW
bxRkDKusUvNZshPN86TY8RDW2OY1nZqBLxlEpqJgfvZOSgoJ50yqsO+nW5GBvrGn
EVpyfl3j23Icyxu/rG3b6W+A6TWwX29Vy41p2OsRBOOzcbM3v6Awrik7xGy6fIYo
EyhBjF7w6qR0BfvgN+baYmBFHdlkqaZg1l31aGGhZzP5fWG+88N6q9VcYkwaLy4m
o2PqEbEIUNnELfgSYMgTaeDJGNNoX5i2AKB84yz1BEkX
-----END CERTIFICATE-----
`;


// Create HTTPS server
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);


// Start the server
httpsServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// Add this route to handle the POST request
app.post('/api/send-email', (req, res) => {
    const { to, subject, text, html } = req.body;

  // Validate that the "to" field is provided and not empty
  if (!to) {
    return res.status(400).json({ error: '"to" field is required' });
  }

  // Email data
  const msg = {
    to, // Replace with the recipient's email address, provided in the POST request
    from: 'messagemarweg@gmail.com', // Replace with the sender's email address
    subject,
    text,
    html,
  };

  // Send the email
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent');
      res.status(200).json({ message: 'Email sent successfully' });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Failed to send email' });
    });
});


// Create a Nodemailer transporter using SMTP
//const transporter = nodemailer.createTransport({
//  host: 'grafibook.cl',
//  port: 587,
// secure: true, // Set to true if you want to use SSL 
// auth: {
 //   user: 'message@grafibook.cl',
//    pass: 'messagemarwegpass',
//  }
//});

// Email data
//const mailOptions = {
//  from: 'message@grafibook.cl',
//  to: 'cristianosvar@gmail.com',
//  subject: 'Test Email',
//  text: 'This is a test email sent from Nodemailer with SMTP.',
//};

// Send the email
//transporter.sendMail(mailOptions, (error, info) => {
//  if (error) {
//    console.error('Error sending email:', error);
//  } else {
//    console.log('Email sent:', info.response);
//  }
//});
