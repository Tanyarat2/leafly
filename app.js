const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2");

const app = express();
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "html")));

const session = require('express-session');

app.use(session({
  secret: 'myAdmin',  
  resave: false,
  saveUninitialized: true
}));



// -------Connect DB------------
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

// --------------------------------

// login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/html/login.html"));
  console.log('Request at ',req.url)
});
// admin login 
app.post("/login", function(req, res) {
  const loginTime = new Date().toLocaleString();
  const { username, password } = req.body;

  console.log(`Request at ${req.url}`)

  const sql = `SELECT * FROM Admin_login WHERE Username = ? AND Password = ?`;
  connection.query(sql, [username, password], (error, results) => {

    if (results.length > 0) {
      req.session.username = username; //collect username to session
      console.log(`[LOGOUT] User: ${username} at ${loginTime}`);
      res.redirect('/admin')
    } else {
      console.log(`Invalid username or password`);
      res.redirect('/')
    }
  });
});

// Signin page
app.get("/create", (req, res) => {
  res.sendFile(path.join(__dirname, "/html/signin.html"));
  console.log('Request at ',req.url)
});

// Create account  ------- ค่อยดูว่าจะเก้บใส่ดาต้าเบสไหม
app.post("/create-acc", function(req, res) {
  const firstname = req.body.firstname;

  console.log(`Request at ${req.url}`)
  console.log(`${firstname} create account sucessful`);

  });


// admin page
app.get('/admin', (req, res) => {
  console.log(`Request at ${req.url}`)
  res.sendFile(path.join(`${__dirname}/html/ProductService.html`))
})

// logout
app.post("/logout", function(req, res) {
  const logoutTime = new Date().toLocaleString();
  const username = req.session.username; 

  req.session.destroy()
  console.log(`Request at ${req.url}`)
  console.log(`[LOGOUT] User: ${username}`);
  console.log(`Logout time: ${logoutTime}`);
  res.redirect('/')
  
  });

// -----------SEARCH----------------
app.get("/search", (req, res) => {
  const { keyword, model, color, collection } = req.query;
  const priceMin = req.query["price-min"];
  const priceMax = req.query["price-max"];

  let sql = "SELECT * FROM Product WHERE 1=1";
  let params = [];

  if (keyword) {
      sql += " AND Product_name LIKE ?";
      params.push(`%${keyword}%`);
  }
  if (model) {
      sql += " AND Iphone_model = ?";
      params.push(model);
  }
  if (color) {
      sql += " AND color = ?";
      params.push(color);
  }
  if (collection) {
      sql += " AND collection = ?";
      params.push(collection);
  }
  if (priceMin && priceMax) {
      sql += " AND price BETWEEN ? AND ?";
      params.push(priceMin, priceMax);
  }

  connection.query(sql, params, (error, results) => {
      if (error) {
          console.error("Search error:", error);
          return res.status(500).send("Server error");
      }
      res.json(results);  // Send the results to the front-end
  });
});



// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "/html/error.html"));
});

// Start server
app.listen(process.env.PORT, () => {
    console.log("Server listening at Port " + process.env.PORT);
});
