import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidEmail } from '@/utils/authErrors';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, cafeName } = body;

    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: 'Format alamat email tidak valid.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Kata sandi minimal harus 6 karakter.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Konfigurasi service role Supabase belum terpasang di server.' }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const userMetadata = {
      name: (name || cleanEmail.split('@')[0]).trim(),
      cafe_name: (cafeName || '').trim(),
      role: 'owner'
    };

    // 1. Buat user baru dengan email_confirm: true (bypass rate limit email Supabase free tier)
    const { data, error } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: userMetadata
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('email_exists') || msg.includes('already been registered')) {
        return NextResponse.json({
          error: 'Alamat email ini sudah terdaftar. Silakan masuk menggunakan tab Masuk Kasir.'
        }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 2. Otomatis buat data toko langsung di tabel public.stores
    if (data?.user?.id) {
      const storePayload = {
        user_id: data.user.id,
        name: (cafeName || 'Warkop Saya').trim(),
        address: '',
        phone: '',
        currency: 'IDR',
        receipt_footer: 'Terima kasih atas kunjungan Anda!',
        tax_percentage: 10,
        tax_enabled: false,
        service_charge_percentage: 5,
        service_charge_enabled: false,
        payment_methods: { cash: true, qris: true, transfer: true }
      };

      const { error: storeError } = await adminClient
        .from('stores')
        .upsert(storePayload, { onConflict: 'user_id' });

      if (storeError) {
        console.warn('Catatan: Pembuatan store awal di Supabase:', storeError.message);
      }
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Akun berhasil dibuat dan profil toko otomatis terdaftar di Supabase.'
    });
  } catch (err) {
    console.error('Server register handler error:', err);
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan sistem di server.' }, { status: 500 });
  }
}
