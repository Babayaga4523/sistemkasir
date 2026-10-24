import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { storeData, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID wajib disertakan.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Konfigurasi service role Supabase belum terpasang di server.' }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const payload = {
      user_id: userId,
      name: (storeData?.name || 'Warkop Saya').trim(),
      address: (storeData?.address || '').trim(),
      phone: (storeData?.phone || '').trim(),
      currency: storeData?.currency || 'IDR',
      logo_url: storeData?.logo_url || '',
      receipt_footer: storeData?.receipt_footer || 'Terima kasih atas kunjungan Anda!',
      tax_percentage: Number(storeData?.tax_percentage) || 10,
      tax_enabled: Boolean(storeData?.tax_enabled),
      service_charge_percentage: Number(storeData?.service_charge_percentage) || 5,
      service_charge_enabled: Boolean(storeData?.service_charge_enabled),
      payment_methods: storeData?.payment_methods || { cash: true, qris: true, transfer: true },
      updated_at: new Date().toISOString()
    };

    const { data: store, error: storeError } = await adminClient
      .from('stores')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (storeError) {
      console.error('Server createStore Supabase error:', storeError);
      return NextResponse.json({ error: storeError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      store
    });
  } catch (err) {
    console.error('Server createStore route error:', err);
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan sistem saat membuat profil kafe.' }, { status: 500 });
  }
}
