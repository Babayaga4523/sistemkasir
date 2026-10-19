'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Toast from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import { uploadImageToStorage } from '../../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { parseQrisMerchantInfo, generateDynamicQRIS, extractQrisFromImage, SAMPLE_WARKOP_QRIS } from '../../utils/qris';
import { 
  Store, 
  Upload, 
  MapPin, 
  Phone, 
  Receipt, 
  Percent, 
  CreditCard, 
  Save, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  QrCode, 
  Banknote,
  Sparkles,
  ArrowRight,
  Wifi,
  Clock,
  Users,
  AtSign,
  Globe,
  ShoppingBag,
  Landmark,
  Key,
  Lock,
  Smartphone,
  RefreshCw,
  Printer,
  Layers,
  Bluetooth,
  Eye,
  EyeOff,
  LogOut,
  KeyRound,
  User
} from 'lucide-react';
import { printThermalIframe, getPrinterSettings, savePrinterSettings } from '../../utils/printer';

export default function SettingsPage() {
  const router = useRouter();
  const { user, store, loading, updateStoreSettings, signOut, updateUserPassword, isDemoMode } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  
  // Transaction params
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState(10);
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState(false);
  const [serviceChargePercentage, setServiceChargePercentage] = useState(5);
  
  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState({ cash: true, qris: true, transfer: true });

  // Extended Warkop / Cafe Parameters
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [openingHours, setOpeningHours] = useState('08:00 - 24:00 WIB');
  const [tableCount, setTableCount] = useState(15);
  const [instagramHandle, setInstagramHandle] = useState('');
  
  // Takeaway packaging fee
  const [takeawayFeeEnabled, setTakeawayFeeEnabled] = useState(false);
  const [takeawayFee, setTakeawayFee] = useState(1000);
  
  // Bank transfer details
  const [bankName, setBankName] = useState('BCA');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  // QRIS Dinamis Otomatis (Standar BI / ASPI)
  const [qrisDynamicEnabled, setQrisDynamicEnabled] = useState(true);
  const [qrisPayload, setQrisPayload] = useState('');

  // Pengaturan Printer Thermal (58mm / 80mm)
  const [defaultPaperWidth, setDefaultPaperWidth] = useState('58mm');
  const [showWifiOnReceipt, setShowWifiOnReceipt] = useState(true);
  const [testingPrint, setTestingPrint] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Live QRIS Dynamic preview calculation
  const previewPayload = React.useMemo(() => {
    const raw = (qrisPayload && qrisPayload.trim().startsWith('000201')) 
      ? qrisPayload.trim() 
      : SAMPLE_WARKOP_QRIS;
    try {
      return generateDynamicQRIS(raw, 25000);
    } catch {
      return raw;
    }
  }, [qrisPayload]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!store) {
        router.push('/onboarding');
      }
    }
  }, [user, store, loading, router]);

  useEffect(() => {
    if (store) {
      setName(store.name || '');
      setAddress(store.address || '');
      setPhone(store.phone || '');
      setLogoUrl(store.logo_url || '');
      setReceiptFooter(store.receipt_footer || '');
      setTaxEnabled(Boolean(store.tax_enabled));
      setTaxPercentage(store.tax_percentage || 10);
      setServiceChargeEnabled(Boolean(store.service_charge_enabled));
      setServiceChargePercentage(store.service_charge_percentage || 5);
      if (store.payment_methods) {
        setPaymentMethods(store.payment_methods);
      }
      setWifiSsid(store.wifi_ssid || '');
      setWifiPassword(store.wifi_password || '');
      setOpeningHours(store.opening_hours || '08:00 - 24:00 WIB');
      setTableCount(store.table_count || 15);
      setInstagramHandle(store.instagram_handle || '');
      setTakeawayFeeEnabled(Boolean(store.takeaway_fee_enabled));
      setTakeawayFee(store.takeaway_fee || 1000);
      setBankName(store.bank_name || 'BCA');
      setBankAccountNumber(store.bank_account_number || '');
      setBankAccountName(store.bank_account_name || '');
      setQrisDynamicEnabled(store.qris_dynamic_enabled !== false);
      setQrisPayload(store.qris_payload || '');

      // Load printer settings from local storage
      const pSettings = getPrinterSettings();
      if (pSettings?.paperWidth) setDefaultPaperWidth(pSettings.paperWidth);
      if (typeof pSettings?.showWifi === 'boolean') setShowWifiOnReceipt(pSettings.showWifi);
    }
  }, [store]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const url = await uploadImageToStorage('store-logos', file);
      if (url) {
        setLogoUrl(url);
        addToast('Logo kafe berhasil diupload!', 'success');
      }
    } catch (err) {
      console.warn('Gagal memproses file logo:', err);
      addToast('Gagal memproses file logo.', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleScanQrisImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      addToast('Membaca barcode QRIS dari gambar...', 'info');
      const detectedQris = await extractQrisFromImage(file);
      setQrisPayload(detectedQris);
      const info = parseQrisMerchantInfo(detectedQris);
      addToast(`QRIS Asli Berhasil Terbaca: ${info.merchantName || 'Merchant'} (${info.nmid || '-'})!`, 'success');
    } catch (err) {
      console.warn('Scan QRIS error:', err);
      addToast(err.message || 'Gagal membaca QR Code dari gambar.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Nama Kafe wajib diisi!', 'warning');
      return;
    }

    setSaving(true);
    try {
      await updateStoreSettings({
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        logo_url: logoUrl,
        receipt_footer: receiptFooter.trim(),
        tax_enabled: taxEnabled,
        tax_percentage: Number(taxPercentage) || 0,
        service_charge_enabled: serviceChargeEnabled,
        service_charge_percentage: Number(serviceChargePercentage) || 0,
        payment_methods: paymentMethods,
        wifi_ssid: wifiSsid.trim(),
        wifi_password: wifiPassword.trim(),
        opening_hours: openingHours.trim(),
        table_count: Number(tableCount) || 15,
        instagram_handle: instagramHandle.trim(),
        takeaway_fee_enabled: takeawayFeeEnabled,
        takeaway_fee: Number(takeawayFee) || 0,
        bank_name: bankName.trim(),
        bank_account_number: bankAccountNumber.trim(),
        bank_account_name: bankAccountName.trim(),
        qris_dynamic_enabled: qrisDynamicEnabled,
        qris_payload: qrisPayload.trim()
      });

      // Simpan preferensi printer ke LocalStorage
      savePrinterSettings({
        paperWidth: defaultPaperWidth,
        showWifi: showWifiOnReceipt
      });

      addToast('Pengaturan kafe berhasil disimpan dan langsung aktif!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Gagal menyimpan pengaturan: ' + (err.message || 'Error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Uji coba cetak struk thermal dari settings
  const handleTestPrint = async () => {
    try {
      setTestingPrint(true);
      const sampleOrder = {
        order_number: 'TEST-' + Math.floor(1000 + Math.random() * 9000),
        created_at: new Date().toISOString(),
        cashier_name: user?.email?.split('@')[0] || 'Kasir',
        customer_name: 'Pelanggan Uji Coba',
        order_type: 'dine_in',
        table_number: '01',
        items: [
          { product_name: 'Kopi Signature Racik', quantity: 1, price: 1000, subtotal: 1000, selected_options: { 'Varian': 'Panas' } },
          { product_name: 'Roti Bakar Coklat Keju', quantity: 1, price: 12000, subtotal: 12000 }
        ],
        subtotal: 13000,
        discount: 0,
        tax: 0,
        service_charge: 0,
        total: 13000,
        payment_method: 'CASH',
        amount_paid: 20000,
        change_amount: 7000
      };

      await printThermalIframe({
        order: sampleOrder,
        store: {
          name,
          address,
          phone,
          logo_url: logoUrl,
          receipt_footer: receiptFooter,
          wifi_ssid: wifiSsid,
          wifi_password: wifiPassword
        },
        paperWidth: defaultPaperWidth,
        showWifi: showWifiOnReceipt
      });

      addToast('Membuka dialog cetak struk uji coba!', 'info');
    } catch (err) {
      addToast('Gagal mencetak struk: ' + (err.message || 'Error'), 'error');
    } finally {
      setTestingPrint(false);
    }
  };

  // Ubah kata sandi pengguna
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast('Kata sandi baru minimal 6 karakter.', 'warning');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      addToast('Konfirmasi kata sandi baru tidak cocok.', 'warning');
      return;
    }

    setUpdatingPassword(true);
    try {
      await updateUserPassword(newPassword);
      addToast('Kata sandi akun kasir berhasil diperbarui!', 'success');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      addToast(err.message || 'Gagal memperbarui kata sandi.', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAccountLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-main)',
      overflow: 'hidden'
    }}>
      <Header />

      {/* Full-width scroll container: scrollbar is on the far right edge */}
      <div style={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        height: 'calc(100vh - 68px)',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        <main style={{
          padding: '24px 32px 100px 32px',
          maxWidth: '1000px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={22} color="var(--accent-primary)" />
              <span>Pengaturan Parameter Kafe</span>
            </h1>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Kelola identitas kafe, parameter struk kasir, pajak PB1, dan biaya layanan
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 22px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-emerald) 0%, var(--accent-emerald-hover) 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              boxShadow: '0 4px 15px var(--accent-emerald-glow)',
              opacity: saving ? 0.7 : 1
            }}
          >
            <Save size={16} />
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card 1: Identitas Kafe */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              🏪 Identitas & Branding Kafe
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {/* Nama Kafe */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Nama Kafe (Tampil di Header & Struk) <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama Kafe / Warkop"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Logo Kafe Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Logo Kafe (Supabase Storage: store-logos)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Store size={20} color="var(--text-muted)" />
                    )}
                  </div>

                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px dashed var(--border-subtle)',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                    <Upload size={14} color="var(--accent-primary)" />
                    <span>{uploadingLogo ? 'Mengupload Logo...' : 'Pilih File Logo'}</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Alamat */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Alamat Kafe (Kop Struk)
                </label>
                <input
                  type="text"
                  placeholder="Jl. Sabang No. 12, Jakarta"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* No Telp */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="0812-3456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card: Pengaturan Printer Thermal & Struk Kasir */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Printer size={18} color="var(--accent-primary)" />
                  <span>Pengaturan Printer & Struk Kasir</span>
                </h2>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Format cetak thermal (USB/Bluetooth) dan pesan kustom untuk pelanggan
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestPrint}
                disabled={testingPrint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: 'var(--accent-primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Printer size={14} />
                <span>{testingPrint ? 'Mencetak...' : 'Test Cetak Struk'}</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {/* Ukuran Kertas Default */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <Layers size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px', color: 'var(--accent-primary)' }} />
                  Ukuran Kertas Thermal Default:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setDefaultPaperWidth('58mm')}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: defaultPaperWidth === '58mm' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      border: defaultPaperWidth === '58mm' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      color: defaultPaperWidth === '58mm' ? 'var(--accent-primary)' : 'var(--text-muted)',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    58mm (Warkop / Mini)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultPaperWidth('80mm')}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: defaultPaperWidth === '80mm' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      border: defaultPaperWidth === '80mm' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      color: defaultPaperWidth === '80mm' ? 'var(--accent-primary)' : 'var(--text-muted)',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    80mm (Resto / Lebar)
                  </button>
                </div>
              </div>

              {/* Tampilkan Info WiFi di Struk */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: showWifiOnReceipt ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  border: showWifiOnReceipt ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={showWifiOnReceipt}
                    onChange={(e) => setShowWifiOnReceipt(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-emerald)' }}
                  />
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff' }}>
                      Cetak Info WiFi di Struk
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      Mencetak nama WiFi & password di bagian bawah struk
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer Struk */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Catatan Kaki Struk Kasir (Ucapan / Footer Thermal):
              </label>
              <textarea
                placeholder="Contoh: Matur suwun sampun rawuh! Silakan berkunjung kembali ☕"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '13px',
                  resize: 'none'
                }}
              />
            </div>
          </div>

          {/* Card 2: Parameter Transaksi & Pajak */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              💰 Parameter Transaksi & Pajak
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {/* Pajak PB1 */}
              <div style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Pajak Restoran / PB1</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Otomatis ditambahkan ke total pesanan</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={taxEnabled}
                    onChange={(e) => setTaxEnabled(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                </div>

                {taxEnabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(e.target.value)}
                      style={{
                        width: '80px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid var(--border-subtle)',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    />
                    <span style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 700 }}>% Pajak</span>
                  </div>
                )}
              </div>

              {/* Service Charge */}
              <div style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Biaya Layanan (Service Charge)</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Biaya servis untuk operasional cafe</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={serviceChargeEnabled}
                    onChange={(e) => setServiceChargeEnabled(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                </div>

                {serviceChargeEnabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={serviceChargePercentage}
                      onChange={(e) => setServiceChargePercentage(e.target.value)}
                      style={{
                        width: '80px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid var(--border-subtle)',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    />
                    <span style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 700 }}>% Service</span>
                  </div>
                )}
              </div>
            </div>

            {/* Metode Pembayaran Aktif */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Metode Pembayaran yang Aktif di Kasir:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                <label style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: paymentMethods.cash ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: paymentMethods.cash ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={Boolean(paymentMethods.cash)}
                    onChange={(e) => setPaymentMethods(p => ({ ...p, cash: e.target.checked }))}
                    style={{ accentColor: 'var(--accent-emerald)' }}
                  />
                  <Banknote size={16} color={paymentMethods.cash ? '#34d399' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Tunai (Cash)</span>
                </label>

                <label style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: paymentMethods.qris ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: paymentMethods.qris ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={Boolean(paymentMethods.qris)}
                    onChange={(e) => setPaymentMethods(p => ({ ...p, qris: e.target.checked }))}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <QrCode size={16} color={paymentMethods.qris ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>QRIS Instan</span>
                </label>

                <label style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: paymentMethods.transfer ? 'rgba(14, 165, 233, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: paymentMethods.transfer ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={Boolean(paymentMethods.transfer)}
                    onChange={(e) => setPaymentMethods(p => ({ ...p, transfer: e.target.checked }))}
                    style={{ accentColor: '#0ea5e9' }}
                  />
                  <CreditCard size={16} color={paymentMethods.transfer ? '#38bdf8' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Debit / Transfer</span>
                </label>
              </div>
            </div>
          </div>

          {/* Card 2.5: Konfigurasi QRIS Dinamis Otomatis */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '260px',
              height: '140px',
              background: 'radial-gradient(circle at top right, rgba(245, 158, 11, 0.15), transparent 70%)',
              pointerEvents: 'none'
            }} />

            {/* Header + Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '14px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)'
                  }}>
                    <QrCode size={16} />
                  </div>
                  <span>QRIS Dinamis Otomatis (Standar BI / ASPI)</span>
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Nominal tagihan otomatis terkunci di HP pembeli saat scan QRIS — anti salah nominal dan tanpa perlu input manual
                </div>
              </div>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 14px',
                borderRadius: '30px',
                background: qrisDynamicEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: qrisDynamicEnabled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={qrisDynamicEnabled}
                  onChange={(e) => setQrisDynamicEnabled(e.target.checked)}
                  style={{ accentColor: 'var(--accent-emerald)', cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '12px', fontWeight: 700, color: qrisDynamicEnabled ? '#34d399' : 'var(--text-muted)' }}>
                  {qrisDynamicEnabled ? 'Fitur Dinamis Aktif' : 'Nonaktif (QR Statis)'}
                </span>
              </label>
            </div>

            {/* Detection & Live Info */}
            {(() => {
              const activePayload = qrisPayload.trim() || SAMPLE_WARKOP_QRIS;
              const info = parseQrisMerchantInfo(activePayload);
              const isUsingSample = !qrisPayload.trim();

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Status Banner */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nama Merchant Terdeteksi</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                        {info.merchantName || 'Belum Terdeteksi'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NMID Nasional</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace', marginTop: '2px' }}>
                        {info.nmid || '-'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Kota Merchant</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                        {info.merchantCity || 'Indonesia'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status Sumber</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: isUsingSample ? 'var(--accent-primary)' : '#34d399', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        {isUsingSample ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
                        <span>{isUsingSample ? 'Simulasi Demo (Contoh)' : 'QRIS Toko Asli (Aktif)'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Real vs Sample Info Alert */}
                  {isUsingSample ? (
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      fontSize: '11px',
                      color: 'var(--accent-primary)',
                      lineHeight: '1.6',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}>
                      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <b>Perhatian (Kenapa Muncul "Invalid QR Code" di HP):</b> Barcode di bawah ini saat ini menggunakan <b>Contoh Dummy / Simulasi</b> untuk menguji tampilan sistem kasir. Aplikasi m-Banking asli (BCA, Livin, GoPay, DANA) akan menolak pembayaran karena merchant dummy belum terdaftar di Bank Indonesia.<br />
                        👉 <b>Untuk Menerima Uang Sungguhan:</b> Tekan tombol <b>"📸 Upload Foto QRIS Asli Toko"</b> di bawah untuk mengunggah foto cetakan QRIS toko Anda (BCA Merchant, GoBiz, OVO, DANA Bisnis, dll).
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      fontSize: '11px',
                      color: '#34d399',
                      lineHeight: '1.5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                      <div>
                        <b>QRIS Toko Asli Berhasil Terhubung!</b> Terdaftar atas nama <b>{info.merchantName}</b>. Saat kasir membuat transaksi, pelanggan dapat langsung scan via BCA, Mandiri, BRI, GoPay, OVO, DANA dengan nominal terkunci otomatis!
                      </div>
                    </div>
                  )}

                  {/* Input and Live Preview Layout */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px', alignItems: 'start' }}>
                    {/* Left: Input Textarea */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                          String Payload QRIS Toko:
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {/* Upload Photo Button */}
                          <label style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.35)'
                          }}>
                            <Upload size={13} />
                            <span>Upload Foto QRIS Asli</span>
                            <input type="file" accept="image/*" onChange={handleScanQrisImage} style={{ display: 'none' }} />
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              setQrisPayload(SAMPLE_WARKOP_QRIS);
                              addToast('Contoh QRIS Warkop berhasil dimuat!', 'success');
                            }}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              background: 'rgba(245, 158, 11, 0.15)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              color: 'var(--accent-primary)',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Sparkles size={12} />
                            <span>Gunakan Contoh</span>
                          </button>

                          {qrisPayload && (
                            <button
                              type="button"
                              onClick={() => setQrisPayload('')}
                              style={{
                                padding: '6px 8px',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-muted)',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              Kosongkan
                            </button>
                          )}
                        </div>
                      </div>

                      <textarea
                        rows={4}
                        placeholder="Tempel / Paste string QRIS toko di sini atau gunakan tombol 'Upload Foto QRIS Asli' di atas..."
                        value={qrisPayload}
                        onChange={(e) => setQrisPayload(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid var(--border-subtle)',
                          color: '#fff',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          resize: 'vertical',
                          lineHeight: '1.5'
                        }}
                      />

                      {/* Instructions Guide */}
                      <div style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'rgba(14, 165, 233, 0.08)',
                        border: '1px solid rgba(14, 165, 233, 0.2)',
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        lineHeight: '1.6'
                      }}>
                        <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Smartphone size={13} />
                          <span>Cara Mengambil String QRIS Toko Anda (Hanya 1x Saja):</span>
                        </div>
                        <ol style={{ margin: 0, paddingLeft: '18px' }}>
                          <li>Ambil foto cetakan QRIS toko Anda (BCA, Mandiri, BRI, GoPay, OVO, DANA Bisnis, dll).</li>
                          <li>Buka <b>Google Lens</b> atau aplikasi <b>QR Scanner</b> di HP Anda lalu arahkan ke barcode tersebut.</li>
                          <li>Tekan <b>Salin Teks (Copy Text)</b> yang berawalan <code style={{ color: '#fff' }}>000201...</code> lalu paste di kolom atas ini.</li>
                        </ol>
                      </div>
                    </div>

                    {/* Right: Live Interactive QR Preview */}
                    <div style={{
                      padding: '16px',
                      borderRadius: '14px',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '12px'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lock size={13} color="var(--accent-primary)" />
                        <span>Simulasi Tampilan QRIS Pelanggan</span>
                      </div>

                      {/* Real QRIS Card Mockup */}
                      <div style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                        maxWidth: '220px',
                        width: '100%'
                      }}>
                        {/* Red QRIS Header */}
                        <div style={{
                          background: '#ed1c24',
                          color: '#fff',
                          width: '100%',
                          padding: '4px 6px',
                          borderRadius: '6px 6px 0 0',
                          fontSize: '10px',
                          fontWeight: 900,
                          letterSpacing: '0.8px',
                          textAlign: 'center',
                          marginBottom: '6px'
                        }}>
                          QRIS PEMBAYARAN
                        </div>

                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#111', textTransform: 'uppercase', marginBottom: '2px', textAlign: 'center' }}>
                          {info.merchantName || store?.name || 'Warkop'}
                        </div>
                        <div style={{ fontSize: '9px', color: '#666', fontFamily: 'monospace', marginBottom: '8px' }}>
                          NMID: {info.nmid || 'ID1024301928475'}
                        </div>

                        {/* Generated QR Code */}
                        <div style={{
                          width: '160px',
                          height: '160px',
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          {previewPayload ? (
                            <QRCodeSVG value={previewPayload} size={148} level="M" />
                          ) : (
                            <QrCode size={120} color="#000" />
                          )}
                        </div>

                        {/* Amount Locked Badge */}
                        <div style={{
                          marginTop: '8px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#059669',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          🔒 Rp 25.000 (Terkunci)
                        </div>
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '240px', lineHeight: '1.4' }}>
                        Coba scan QR di atas pakai HP Anda (BCA, Mandiri, GoPay, Dana) — nominal Rp 25.000 akan langsung otomatis terisi!
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Card 3: Operasional & Fasilitas Kafe */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📶 Fasilitas & Jam Operasional Warkop</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {/* Jam Operasional */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <Clock size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px', color: 'var(--accent-primary)' }} />
                  Jam Operasional Kafe
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 08:00 - 24:00 WIB"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Jumlah Meja */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <Users size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px', color: 'var(--accent-primary)' }} />
                  Jumlah Meja Dine-In
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  placeholder="15"
                  value={tableCount}
                  onChange={(e) => setTableCount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* WiFi SSID */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <Wifi size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px', color: 'var(--accent-primary)' }} />
                  Nama WiFi Kafe (SSID)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Warkop_Bahagia_Free"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* WiFi Password */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <Key size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px', color: 'var(--accent-primary)' }} />
                  Password WiFi Pengunjung
                </label>
                <input
                  type="text"
                  placeholder="Contoh: ngopidulu123"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Akun Instagram / Sosmed */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <AtSign size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px', color: 'var(--accent-rose)' }} />
                  Akun Media Sosial / Instagram
                </label>
                <input
                  type="text"
                  placeholder="Contoh: @warkopbahagia.id"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Biaya Kemasan & Rekening Kasir */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              🥡 Biaya Kemasan & Rekening Pembayaran Transfer
            </h2>

            {/* Biaya Kemasan / Takeaway */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={15} color="var(--accent-primary)" />
                  <span>Biaya Tambahan Pesanan Bungkus / Takeaway</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Secara otomatis menambahkan biaya kemasan/cup jika pelanggan memesan takeaway
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={takeawayFeeEnabled}
                    onChange={(e) => setTakeawayFeeEnabled(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', color: takeawayFeeEnabled ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {takeawayFeeEnabled ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {takeawayFeeEnabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Rp</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={takeawayFee}
                      onChange={(e) => setTakeawayFee(e.target.value)}
                      style={{
                        width: '100px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid var(--border-subtle)',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Rekening Transfer Bank */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                <Landmark size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px', color: '#38bdf8' }} />
                Informasi Rekening Kasir (Untuk Pelanggan Bayar via Transfer / QRIS Manual):
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nama Bank / E-Wallet</span>
                  <input
                    type="text"
                    placeholder="BCA / Mandiri / BRI / Dana"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nomor Rekening</span>
                  <input
                    type="text"
                    placeholder="Contoh: 8271039821"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Atas Nama Pemilik</span>
                  <input
                    type="text"
                    placeholder="Contoh: Yoga Krisna"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Akun Pengguna & Keamanan Sandi */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <KeyRound size={17} color="var(--accent-primary)" />
                <span>Akun Pengguna & Keamanan Sandi</span>
              </h2>

              <button
                type="button"
                onClick={handleAccountLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <LogOut size={13} />
                <span>Keluar dari Akun Kasir</span>
              </button>
            </div>

            {/* Account Info Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Email Akun Aktif</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{user?.email || 'Mode Demo / Offline'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Tipe Sesi Kasir</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: isDemoMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: isDemoMode ? 'var(--accent-primary)' : '#34d399'
                }}>
                  {isDemoMode ? 'Offline / Demo Mode' : 'Supabase Cloud Terautentikasi'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Tenant Store ID</span>
                <code style={{ fontSize: '12px', color: 'var(--accent-primary)' }}>{store?.id || 'demo-store-001'}</code>
              </div>
            </div>

            {/* Change Password Sub-form (Cloud User Only) */}
            {!isDemoMode && (
              <div style={{
                borderTop: '1px dashed var(--border-subtle)',
                paddingTop: '14px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>
                  Ganti Kata Sandi Akun
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Kata Sandi Baru (Min 6 Karakter)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Minimal 6 karakter"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 34px 9px 32px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle)',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Ulangi sandi baru"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px 9px 32px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle)',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleUpdatePassword}
                      disabled={updatingPassword || !newPassword}
                      style={{
                        width: '100%',
                        padding: '9px 14px',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        color: 'var(--accent-primary)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: (!newPassword || updatingPassword) ? 'not-allowed' : 'pointer',
                        opacity: (!newPassword || updatingPassword) ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Save size={14} />
                      <span>{updatingPassword ? 'Menyimpan...' : 'Perbarui Kata Sandi'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 5: Multi-Tenant Isolation Status */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={20} color="#34d399" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                  Isolasi Multi-Tenant Supabase (RLS Aktif)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ID Toko: <code style={{ color: 'var(--accent-primary)' }}>{store?.id || 'demo-store'}</code> • Akun: {user?.email || 'demo@user'}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-emerald) 0%, var(--accent-emerald-hover) 100%)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                opacity: saving ? 0.7 : 1
              }}
            >
              <Save size={15} />
              <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </form>
      </main>
      </div>

      <Toast toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))} />
    </div>
  );
}
