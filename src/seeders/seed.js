// src/seeders/seed.js
import { supabase } from "../config/supabase.js";

async function seed() {
  try {
    // 1. Tambah Categories
    const { data: categories, error: catErr } = await supabase
      .from("categories")
      .insert([
        { name: "Electronics", description: "Electronic gadgets and devices" },
        { name: "Books", description: "Various kinds of books" },
        { name: "Fashion", description: "Clothing and accessories" }
      ])
      .select();

    if (catErr) throw catErr;
    console.log("✅ Categories inserted:", categories);

    // 2. Tambah Products
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .insert([
        {
          name: "Smartphone X",
          description: "Latest smartphone with high-end features",
          price: 999.99,
          stock: 50,
          category_id: categories[0].id,
          image: "https://via.placeholder.com/200"
        },
        {
          name: "Science Book",
          description: "Educational science book",
          price: 29.99,
          stock: 100,
          category_id: categories[1].id,
          image: "https://via.placeholder.com/200"
        },
        {
          name: "T-Shirt",
          description: "Comfortable cotton T-shirt",
          price: 19.99,
          stock: 200,
          category_id: categories[2].id,
          image: "https://via.placeholder.com/200"
        }
      ])
      .select();

    if (prodErr) throw prodErr;
    console.log("✅ Products inserted:", products);

    // 3. Tambah Users
    const { data: users, error: userErr } = await supabase
      .from("users")
      .insert([
        { name: "John Doe", email: "john@example.com", phone: "08123456789" },
        { name: "Jane Smith", email: "jane@example.com", phone: "08129876543" }
      ])
      .select();

    if (userErr) throw userErr;
    console.log("✅ Users inserted:", users);

    // 4. Tambah Cart (contoh favorit user)
    const { data: cart, error: cartErr } = await supabase
      .from("cart")
      .insert([
        { user_id: users[0].id, product_id: products[0].id, quantity: 1 },
        { user_id: users[0].id, product_id: products[1].id, quantity: 2 },
        { user_id: users[1].id, product_id: products[2].id, quantity: 1 }
      ])
      .select();

    if (cartErr) throw cartErr;
    console.log("✅ Cart inserted:", cart);

    // 5. Tambah Orders
    const { data: orders, error: orderErr } = await supabase
      .from("orders")
      .insert([
        {
          user_id: users[0].id,
          total_amount: 1029.98,
          status: "pending",
          shipping_address: "Jl. Contoh No. 123, Jakarta"
        }
      ])
      .select();

    if (orderErr) throw orderErr;
    console.log("✅ Orders inserted:", orders);

    // 6. Tambah Order Items
    const { data: orderItems, error: orderItemErr } = await supabase
      .from("order_items")
      .insert([
        {
          order_id: orders[0].id,
          product_id: products[0].id,
          product_name: products[0].name,
          price: products[0].price,
          quantity: 1
        },
        {
          order_id: orders[0].id,
          product_id: products[1].id,
          product_name: products[1].name,
          price: products[1].price,
          quantity: 1
        }
      ])
      .select();

    if (orderItemErr) throw orderItemErr;
    console.log("✅ Order Items inserted:", orderItems);

    console.log("🎉 Seeder selesai!");
  } catch (err) {
    console.error("❌ Seeder error:", err.message);
  }
}

seed();
