const supabase = require("../supabase");
const fs = require("fs");

async function uploadProductImage(filePath, fileName) {
  const fileBuffer = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(fileName, fileBuffer, {
      contentType: "image/jpeg",
      upsert: true
    });

  if (error) throw error;

  const { publicUrl } = supabase.storage.from("product-images").getPublicUrl(fileName).data;
  return publicUrl;
}

module.exports = { uploadProductImage };
