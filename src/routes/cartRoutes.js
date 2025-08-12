// src/routes/cartRoutes.js
import express from "express";
import { getCart, addToCart, removeFromCart, getCartCount, clearCart } from "../controllers/cartController.js";
// const auth = require("../middleware/authMiddleware");

const router = express.Router();

// GET semua item cart user
router.get("/:user_id", getCart);

// POST tambah item ke cart
router.post("/", addToCart);

// DELETE hapus satu item di cart
router.delete("/:user_id/:product_id", removeFromCart);

// DELETE kosongkan cart
router.delete("/clear/:user_id", clearCart);

router.get("/count/:user_id", getCartCount);

export default router;
