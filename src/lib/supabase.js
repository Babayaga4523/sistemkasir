import { createClient } from '@supabase/supabase-js';

// Cache client instance
let supabaseInstance = null;
let currentConfig = { url: '', key: '' };

export function getSupabaseConfig() {
  if (typeof window === 'undefined') {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    };
  }

  const storedUrl = localStorage.getItem('warkop_supabase_url');
  const storedKey = localStorage.getItem('warkop_supabase_key');

  return {
    url: storedUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key: storedKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  };
}

export function saveSupabaseConfig(url, key) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('warkop_supabase_url', url.trim());
      localStorage.setItem('warkop_supabase_key', key.trim());
    } else {
      localStorage.removeItem('warkop_supabase_url');
      localStorage.removeItem('warkop_supabase_key');
    }
  }
  supabaseInstance = null; // Reset cached client
}

export function getSupabase() {
  const { url, key } = getSupabaseConfig();

  if (!url || !key) {
    return null;
  }

  if (supabaseInstance && currentConfig.url === url && currentConfig.key === key) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    currentConfig = { url, key };
    return supabaseInstance;
  } catch (err) {
    console.error('Gagal membuat Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url, key) {
  if (!url || !key) {
    return { success: false, message: 'URL dan Anon Key tidak boleh kosong' };
  }

  try {
    const client = createClient(url.trim(), key.trim(), {
      auth: { persistSession: false }
    });
    
    // Test simple select on stores
    const { data, error } = await client.from('stores').select('id').limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          tableWarning: true,
          message: 'Terhubung ke Supabase! Namun tabel multi-tenant belum dibuat. Harap jalankan supabase/schema.sql di SQL Editor.'
        };
      }
      // RLS error is fine as it confirms table exists
      if (error.code === 'PGRST301' || error.message.includes('row-level security') || error.code === '42501') {
        return { success: true, message: 'Koneksi ke Supabase & RLS berhasil terdeteksi!' };
      }
      return { success: false, message: error.message || 'Gagal query Supabase' };
    }

    return { success: true, message: 'Koneksi ke Supabase berhasil & tabel terdeteksi!' };
  } catch (err) {
    return { success: false, message: err.message || 'Koneksi gagal' };
  }
}

// Helper: Compress image to base64 Data URL (max 600x600, quality 0.8) to prevent exceeding browser localStorage limits
function compressImageToBase64(file) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !file) {
      resolve('');
      return;
    }

    // If not an image (or svg), just read as data URL directly
    if (!file.type || !file.type.startsWith('image/') || file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          resolve(e.target?.result || '');
        }
      };
      img.onerror = () => resolve(e.target?.result || '');
      img.src = e.target?.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

// Upload file to Supabase Storage bucket ('menu-images' or 'store-logos') with seamless offline fallback
export async function uploadImageToStorage(bucketName, file, customPath = '') {
  if (!file) return '';

  const supabase = getSupabase();

  if (supabase) {
    try {
      const fileExt = file.name ? file.name.split('.').pop() : 'png';
      const fileName = customPath || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else if (error) {
        console.warn(`Catatan upload Supabase Storage (${bucketName}):`, error.message);
      }
    } catch (err) {
      console.warn('Fallback penyimpanan gambar lokal aktif:', err?.message || err);
    }
  }

  // Graceful Offline / Local Base64 fallback (compressed, guaranteed safe, no credentials required)
  return await compressImageToBase64(file);
}
