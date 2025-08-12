// src/controllers/categoriesController.js
import { supabase } from "../config/supabase.js";

export const listCategories = async (req, res) => {
  const { data, error } = await supabase.from("categories").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getCategory = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
};

export const createCategory = async (req, res) => {
  const { name, description } = req.body;
  const { data, error } = await supabase.from("categories").insert([{ name, description }]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const { data, error } = await supabase.from("categories").update({ name, description }).eq("id", id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Category deleted" });
};
