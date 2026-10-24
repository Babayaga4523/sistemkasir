import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { storeId, updateData } = body;

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID wajib disertakan.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Konfigurasi service role Supabase belum terpasang di server.' }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const paymentMethodsPayload = {
      ...(typeof updateData?.payment_methods === 'object' ? updateData.payment_methods : {}),
      qris_payload: updateData?.qris_payload || '',
      qris_dynamic_enabled: updateData?.qris_dynamic_enabled !== false,
      bank_name: updateData?.bank_name || '',
      bank_account_number: updateData?.bank_account_number || '',
      bank_account_name: updateData?.bank_account_name || '',
      wifi_ssid: updateData?.wifi_ssid || '',
      wifi_password: updateData?.wifi_password || '',
      opening_hours: updateData?.opening_hours || '',
      table_count: Number(updateData?.table_count) || 15,
      instagram_handle: updateData?.instagram_handle || '',
      takeaway_fee_enabled: Boolean(updateData?.takeaway_fee_enabled),
      takeaway_fee: Number(updateData?.takeaway_fee) || 0,
      discounts: Array.isArray(updateData?.discounts) ? updateData.discounts : []
    };

    // Only include valid database schema columns for 'stores'
    const corePayload = {
      name: (updateData?.name || '').trim(),
      address: (updateData?.address || '').trim(),
      phone: (updateData?.phone || '').trim(),
      currency: updateData?.currency || 'IDR',
      logo_url: updateData?.logo_url || '',
      receipt_footer: (updateData?.receipt_footer || '').trim(),
      tax_percentage: Number(updateData?.tax_percentage) || 0,
      tax_enabled: Boolean(updateData?.tax_enabled),
      service_charge_percentage: Number(updateData?.service_charge_percentage) || 0,
      service_charge_enabled: Boolean(updateData?.service_charge_enabled),
      payment_methods: paymentMethodsPayload,
      updated_at: new Date().toISOString()
    };

    const { data: updatedStore, error: updateError } = await adminClient
      .from('stores')
      .update(corePayload)
      .eq('id', storeId)
      .select()
      .single();

    if (updateError) {
      console.error('Server updateStore Supabase error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Return the updated store merged with unpack fields
    const fullStore = {
      ...updatedStore,
      ...updateData,
      payment_methods: paymentMethodsPayload,
      qris_payload: paymentMethodsPayload.qris_payload,
      qris_dynamic_enabled: paymentMethodsPayload.qris_dynamic_enabled,
      bank_name: paymentMethodsPayload.bank_name,
      bank_account_number: paymentMethodsPayload.bank_account_number,
      bank_account_name: paymentMethodsPayload.bank_account_name,
      wifi_ssid: paymentMethodsPayload.wifi_ssid,
      wifi_password: paymentMethodsPayload.wifi_password,
      opening_hours: paymentMethodsPayload.opening_hours,
      table_count: paymentMethodsPayload.table_count,
      instagram_handle: paymentMethodsPayload.instagram_handle,
      takeaway_fee_enabled: paymentMethodsPayload.takeaway_fee_enabled,
      takeaway_fee: paymentMethodsPayload.takeaway_fee,
      discounts: paymentMethodsPayload.discounts
    };

    return NextResponse.json({
      success: true,
      store: fullStore
    });
  } catch (err) {
    console.error('Server updateStore route error:', err);
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan sistem saat memperbarui profil kafe.' }, { status: 500 });
  }
}
