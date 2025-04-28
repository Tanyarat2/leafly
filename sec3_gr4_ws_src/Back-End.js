// Import required Node.js modules
const express = require("express");
const path = require("path");
const cors = require('cors');
const dotenv = require("dotenv");
const mysql = require("mysql2");
const router = express.Router();
const multer = require('multer');
const fs = require('fs').promises;
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');

const app = express();
dotenv.config();

// ---------------- DATABASE CONNECTION ----------------
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
connection.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to DB:", process.env.DB_NAME);
});

// ---------------- SESSION STORE SETUP ----------------
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// ---------------- MIDDLEWARE SETUP ----------------
// Enable CORS for cross-origin requests from frontend
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));  // 10MB limit
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads and public directories
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'html')));
app.use(express.static('public'));

// Handle Multer and image format errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes('Only JPEG/PNG')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

// Configure session middleware with MySQL store
app.use(session({
  name: 'leafly_admin_si',
  secret: 'myAdmin',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 3, // 3 hour session
    httpOnly: true,
    secure: false
  }
}));

// ---------------- UTILITY FUNCTIONS ----------------
// Get current date and time in Bangkok timezone
function getBangkokDateTime() {
  const date = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" });
  return date.replace("T", " ");
}

// Check if admin is logged in
function isAdminLoggedIn(req, res, next) {
  if (req.session.admin_id) {
    console.log("Admin logged in, access granted.");
    return next();
  } else {
    console.log("Access denied, no admin session.");
    return res.redirect('/login');
  }
}

app.use("/", router);

// ---------------- MULTER CONFIGURATION ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์เป็น timestamp + extension
  }
});
const upload = multer({ storage: storage });

// ---------------- API ROUTES ----------------
// Get all products
router.get('/api/products', (req, res) => {
  const sql = 'SELECT Product_ID, Product_Name, Price, Product_Img, Collection FROM Product';
  connection.query(sql, async (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }

    const mimeType = 'image/jpeg';
    const processedResults = results.map(product => {
      if (product.Product_Img && !product.Product_Img.startsWith('data:image')) {
        product.Product_Img = `data:${mimeType};base64,${product.Product_Img}`;
      }
      return product;
    });

    res.json(processedResults);
  });
});


/* 

1. Authentication Web Service for Administrators

// TESTING ADMIN LOGIN
Test Case 1 :
Method: POST
URL: http://localhost:4000/admin-login
Body: raw JSON
{
    "admin_id": "AD67093",
    "password": "Mantrajennie444"
}

// TESTING ADMIN LOGOUT
Test Case 2 :
Method: POST
URL: http://localhost:4000/admin-logout
Body: raw JSON
{
    "admin_id": "AD67093",
    "password": "Mantrajennie444"
}

 */

// Admin login
router.post("/admin-login", function (req, res) {
  const loginTime = getBangkokDateTime();
  const { admin_id, password } = req.body;

  if (!admin_id) {
    console.log("No admin_id in session.");
    return res.status(400).json({ success: false, message: "Missing credentials" });
  }

  // Get the first name and last name from the Admin_info table where that admin_id is that login.  const adminInfoSql = `SELECT * FROM Admin_info WHERE admin_id = ?`;
  const adminInfoSql = `SELECT * FROM Admin_info WHERE admin_id = ?`;
  connection.query(adminInfoSql, [admin_id], (err, adminResults) => {
    if (err) {
      console.error("Error fetching admin info:", err);
      return res.status(500).json({ success: false, message: "Server error" });

    }
    if (adminResults.length === 0) {
      console.log("Admin ID not found");
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const adminName = `${adminResults[0].First_Name} ${adminResults[0].Last_Name}`;

    // Verify admin credentials
    const sql = `SELECT * FROM Admin_login WHERE admin_id = ? AND Password = ?`;
    connection.query(sql, [admin_id, password], (error, results) => {
      if (error) {
        console.error("Login check error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }

      if (results.length > 0) {
        req.session.admin_id = admin_id; // Store admin ID in session

        // Insert admin login data
        const loginsql = `
      INSERT INTO Admin_login (admin_id, Password, Login_Time)
      VALUES (?, ?, ?)
    `;
        connection.query(loginsql, [admin_id, password, loginTime], (err) => {
          if (err) {
            console.error("Insert login failed:", err);
          } else {
            console.log(`[LOGIN] by Admin: ${adminName} at ${loginTime}`);
          }
        });

        res.json({ success: true, message: "Login successful", redirectUrl: "/admin-page" });
      } else {
        return res.status(401).json({ success: false, message: "Invalid Admin ID or Password" });
      }
    });
  });
});

// Admin logout
router.post('/admin-logout', function (req, res) {
  const logoutTime = getBangkokDateTime();
  const admin_id = req.session.admin_id;

  // Check if admin is logged in
  if (!admin_id) {
    console.log("No admin_id in session.");
    return res.status(400).json({ success: false, message: "No admin session" });
  }

  // Get admin name for logging
  const getAdminNameSql = `SELECT First_Name, Last_Name FROM Admin_info WHERE admin_id = ?`;
  connection.query(getAdminNameSql, [admin_id], (error, results) => {
    if (error) {
      console.error("Error fetching admin name:", error);
      return res.redirect('/');
    }

    const adminName = results.length > 0 ? `${results[0].First_Name} ${results[0].Last_Name}` : 'Unknown Admin';
    console.log(`[LOGOUT] by Admin: ${adminName} at ${logoutTime}`);

    // Get latest login time to update in database
    const latestLoginSql = `SELECT MAX(login_time) AS latest_login_time FROM Admin_login WHERE admin_id = ?`;
    connection.query(latestLoginSql, [admin_id], (error, loginResults) => {
      if (error || !loginResults[0].latest_login_time) {
        console.error("Error fetching latest login time:", error || 'No login found');
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }
      const latestLoginTime = loginResults[0].latest_login_time;

      // Update logout time in Admin_login table
      const updateLogSql = `
        UPDATE Admin_login
        SET logout_time = ?
        WHERE admin_id = ? AND login_time = ?
      `;
      connection.query(updateLogSql, [logoutTime, admin_id, latestLoginTime], (error) => {
        if (error) {
          console.error("Logout log update failed:", error);
        } 
        
        // Destroy session and clear cookie
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destroy error:', err);
            return res.status(500).json({ success: false, message: 'Logout failed' });
          }
          res.clearCookie('connect.sid');
          res.json({ success: true, message: 'Logged out successfully' });
        });
      });
    });
  });
});

// Serve protected admin pages
router.get("/admin-page", isAdminLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'ProductService.html'));
});

router.get("/add-page", isAdminLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'add.html'));
});

router.get("/delete-edit-page", isAdminLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'delete_edit.html'));
});

// Check admin session status
router.get('/check-admin', (req, res) => {
  if (!req.session.admin_id) {
    return res.status(401).json({ message: 'Not logged in as admin' });
  }
  res.json({ message: 'Admin logged in' });
});

/* 

2. Product/Service Search and Details

//TESTING SEARCH PRODUCT

Test Case 1 : No-Criteria Search
Method: GET
URL: http://localhost:4000/api/products

Test Case 2 : Criteria Search - Search by Color "Pink" 
Method: GET
URL: http://localhost:4000/search-api?color=Pink

Test Case 3 : Criteria Search - Search by all criteria
Method: GET
URL: http://localhost:4000/search-api?keyword=Banana&model=14&color=Yellow&collection=Plain&price-min=500&price-max=1000

 */
// Search products with criteria
router.get('/search-api', async (req, res) => {
  const {
    keyword,
    model,
    color,
    collection,
    'price-min': priceMin,
    'price-max': priceMax
  } = req.query;

  let sql = 'SELECT * FROM Product WHERE 1=1';
  const params = [];

  if (keyword) {
    sql += ' AND Product_Name LIKE ?';
    params.push(`%${keyword}%`);
  }

  if (model) {
    sql += ' AND Iphone_Model LIKE ?';
    params.push(`%${model}%`);
  }

  if (color) {
    sql += ' AND Color LIKE ?';
    params.push(`%${color}%`);
  }

  if (collection) {
    sql += ' AND Collection LIKE ?';
    params.push(`%${collection}%`);
  }

  if (priceMin && priceMax) {
    sql += ' AND Price BETWEEN ? AND ?';
    params.push(Number(priceMin), Number(priceMax));
  } else if (priceMin) {
    sql += ' AND Price >= ?';
    params.push(Number(priceMin));
  } else if (priceMax) {
    sql += ' AND Price <= ?';
    params.push(Number(priceMax));
  }

  connection.query(sql, params, async (err, results) => {
    if (err) {
      console.error('Search query failed:', err);
      return res.status(500).json({ error: 'Query failed' });
    }

    const seenNames = new Set();
    const mimeType = 'image/jpeg';

    // Prepare results with Base64 images and remove duplicate products
    const processedResults = await Promise.all(results.map(async (product) => {
      if (product.Product_Img && !product.Product_Img.startsWith('data:image')) {
        product.Product_Img = `data:${mimeType};base64,${product.Product_Img}`;
      }
      return product;
    }));

    const uniqueResults = processedResults.filter(product => {
      if (seenNames.has(product.Product_Name)) {
        return false;
      }
      seenNames.add(product.Product_Name);
      return true;
    });

    res.json(uniqueResults);
  });
});

/* 

//TESTING VEIEWING PRODUCT DETAILS

Test Case 1 : View product details : Grey Hamster
Method: GET
URL: http://localhost:4000/api/product/24SMGH1401

Test Case 2 : View product details : Sky Blue
Method: GET
URL: http://localhost:4000/api/product/25PLSB1501

 */

// Get product details by ID
router.get("/api/product/:id", async (req, res) => {
  const productId = req.params.id;
  const sql = "SELECT * FROM Product WHERE Product_ID = ?";

  connection.query(sql, [productId], async (err, results) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = results[0];

    // Check if the product image exists and convert to Base64 format
    if (product.Product_Img && !product.Product_Img.startsWith('data:image')) {
      try {
        const mimeType = 'image/jpeg'; 
        product.Product_Img = `data:${mimeType};base64,${product.Product_Img}`;
      } catch (err) {
        console.error('Error reading image file:', err);
        product.Product_Img = null;  // Set to null if there's an issue
      }
    }
    res.json(product);
  });
});

// -----------------------------------------------

/* 

3. Product/Service management web service for administrators

** MAKE SURE YOU ARE LOGGED IN FIRST **

Login :
Method: POST
URL: http://localhost:4000/admin-login
Body: raw JSON
{
    "admin_id": "AD67093",
    "password": "Mantrajennie444"
}
    
// We collect images as Base64. It's too long to include in comments,
// so we provide a sample Base64 string for testing.

// INSERT PRODUCT

Test Case 1 : Insert product - Green Forest
Method: POST
URL: http://localhost:4000/add-product
Body: raw JSON
{
  "product_id": "25PLGF1401",
  "product_name": "Green Forest",
  "description": "Protect your phone with the Green Forest Phone Case, designed with vibrant, eco-friendly materials. Featuring a unique forest design, it provides durability, style, and protection for your device.",
  "color": "Green",
  "price": 999.00,
  "stock": 50,
  "collection": "Plain",
  "iphone_model": "iPhone 14",
  "product_image_base64": "data:image/jpg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD"
}

Test Case 2 : Insert product - Red Lion
Method: POST
URL: http://localhost:4000/add-product
Body: raw JSON
{
  "product_id": "24SMRL1501",
  "product_name": "Red Lion",
  "description": "Unleash boldness with the Red Lion Phone Case. Designed for strength and style, this case offers rugged protection with a fierce lion emblem, perfect for those who dare to stand out.",
  "color": "Red",
  "price": 1800.00,
  "stock": 70,
  "collection": "Samote",
  "iphone_model": "iPhone 15",
  "product_image_base64": "data:image/jpg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/"
}

 */

// Add new product
router.post('/add-product', async (req, res) => {
  const {
    product_id,
    product_name,
    description,
    color,
    price,
    stock,
    collection,
    iphone_model,
    product_image_base64 
  } = req.body;

  let imageData = null;
  // Validate Base64 image format
  if (product_image_base64) {
    const regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;
    if (regex.test(product_image_base64)) {
      imageData = product_image_base64;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid image format' });
    }
  }

  // Check if product ID already exists
  const checkSql = 'SELECT COUNT(*) AS count FROM Product WHERE Product_ID = ?';
  connection.query(checkSql, [product_id], (err, results) => {
    if (err) {
      console.error('Error checking product ID:', err);
      return res.status(500).json({ success: false, message: 'Error checking product ID' });
    }

    if (results[0].count > 0) {
      return res.status(400).json({ success: false, message: 'Product ID already exists' });
    }

    // Insert new product into database
    const sql = `
      INSERT INTO Product 
      (Product_ID, Product_Name, Description, Color, Price, Stock_Quantity, Collection, Iphone_Model, Product_Img)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(
      sql,
      [product_id, product_name, description, color, price, stock, collection, iphone_model, imageData],
      (err, result) => {
        if (err) {
          console.error('Error inserting product:', err);
          return res.status(500).json({ success: false, message: 'Error inserting product' });
        }
        console.log(`Add new product : [${product_id}] Product name: ${product_name}, iPhone model: ${iphone_model}, Collection: ${collection}, Color: ${color}`);

        res.json({ success: true, message: 'Product added successfully!', redirect: '/admin-page' });
      }
    );
  });
});

/* 

** MAKE SURE YOU ARE LOGGED IN FIRST **
// We collect images as Base64. It's too long to include in comments,
// so we provide a sample Base64 string for testing.

// EDIT PRODUCT

Test Case 1 : Update New Price for Green Forest
Method: PUT
URL: http://localhost:4000/edit-product
Body: raw JSON
{
  "product_id": "25PLGF1401",
  "product_name": "Green Forest",
  "description": "Protect your phone with the Green Forest Phone Case, designed with vibrant, eco-friendly materials. Featuring a unique forest design, it provides durability, style, and protection for your device.",
  "color": "Green",
  "price": 1999.00,
  "stock": 50,
  "collection": "Plain",
  "iphone_model": "iPhone 14",
  "product_image_base64": "data:image/jpg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD"
}

Test Case 2 : Update Stock for Red Lion
Method: PUT
URL: http://localhost:4000/edit-product
Body: raw JSON
{
  "product_id": "24SMRL1501",
  "product_name": "Red Lion",
  "description": "Unleash boldness with the Red Lion Phone Case. Designed for strength and style, this case offers rugged protection with a fierce lion emblem, perfect for those who dare to stand out.",
  "color": "Red",
  "price": 1800.00,
  "stock": 100,
  "collection": "Samote",
  "iphone_model": "iPhone 15",
  "product_image_base64": "data:image/jpg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/"
}

 */

// Search product by ID for edit an delete
router.get("/edit-product-search", (req, res) => {
  const { product_id } = req.query;

  if (!product_id) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  const query = `SELECT * FROM Product WHERE Product_ID = ?`;
  connection.query(query, [product_id], (err, results) => {
    if (err) {
      console.error("Search error:", err);
      return res.status(500).json({ success: false, message: "Database error", details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(results[0]);
  });
});

// Edit product 
router.put('/edit-product', async (req, res) => {
  console.log('Received edit-product request:', req.body);

  const {
    product_id,
    product_name,
    description,
    price,
    color,
    collection,
    iphone_model,
    stock,
    product_image_base64
  } = req.body;

  if (!product_id) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }

  let imageData = product_image_base64 || null;
  // Validate Base64 image format
  if (imageData) {
    const regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;
    if (!regex.test(imageData)) {
      return res.status(400).json({ success: false, message: 'Invalid image format' });
    }
  }

  // Update product in database
  const sql = `
    UPDATE Product
    SET Product_Name = ?, Description = ?, Price = ?, Color = ?, Collection = ?, Iphone_Model = ?, Stock_Quantity = ?, Product_Img = ?
    WHERE Product_ID = ?
  `;
  console.log('Executing SQL:', sql, 'Params:', [product_name, description, price, color, collection, iphone_model, stock, imageData, product_id]);

  connection.query(
    sql,
    [product_name, description, price, color, collection, iphone_model, stock, imageData, product_id],
    (err, result) => {
      if (err) {
        console.error('Error updating product:', err);
        return res.status(500).json({ success: false, message: 'Error updating product', details: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      console.log(`Updated product: [${product_id}]`);
      res.json({ success: true, message: 'Product updated successfully!' });
    }
  );
});

/* 

** MAKE SURE YOU ARE LOGGED IN FIRST **

// DELETE PRODUCT

Test Case 1 : Delete Green Forest
Method: DELETE
URL: http://localhost:4000/delete-product/25PLGF1401


Test Case 2 : Delete Red Lion
Method: DELETE
URL:http://localhost:4000/delete-product/24SMRL1501
}

 */

// Delete product by ID
router.delete('/delete-product/:product_id', isAdminLoggedIn, (req, res) => {
  const { product_id } = req.params;
  const query = `DELETE FROM Product WHERE Product_ID = ?`;
  connection.query(query, [product_id], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ success: false, message: 'Database error', details: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    console.log(`Delete product : [${product_id}]`);
    res.json({ success: true, message: 'Product deleted successfully' });
  });
});

// Export router for use in other modules
module.exports = router;

// ---------------- ERROR  ----------------
app.use((req, res) => {
  res.redirect("/error");
});

// Start the server and listen on port 4000
const port = process.env.PORT || 4000; 
app.listen(port, () => {
  console.log(`Backend Server listening at Port ${port}`);
});
