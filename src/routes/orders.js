// src/routes/orders.js
import express from "express";
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
  countPendingOrdersByUser,
  getOrdersByUser
} from "../controllers/ordersController.js";

const router = express.Router();

router.get("/", listOrders);
router.get("/pending-count/:user_id", countPendingOrdersByUser);
router.get("/:id", getOrder);
router.post("/", createOrder);
router.get("/user/:user_id", getOrdersByUser);
router.put("/:id/status", updateOrderStatus); // update status
router.delete("/:id", deleteOrder);

export default router;
