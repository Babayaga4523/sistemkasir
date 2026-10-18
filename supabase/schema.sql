-- ===================================================
-- WARKOP & CAFE POS - MULTI-TENANT SUPABASE SCHEMA
-- Setiap user memiliki 1 Store (Kafe) sendiri.
-- Data terisolasi penuh berdasarkan user_id / store_id via RLS.
-- ===================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabel Stores (Profil Kafe / Tenant)
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  currency TEXT DEFAULT 'IDR',
  logo_url TEXT DEFAULT '',
  receipt_footer TEXT DEFAULT 'Terima kasih atas kunjungan Anda!',
  tax_percentage NUMERIC DEFAULT 10,
  tax_enabled BOOLEAN DEFAULT false,
  service_charge_percentage NUMERIC DEFAULT 5,
  service_charge_enabled BOOLEAN DEFAULT false,
  payment_methods JSONB DEFAULT '{"cash": true, "qris": true, "transfer": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Kategori Menu (Per Store)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'Coffee',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Produk / Menu (Per Store)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  image_url TEXT DEFAULT '☕',
  available BOOLEAN DEFAULT TRUE,
  has_options BOOLEAN DEFAULT FALSE,
  options JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Pesanan / Transaksi (Per Store)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT NOT NULL,
  customer_name TEXT DEFAULT 'Pelanggan',
  table_number TEXT DEFAULT '',
  order_type TEXT DEFAULT 'dine_in', -- 'dine_in' atau 'takeaway'
  status TEXT DEFAULT 'pending', -- 'pending', 'brewing', 'ready', 'completed', 'cancelled'
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  service_charge NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash', -- 'cash', 'qris', 'transfer', 'debit'
  amount_paid NUMERIC DEFAULT 0,
  change_amount NUMERIC DEFAULT 0,
  cashier_name TEXT DEFAULT 'Kasir',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 6. Tabel Detail Item Pesanan (Per Store)
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_options JSONB DEFAULT '{}'::jsonb,
  notes TEXT DEFAULT '',
  subtotal NUMERIC NOT NULL DEFAULT 0
);

-- 7. ENABLE ROW LEVEL SECURITY (RLS) WAJIB
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 8. POLICIES RLS MULTI-TENANT ISOLATION

-- Drop existing policies if any to prevent duplicate errors
DROP POLICY IF EXISTS "Users can view own store" ON stores;
DROP POLICY IF EXISTS "Users can create own store" ON stores;
DROP POLICY IF EXISTS "Users can update own store" ON stores;
DROP POLICY IF EXISTS "Users can delete own store" ON stores;

DROP POLICY IF EXISTS "Users can view categories of own store" ON categories;
DROP POLICY IF EXISTS "Users can insert categories to own store" ON categories;
DROP POLICY IF EXISTS "Users can update categories in own store" ON categories;
DROP POLICY IF EXISTS "Users can delete categories from own store" ON categories;

DROP POLICY IF EXISTS "Users can view products of own store" ON products;
DROP POLICY IF EXISTS "Users can insert products to own store" ON products;
DROP POLICY IF EXISTS "Users can update products in own store" ON products;
DROP POLICY IF EXISTS "Users can delete products from own store" ON products;

DROP POLICY IF EXISTS "Users can view orders of own store" ON orders;
DROP POLICY IF EXISTS "Users can insert orders to own store" ON orders;
DROP POLICY IF EXISTS "Users can update orders in own store" ON orders;
DROP POLICY IF EXISTS "Users can delete orders from own store" ON orders;

DROP POLICY IF EXISTS "Users can view order items of own store" ON order_items;
DROP POLICY IF EXISTS "Users can insert order items to own store" ON order_items;
DROP POLICY IF EXISTS "Users can update order items in own store" ON order_items;
DROP POLICY IF EXISTS "Users can delete order items from own store" ON order_items;

-- Stores Policies: User hanya bisa akses store miliknya sendiri
CREATE POLICY "Users can view own store" ON stores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own store" ON stores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own store" ON stores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own store" ON stores
  FOR DELETE USING (auth.uid() = user_id);

-- Categories Policies
CREATE POLICY "Users can view categories of own store" ON categories
  FOR SELECT USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert categories to own store" ON categories
  FOR INSERT WITH CHECK (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can update categories in own store" ON categories
  FOR UPDATE USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete categories from own store" ON categories
  FOR DELETE USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- Products Policies
CREATE POLICY "Users can view products of own store" ON products
  FOR SELECT USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert products to own store" ON products
  FOR INSERT WITH CHECK (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can update products in own store" ON products
  FOR UPDATE USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete products from own store" ON products
  FOR DELETE USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- Orders Policies
CREATE POLICY "Users can view orders of own store" ON orders
  FOR SELECT USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert orders to own store" ON orders
  FOR INSERT WITH CHECK (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can update orders in own store" ON orders
  FOR UPDATE USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete orders from own store" ON orders
  FOR DELETE USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- Order Items Policies
CREATE POLICY "Users can view order items of own store" ON order_items
  FOR SELECT USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert order items to own store" ON order_items
  FOR INSERT WITH CHECK (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can update order items in own store" ON order_items
  FOR UPDATE USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete order items from own store" ON order_items
  FOR DELETE USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- 9. Storage Buckets (menu-images & store-logos)
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('menu-images', 'menu-images', true),
  ('store-logos', 'store-logos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read store-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload store-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update store-logos" ON storage.objects;

CREATE POLICY "Public read menu-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Authenticated users upload menu-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users update menu-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public read store-logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-logos');

CREATE POLICY "Authenticated users upload store-logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'store-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users update store-logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'store-logos' AND auth.role() = 'authenticated');
