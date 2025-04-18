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



// login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/html/login.html"));
  console.log('Request at ', req.url)
});
app.post("/login", function (req, res) {
  const loginTime = new Date().toISOString().slice(0, 19).replace("T", " ");
  const { admin_id, password } = req.body;

  // ดึงข้อมูลชื่อแอดมินจาก Admin_info
  const adminInfoSql = `SELECT * FROM Admin_info WHERE admin_id = ?`;
  connection.query(adminInfoSql, [admin_id], (err, adminResults) => {
    if (err) {
      console.error("Error fetching admin info:", err);
      res.redirect('/home');
      return;
    }

    if (adminResults.length > 0) {
      const adminName = `${adminResults[0].First_Name} ${adminResults[0].Last_Name}`;
      console.log(`Request at ${req.url}`);

      // ตรวจสอบข้อมูลการล็อกอิน
      const sql = `SELECT * FROM Admin_login WHERE admin_id = ? AND Password = ?`;
      connection.query(sql, [admin_id, password], (error, results) => {
        if (results.length > 0) {
          req.session.admin_id = admin_id; // collect admin_id to session

          // insert into login table
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

          res.redirect('/admin');
        } else {
          console.log("Invalid username or password");
          res.redirect('/home');
        }
      });
    } else {
      console.log("Admin ID not found");
      res.redirect('/home');
    }
  });
});


// Signin page
app.get("/create", (req, res) => {
  res.sendFile(path.join(__dirname, "/html/signin.html"));
  console.log('Request at ', req.url)
});

// Create account  ------- ค่อยดูว่าจะเก้บใส่ดาต้าเบสไหม
app.post("/create-acc", function (req, res) {
  const firstname = req.body.firstname;

  console.log(`Request at ${req.url}`)
  console.log(`${firstname} create account sucessful`);

});

//homeee
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "/html/home.html"));
  console.log('Request at ', req.url)
});

// admin page
app.get('/admin', (req, res) => {
  console.log(`Request at ${req.url}`)
  res.sendFile(path.join(`${__dirname}/html/ProductService.html`))
})

// logout
app.post("/logout", function (req, res) {
  const logoutTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const admin_id = req.session.admin_id;

  if (!admin_id) {
    console.log("No admin_id in session.");
    return res.redirect('/home'); // หรือหน้าที่คุณต้องการให้ไปหากไม่มี admin_id
  }

  console.log(`Request at ${req.url}`);

  // ดึงชื่อของ admin จากฐานข้อมูล
  const getAdminNameSql = `SELECT First_Name, Last_Name FROM Admin_info WHERE admin_id = ?`;
  connection.query(getAdminNameSql, [admin_id], (error, results) => {
    if (error) {
      console.error("Error fetching admin name:", error);
      return res.redirect('/home'); // ป้องกันการผิดพลาด
    }

    const adminName = results.length > 0 ? `${results[0].First_Name} ${results[0].Last_Name}` : 'Unknown Admin';

    console.log(`[LOGOUT] by Admin: ${adminName} at ${logoutTime}`);

    // Update logout time
    const updateLogSql = `
      UPDATE Admin_login
      SET logout_time = ?
      WHERE admin_id = ?
      ORDER BY login_time DESC
      LIMIT 1
    `;
  
    connection.query(updateLogSql, [logoutTime, admin_id], (error, results) => {
      if (error) {
        console.error("Logout log update failed:", error);
      } else {
        console.log("Logout time updated successfully.");
      }

      // Destroy the session after the update is successful
      req.session.destroy(() => {
        res.redirect('/'); // Redirect to home or login page after logout
      });
    });
  });
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
