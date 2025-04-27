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
// ตั้งค่าที่เก็บรูป
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์เป็น timestamp + extension
  }
});

const upload = multer({ storage: storage });



dotenv.config();



function getBangkokDateTime() {
  const date = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" });
  return date.replace("T", " ");
}

function isAdminLoggedIn(req, res, next) {
  if (req.session.admin_id) {
    console.log("Admin logged in, access granted.");
    return next();
  } else {
    console.log("Access denied, no admin session.");
    return res.redirect('/login');
  }
}

app.use(bodyParser.json({ limit: '10mb' }));  // 10MB limit
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'html')));
app.use(express.static('public'));
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes('Only JPEG/PNG')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});



const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.use(session({
  name: 'leafly_admin_si',
  secret: 'myAdmin',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 3,
    httpOnly: true,
    secure: false
  }
}));


app.use("/", router);
// ---------------CONNECT DATABASE---------------
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
// -----------------------------------------------


// ---------------HOME PAGE---------------
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


// ---------------DETAIL PAGE---------------
router.get("/api/product/:id", async (req, res) => {
  console.log('Request at ', req.url)
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

    // Check if the product image exists and if it is not in Base64 format
    if (product.Product_Img && !product.Product_Img.startsWith('data:image')) {
      try {
        const mimeType = 'image/jpeg';  // Assuming the image is JPEG
        // Convert the image to a Base64 string
        product.Product_Img = `data:${mimeType};base64,${product.Product_Img}`;
      } catch (err) {
        console.error('Error reading image file:', err);
        product.Product_Img = null;  // Set to null if there's an issue
      }
    }

    // Send the product details as JSON
    res.json(product);
  });
});

// ---------------SEARCH PAGE---------------
// SEARCH
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

  // 💥💥💥 FIX is here: pass "params" to the query
  connection.query(sql, params, async (err, results) => {
    if (err) {
      console.error('Search query failed:', err);
      return res.status(500).json({ error: 'Query failed' });
    }

    const seenNames = new Set();

    const mimeType = 'image/jpeg';
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

// ---------------ADMIN PAGE---------------
// ตรวจสอบ session ในฝั่งเซิร์ฟเวอร์เมื่อเข้าสู่ /admin-page
// ใช้ isAdminLoggedIn เพื่อให้แอดมินที่เข้าสู่ระบบแล้วเท่านั้นที่สามารถเข้าถึงได้
router.get("/admin-page", isAdminLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '../sec3_gr4_fe_src/html', 'ProductService.html'));
});

router.get("/add-page", isAdminLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'add.html'));
});

router.get("/delete-edit-page", isAdminLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'delete-edit-page.html'));
});


// Route สำหรับตรวจสอบว่าเป็นแอดมินหรือไม่
app.get('/check-admin', (req, res) => {
  if (!req.session.admin_id) {
    return res.status(401).json({ message: 'Not logged in as admin' });
  }
  res.json({ message: 'Admin logged in' });
});

//Login
router.post("/admin-login", function (req, res) { // Collect login information
  const loginTime = getBangkokDateTime();
  const { admin_id, password } = req.body;

  if (!admin_id) {
    console.log("No admin_id in session.");
    return res.status(400).json({ success: false, message: "Missing credentials" });
  }

  //Get first name and last name from Admin_info table where that admin_id that login
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

    // เช็ครหัสผ่าน
    const sql = `SELECT * FROM Admin_login WHERE admin_id = ? AND Password = ?`;
    connection.query(sql, [admin_id, password], (error, results) => {
      if (error) {
        console.error("Login check error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }

      if (results.length > 0) {
        req.session.admin_id = admin_id; // เก็บ session

        // Insert login log
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




//logout
router.post('/admin-logout', function (req, res) {
  const logoutTime = getBangkokDateTime();
  const admin_id = req.session.admin_id;

  if (!admin_id) {
    console.log("No admin_id in session.");
    return res.status(400).json({ success: false, message: "No admin session" });
  }

  const getAdminNameSql = `SELECT First_Name, Last_Name FROM Admin_info WHERE admin_id = ?`;
  connection.query(getAdminNameSql, [admin_id], (error, results) => {
    if (error) {
      console.error("Error fetching admin name:", error);
      return res.redirect('/');
    }

    const adminName = results.length > 0 ? `${results[0].First_Name} ${results[0].Last_Name}` : 'Unknown Admin';
    console.log(`[LOGOUT] by Admin: ${adminName} at ${logoutTime}`);

    // ดึง login_time ล่าสุดมาก่อน
    const latestLoginSql = `SELECT MAX(login_time) AS latest_login_time FROM Admin_login WHERE admin_id = ?`;
    connection.query(latestLoginSql, [admin_id], (error, loginResults) => {
      if (error || !loginResults[0].latest_login_time) {
        console.error("Error fetching latest login time:", error || 'No login found');
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }

      const latestLoginTime = loginResults[0].latest_login_time;

      const updateLogSql = `
        UPDATE Admin_login
        SET logout_time = ?
        WHERE admin_id = ? AND login_time = ?
      `;

      connection.query(updateLogSql, [logoutTime, admin_id, latestLoginTime], (error) => {
        if (error) {
          console.error("Logout log update failed:", error);
        } else {
          console.log("Logout time updated successfully.");
        }

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

// --------------- ADD PRODUCT ---------------
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
    product_image_base64 // รับค่า Base64 Image
  } = req.body;

  let imageData = null;
  if (product_image_base64) {
    // ตรวจสอบว่า Base64 ที่รับมาเป็นรูปแบบที่ถูกต้อง
    const regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;
    if (regex.test(product_image_base64)) {
      // ถ้า Base64 ถูกต้อง ให้เก็บเป็น Base64 ในฐานข้อมูล
      imageData = product_image_base64;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid image format' });
    }
  }

  // 1. ตรวจสอบว่า product_id มีในฐานข้อมูลแล้วหรือไม่
  const checkSql = 'SELECT COUNT(*) AS count FROM Product WHERE Product_ID = ?';
  connection.query(checkSql, [product_id], (err, results) => {
    if (err) {
      console.error('Error checking product ID:', err);
      return res.status(500).json({ success: false, message: 'Error checking product ID' });
    }

    if (results[0].count > 0) {
      // ถ้ามีแล้ว ให้คืนค่า error
      return res.status(400).json({ success: false, message: 'Product ID already exists' });
    }

    // 2. ถ้าไม่มี, ทำการ insert ข้อมูล
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

        // ตอบกลับด้วย JSON
        res.json({ success: true, message: 'Product added successfully!', redirect: '/admin-page' });
      }
    );
  });
});



// ---------------EDIT---------------
// serach by product id
// Route to search for a product by ID
router.get("/edit-product-search", (req, res) => {
  console.log('Request at ', req.url);
  const { product_id } = req.query;

  // เช็คว่า product_id ถูกส่งมาหรือไม่
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

    // ส่งข้อมูลสินค้าคืนไปยัง client
    res.json(results[0]);
  });
});

// Edit product route
router.put('/edit-product', isAdminLoggedIn, async (req, res) => {
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
  if (imageData) {
    const regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;
    if (!regex.test(imageData)) {
      return res.status(400).json({ success: false, message: 'Invalid image format' });
    }
  }

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
      console.log(`Updated product: ${product_id}`);
      res.json({ success: true, message: 'Product updated successfully!' });
    }
  );
});

// Delete product route
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
    res.json({ success: true, message: 'Product deleted successfully' });
  });
});

module.exports = router;


// ---------------ERROR---------------
app.use((req, res) => {
  res.redirect("/error");
});


// Start server
const port = process.env.PORT || 4000; // Default to 4000 if no PORT is set
app.listen(port, () => {
  console.log(`Backend Server listening at Port ${port}`);
});

