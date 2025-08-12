import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Ping Supabase
app.get("/ping", async (req, res) => {
  // Cek apakah env sudah terisi
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    return res.status(500).json({
      success: false,
      message: "SUPABASE_URL atau SUPABASE_KEY belum diatur di .env"
    });
  }

  app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileExt = file.originalname.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    // Upload ke Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(fileName, Buffer.from(file.buffer), {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Ambil public URL
    const { data } = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(fileName);

    // Simpan metadata di DB
    const { error: dbError } = await supabase
      .from("files")
      .insert([{ name: file.originalname, url: data.publicUrl, type: file.mimetype }]);

    if (dbError) throw dbError;

    res.json({ message: "Upload success", url: data.publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Ambil list file
app.get("/files", async (req, res) => {
  try {
    const { data, error } = await supabase.from("files").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hapus file
app.delete("/files/:id", async (req, res) => {
  try {
    const { data: fileData, error: getError } = await supabase.from("files").select("*").eq("id", req.params.id).single();
    if (getError) throw getError;

    const fileName = fileData.url.split("/").pop();

    // Hapus dari storage
    const { error: storageError } = await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([fileName]);
    if (storageError) throw storageError;

    // Hapus dari DB
    const { error: dbError } = await supabase.from("files").delete().eq("id", req.params.id);
    if (dbError) throw dbError;

    res.json({ message: "File deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  // Tes query sederhana
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .limit(1);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Gagal koneksi ke Supabase",
        detail: error.message
      });
    }

    res.json({
      success: true,
      message: "Koneksi ke Supabase berhasil 🚀",
      sampleData: data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Fetch ke Supabase gagal",
      detail: err.message
    });
  }
});

// Tes koneksi API
app.get("/", (req, res) => {
  res.json({ message: "Toko Online API is running 🚀" });
});

// Ambil semua produk
app.get("/products", async (req, res) => {
  const { data, error } = await supabase.from("products").select("*");
  if (error) return res.status(400).json({ error: "error" });
  res.json(data);
});

// Tambah produk
app.post("/products", async (req, res) => {
  const { name, price, stock } = req.body;
  const { data, error } = await supabase
    .from("products")
    .insert([{ name, price, stock }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

// Checkout
app.post("/checkout", async (req, res) => {
  const { name, address, cart } = req.body;
  const { data, error } = await supabase
    .from("orders")
    .insert([{ name, address, cart }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Order received", order: data[0] });
});
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}
export default app;
