const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Product = require("./models/Product");
const { authenticateJWT } = require("./auth");

// 🛒 Cart Schema
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

// ➕ Add item to cart (requires JWT token)
router.post("/cart/add", authenticateJWT, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.userId; // ✅ from token

    if (!productId || !userId) {
      return res
        .status(400)
        .json({ message: "Product ID and user ID are required" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      cart.items.push({ productId, quantity: parseInt(quantity) });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    console.error("Cart Add Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📦 Get user's cart (requires JWT)
router.get("/carts", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "No cart found for user" });
    }

    // ✅ Populate product details
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          product: product || null,
          quantity: item.quantity,
        };
      })
    );

    res.status(200).json({
      userId: cart.userId,
      items: populatedItems,
    });
  } catch (error) {
    console.error("Fetch Cart Error:", error);
    res.status(500).json({ error: "Failed to fetch cart data" });
  }
});

// 🗑️ Delete item from cart
router.delete("/cart/:productId", authenticateJWT, async (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found for user" });
    }

    cart.items = cart.items.filter((item) => item.productId !== productId);
    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({ message: "Item deleted successfully", cart });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Failed to delete item from cart" });
  }
});

module.exports = router;
