import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY // pakai service role untuk full access
);

dotenv.config();

import productRoutes from "./src/routes/products.js";
import categoryRoutes from "./src/routes/categories.js";
import userRoutes from "./src/routes/users.js";
import orderRoutes from "./src/routes/orders.js";
import cartRoutes from "./src/routes/cartRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// mount api
app.get("/", (req, res) => {
  res.json({ message: "Toko Online API is running 🚀" });
});
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));