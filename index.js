const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // replaces body-parser

// Routes
const { router: authRoutes } = require("./auth");
const cartRoutes = require("./cart");
const Product = require("./models/Product");

app.use(authRoutes);
app.use(cartRoutes);

// ✅ MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://aditya_123:adityarajsingh_123@cluster1.cypdwq.mongodb.net/ecommerce",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Get All Products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ✅ Get Product by ID
app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Add Dummy Product
// app.get("/add-dummy", async (req, res) => {
//   try {
//     const dummy = new Product({
//       name: "Test Product",
//       price: 999,
//     });
//     await dummy.save();
//     res.send("✅ Dummy product added");
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: "Failed to add dummy product", details: err.message });
//   }
// });
const fs = require("fs");
const path = require("path");
const Product = require("./models/Product"); // ensure this import exists

app.get("/add-dummy", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "data.json");
    const fileData = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(fileData);

    if (!Array.isArray(jsonData.products)) {
      return res
        .status(400)
        .json({ error: "Invalid data format in JSON file" });
    }

    await Product.insertMany(jsonData.products);
    res.send("✅ Products imported successfully from data.json");
  } catch (err) {
    console.error("❌ Import Error:", err);
    res
      .status(500)
      .json({ error: "Failed to import products", details: err.message });
  }
});

app.get("/ping", (req, res) => {
  res.send("✅ Server is alive and synced!");
});

// ✅ Start Server
app.listen(8080, () => {
  console.log("🚀 Server running at http://localhost:8080");
});
