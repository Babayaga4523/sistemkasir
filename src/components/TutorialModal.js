'use client';

import React, { useState } from 'react';
import { 
  X, 
  Coffee, 
  Sliders, 
  ShoppingCart, 
  ChefHat, 
  BarChart3, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Printer,
  Receipt
} from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    step: 1,
    title: '1. Kelola Menu & Kategori Kafe',
    icon: Coffee,
    badge: 'Langkah Pertama',
    color: '#f59e0b',
    description: 'Katalog menu adalah nyawa kafe Anda. Masukkan produk minuman, makanan, atau snack yang Anda jual.',
    points: [
      'Buka menu "Kelola Menu" di bilah atas.',
      'Buat Kategori baru (misal: Kopi, Minuman Segar, Makanan, Cemilan).',
      'Tambahkan Produk dengan Nama, Kategori, Harga Modal (HPP), dan Harga Jual.',
      'Unggah foto menu asli atau pilih ikon emoji untuk tampilan kasir yang menarik.'
    ],
    tip: 'Anda juga bisa memuat 18 menu template warkop siap pakai dengan 1 klik jika ingin langsung mencoba kasir!'
  },
  {
    step: 2,
    title: '2. Atur Identitas Kafe & Struk Thermal',
    icon: Sliders,
    badge: 'Branding Toko',
    color: '#3b82f6',
    description: 'Sesuaikan nama kafe, logo, alamat, dan catatan kaki pada struk belanja pelanggan.',
    points: [
      'Buka menu "Pengaturan Kafe".',
      'Unggah Logo Kafe (akan otomatis tampil di struk kasir thermal 58mm/80mm).',
      'Atur Pajak Restoran (PB1) & Biaya Layanan jika kafe Anda menerapkannya.',
      'Pilih metode pembayaran yang Anda terima: Tunai (Cash), QRIS Instan, atau Transfer Bank.'
    ],
    tip: 'Catatan kaki struk bisa diisi informasi password Wi-Fi kafe atau akun Instagram Anda!'
  },
  {
    step: 3,
    title: '3. Layar Kasir (POS) & Transaksi',
    icon: ShoppingCart,
    badge: 'Operasional Harian',
    color: '#10b981',
    description: 'Proses pemesanan pelanggan dengan cepat, responsif, dan akurat.',
    points: [
      'Klik produk di katalog untuk memasukkannya ke keranjang belanja.',
      'Isi Nama Pelanggan dan Nomor Meja (atau pilih opsi "Bawa Pulang / Takeaway").',
      'Gunakan tombol "Catatan" pada item keranjang untuk pesanan khusus (misal: Less Sugar, Pedas, Tanpa Es).',
      'Klik "Bayar Sekarang", pilih metode pembayaran, dan cetak struk thermal kasir.'
    ],
    tip: 'Kasir juga mendukung tombol "Kirim Dapur Dulu (Open Bill)" untuk pelanggan yang makan dulu bayar belakangan!'
  },
  {
    step: 4,
    title: '4. Layar Dapur & Bar (KDS)',
    icon: ChefHat,
    badge: 'Kitchen Display',
    color: '#ec4899',
    description: 'Koki dan barista dapat memantau antrean pesanan secara langsung tanpa kertas tiket yang tercecer.',
    points: [
      'Buka menu "Dapur & Bar" di tablet atau layar monitor dapur.',
      'Pesanan masuk akan tampil dengan status "Menunggu" lengkap dengan nomor meja dan catatan khusus.',
      'Klik tombol "Mulai Masak" saat pesanan sedang diracik.',
      'Klik "Selesai" jika minuman atau makanan sudah siap disajikan kepada pelanggan.'
    ],
    tip: 'Layar dapur diperbarui otomatis secara real-time saat ada pesanan baru dari kasir.'
  },
  {
    step: 5,
    title: '5. Rekap Transaksi & Laporan Omzet',
    icon: BarChart3,
    badge: 'Laporan Keuangan',
    color: '#8b5cf6',
    description: 'Pantau performa penjualan kafe Anda kapan saja dan dari mana saja.',
    points: [
      'Buka menu "Riwayat Transaksi" untuk melihat total omzet, laba kotor, dan total transaksi.',
      'Filter berdasarkan periode: Hari Ini, Bulan Ini, atau Semua Waktu.',
      'Cetak ulang struk transaksi pelanggan yang telah selesai kapan saja.',
      'Ekspor laporan lengkap ke format file CSV (Excel) untuk pembukuan akuntansi kafe Anda.'
    ],
    tip: 'Data Anda terisolasi aman dengan Supabase Row Level Security (RLS) sehingga tidak bisa diakses orang lain.'
  }
];

export default function TutorialModal({ isOpen, onClose, onSeedTemplate, loadingSeed }) {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const current = TUTORIAL_STEPS[activeStep];
  const IconComponent = current.icon;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div 
        className="animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#171412',
          border: '1px solid var(--border-subtle)',
          borderRadius: '24px',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>
                Panduan Memulai Warkop POS
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Langkah mudah mengoperasikan sistem kasir kafe Anda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator Progress */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '12px 24px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {TUTORIAL_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(idx)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: '8px',
                background: activeStep === idx 
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%)' 
                  : 'rgba(255, 255, 255, 0.03)',
                border: activeStep === idx ? '1px solid var(--accent-primary)' : '1px solid transparent',
                color: activeStep === idx ? '#fff' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: activeStep === idx ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: activeStep === idx ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                color: activeStep === idx ? '#000' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 800
              }}>
                {s.step}
              </span>
              <span className="hidden-mobile" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Card Header */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${current.color} 0%, rgba(0,0,0,0.4) 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 8px 20px -4px ${current.color}40`
            }}>
              <IconComponent size={26} color="#fff" />
            </div>

            <div>
              <div style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 800,
                color: current.color,
                background: `${current.color}18`,
                padding: '3px 8px',
                borderRadius: '6px',
                marginBottom: '6px'
              }}>
                {current.badge}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
                {current.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                {current.description}
              </p>
            </div>
          </div>

          {/* Checklist Points */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            padding: '16px 18px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {current.points.map((pt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '13px', color: '#e5e5e5', lineHeight: 1.5 }}>
                  {pt}
                </span>
              </div>
            ))}
          </div>

          {/* Tip Box */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Sparkles size={18} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '12px', color: '#fef3c7', margin: 0, lineHeight: 1.4 }}>
              <strong style={{ color: 'var(--accent-primary)' }}>Tips:</strong> {current.tip}
            </p>
          </div>

          {/* Optional Action for Step 1: Muat Template Menu */}
          {activeStep === 0 && onSeedTemplate && (
            <div style={{
              marginTop: '16px',
              padding: '14px 16px',
              borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                  Ingin langsung coba tanpa input manual?
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Muat 18 menu warkop (Kopi aren, tubruk, mie dok-dok, roti bakar) otomatis.
                </div>
              </div>
              <button
                onClick={onSeedTemplate}
                disabled={loadingSeed}
                style={{
                  padding: '9px 14px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: loadingSeed ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  opacity: loadingSeed ? 0.7 : 1
                }}
              >
                {loadingSeed ? 'Memuat Menu...' : '✨ Muat Menu Template'}
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <button
            onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: activeStep === 0 ? 'rgba(255,255,255,0.2)' : '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: activeStep === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ChevronLeft size={16} />
            <span>Sebelumnya</span>
          </button>

          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Halaman {activeStep + 1} dari {TUTORIAL_STEPS.length}
          </span>

          {activeStep < TUTORIAL_STEPS.length - 1 ? (
            <button
              onClick={() => setActiveStep(prev => Math.min(TUTORIAL_STEPS.length - 1, prev + 1))}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)',
                color: '#fff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}
            >
              <span>Selanjutnya</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px var(--accent-emerald-glow)'
              }}
            >
              <CheckCircle2 size={16} />
              <span>Mulai Berjualan!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
