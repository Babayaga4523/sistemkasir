# ☕ WARKOPKITA POS PRO - Sistem Kasir Modern Warkop & Cafe

Sistem Kasir (Point of Sale) modern & responsif yang dirancang khusus untuk operasional warung kopi (warkop) dan cafe kekinian. Dilengkapi sistem Kitchen Display System (KDS), struk thermal 58mm/80mm, kalkulasi pajak PB1 & diskon member, manajemen menu, laporan omzet, serta dukungan database lokal (offline-first) dan integrasi cloud Supabase.

---

## 🚀 Menjalankan Aplikasi dengan Docker

Proyek ini telah dikonfigurasi penuh dengan **Docker** (multi-stage standalone Next.js) dan **Docker Compose**.

### Prasyarat
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/) sudah terpasang di komputer Anda.

### 1. Menjalankan Container (Satu Perintah)
Jalankan perintah berikut di root folder project:

```bash
docker compose up --build -d
```

### 2. Akses Aplikasi
Buka browser dan buka alamat:
```
http://localhost:3000
```

### 3. Menghentikan Container
```bash
docker compose down
```

### 4. Melihat Log Container
```bash
docker compose logs -f
```

---

## 🛠️ Menjalankan Secara Lokal (Node.js)

```bash
# 1. Install dependensi
npm install

# 2. Jalankan mode development
npm run dev

# 3. Jalankan mode build produksi
npm run build
npm run start
```

---

## ✨ Fitur Utama

1. **Kasir Cepat & Custom Order (POS)**:
   - Pencarian real-time menu kopi, mie, camilan, dan minuman dingin.
   - Pilihan kustomisasi suhu (Panas/Dingin), level gula (Normal/Less Sugar), ekstra shot espresso, dan catatan khusus dapur.
   - Pilihan tipe pesanan: *Makan di Sini (No. Meja)* atau *Bawa Pulang*.
   - Diskon member & kalkulasi pajak resto (PB1 10%).
   - Pembayaran tunai (hitung kembalian otomatis), QRIS instan, dan transfer bank.

2. **Kitchen & Bar Display System (KDS)**:
   - Antrean pesanan masuk real-time untuk barista dan koki.
   - Alur status tiket: `Pesanan Masuk` ➡️ `Sedang Diracik` ➡️ `Siap Disajikan` ➡️ `Selesai / Sudah Diantar`.
   - Timer elapsed waktu tunggu per pesanan.

3. **Laporan & Riwayat Penjualan**:
   - Ringkasan total omzet, jumlah transaksi, rata-rata nota (AOV), dan total porsi terjual.
   - Grafik Top 5 Menu Terlaris dan pembagian metode pembayaran.
   - Riwayat transaksi dengan filter status, pencarian nota, dan fitur **Cetak Ulang Struk**.
   - Export rekap laporan transaksi ke format **CSV**.

4. **Manajemen Menu & Stok**:
   - Tambah dan edit menu (nama, kategori, harga jual, HPP / modal, emoji).
   - Saklar status stok (*Tersedia* / *Habis*).
   - Tombol *Reset Default* untuk mengembalikan menu standar warkop.

5. **Dukungan Cloud Supabase & Offline Mode**:
   - Bekerja secara instan secara offline menggunakan penyimpanan browser.
   - Tombol koneksi Supabase di header untuk sinkronisasi cloud real-time.
   - Skema database SQL lengkap tersedia di file `supabase/schema.sql`.

---

## 📁 Struktur File Penting

- [`Dockerfile`](Dockerfile): Multi-stage Docker build untuk image produksi Next.js standalone yang ringan dan aman.
- [`docker-compose.yml`](docker-compose.yml): Konfigurasi orchestration container untuk port `3000:3000`.
- [`supabase/schema.sql`](supabase/schema.sql): Skema tabel PostgreSQL & Row Level Security (RLS) untuk Supabase.
- [`src/app/page.js`](src/app/page.js): Komponen root aplikasi kasir.
- [`src/components/CartSidebar.js`](src/components/CartSidebar.js): Sidebar keranjang belanja responsif.
- [`src/components/KitchenScreen.js`](src/components/KitchenScreen.js): Layar display dapur (KDS).
- [`src/components/ReportScreen.js`](src/components/ReportScreen.js): Layar laporan transaksi & analitik.
- [`src/components/MenuManagementScreen.js`](src/components/MenuManagementScreen.js): Layar kelola menu & stok warkop.
