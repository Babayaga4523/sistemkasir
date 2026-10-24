import { getSupabase } from './supabase';
import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS, INITIAL_SAMPLE_ORDERS, DEFAULT_DISCOUNTS } from './defaultData';

const DEMO_STORE_ID = 'demo-store-001';

export const DEMO_STORE = {
  id: DEMO_STORE_ID,
  user_id: 'demo-user-001',
  name: 'Warkop Kita Pro',
  address: 'Jl. Pemuda No. 45, Jakarta Selatan',
  phone: '0812-3456-7890',
  currency: 'IDR',
  logo_url: '',
  receipt_footer: 'Matur nuwun sampun rawuh! Wifi: kopikita / IG: @warkopkitapro',
  tax_percentage: 10,
  tax_enabled: false,
  service_charge_percentage: 5,
  service_charge_enabled: false,
  payment_methods: { cash: true, qris: true, transfer: true },
  discounts: DEFAULT_DISCOUNTS
};

const STORAGE_KEYS = {
  STORE: 'warkop_store_profile',
  CATEGORIES: 'warkop_categories_v2',
  PRODUCTS: 'warkop_products_v2',
  ORDERS: 'warkop_orders_v2'
};

// Inisialisasi fallback data lokal
export function initLocalData() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.STORE)) {
    localStorage.setItem(STORAGE_KEYS.STORE, JSON.stringify(DEMO_STORE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES.map(c => ({ ...c, store_id: DEMO_STORE_ID }))));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS.map(p => ({ ...p, store_id: DEMO_STORE_ID, image_url: p.image }))));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_SAMPLE_ORDERS.map(o => ({ ...o, store_id: DEMO_STORE_ID }))));
  }
}

// ==========================================
// STORE (TENANT) OPERATIONS
// ==========================================

export async function getStoreByUserId(userId) {
  const supabase = getSupabase();
  let storeResult = null;

  if (supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        storeResult = {
          ...data,
          qris_payload: data.qris_payload || data.payment_methods?.qris_payload || '',
          qris_dynamic_enabled: data.qris_dynamic_enabled !== undefined 
            ? data.qris_dynamic_enabled 
            : (data.payment_methods?.qris_dynamic_enabled !== false),
          bank_name: data.bank_name || data.payment_methods?.bank_name || 'BCA',
          bank_account_number: data.bank_account_number || data.payment_methods?.bank_account_number || '',
          bank_account_name: data.bank_account_name || data.payment_methods?.bank_account_name || '',
          wifi_ssid: data.wifi_ssid || data.payment_methods?.wifi_ssid || '',
          wifi_password: data.wifi_password || data.payment_methods?.wifi_password || '',
          opening_hours: data.opening_hours || data.payment_methods?.opening_hours || '08:00 - 24:00 WIB',
          table_count: data.table_count || data.payment_methods?.table_count || 15,
          instagram_handle: data.instagram_handle || data.payment_methods?.instagram_handle || '',
          takeaway_fee_enabled: data.takeaway_fee_enabled !== undefined ? data.takeaway_fee_enabled : data.payment_methods?.takeaway_fee_enabled,
          takeaway_fee: data.takeaway_fee !== undefined ? data.takeaway_fee : (data.payment_methods?.takeaway_fee || 1000),
          discounts: data.discounts || data.payment_methods?.discounts || DEFAULT_DISCOUNTS
        };
      }
    } catch (err) {
      console.warn('Gagal ambil store dari Supabase:', err);
    }
  }

  // Merge with any extended local settings with STRICT tenant isolation
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(STORAGE_KEYS.STORE);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (storeResult) {
          // Hanya merge jika data local storage benar-benar milik store/user ini
          if (parsed && (parsed.id === storeResult.id || parsed.user_id === userId)) {
            storeResult = { ...storeResult, ...parsed };
          }
        } else if (parsed && parsed.user_id === userId) {
          storeResult = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
  return storeResult;
}

export async function createStore(storeData, userId) {
  const supabase = getSupabase();
  const payload = {
    user_id: userId,
    name: storeData.name || 'Warkop Saya',
    address: storeData.address || '',
    phone: storeData.phone || '',
    currency: storeData.currency || 'IDR',
    logo_url: storeData.logo_url || '',
    receipt_footer: storeData.receipt_footer || 'Terima kasih atas kunjungan Anda!',
    tax_percentage: Number(storeData.tax_percentage) || 10,
    tax_enabled: Boolean(storeData.tax_enabled),
    service_charge_percentage: Number(storeData.service_charge_percentage) || 5,
    service_charge_enabled: Boolean(storeData.service_charge_enabled),
    payment_methods: storeData.payment_methods || { cash: true, qris: true, transfer: true }
  };

  // 1. Coba buat via Server API Route (memakai Supabase Service Role - aman dari RLS 42501 & 401)
  if (typeof window !== 'undefined' && userId) {
    try {
      const res = await fetch('/api/store/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeData, userId })
      });
      if (res.ok) {
        const resJson = await res.json();
        if (resJson?.store) {
          const createdStore = resJson.store;
          localStorage.setItem(STORAGE_KEYS.STORE, JSON.stringify(createdStore));

          if (createdStore.id && storeData.seedDefaultMenu) {
            try {
              await seedStoreDefaultMenu(createdStore.id);
            } catch (e) {
              console.warn('Gagal auto-seed menu awal store:', e);
            }
          }
          return createdStore;
        }
      }
    } catch (apiErr) {
      console.warn('API route /api/store/create gagal, beralih ke client-side:', apiErr);
    }
  }

  // 2. Fallback Client-side Supabase Upsert
  if (supabase && userId) {
    const { data, error } = await supabase
      .from('stores')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Gagal createStore di Supabase:', error);
      throw error;
    }

    // Hanya seed menu default jika user memilih opsi centang "Muat Template Menu"
    if (data?.id && storeData.seedDefaultMenu) {
      try {
        await seedStoreDefaultMenu(data.id);
      } catch (e) {
        console.warn('Gagal auto-seed menu awal store:', e);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.STORE, JSON.stringify(data));
    }
    return data;
  }

  // Local Storage fallback
  const localStore = { ...payload, id: `store-${Date.now()}` };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.STORE, JSON.stringify(localStore));
  }
  return localStore;
}

export async function updateStore(storeId, updateData) {
  const supabase = getSupabase();
  const payload = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  const paymentMethodsPayload = {
    ...(typeof payload.payment_methods === 'object' ? payload.payment_methods : {}),
    qris_payload: payload.qris_payload || '',
    qris_dynamic_enabled: payload.qris_dynamic_enabled !== false,
    bank_name: payload.bank_name || '',
    bank_account_number: payload.bank_account_number || '',
    bank_account_name: payload.bank_account_name || '',
    wifi_ssid: payload.wifi_ssid || '',
    wifi_password: payload.wifi_password || '',
    opening_hours: payload.opening_hours || '',
    table_count: Number(payload.table_count) || 15,
    instagram_handle: payload.instagram_handle || '',
    takeaway_fee_enabled: Boolean(payload.takeaway_fee_enabled),
    takeaway_fee: Number(payload.takeaway_fee) || 0,
    discounts: Array.isArray(payload.discounts) ? payload.discounts : []
  };

  let savedData = null;

  // 1. Coba update via Server API Route (memakai Supabase Service Role - aman dari RLS & 400 Bad Request)
  if (typeof window !== 'undefined' && storeId && !storeId.startsWith('demo-')) {
    try {
      const res = await fetch('/api/store/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, updateData: { ...payload, payment_methods: paymentMethodsPayload } })
      });
      if (res.ok) {
        const resJson = await res.json();
        if (resJson?.store) {
          savedData = resJson.store;
        }
      }
    } catch (apiErr) {
      console.warn('API route /api/store/update gagal, beralih ke client Supabase:', apiErr);
    }
  }

  // 2. Fallback Direct Supabase Update dengan Sanitasi Kolom Ketat (Hanya kolom resmi skema stores)
  if (!savedData && supabase && storeId && !storeId.startsWith('demo-')) {
    const corePayload = {
      name: (payload.name || '').trim(),
      address: (payload.address || '').trim(),
      phone: (payload.phone || '').trim(),
      currency: payload.currency || 'IDR',
      logo_url: payload.logo_url || '',
      receipt_footer: (payload.receipt_footer || '').trim(),
      tax_percentage: Number(payload.tax_percentage) || 0,
      tax_enabled: Boolean(payload.tax_enabled),
      service_charge_percentage: Number(payload.service_charge_percentage) || 0,
      service_charge_enabled: Boolean(payload.service_charge_enabled),
      payment_methods: paymentMethodsPayload,
      updated_at: payload.updated_at
    };

    try {
      const { data, error } = await supabase
        .from('stores')
        .update(corePayload)
        .eq('id', storeId)
        .select()
        .single();

      if (!error && data) {
        savedData = {
          ...data,
          ...payload,
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
      } else if (error) {
        console.warn('Direct Supabase store update error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase updateStore error:', err);
    }
  }

  const finalMerged = {
    ...(savedData || payload),
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
    discounts: paymentMethodsPayload.discounts,
    id: storeId,
    updated_at: payload.updated_at
  };

  // Always sync to local storage with strict store ID check
  if (typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.STORE) || '{}');
    const isSameStore = !existing.id || existing.id === storeId;
    const finalStored = { ...(isSameStore ? existing : {}), ...finalMerged };
    localStorage.setItem(STORAGE_KEYS.STORE, JSON.stringify(finalStored));
    return finalStored;
  }

  return finalMerged;
}

// ==========================================
// CATEGORIES OPERATIONS (MULTI-TENANT)
// ==========================================

export async function getCategories(storeId) {
  const supabase = getSupabase();
  if (supabase && storeId && !storeId.startsWith('demo-')) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', storeId)
        .order('sort_order', { ascending: true });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('Gagal ambil kategori dari Supabase:', err);
    }
    return []; // Supabase store returns empty array if no categories created yet
  }

  // Fallback LocalStorage HANYA untuk demo/offline
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return parsed.filter(c => !c.store_id || c.store_id === storeId || storeId === DEMO_STORE_ID);
      } catch (e) {
        console.error(e);
      }
    }
  }
  return DEFAULT_CATEGORIES;
}

export async function saveCategory(category, storeId) {
  const supabase = getSupabase();
  const isNew = !category.id;
  const payload = {
    store_id: storeId,
    name: category.name,
    icon: category.icon || 'Coffee',
    sort_order: Number(category.sort_order) || 0
  };

  if (supabase && storeId && !storeId.startsWith('demo-')) {
    if (isNew) {
      const { data, error } = await supabase
        .from('categories')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', category.id)
        .eq('store_id', storeId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  // Local storage fallback
  if (typeof window !== 'undefined') {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    let updated;
    if (isNew) {
      const newCat = { ...payload, id: `cat-${Date.now()}` };
      updated = [...local, newCat];
    } else {
      updated = local.map(c => c.id === category.id ? { ...c, ...payload } : c);
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    return isNew ? updated[updated.length - 1] : category;
  }
}

export async function deleteCategory(categoryId, storeId) {
  const supabase = getSupabase();
  if (supabase && storeId && !storeId.startsWith('demo-')) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('store_id', storeId);
    if (error) throw error;
    return true;
  }

  // Local storage fallback
  if (typeof window !== 'undefined') {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    const filtered = local.filter(c => c.id !== categoryId);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
  }
  return true;
}

// ==========================================
// PRODUCTS OPERATIONS (MULTI-TENANT)
// ==========================================

export async function getProducts(storeId) {
  const supabase = getSupabase();
  if (supabase && storeId && !storeId.startsWith('demo-')) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map(item => ({
          ...item,
          image: item.image_url || item.image || '☕',
          options: Array.isArray(item.options) ? item.options : (typeof item.options === 'string' ? JSON.parse(item.options) : [])
        }));
      }
    } catch (err) {
      console.warn('Gagal ambil produk dari Supabase:', err);
    }
    return []; // Supabase store returns empty array if no products created yet
  }

  // Fallback LocalStorage HANYA untuk demo/offline
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return parsed.filter(p => !p.store_id || p.store_id === storeId || storeId === DEMO_STORE_ID);
      } catch (e) {
        console.error(e);
      }
    }
  }
  return DEFAULT_PRODUCTS;
}

export async function saveProduct(product, storeId) {
  const supabase = getSupabase();
  const isNew = !product.id;
  const payload = {
    store_id: storeId,
    category_id: product.category_id || null,
    name: product.name,
    description: product.description || '',
    price: Number(product.price) || 0,
    cost_price: Number(product.cost_price) || 0,
    image_url: product.image_url || product.image || '☕',
    available: product.available !== false,
    has_options: Boolean(product.has_options),
    options: product.options || [],
    updated_at: new Date().toISOString()
  };

  if (supabase && storeId && !storeId.startsWith('demo-')) {
    if (isNew) {
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return { ...data, image: data.image_url };
    } else {
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', product.id)
        .eq('store_id', storeId)
        .select()
        .single();
      if (error) throw error;
      return { ...data, image: data.image_url };
    }
  }

  // Local storage fallback
  if (typeof window !== 'undefined') {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    let updated;
    const finalProd = { ...payload, image: payload.image_url, id: product.id || `prod-${Date.now()}` };
    if (isNew) {
      updated = [finalProd, ...local];
    } else {
      updated = local.map(p => p.id === product.id ? finalProd : p);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    return finalProd;
  }
}

export async function deleteProduct(productId, storeId) {
  const supabase = getSupabase();
  if (supabase && storeId && !storeId.startsWith('demo-')) {
    try {
      // 1. Attempt direct delete from products
      let { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('store_id', storeId);

      // 2. If blocked by foreign key constraint (23503) from order_items
      if (error && (error.code === '23503' || error.message?.includes('violates foreign key constraint'))) {
        console.warn('Produk memiliki riwayat di order_items, mencoba melepaskan foreign key...');
        const { error: detachError } = await supabase
          .from('order_items')
          .update({ product_id: null })
          .eq('product_id', productId);

        if (!detachError) {
          const retryRes = await supabase
            .from('products')
            .delete()
            .eq('id', productId)
            .eq('store_id', storeId);
          error = retryRes.error;
        } else {
          // If order_items.product_id has a NOT NULL constraint, mark product unavailable
          console.warn('Tidak dapat null-kan product_id, mengarsipkan produk:', detachError);
          const archiveRes = await supabase
            .from('products')
            .update({ available: false })
            .eq('id', productId)
            .eq('store_id', storeId);
          if (archiveRes.error) throw archiveRes.error;
          return true;
        }
      }

      if (error) {
        console.error('Supabase delete product error:', error);
        throw error;
      }
      return true;
    } catch (err) {
      console.error('Gagal menghapus produk di Supabase:', err);
      throw err;
    }
  }

  // Local storage fallback
  if (typeof window !== 'undefined') {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const filtered = local.filter(p => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  }
  return true;
}

export async function toggleProductAvailability(productId, available, storeId) {
  const supabase = getSupabase();
  if (supabase && storeId && !storeId.startsWith('demo-')) {
    const { error } = await supabase
      .from('products')
      .update({ available })
      .eq('id', productId)
      .eq('store_id', storeId);
    if (error) throw error;
    return true;
  }

  // Local storage fallback
  if (typeof window !== 'undefined') {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const updated = local.map(p => p.id === productId ? { ...p, available } : p);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  }
  return true;
}

// ==========================================
// ORDERS & TRANSACTIONS (MULTI-TENANT)
// ==========================================

export async function getOrders(storeId) {
  const supabase = getSupabase();
  if (supabase && storeId && !storeId.startsWith('demo-')) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('Gagal ambil orders dari Supabase:', err);
    }
    return []; // Supabase store returns empty array if no transactions yet
  }

  // Fallback LocalStorage HANYA untuk demo/offline
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return parsed.filter(o => !o.store_id || o.store_id === storeId || storeId === DEMO_STORE_ID);
      } catch (e) {
        console.error(e);
      }
    }
  }
  return INITIAL_SAMPLE_ORDERS;
}

export async function createOrder(orderData, storeId) {
  const supabase = getSupabase();
  const orderNumber = orderData.order_number || `ORD-${Date.now().toString().slice(-4)}`;

  const orderPayload = {
    store_id: storeId,
    order_number: orderNumber,
    customer_name: orderData.customer_name || 'Pelanggan',
    table_number: orderData.table_number || '',
    order_type: orderData.order_type || 'dine_in',
    status: orderData.status || 'pending',
    subtotal: Number(orderData.subtotal) || 0,
    discount: Number(orderData.discount) || 0,
    tax: Number(orderData.tax) || 0,
    service_charge: Number(orderData.service_charge) || 0,
    total: Number(orderData.total) || 0,
    payment_method: orderData.payment_method || 'cash',
    amount_paid: Number(orderData.amount_paid) || 0,
    change_amount: Number(orderData.change_amount) || 0,
    cashier_name: orderData.cashier_name || 'Kasir',
    notes: orderData.notes || '',
    created_at: new Date().toISOString(),
    completed_at: orderData.status === 'completed' ? new Date().toISOString() : null
  };

  if (supabase && storeId && !storeId.startsWith('demo-')) {
    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    if (orderData.items && orderData.items.length > 0) {
      const itemsPayload = orderData.items.map(it => ({
        store_id: storeId,
        order_id: createdOrder.id,
        product_id: it.product_id || null,
        product_name: it.product_name,
        price: Number(it.price) || 0,
        quantity: Number(it.quantity) || 1,
        selected_options: it.selected_options || {},
        notes: it.notes || '',
        subtotal: Number(it.subtotal || it.price * it.quantity)
      }));

      const { data: createdItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsPayload)
        .select();

      if (itemsError) console.error('Gagal simpan order_items:', itemsError);

      return {
        ...createdOrder,
        items: createdItems || orderData.items
      };
    }

    return createdOrder;
  }

  // Local storage fallback
  const finalLocalOrder = {
    ...orderPayload,
    id: `ord-${Date.now()}`,
    items: orderData.items || []
  };

  if (typeof window !== 'undefined') {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([finalLocalOrder, ...local]));
  }
  return finalLocalOrder;
}

export async function updateOrderStatus(orderId, status, storeId) {
  const supabase = getSupabase();
  const updateData = {
    status,
    ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
  };

  if (supabase && storeId && !storeId.startsWith('demo-')) {
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .eq('store_id', storeId);

    if (error) throw error;
    return true;
  }

  // Local storage fallback
  if (typeof window !== 'undefined') {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const updated = local.map(o => o.id === orderId ? { ...o, ...updateData } : o);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  }
  return true;
}

export async function settleOrderPayment(orderId, paymentDetails, storeId) {
  const supabase = getSupabase();
  const updateData = {
    payment_method: paymentDetails.payment_method || 'cash',
    payment_status: 'paid',
    amount_paid: Number(paymentDetails.amount_paid) || 0,
    change_amount: Number(paymentDetails.change_amount) || 0,
    status: 'completed',
    completed_at: new Date().toISOString()
  };

  if (supabase && storeId && !storeId.startsWith('demo-')) {
    // Only send columns that exist in the Supabase orders schema
    const supabasePayload = {
      payment_method: updateData.payment_method,
      amount_paid: updateData.amount_paid,
      change_amount: updateData.change_amount,
      status: updateData.status,
      completed_at: updateData.completed_at
    };

    const { data, error } = await supabase
      .from('orders')
      .update(supabasePayload)
      .eq('id', orderId)
      .eq('store_id', storeId)
      .select()
      .single();

    if (error) throw error;
    return { ...data, payment_status: 'paid' };
  }

  // Local storage fallback
  if (typeof window !== 'undefined') {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    let updatedOrder = null;
    const updated = local.map(o => {
      if (o.id === orderId) {
        updatedOrder = { ...o, ...updateData };
        return updatedOrder;
      }
      return o;
    });
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    return updatedOrder || updateData;
  }
  return updateData;
}

// ==========================================
// SEED DEFAULT MENU FOR NEW STORE
// ==========================================

export async function seedStoreDefaultMenu(storeId) {
  const supabase = getSupabase();
  if (!supabase || !storeId || storeId.startsWith('demo-')) return;

  try {
    // 1. Insert categories
    const categoriesPayload = DEFAULT_CATEGORIES.map(c => ({
      store_id: storeId,
      name: c.name,
      icon: c.icon,
      sort_order: c.sort_order
    }));

    const { data: insertedCategories, error: catError } = await supabase
      .from('categories')
      .insert(categoriesPayload)
      .select();

    if (catError) {
      console.warn('Gagal seed kategori:', catError);
      return;
    }

    // Map old category IDs to new UUIDs
    const catMap = {};
    DEFAULT_CATEGORIES.forEach((c, idx) => {
      if (insertedCategories[idx]) {
        catMap[c.id] = insertedCategories[idx].id;
      }
    });

    // 2. Insert products
    const productsPayload = DEFAULT_PRODUCTS.map(p => ({
      store_id: storeId,
      category_id: catMap[p.category_id] || insertedCategories[0]?.id || null,
      name: p.name,
      description: p.description || '',
      price: p.price,
      cost_price: p.cost_price || 0,
      image_url: p.image || '☕',
      available: true,
      has_options: p.has_options || false,
      options: p.options || []
    }));

    const { error: prodError } = await supabase
      .from('products')
      .insert(productsPayload);

    if (prodError) {
      console.warn('Gagal seed produk:', prodError);
    }
  } catch (e) {
    console.error('Error saat seeding store default menu:', e);
  }
}

export async function seedSupabaseFromLocal(customStoreId) {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, message: 'Supabase belum terhubung.' };
  }

  try {
    let storeId = customStoreId;
    if (!storeId) {
      // Coba ambil store pertama milik user yang login
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const store = await getStoreByUserId(user.id);
        storeId = store?.id;
      }
    }

    if (!storeId) {
      return { success: false, message: 'Silakan buat atau login ke profil kafe terlebih dahulu.' };
    }

    await seedStoreDefaultMenu(storeId);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || 'Gagal seed data ke Supabase.' };
  }
}

