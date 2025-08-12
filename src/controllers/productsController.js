import { supabase } from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";

export const getProducts = async (req, res) => {
  try {
    const { name, category_id } = req.query;

    let query = supabase.from("products").select("*");

    if (name) {
      // ILIKE untuk pencarian case-insensitive di Supabase/Postgres
      query = query.ilike("name", `%${name}%`);
    }

    if (category_id) {
      query = query.eq("category_id", category_id);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getProductById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
};

export const createProduct = async (req, res) => {
  try {
    let { name, category_id = null, price, description, stock } = req.body;

    // Konversi price dan stock ke number jika perlu
    price = price ? Number(price) : null;
    stock = stock ? Number(stock) : null;

    let imageUrl = null;

    if (req.file) {
      const fileName = `${uuidv4()}-${req.file.originalname}`;
      console.log("Uploading file:", fileName);
      console.log("File mimetype:", req.file.mimetype);
      console.log("File size:", req.file.size);

      // Upload file ke storage
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return res.status(500).json({ error: uploadError.message });
      }

      // Ambil URL publik file yang sudah diupload
      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      if (publicUrlError) {
        console.error("Error getting public URL:", publicUrlError);
        return res.status(500).json({ error: publicUrlError.message });
      }

      imageUrl = publicUrlData.publicUrl;
      console.log("Public URL:", imageUrl);
    }

    // Insert data produk ke tabel
    const { data, error } = await supabase.from("products").insert([
      { name, category_id, price, description, stock, image: imageUrl },
    ]);

    if (error) {
      console.error("Insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Update product id:", id);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    // Ambil data dari body
    const {
      name,
      category_id = null, // default null jika tidak dikirim
      price,
      description,
      stock,
    } = req.body;

    // Konversi price dan stock ke number
    let updateData = {
      name,
      category_id,
      price: price ? Number(price) : null,
      description,
      stock: stock ? Number(stock) : null,
    };

    // Upload gambar jika ada file
    if (req.file) {
      const fileName = `${uuidv4()}-${req.file.originalname}`;
      console.log("Uploading file with name:", fileName);
      console.log("File mimetype:", req.file.mimetype);
      console.log("File size:", req.file.size);

      // Upload ke supabase storage
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return res.status(500).json({ error: uploadError.message });
      }

      // Ambil public URL file yang sudah diupload
      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      if (publicUrlError) {
        console.error("Error getting public URL:", publicUrlError);
        return res.status(500).json({ error: publicUrlError.message });
      }

      console.log("Public URL:", publicUrlData.publicUrl);
      updateData.image = publicUrlData.publicUrl;
    }

    console.log("Updating product with data:", updateData);

    // Update produk di database berdasarkan id
    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("Update successful:", data);
    res.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Product deleted" });
};
