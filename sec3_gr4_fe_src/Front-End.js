const PORT = 3000;
const path = require("path");
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");


// Initialize Express application and router
const app = express();
const router = express.Router();

app.use("/", router);

app.use(express.static(path.join(__dirname, "html")));
app.use(express.static(path.join(__dirname, "js")));
app.use(express.static(path.join(__dirname, "css")));
app.use(express.static(path.join(__dirname, "images")));

// Configure proxy middleware for API requests
router.use(
    ["/api"],
    createProxyMiddleware({
        target: "http://localhost:4000",
        changeOrigin: true,
        onProxyReq: (proxyReq, req) => {
            console.log(`Proxying ${req.method} ${req.url} to http://localhost:4000${req.url}`);
        },
        onError: (err, req, res) => {
            console.error("Proxy error:", err);
            res.status(500).send("Proxy error");
        }
    })
);

// Routes for serving HTML pages
app.get(["/", "/home"], (req, res) => {
    console.log("Request at", req.url);
    res.sendFile(path.join(__dirname, "html", "home.html"));
});

app.get("/team", (req, res) => {
    console.log("Request at", req.url);
    res.sendFile(path.join(__dirname, "html", "team.html"));
});

app.get("/login", (req, res) => {
    console.log("Request at", req.url);
    res.sendFile(path.join(__dirname, "html", "login.html"));
});

app.get("/search", (req, res) => {
    console.log("Request at", req.url);
    res.sendFile(path.join(__dirname, "html", "SearchPage.html"));
});

app.get("/detail", (req, res) => {
    console.log("Request at", req.url);
    res.sendFile(path.join(__dirname, "html", "Detail.html"));
});

app.get("/admin-page", (req, res) => {
    console.log("Request at", req.url);
    res.sendFile(path.join(__dirname, "html", "ProductService.html"));
});

app.get("/add-page", (req, res) => {
    console.log("Request at", req.url);
    res.sendFile(path.join(__dirname, "html", "add.html"));
});

app.get("/delete-edit-page", (req, res) => {
    console.log("Request at", req.url);
    res.sendFile(path.join(__dirname, "html", "delete_edit.html"));
});

app.get("/error", (req, res) => {
    console.log("Request at", req.url);
    res.sendFile(path.join(__dirname, "html", "error.html"));
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});
