import { supabase } from '../supabase';

/**
 * Upload image to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} bucket - Storage bucket name (e.g., 'product-images', 'order-images')
 * @param {string} path - Path/folder in bucket (e.g., 'products/frame-1', 'orders/ORD-1025')
 * @returns {Promise<{url: string, path: string, error: null} | {url: null, path: null, error: string}>}
 */
export const uploadImage = async (file, bucket = 'product-images', path = '') => {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${random}.${extension}`;

    // Build full path
    const fullPath = path ? `${path}/${filename}` : filename;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error details:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fullPath);

    return {
      url: urlData.publicUrl,
      path: fullPath,
      error: null,
    };
  } catch (err) {
    console.error('Image upload error:', err);
    return {
      url: null,
      path: null,
      error: err.message,
    };
  }
};

/**
 * Upload product image
 */
export const uploadProductImage = (file) => {
  return uploadImage(file, 'product-images', `products/${Date.now()}`);
};

/**
 * Upload customer image for order customization
 */
export const uploadOrderImage = (file, orderNumber) => {
  return uploadImage(file, 'order-images', `orders/${orderNumber}`);
};

/**
 * Upload category image
 */
export const uploadCategoryImage = (file) => {
  return uploadImage(file, 'category-images', `categories/${Date.now()}`);
};

/**
 * Delete image from Supabase Storage
 */
export const deleteImage = async (bucket, path) => {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (err) {
    console.error('Image delete error:', err);
    return { error: err.message };
  }
};

/**
 * Compress image before upload (for web optimization)
 */
export const compressImage = async (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
    };
  });
};

/**
 * Get image dimensions
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
  });
};
