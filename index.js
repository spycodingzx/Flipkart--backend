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
app.get("/add-dummy", async (req, res) => {
  try {
    const dummy = new Product({
      name: "Test Product",
      price: 999,
    });
    await dummy.save();
    res.send("✅ Dummy product added");
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to add dummy product", details: err.message });
  }
});

const { Product } = require("./models/Product");

app.get("/add-dummy", async (req, res) => {
  try {
    await Product.insertMany([
      {
        name: "iPhone 14",
        price: 79900,
        description: "Apple iPhone 14 - 128GB, Blue",
        image: "https://example.com/iphone14.jpg",
      },
      {
        name: "Samsung Galaxy S23",
        price: 74999,
        description: "Samsung Galaxy S23 - 128GB, Phantom Black",
        image: "https://example.com/galaxy.jpg",
      },
    ]);

    res.send("Dummy products added");
  } catch (err) {
    res.status(500).json({ error: "Failed to insert dummy products" });
  }
});

// ✅ Start Server
app.listen(8080, () => {
  console.log("🚀 Server running at http://localhost:8080");
});
