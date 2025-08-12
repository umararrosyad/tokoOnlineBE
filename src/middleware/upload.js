// src/middlewares/upload.middleware.js
import multer from 'multer';

const storage = multer.memoryStorage(); // simpan di RAM dulu sebelum upload ke Supabase
export const upload = multer({ storage });
