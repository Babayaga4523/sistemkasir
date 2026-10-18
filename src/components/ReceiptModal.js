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
  const [isPrintingIframe, setIsPrintingIframe] = useState(false);
  const [isPrintingBt, setIsPrintingBt] = useState(false);
  const [btStatus, setBtStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showWaInput, setShowWaInput] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');

  // Load saved printer preferences
  useEffect(() => {
    if (isOpen) {
      const settings = getPrinterSettings();
      if (settings?.paperWidth) {
        setPaperWidth(settings.paperWidth);
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

  const formatIDR = (num) => {
    return `Rp ${Number(num || 0).toLocaleString('id-ID')}`;
  };

  const handleSelectPaperWidth = (width) => {
    setPaperWidth(width);
    const curr = getPrinterSettings();
    savePrinterSettings({ ...curr, paperWidth: width });
  };

  // Cetak Thermal Standar / USB via Isolated Iframe
  const handlePrintThermal = async () => {
    try {
      setIsPrintingIframe(true);
      await printThermalIframe({
        order,
        store,
        paperWidth,
        showWifi: true
      });
    } catch (err) {
      console.error('Error print thermal:', err);
      // Fallback ke window.print
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
        showWifi: true
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
    const text = formatWhatsAppReceipt({ order, store, showWifi: true });
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      alert('Gagal menyalin ringkasan.');
    });
  };

  // Buka WhatsApp Langsung
  const handleOpenWhatsApp = () => {
    const text = formatWhatsAppReceipt({ order, store, showWifi: true });
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
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="receipt-modal-content animate-scale-up"
        style={{
          width: '100%',
          maxWidth: is80 ? '480px' : '430px',
          maxHeight: '94vh',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
          transition: 'max-width 0.25s ease'
        }}
      >
        {/* Modal Header */}
        <div className="no-print" style={{
          padding: '14px 18px',
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
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#fff' }}>Cetak Struk Transaksi</span>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Nomor: #{order.order_number}
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

        {/* Paper Size Selector & Quick Notice */}
        <div className="no-print" style={{
          padding: '8px 18px',
          background: 'rgba(15, 12, 10, 0.95)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <Layers size={13} color="var(--accent-primary)" />
            <span>Ukuran Kertas:</span>
          </div>

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
        </div>

        {/* Status Toast Notification for Bluetooth */}
        {btStatus && (
          <div className="no-print" style={{
            padding: '8px 18px',
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
            <Bluetooth size={14} className={isPrintingBt ? 'animate-pulse' : ''} />
            <span>{btStatus}</span>
          </div>
        )}

        {/* Thermal Receipt Paper Container */}
        <div 
          className="receipt-paper-wrapper"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            background: '#0d0b09',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}
        >
          <div 
            id="thermal-receipt"
            style={{
              width: '100%',
              maxWidth: is80 ? '360px' : '280px',
              background: '#fff',
              color: '#111',
              padding: is80 ? '20px 18px' : '16px 14px',
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '11px',
              lineHeight: 1.35,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
              borderRadius: '6px',
              position: 'relative',
              transition: 'max-width 0.2s ease',
              boxSizing: 'border-box'
            }}
          >
            {/* Header Struk */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              {cafeLogo && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                  <img 
                    src={cafeLogo} 
                    alt={cafeName} 
                    style={{ maxHeight: '42px', maxWidth: '120px', objectFit: 'contain' }} 
                  />
                </div>
              )}
              <div style={{ fontSize: is80 ? '15px' : '13px', fontWeight: 900, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                {cafeName}
              </div>
              {cafeAddress && <div style={{ fontSize: '9.5px', color: '#555', marginTop: '2px' }}>{cafeAddress}</div>}
              {cafePhone && <div style={{ fontSize: '9.5px', color: '#555' }}>Telp: {cafePhone}</div>}
            </div>

            <div style={{ borderTop: '1px dashed #333', margin: '7px 0' }} />

            {/* Info Pesanan */}
            <div style={{ fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '2px', color: '#222' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>No. Nota:</span>
                <span style={{ fontWeight: 700 }}>#{order.order_number}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Waktu:</span>
                <span>{new Date(order.created_at || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {new Date(order.created_at || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
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
                <span style={{ fontWeight: 700 }}>{order.order_type === 'dine_in' ? `Meja ${order.table_number || '-'}` : 'Bawa Pulang'}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #333', margin: '7px 0' }} />

            {/* Items Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {(order.items || []).map((it, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span style={{ flex: 1, paddingRight: '4px' }}>{it.product_name}</span>
                    <span style={{ whiteSpace: 'nowrap' }}>{formatIDR(it.subtotal || it.price * it.quantity)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#555' }}>
                    <span>{it.quantity} x {formatIDR(it.price)}</span>
                    {it.selected_options && Object.keys(it.selected_options).length > 0 && (
                      <span style={{ fontStyle: 'italic' }}>
                        {Object.values(it.selected_options).join(', ')}
                      </span>
                    )}
                  </div>
                  {it.notes && (
                    <div style={{ fontSize: '9px', color: '#444', fontStyle: 'italic' }}>
                      Catatan: {it.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px dashed #333', margin: '8px 0' }} />

            {/* Total Calculation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>{formatIDR(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000' }}>
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
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 900,
                fontSize: is80 ? '13px' : '12px',
                paddingTop: '4px',
                borderTop: '1px solid #111',
                marginTop: '3px'
              }}>
                <span>TOTAL</span>
                <span>{formatIDR(order.total)}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #333', margin: '7px 0' }} />

            {/* Payment Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px', color: '#222' }}>
              {isUnpaid ? (
                <div style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  padding: '4px 6px',
                  borderRadius: '3px',
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: '10px',
                  letterSpacing: '0.5px',
                  marginBottom: '3px',
                  border: '1px solid #f87171'
                }}>
                  *** TAGIHAN SEMENTARA (BELUM LUNAS) ***
                </div>
              ) : (
                <div style={{
                  background: '#f0fdf4',
                  color: '#15803d',
                  padding: '3px 6px',
                  borderRadius: '3px',
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: '9.5px',
                  letterSpacing: '0.5px',
                  marginBottom: '3px',
                  border: '1px solid #86efac'
                }}>
                  *** LUNAS ***
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Metode:</span>
                <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>
                  {isUnpaid ? 'BELUM LUNAS (OPEN BILL)' : (order.payment_method || 'CASH')}
                </span>
              </div>
              {!isUnpaid && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Diterima:</span>
                    <span>{formatIDR(order.amount_paid || order.total)}</span>
                  </div>
                  {order.change_amount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Kembalian:</span>
                      <span>{formatIDR(order.change_amount)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* WiFi Facility */}
            {(wifiSsid || wifiPass) && (
              <>
                <div style={{ borderTop: '1px dashed #333', margin: '7px 0' }} />
                <div style={{ textAlign: 'center', fontSize: '9.5px', lineHeight: 1.3, color: '#333' }}>
                  <div style={{ fontWeight: 700 }}>📶 Fasilitas WiFi</div>
                  {wifiSsid && <div>SSID: <strong>{wifiSsid}</strong></div>}
                  {wifiPass && <div>Pass: <strong>{wifiPass}</strong></div>}
                </div>
              </>
            )}

            <div style={{ borderTop: '1px dashed #333', margin: '8px 0' }} />

            {/* Footer Struk */}
            <div style={{ textAlign: 'center', fontSize: '9px', color: '#555', display: 'flex', flexDirection: 'column', gap: '2px', whiteSpace: 'pre-line' }}>
              <div>{cafeFooter}</div>
              <div style={{ fontSize: '8px', color: '#888', marginTop: '3px' }}>
                Sistem Kasir Warkop POS
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Direct Drawer (Expandable) */}
        {showWaInput && (
          <div className="no-print" style={{
            padding: '10px 18px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderTop: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <input 
              type="text"
              placeholder="Contoh: 08123456789 (Nomor WA Pembeli)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.4)',
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

        {/* Modal Actions */}
        <div className="no-print" style={{
          padding: '14px 18px',
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
                padding: '11px',
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
                padding: '11px',
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
            {/* Salin / WhatsApp */}
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

            {/* Transaksi Baru */}
            <button
              type="button"
              onClick={onNewTransaction}
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
