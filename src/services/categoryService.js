const supabase = require("../supabase");

async function createCategory(data) {
  return await supabase.from("categories").insert([data]);
}

async function getCategories() {
  return await supabase.from("categories").select("*");
}

async function getCategoryById(id) {
  return await supabase.from("categories").select("*").eq("id", id).single();
}

async function updateCategory(id, data) {
  return await supabase.from("categories").update(data).eq("id", id);
}

async function deleteCategory(id) {
  return await supabase.from("categories").delete().eq("id", id);
}

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
