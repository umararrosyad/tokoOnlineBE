// src/services/supabase.service.js
import { supabase } from '../config/supabase.js';
import { randomUUID } from 'crypto';

export const uploadImage = async (file) => {
  const fileName = `${Date.now()}-${randomUUID()}-${file.originalname}`;
  const { data, error } = await supabase
    .storage
    .from('product-images')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: publicUrl } = supabase
    .storage
    .from('product-images')
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
};
