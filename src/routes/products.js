import express from "express";
import { upload } from "../middleware/upload.js";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productsController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", upload.single("file"), createProduct);
router.put("/:id", upload.single("file"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
