// src/routes/users.js
import express from "express";
import {
  listUsers,
  createUser,
  loginUser,
  updateUser,
  deleteUser
} from "../controllers/usersController.js";

const router = express.Router();

router.get("/", listUsers);
router.post("/", createUser); // register
router.post("/login", loginUser); // login
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
