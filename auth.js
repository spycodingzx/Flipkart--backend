const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

// User Schema
const User = mongoose.model(
  "User",
  new mongoose.Schema({ email: String, password: String })
);

// Signup Route
router.post("/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  const token = jwt.sign({ userId: user._id }, "your_jwt_secret", {
    expiresIn: "1h",
  });

  res.status(201).json({ token });
});

// Login Route
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: req.body, email });
  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    const token = jwt.sign({ userId: user._id }, "secret", { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid crendentials" });
  }
});

//JWt middleware
function authenticationJWt(req, res, next) {
  const authHeader = rea.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "secret", (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

module.exports = { router, authenticationJWt };
