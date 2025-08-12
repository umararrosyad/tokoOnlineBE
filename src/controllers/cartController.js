// src/controllers/cartController.js
import { supabase } from "../config/supabase.js";

// Ambil semua item cart user
export const getCart = async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from("cart")
    .select("*, products(*)")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// Tambah produk ke cart
export const addToCart = async (req, res) => {
  const { user_id, product_id, quantity = 1 } = req.body;

  // Cek apakah produk sudah ada di cart
  const { data: existing, error: checkError } = await supabase
    .from("cart")
    .select("*")
    .eq("user_id", user_id)
    .eq("product_id", product_id)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    return res.status(500).json({ error: checkError.message });
  }

  if (existing) {
    // Produk sudah ada → update quantity
    const newQuantity = existing.quantity + quantity;

    const { data: updated, error: updateError } = await supabase
      .from("cart")
      .update({ quantity: newQuantity })
      .eq("id", existing.id) // berdasarkan id cart
      .select()
      .single();

    if (updateError) return res.status(500).json({ error: updateError.message });
    return res.status(200).json(updated);
  }

  // Jika belum ada → insert baru
  const { data, error } = await supabase
    .from("cart")
    .insert([{ user_id, product_id, quantity }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};


// Hapus produk dari cart
export const removeFromCart = async (req, res) => {
  const { user_id, product_id } = req.params;
  const { error } = await supabase
    .from("cart")
    .delete()
    .eq("user_id", user_id)
    .eq("product_id", product_id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Product removed from cart" });
};

// Kosongkan cart user
export const clearCart = async (req, res) => {
  const { user_id } = req.params;
  const { error } = await supabase.from("cart").delete().eq("user_id", user_id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Cart cleared" });
};

// Ambil jumlah item di cart untuk user tertentu
export const getCartCount = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ error: "user_id diperlukan" });
    }

    const { count, error } = await supabase
      .from("cart")
      .select("*", { count: "exact", head: true }) // hanya hitung, tidak ambil data
      .eq("user_id", user_id);

    if (error) throw error;

    res.json({ user_id, cart_count: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

