// src/controllers/ordersController.js
import { supabase } from "../config/supabase.js";

/**
 * Create Order with order_items and decrement stock transactionally (best-effort).
 * For simplicity we do sequential operations; for production consider DB functions or transaction handling.
 */
export const createOrder = async (req, res) => {
  try {
    const { user_id, shipping_address, items } = req.body;
    // items: [{ product_id, quantity }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order items required" });
    }

    // Ambil harga & nama produk dari DB, hitung total
    let total = 0;
    const itemsWithPrice = [];

    for (const it of items) {
      const { product_id, quantity } = it;

      // Ambil produk dari DB
      const { data: product, error: productErr } = await supabase
        .from("products")
        .select("price, name, stock")
        .eq("id", product_id)
        .single();

      if (productErr || !product) {
        return res.status(400).json({ error: `Product with id ${product_id} not found` });
      }

      if (quantity > product.stock) {
        return res.status(400).json({ error: `Insufficient stock for product ${product.name}` });
      }

      const subTotal = Number(product.price) * Number(quantity);
      total += subTotal;

      itemsWithPrice.push({
        product_id,
        product_name: product.name,
        price: product.price,
        quantity
      });
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{ user_id, shipping_address, total_amount: total }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order_items dan update stok produk
    for (const it of itemsWithPrice) {
      await supabase.from("order_items").insert([{
        order_id: order.id,
        product_id: it.product_id,
        product_name: it.product_name,
        price: it.price,
        quantity: it.quantity
      }]);

      // Update stok produk (decrement)
      const { data: pData, error: pErr } = await supabase
        .from("products")
        .select("stock")
        .eq("id", it.product_id)
        .single();

      if (pErr) {
        // Kalau error, skip update stok
        continue;
      }

      const newStock = (pData.stock || 0) - Number(it.quantity);

      await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", it.product_id);
    }

// (Opsional) Hapus hanya produk yang diorder dari cart user
const orderedProductIds = items.map(it => it.product_id);

await supabase
  .from("cart")
  .delete()
  .eq("user_id", user_id)
  .in("product_id", orderedProductIds);

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const listOrders = async (req, res) => {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getOrder = async (req, res) => {
  const { id } = req.params;
  // get order
  const { data: order, error: orderErr } = await supabase.from("orders").select("*").eq("id", id).single();
  if (orderErr) return res.status(404).json({ error: orderErr.message });

  // get items
  const { data: items, error: itemsErr } = await supabase.from("order_items").select("*").eq("order_id", id);
  if (itemsErr) return res.status(500).json({ error: itemsErr.message });

  res.json({ order, items });
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const countPendingOrdersByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ error: "user_id diperlukan" });
    }

    const { count, error } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true }) // hanya hitung, tidak ambil data
      .eq("user_id", user_id)
      .eq("status", "pending");

    if (error) throw error;

    res.json({ user_id, pending_count: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Order deleted" });
};

export const getOrdersByUser = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "user_id diperlukan" });
  }

  try {
    // Ambil semua order user
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (ordersError) throw ordersError;

    // Untuk setiap order, ambil items dan image produk
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);

        if (itemsError) {
          return { ...order, items: [] };
        }

        // Ambil image produk untuk setiap item secara paralel
        const itemsWithImage = await Promise.all(
          items.map(async (item) => {
            const { data: product, error: productError } = await supabase
              .from("products")
              .select("image")
              .eq("id", item.product_id)
              .single();

            return {
              ...item,
              image: productError || !product ? null : product.image,
            };
          })
        );

        return { ...order, items: itemsWithImage };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

