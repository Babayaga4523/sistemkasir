/**
 * Helper validasi & terjemahan pesan error Supabase Auth ke Bahasa Indonesia ramah pengguna.
 */

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(email.trim());
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: 'Kosong', color: '#6b7280' };
  if (password.length < 6) return { score: 0, label: 'Terlalu Pendek (min 6 karakter)', color: '#ef4444' };

  let score = 1; // Base score untuk minimal 6 karakter
  if (password.length >= 8) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, label: 'Lemah', color: '#f87171' };
  if (score === 2) return { score: 2, label: 'Cukup', color: '#f59e0b' };
  if (score === 3) return { score: 3, label: 'Kuat', color: '#10b981' };
  return { score: 4, label: 'Sangat Kuat', color: '#059669' };
}

export function formatAuthError(error) {
  if (!error) return 'Terjadi kesalahan autentikasi.';
  const msg = typeof error === 'string' ? error : (error.message || '');
  const lower = msg.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant')) {
    return 'Email atau kata sandi tidak sesuai. Periksa kembali atau daftar akun baru.';
  }
  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
    return 'Email Anda belum diverifikasi. Silakan periksa inbox/spam email Anda untuk klik link aktivasi.';
  }
  if (lower.includes('user already registered') || lower.includes('email_address_already_in_use') || lower.includes('already registered')) {
    return 'Alamat email ini sudah terdaftar. Silakan masuk menggunakan tab Masuk Kasir.';
  }
  if (lower.includes('password should be at least 6 characters') || lower.includes('weak_password')) {
    return 'Kata sandi minimal harus 6 karakter.';
  }
  if (lower.includes('over_email_send_rate_limit') || lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Terlalu banyak permintaan dalam waktu singkat. Mohon tunggu 1-2 menit sebelum mencoba lagi.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('networkerror')) {
    return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
  }
  if (lower.includes('unable to validate email address') || lower.includes('invalid email')) {
    return 'Format alamat email tidak valid. Pastikan penulisan benar (contoh: kasir@warkop.id).';
  }
  if (lower.includes('same_password') || lower.includes('should be different')) {
    return 'Kata sandi baru tidak boleh sama dengan kata sandi lama.';
  }

  return msg;
}
