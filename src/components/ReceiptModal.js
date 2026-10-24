'use client';

import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Copy, 
  Check, 
  X, 
  PlusCircle, 
  Coffee, 
  Bluetooth, 
  Share2, 
  ExternalLink,
  Wifi,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import { STORE_INFO } from '../lib/defaultData';
import { 
  printThermalIframe, 
  printBluetoothThermal, 
  formatWhatsAppReceipt,
  getPrinterSettings,
  savePrinterSettings,
  generateBarcodeSvg,
  formatIDR,
  PAPER_WIDTHS 
} from '../utils/printer';

export default function ReceiptModal({
  isOpen,
  onClose,
  order,
  store,
  onNewTransaction
}) {
  const [paperWidth, setPaperWidth] = useState('58mm');
  const [showWifi, setShowWifi] = useState(true);
  const [isPrintingIframe, setIsPrintingIframe] = useState(false);
  const [isPrintingBt, setIsPrintingBt] = useState(false);
  const [btStatus, setBtStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showWaInput, setShowWaInput] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');

  // Muat preferensi printer yang tersimpan
  useEffect(() => {
    if (isOpen) {
      const settings = getPrinterSettings();
      if (settings?.paperWidth) {
        setPaperWidth(settings.paperWidth);
      }
      if (typeof settings?.showWifi === 'boolean') {
        setShowWifi(settings.showWifi);
      }
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const cafeName = store?.name || STORE_INFO.name;
  const cafeAddress = store?.address || STORE_INFO.address;
  const cafePhone = store?.phone || STORE_INFO.phone;
  const cafeFooter = store?.receipt_footer || 'Matur suwun sampun rawuh!\nSilakan berkunjung kembali ☕';
  const cafeLogo = store?.logo_url;
  const wifiSsid = store?.wifi_ssid;
  const wifiPass = store?.wifi_password;

  const handleSelectPaperWidth = (width) => {
    setPaperWidth(width);
    const curr = getPrinterSettings();
    savePrinterSettings({ ...curr, paperWidth: width });
  };

  const handleToggleWifi = () => {
    const nextVal = !showWifi;
    setShowWifi(nextVal);
    const curr = getPrinterSettings();
    savePrinterSettings({ ...curr, showWifi: nextVal });
  };

  // Cetak Thermal Standar / USB via Isolated Iframe
  const handlePrintThermal = async () => {
    try {
      setIsPrintingIframe(true);
      await printThermalIframe({
        order,
        store,
        paperWidth,
        showWifi
      });
    } catch (err) {
      console.error('Error print thermal:', err);
      window.print();
    } finally {
      setIsPrintingIframe(false);
    }
  };

  // Cetak Bluetooth Portable (ESC/POS)
  const handlePrintBluetooth = async () => {
    try {
      setIsPrintingBt(true);
      setBtStatus('Mencari printer Bluetooth...');
      
      const res = await printBluetoothThermal({
        order,
        store,
        paperWidth,
        showWifi
      });

      if (res?.cancelled) {
        setBtStatus('Pencarian Bluetooth dibatalkan.');
        setTimeout(() => setBtStatus(null), 2500);
        return;
      }

      setBtStatus('Struk berhasil dikirim ke printer Bluetooth!');
      setTimeout(() => setBtStatus(null), 3500);
    } catch (err) {
      console.warn('Bluetooth print notice:', err.message);
      setBtStatus(err.message || 'Gagal menyambung ke printer Bluetooth.');
      setTimeout(() => setBtStatus(null), 5000);
    } finally {
      setIsPrintingBt(false);
    }
  };

  // Salin Struk ke Clipboard
  const handleCopyReceipt = () => {
    const text = formatWhatsAppReceipt({ order, store, showWifi });
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      alert('Gagal menyalin ringkasan.');
    });
  };

  // Buka WhatsApp Langsung
  const handleOpenWhatsApp = () => {
    const text = formatWhatsAppReceipt({ order, store, showWifi });
    let phone = customerPhone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    const waUrl = phone 
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    window.open(waUrl, '_blank');
  };

  const is80 = paperWidth === '80mm';
  const isUnpaid = order.payment_method === 'unpaid' || order.payment_status === 'unpaid';

  return (
    <div 
      className="receipt-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
    >
      <style>{`
        @media (max-width: 480px) {
          .receipt-modal-backdrop {
            padding: 6px !important;
          }
          .receipt-modal-content {
            border-radius: 18px !important;
            max-height: 98vh !important;
          }
        }

        /* Sawtooth jagged paper tear edges */
        .jagged-receipt {
          position: relative;
          clip-path: polygon(
            0% 6px, 2% 0, 4% 6px, 6% 0, 8% 6px, 10% 0, 12% 6px, 14% 0, 16% 6px, 18% 0, 20% 6px, 22% 0, 24% 6px, 26% 0, 28% 6px, 30% 0, 32% 6px, 34% 0, 36% 6px, 38% 0, 40% 6px, 42% 0, 44% 6px, 46% 0, 48% 6px, 50% 0, 52% 6px, 54% 0, 56% 6px, 58% 0, 60% 6px, 62% 0, 64% 6px, 66% 0, 68% 6px, 70% 0, 72% 6px, 74% 0, 76% 6px, 78% 0, 80% 6px, 82% 0, 84% 6px, 86% 0, 88% 6px, 90% 0, 92% 6px, 94% 0, 96% 6px, 98% 0, 100% 6px,
            100% calc(100% - 6px), 98% 100%, 96% calc(100% - 6px), 94% 100%, 92% calc(100% - 6px), 90% 100%, 88% calc(100% - 6px), 86% 100%, 84% calc(100% - 6px), 82% 100%, 80% calc(100% - 6px), 78% 100%, 76% calc(100% - 6px), 74% 100%, 72% calc(100% - 6px), 70% 100%, 68% calc(100% - 6px), 66% 100%, 64% calc(100% - 6px), 62% 100%, 60% calc(100% - 6px), 58% 100%, 56% calc(100% - 6px), 54% 100%, 52% calc(100% - 6px), 50% 100%, 48% calc(100% - 6px), 46% 100%, 44% calc(100% - 6px), 42% 100%, 40% calc(100% - 6px), 38% 100%, 36% calc(100% - 6px), 34% 100%, 32% calc(100% - 6px), 30% 100%, 28% calc(100% - 6px), 26% 100%, 24% calc(100% - 6px), 22% 100%, 20% calc(100% - 6px), 18% 100%, 16% calc(100% - 6px), 14% 100%, 12% calc(100% - 6px), 10% 100%, 8% calc(100% - 6px), 6% 100%, 4% calc(100% - 6px), 2% 100%, 0% calc(100% - 6px)
          );
        }
      `}</style>
      
      <div 
        className="receipt-modal-content animate-scale-up"
        style={{
          width: '100%',
          maxWidth: is80 ? '490px' : '440px',
          maxHeight: '94vh',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.95)',
          overflow: 'hidden',
          transition: 'max-width 0.25s ease'
        }}
      >
        {/* Modal Header */}
        <div className="no-print" style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(23, 20, 18, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Printer size={15} color="var(--accent-primary)" />
            </div>
            <div>
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#fff' }}>Pratinjau & Cetak Struk</span>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                No. Nota: #{order.order_number}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '5px',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Paper Size Selector & Options Bar */}
        <div className="no-print" style={{
          padding: '8px 16px',
          background: 'rgba(15, 12, 10, 0.95)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {/* Paper Width Pills */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '2px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={() => handleSelectPaperWidth('58mm')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: paperWidth === '58mm' ? 800 : 500,
                background: paperWidth === '58mm' ? 'var(--accent-primary)' : 'transparent',
                color: paperWidth === '58mm' ? '#000' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              58mm (Warkop)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPaperWidth('80mm')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: paperWidth === '80mm' ? 800 : 500,
                background: paperWidth === '80mm' ? 'var(--accent-primary)' : 'transparent',
                color: paperWidth === '80mm' ? '#000' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              80mm (Resto)
            </button>
          </div>

          {/* WiFi Toggle on Receipt */}
          {(wifiSsid || wifiPass) && (
            <button
              type="button"
              onClick={handleToggleWifi}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                background: showWifi ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${showWifi ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                color: showWifi ? '#34d399' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <Wifi size={12} />
              <span>WiFi: {showWifi ? 'Cetak' : 'Sembunyi'}</span>
            </button>
          )}
        </div>

        {/* Status Toast Notification for Bluetooth */}
        {btStatus && (
          <div className="no-print" style={{
            padding: '7px 16px',
            background: btStatus.includes('berhasil') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
            color: btStatus.includes('berhasil') ? '#34d399' : '#fbbf24',
            fontSize: '11px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'fadeIn 0.2s ease'
          }}>
            <Bluetooth size={13} className={isPrintingBt ? 'animate-pulse' : ''} />
            <span>{btStatus}</span>
          </div>
        )}

        {/* Thermal Receipt Paper Container */}
        <div 
          className="receipt-paper-wrapper"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 14px',
            background: '#0d0b09',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}
        >
          <div 
            id="thermal-receipt"
            className={`jagged-receipt ${is80 ? 'receipt-80mm' : 'receipt-58mm'}`}
            style={{
              width: '100%',
              maxWidth: is80 ? '370px' : '290px',
              background: '#ffffff',
              color: '#000000',
              padding: is80 ? '22px 20px 24px 20px' : '18px 14px 20px 14px',
              fontFamily: "'SF Mono', 'Segoe UI Mono', 'Roboto Mono', 'Courier New', monospace, sans-serif",
              fontSize: is80 ? '11px' : '10px',
              lineHeight: 1.35,
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.85)',
              position: 'relative',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
          >
            {/* 1. Header Toko */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              {cafeLogo && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                  <img 
                    src={cafeLogo} 
                    alt={cafeName} 
                    style={{ maxHeight: '44px', maxWidth: '130px', objectFit: 'contain', filter: 'grayscale(100%) contrast(150%)' }} 
                  />
                </div>
              )}
              <div style={{ fontSize: is80 ? '16px' : '14px', fontWeight: 900, letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: 1.2 }}>
                {cafeName}
              </div>
              {cafeAddress && <div style={{ fontSize: is80 ? '10px' : '9.5px', color: '#333', marginTop: '2px', lineHeight: 1.3 }}>{cafeAddress}</div>}
              {cafePhone && <div style={{ fontSize: is80 ? '10px' : '9.5px', color: '#333' }}>Telp/WA: {cafePhone}</div>}
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

            {/* 2. Metadata Pesanan */}
            <div style={{ fontSize: is80 ? '10.5px' : '9.5px', display: 'flex', flexDirection: 'column', gap: '2px', color: '#111', lineHeight: 1.45 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>No. Nota:</span>
                <span style={{ fontWeight: 800 }}>#{order.order_number}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Waktu:</span>
                <span>{new Date(order.created_at || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {new Date(order.created_at || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Kasir:</span>
                <span>{order.cashier_name || 'Kasir'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pelanggan:</span>
                <span style={{ fontWeight: 700 }}>{order.customer_name || 'Pelanggan'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Layanan:</span>
                <span style={{ fontWeight: 700 }}>{order.order_type === 'dine_in' ? `Dine-In (Meja ${order.table_number || '-'})` : 'Bawa Pulang / Takeaway'}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

            {/* 3. Items Menu (Layout 2 Baris: Nama Menu lalu Qty x Harga & Subtotal) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {(order.items || []).map((it, idx) => {
                const variantText = it.selected_options && Object.keys(it.selected_options).length > 0 
                  ? Object.values(it.selected_options).join(', ') 
                  : '';
                const subtotalText = formatIDR(it.subtotal || it.price * it.quantity);
                const unitPriceText = formatIDR(it.price);

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {/* Baris 1: Nama Menu */}
                    <div style={{ fontWeight: 700, color: '#000', wordBreak: 'break-word', lineHeight: 1.25 }}>
                      {it.product_name}
                    </div>
                    {/* Baris 2: Qty x Harga Satuan (kiri) & Subtotal (kanan) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: is80 ? '10px' : '9.5px', color: '#222' }}>
                      <span style={{ paddingLeft: '6px' }}>{it.quantity} x {unitPriceText}</span>
                      <span style={{ fontWeight: 700, color: '#000' }}>{subtotalText}</span>
                    </div>
                    {/* Baris 3: Opsi Varian (jika ada) */}
                    {variantText && (
                      <div style={{ fontSize: '8.5px', color: '#555', paddingLeft: '6px', fontStyle: 'italic' }}>
                        • [{variantText}]
                      </div>
                    )}
                    {/* Baris 4: Catatan Khusus (jika ada) */}
                    {it.notes && (
                      <div style={{ fontSize: '8.5px', color: '#444', paddingLeft: '6px', fontStyle: 'italic' }}>
                        * Catatan: {it.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

            {/* 4. Rincian Biaya */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: is80 ? '10.5px' : '9.5px', color: '#111' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>{formatIDR(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Diskon Promo</span>
                  <span>-{formatIDR(order.discount)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pajak (PB1)</span>
                  <span>{formatIDR(order.tax)}</span>
                </div>
              )}
              {order.service_charge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Biaya Layanan</span>
                  <span>{formatIDR(order.service_charge)}</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1.5px solid #000', margin: '6px 0' }} />

            {/* 5. Total Pembayaran */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 900,
              fontSize: is80 ? '14px' : '13px',
              padding: '2px 0'
            }}>
              <span>TOTAL</span>
              <span>{formatIDR(order.total)}</span>
            </div>

            <div style={{ borderTop: '1.5px solid #000', margin: '6px 0' }} />

            {/* 6. Detail Pembayaran */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: is80 ? '10.5px' : '9.5px', color: '#111' }}>
              {isUnpaid ? (
                <div style={{
                  padding: '4px',
                  border: '1.5px dashed #000',
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: is80 ? '11px' : '10px',
                  letterSpacing: '0.3px',
                  marginBottom: '4px'
                }}>
                  *** TAGIHAN SEMENTARA (BELUM LUNAS) ***
                </div>
              ) : (
                <div style={{
                  padding: '4px',
                  border: '1.5px solid #000',
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: is80 ? '11px' : '10px',
                  letterSpacing: '0.3px',
                  marginBottom: '4px'
                }}>
                  *** LUNAS ***
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Metode Bayar:</span>
                <span style={{ textTransform: 'uppercase', fontWeight: 800 }}>
                  {isUnpaid ? 'OPEN BILL' : (order.payment_method || 'CASH')}
                </span>
              </div>
              {!isUnpaid && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Nominal Diterima:</span>
                    <span>{formatIDR(order.amount_paid || order.total)}</span>
                  </div>
                  {order.change_amount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: is80 ? '11px' : '10px' }}>
                      <span>Kembalian:</span>
                      <span>{formatIDR(order.change_amount)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 7. Fasilitas WiFi Kafe */}
            {(showWifi && (wifiSsid || wifiPass)) && (
              <>
                <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
                <div style={{
                  border: '1px dashed #000',
                  padding: '5px 8px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  margin: '4px 0'
                }}>
                  <div style={{ fontWeight: 800, fontSize: is80 ? '10px' : '9.5px', letterSpacing: '0.3px' }}>📶 FASILITAS WIFI KAFE</div>
                  {wifiSsid && <div style={{ fontSize: is80 ? '9.5px' : '9px', marginTop: '2px' }}>SSID: <strong>{wifiSsid}</strong></div>}
                  {wifiPass && <div style={{ fontSize: is80 ? '9.5px' : '9px' }}>Password: <strong>{wifiPass}</strong></div>}
                </div>
              </>
            )}

            {/* 8. Barcode Vektor */}
            <div dangerouslySetInnerHTML={{ __html: generateBarcodeSvg(order.order_number) }} />

            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

            {/* 9. Footer Struk */}
            <div style={{ textAlign: 'center', fontSize: is80 ? '9.5px' : '9px', color: '#333', display: 'flex', flexDirection: 'column', gap: '2px', whiteSpace: 'pre-line' }}>
              <div>{cafeFooter}</div>
              <div style={{ fontSize: '8px', color: '#666', marginTop: '4px' }}>
                Warkop & Cafe POS • Sistem Kasir Modern
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Direct Drawer (Expandable) */}
        {showWaInput && (
          <div className="no-print" style={{
            padding: '10px 16px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderTop: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <input 
              type="text"
              placeholder="Contoh: 08123456789 (Nomor WA Pelanggan)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#10b981',
                color: '#fff',
                fontWeight: 700,
                fontSize: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <ExternalLink size={13} />
              <span>Kirim</span>
            </button>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="no-print" style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(23, 20, 18, 0.98)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Main Printing Actions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px' }}>
            {/* 1. Cetak Thermal Standar / USB */}
            <button
              type="button"
              onClick={handlePrintThermal}
              disabled={isPrintingIframe}
              title="Cetak struk ke printer thermal via driver USB / dialog cetak bersih"
              style={{
                padding: '10px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%)',
                color: '#000',
                fontWeight: 800,
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Printer size={16} />
              <span>{isPrintingIframe ? 'Membuka Printer...' : `Cetak (${paperWidth})`}</span>
            </button>

            {/* 2. Cetak Bluetooth Portable (ESC/POS) */}
            <button
              type="button"
              onClick={handlePrintBluetooth}
              disabled={isPrintingBt}
              title="Cetak langsung ke mini printer Bluetooth portable (ESC/POS) tanpa popup dialog"
              style={{
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#60a5fa',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Bluetooth size={15} />
              <span>{isPrintingBt ? 'Menyambung...' : 'Bluetooth'}</span>
            </button>
          </div>

          {/* Secondary Actions Row */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Kirim WhatsApp */}
            <button
              type="button"
              onClick={() => setShowWaInput(!showWaInput)}
              title="Kirim struk digital ke WhatsApp pelanggan"
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '9px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34d399',
                fontSize: '11.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Share2 size={13} />
              <span>Kirim WA</span>
            </button>

            {/* Salin Clipboard */}
            <button
              type="button"
              onClick={handleCopyReceipt}
              title="Salin teks struk ke clipboard"
              style={{
                padding: '9px 12px',
                borderRadius: '9px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '11.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>

            {/* Selesai / Transaksi Baru */}
            <button
              type="button"
              onClick={onNewTransaction || onClose}
              style={{
                padding: '9px 14px',
                borderRadius: '9px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '11.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <PlusCircle size={13} />
              <span>Selesai</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
