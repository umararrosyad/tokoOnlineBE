// src/controllers/usersController.js
import { supabase } from "../config/supabase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// List users (tanpa password)
export const listUsers = async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, phone, created_at")
    .order("created_at", { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// Register user
export const createUser = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke DB
    const { data: user, error } = await supabase
      .from("users")
      .insert([{ name, email, phone, password: hashedPassword }])
      .select("id, name, email, phone, created_at")
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Gabungkan token ke data user
    const userWithToken = { ...user, token };

    res.status(201).json({
      message: "Register successful",
      user: userWithToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Cari user
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Cek password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET , // gunakan dari .env
    { expiresIn: "1d" }
  );

  // Hilangkan password sebelum mengirim
  const { password: _, ...userData } = user;

  // Tambahkan token ke dalam objek user
  userData.token = token;

  res.json({
    message: "Login successful",
    user: userData
  });
};

// Update user (boleh update password juga)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, password } = req.body;

  let updateData = { name, email, phone };

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", id)
    .select("id, name, email, phone")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "User deleted" });
};
