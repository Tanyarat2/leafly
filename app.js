// POST /add-product
// app.post('/add-product', (req, res) => {
//     const { product_id, product_name, description, price, color, collection, iphone_model, stock } = req.body;
//     const sql = "INSERT INTO products (...) VALUES (...)";
//     db.query(sql, [...], (err, result) => {
//       if (err) throw err;
//       res.redirect('/products'); // Redirect after successful insert
//     });
//   });
  
//   // GET /edit/:id
//   app.get('/edit/:id', (req, res) => {
//     const id = req.params.id;
//     const sql = "SELECT * FROM products WHERE id = ?";
//     db.query(sql, [id], (err, result) => {
//       if (err) throw err;
//       res.render('edit_product', { product: result[0] });
//     });
//   });
  
//   // POST /delete/:id
//   app.post('/delete/:id', (req, res) => {
//     const id = req.params.id;
//     const sql = "DELETE FROM products WHERE id = ?";
//     db.query(sql, [id], (err, result) => {
//       if (err) throw err;
//       res.redirect('/products');
//     });
//   });
  