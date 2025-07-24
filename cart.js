const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

// Define Cart schema
const Cart = mongoose.model(
  "Cart",
  new mongoose.Schema({
    userId: String,
    items: [
      {
        productId: String,
        quantity: Number,
      },
    ],
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  })
);

// ➕ Add item to cart
router.post("/cart/add", async (req, res) => {
  try {
    const { productId, quantity = 1, user } = req.body;

    if (!productId || !user) {
      return res.status(400).json({ message: "Product ID and user are required" });
    }

    let cart = await Cart.findOne({ userId: user });

    if (!cart) {
      cart = new Cart({ userId: user, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex > -1) {
      // If item already exists, update quantity
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      // Else, add new item
      cart.items.push({ productId, quantity: parseInt(quantity) });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    console.error("Cart Add Error:", error);
    res.status(500).json({
      error: "Internal server error. Item has not been added",
    });
  }
});

// 📦 Get all carts
router.get("/carts", async (req, res) => {
  try {
    const carts = await Cart.find({});
    res.status(200).json({
      success: true,
      count: carts.length,
      data: carts,
    });
  } catch (error) {
    console.log("Error fetching carts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart data",
      error: error.message,
    });
  }
});

// 🗑️ Delete item from cart
router.delete("/cart/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found for user" });
    }

    const updatedItems = cart.items.filter(
      (item) => item.productId !== productId
    );

    cart.items = updatedItems;
    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({ message: "Item deleted successfully", cart });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Failed to delete item from cart" });
  }
});

module.exports = router;
