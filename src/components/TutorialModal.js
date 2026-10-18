'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Receipt,
  Utensils,
  Clock,
  QrCode,
  TrendingUp,
  Download,
  Wifi,
  Flame,
  Layers,
  ArrowRight
} from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    step: 1,
    id: 'menu',
    title: 'Kelola Menu & Kategori',
    icon: Coffee,
    badge: 'Langkah 1: Master Menu',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    description: 'Katalog menu adalah jantung operasional warkop. Buat kategori dan susun daftar minuman, makanan, atau cemilan favorit pelanggan.',
    points: [
      'Buka bilah "Kelola Menu" untuk menambah atau mengedit item.',
      'Kelompokkan ke Kategori: Kopi, Minuman Dingin, Mie, atau Camilan.',
      'Tentukan Harga Jual, Harga Modal (HPP), serta Varian (Suhu, Gula, Level Pedas).',
      'Atur saklar status stok (Tersedia / Habis) langsung dari layar manajemen.'
    ],
    tip: 'Gunakan tombol "Muat Template Menu" untuk langsung mendapatkan 18 menu warkop standar tanpa perlu input manual satu per satu!'
  },
  {
    step: 2,
    id: 'branding',
    title: 'Identitas Toko & Struk Kasir',
    icon: Sliders,
    badge: 'Langkah 2: Branding Kafe',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    description: 'Tampilkan identitas profesional kafe pada struk fisik pelanggan dan sesuaikan parameter pajak resto.',
    points: [
      'Buka menu "Pengaturan Kafe" untuk mengganti Nama, Alamat, dan Nomor Kontak.',
      'Unggah Logo Kafe (otomatis tercetak di printer thermal 58mm & 80mm).',
      'Aktifkan Pajak Resto (PB1 10%) atau Service Charge jika dibutuhkan.',
      'Kustomisasi catatan kaki struk dengan info Password Wi-Fi & akun Instagram warkop.'
    ],
    tip: 'Struk thermal mendukung koneksi via Isolated Print Browser maupun Bluetooth ESC/POS portabel langsung dari smartphone atau tablet!'
  },
  {
    step: 3,
    id: 'pos',
    title: 'Transaksi Kasir Cepat (POS)',
    icon: ShoppingCart,
    badge: 'Langkah 3: Kasir Harian',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    description: 'Antarmuka kasir cepat dirancang untuk kecepatan tinggi saat jam sibuk warkop.',
    points: [
      'Klik menu untuk langsung masuk keranjang, atau pilih varian (Panas/Dingin, Extra Shot).',
      'Pilih tipe pesanan: "Makan di Sini" (+ No. Meja) atau "Bawa Pulang (Takeaway)".',
      'Mendukung Open Bill (Kirim ke Dapur Dulu) bagi pelanggan yang makan dulu bayar belakangan.',
      'Pembayaran fleksibel: Tunai otomatis hitung kembalian, QRIS Dinamis instan, atau Transfer Bank.'
    ],
    tip: 'Terdapat fitur pencarian cepat real-time untuk menemukan menu dalam hitungan detik tanpa scroll panjang.'
  },
  {
    step: 4,
    id: 'kitchen',
    title: 'Layar Dapur & Bar (KDS)',
    icon: ChefHat,
    badge: 'Langkah 4: Kitchen Display',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    description: 'Hilangkan kertas tiket yang tercecer. Barista dan koki memantau antrean secara rapi di layar monitor atau tablet dapur.',
    points: [
      'Buka menu "Dapur & Bar" pada layar kitchen.',
      'Pesanan baru muncul otomatis dengan nomor meja dan catatan khusus (misal: "Gula dikit", "Pedas gila").',
      'Perbarui status pesanan: "Pesanan Masuk" ➔ "Sedang Diracik" ➔ "Siap Disajikan".',
      'Dilengkapi elapsed timer untuk memantau durasi tunggu pelanggan sejak order masuk.'
    ],
    tip: 'Barista dapat memfilter tampilan khusus racikan bar minuman atau makanan dapur secara terpisah.'
  },
  {
    step: 5,
    id: 'reports',
    title: 'Laporan Omzet & Analitik',
    icon: BarChart3,
    badge: 'Langkah 5: Keuangan & Omzet',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    description: 'Pantau performa harian kafe Anda dengan visualisasi grafik penjualan dan laporan laba kotor.',
    points: [
      'Buka bilah "Riwayat Transaksi" untuk rekap total omzet, jumlah nota, dan AOV (Average Order Value).',
      'Grafik Top 5 Menu Terlaris & perbandingan metode pembayaran tunai vs digital.',
      'Cari transaksi lampau dan lakukan Cetak Ulang Struk (Reprint) kapan saja.',
      'Ekspor seluruh rekapan transaksi ke file format CSV untuk pembukuan Excel.'
    ],
    tip: 'Semua data transaksi tersimpan aman di cloud Supabase dengan Row Level Security (RLS) serta pencadangan lokal otomatis.'
  }
];

export default function TutorialModal({ isOpen, onClose, onSeedTemplate, loadingSeed = false }) {
  const [activeStep, setActiveStep] = useState(0);

  // Keyboard navigation listener (Arrow Left/Right, Esc)
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowRight') {
      setActiveStep(prev => Math.min(TUTORIAL_STEPS.length - 1, prev + 1));
    } else if (e.key === 'ArrowLeft') {
      setActiveStep(prev => Math.max(0, prev - 1));
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const current = TUTORIAL_STEPS[activeStep];
  const IconComponent = current.icon;

  return (
    <div 
      className="tutorial-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 4, 3, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="tutorial-modal-box"
        style={{
          width: '100%',
          maxWidth: '820px',
          background: 'linear-gradient(175deg, #181412 0%, #120f0d 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 35px -5px rgba(245, 158, 11, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          animation: 'scaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              flexShrink: 0
            }}>
              <Sparkles size={19} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.2px' }}>
                Panduan Memulai Warkop POS Pro
              </h2>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Alur cepat & standar operasional sistem kasir kafe Anda
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '11px',
              color: 'var(--text-faint)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              Esc untuk tutup
            </span>
            <button
              onClick={onClose}
              type="button"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.color = '#f87171';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              title="Tutup (Esc)"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Horizontal Step Tracker */}
        <div style={{
          padding: '12px 24px',
          background: 'rgba(0, 0, 0, 0.35)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          overflowX: 'auto'
        }}>
          {TUTORIAL_STEPS.map((s, idx) => {
            const isCurrent = activeStep === idx;
            const isCompleted = activeStep > idx;
            const StepIcon = s.icon;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(idx)}
                style={{
                  flex: 1,
                  minWidth: '100px',
                  padding: '7px 10px',
                  borderRadius: '10px',
                  background: isCurrent 
                    ? 'rgba(245, 158, 11, 0.14)' 
                    : isCompleted 
                      ? 'rgba(16, 185, 129, 0.08)' 
                      : 'rgba(255, 255, 255, 0.03)',
                  border: isCurrent 
                    ? '1px solid var(--accent-primary)' 
                    : isCompleted 
                      ? '1px solid rgba(16, 185, 129, 0.3)' 
                      : '1px solid rgba(255, 255, 255, 0.05)',
                  color: isCurrent ? '#fff' : isCompleted ? '#34d399' : 'var(--text-muted)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.18s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  background: isCurrent 
                    ? 'var(--accent-primary)' 
                    : isCompleted 
                      ? 'var(--accent-emerald)' 
                      : 'rgba(255, 255, 255, 0.08)',
                  color: isCurrent ? '#000' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 900,
                  flexShrink: 0
                }}>
                  {isCompleted ? <CheckCircle2 size={12} strokeWidth={3} /> : s.step}
                </div>
                <div style={{ 
                  textAlign: 'left', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}>
                  <div style={{ 
                    fontWeight: isCurrent ? 800 : 600, 
                    fontSize: '11.5px',
                    color: isCurrent ? '#fff' : isCompleted ? '#a7f3d0' : 'var(--text-muted)'
                  }}>
                    {s.title.split(' ')[0]} {s.title.split(' ')[1] || ''}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Main 2-Column Responsive Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            alignItems: 'stretch'
          }}>
            {/* Left Column: Explanation, Checklists, & Tip */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Step Header Title */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: current.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 8px 20px -4px ${current.color}50`
                }}>
                  <IconComponent size={24} color="#fff" />
                </div>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    color: current.color,
                    background: `${current.color}16`,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    marginBottom: '4px',
                    border: `1px solid ${current.color}30`
                  }}>
                    {current.badge}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.2px' }}>
                    {current.title}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.45 }}>
                    {current.description}
                  </p>
                </div>
              </div>

              {/* Action Points / Checklist */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.025)',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Petunjuk Langkah:
                </div>
                {current.points.map((pt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px'
                    }}>
                      <CheckCircle2 size={13} color="var(--accent-emerald)" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '12.5px', color: '#e2e8f0', lineHeight: 1.45 }}>
                      {pt}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pro Tip Box */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.07)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <Sparkles size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '11.5px', color: '#fef3c7', margin: 0, lineHeight: 1.4 }}>
                  <strong style={{ color: 'var(--accent-primary)' }}>Tips Praktis:</strong> {current.tip}
                </p>
              </div>
            </div>

            {/* Right Column: Visual Mockup Showcase */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Subtle Ambient Glow */}
              <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-20%',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: `${current.color}18`,
                filter: 'blur(40px)',
                pointerEvents: 'none'
              }} />

              {/* Dynamic Feature Preview based on step */}
              {activeStep === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                      Pratinjau Katalog Menu
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      ● Tersedia
                    </span>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      ☕
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                        Es Kopi Susu Gula Aren
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Kategori: Kopi • HPP Rp 7.500
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      Rp 18.000
                    </div>
                  </div>

                  {/* Seed template CTA button on Step 1 */}
                  {onSeedTemplate && (
                    <div style={{
                      marginTop: '4px',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#a7f3d0' }}>
                        ✨ Ingin langsung siap jualan tanpa input manual?
                      </div>
                      <button
                        type="button"
                        onClick={onSeedTemplate}
                        disabled={loadingSeed}
                        style={{
                          padding: '9px 14px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%)',
                          color: '#fff',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: loadingSeed ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px var(--accent-emerald-glow)',
                          opacity: loadingSeed ? 0.7 : 1
                        }}
                      >
                        <Sparkles size={14} />
                        <span>{loadingSeed ? 'Menyiapkan Template...' : 'Muat 18 Menu Warkop Default'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase' }}>
                    Simulasi Struk Thermal 58mm
                  </div>
                  <div style={{
                    background: '#fff',
                    color: '#000',
                    borderRadius: '8px',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '10.5px',
                    lineHeight: 1.4,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
                  }}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      *** WARKOPKITA POS ***
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '9px', color: '#555' }}>
                      Jl. Pemuda No. 45 Jakarta
                    </div>
                    <div style={{ borderTop: '1px dashed #777', margin: '6px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>1x Es Kopi Aren</span>
                      <span>18.000</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>1x Indomie Dok-dok</span>
                      <span>15.000</span>
                    </div>
                    <div style={{ borderTop: '1px dashed #777', margin: '6px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>TOTAL (LUNAS - QRIS)</span>
                      <span>33.000</span>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '9px', color: '#666' }}>
                      Wi-Fi: kopikita / IG: @warkopkitapro
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
                    Alur Kasir Cepat (POS)
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tipe Pesanan:</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>🍽️ Meja 03 (Makan di Tempat)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Item Dipilih:</span>
                      <span style={{ fontWeight: 700, color: '#fff' }}>2 Porsi (Rp 33.000)</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <div style={{ flex: 1, padding: '7px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-primary)', borderRadius: '6px', textAlign: 'center', fontSize: '11px', fontWeight: 700 }}>
                        Kirim Dapur Dulu
                      </div>
                      <div style={{ flex: 1, padding: '7px', background: 'var(--accent-emerald)', color: '#000', borderRadius: '6px', textAlign: 'center', fontSize: '11px', fontWeight: 800 }}>
                        Bayar Sekarang
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#f472b6', textTransform: 'uppercase' }}>
                    Tiket Antrean Dapur & Bar
                  </div>
                  <div style={{
                    background: 'rgba(236, 72, 153, 0.08)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '13px', color: '#fff' }}>#ORD-4028 (Meja 02)</span>
                      <span style={{ fontSize: '10.5px', color: '#f472b6', background: 'rgba(236, 72, 153, 0.2)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        Sedang Diracik ♨️
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                      • 1x Kopi Tubruk Susu (Panas, Manis)<br/>
                      • 1x Roti Bakar Coklat Keju
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '4px' }}>
                      ⏱️ Waktu tunggu: 3 menit lalu
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase' }}>
                    Ringkasan Keuangan Toko
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px'
                  }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Omzet Hari Ini</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>
                        Rp 845.000
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Total Nota</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                        42 Transaksi
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    fontSize: '11px',
                    color: '#c4b5fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>📊 Ekspor Laporan CSV Excel</span>
                    <Download size={13} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)',
          gap: '12px'
        }}>
          {/* Back Button */}
          <button
            type="button"
            onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: activeStep === 0 ? 'rgba(255, 255, 255, 0.2)' : '#fff',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: activeStep === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <ChevronLeft size={16} />
            <span>Sebelumnya</span>
          </button>

          {/* Stepper Dots & Count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {TUTORIAL_STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: activeStep === i ? '16px' : '6px',
                    height: '6px',
                    borderRadius: '99px',
                    background: activeStep === i ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.15)',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              {activeStep + 1} dari {TUTORIAL_STEPS.length}
            </span>
          </div>

          {/* Next or Finish Button */}
          {activeStep < TUTORIAL_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setActiveStep(prev => Math.min(TUTORIAL_STEPS.length - 1, prev + 1))}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)',
                color: '#fff',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Lanjut: {TUTORIAL_STEPS[activeStep + 1].title.split(' ')[0]}</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px var(--accent-emerald-glow)',
                transition: 'all 0.15s ease'
              }}
            >
              <CheckCircle2 size={16} />
              <span>Mulai Berjualan Sekarang!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
