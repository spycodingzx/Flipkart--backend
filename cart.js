const mongoose = require("mongoose");
const express = require("express");
const { execSync } = require("child_process");
const router = express.Router();

const Cart = mongoose.model(
  "Cart",
  new mongoose.Schema({
    userId: String,
    item: [
      {
        productId: String,
        quantity: Number,
      },
    ],
  })
);

router.post("/cart/add", async (req, res) => {
  try {
    const { productId, quantity = 1, user } = req.body;

    if (!productId || !user)
      return res.status(400).json({ message: "ProductId nd user is required" });

    let cart = await Cart.findOne({ userid: user, status: "active" });

    if (!cart) {
      cart = new Cart({ userId: user, item: [], status: "active" });
    }

    const existingItemIndex = cart.item.findIndex(
      (items) => productId === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      cart.items.push({
        productId,
        quantity: parseInt(quantity),
      });
    }
    cart.updateAt = new Date();
    await cart.save();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error,itemhas not been added" });
  }
});

router.get("/carts", async (req, res) => {
  try {
    const carts = await Cart.find({});

    res.status(200).json({
      success: true,
      count: carts.length,
      data: carts,
    });
  } catch (error) {
    console.log("Error fetching data", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
});

// 🗑️ Delete item from cart
router.delete("/cart/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId, status: "active" });

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
    console.error(" Delete Error:", err);
    res.status(500).json({ error: "Failed to delete item from cart" });
  }
});

module.exports = router;
