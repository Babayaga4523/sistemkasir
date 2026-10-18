'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateDynamicQRIS, parseQrisMerchantInfo, SAMPLE_WARKOP_QRIS } from '../utils/qris';
import { 
  X, 
  Banknote, 
  QrCode, 
  CreditCard, 
  CheckCircle2, 
  Sparkles,
  Copy,
  Lock,
  Check,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentModal({
  isOpen,
  onClose,
  totalAmount,
  customerName,
  tableNumber,
  orderType,
  storePaymentMethods,
  store,
  onProcessPayment
}) {
  const allMethods = [
    { id: 'cash', label: 'Tunai', sub: 'Cash', icon: Banknote, enabled: storePaymentMethods?.cash !== false },
    { id: 'qris', label: 'QRIS', sub: 'Otomatis', icon: QrCode, enabled: storePaymentMethods?.qris !== false },
    { id: 'transfer', label: 'Transfer', sub: 'Bank', icon: CreditCard, enabled: storePaymentMethods?.transfer !== false }
  ];
  const activeMethods = allMethods.filter(m => m.enabled);
  const availableMethods = activeMethods.length > 0 ? activeMethods : allMethods;

  const [method, setMethod] = useState(availableMethods[0]?.id || 'cash');
  const [cashAmount, setCashAmount] = useState(totalAmount);
  const [selectedBank, setSelectedBank] = useState('BCA');

  // QRIS State
  const [copiedQris, setCopiedQris] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Sync default method if availableMethods change or on open
  useEffect(() => {
    if (isOpen) {
      setCashAmount(totalAmount);
      if (!availableMethods.some(m => m.id === method)) {
        setMethod(availableMethods[0]?.id || 'cash');
      }
    }
  }, [isOpen, totalAmount]);

  // Generate dynamic QRIS string synchronously
  const qrisString = useMemo(() => {
    const rawBase = (store?.qris_payload && store.qris_payload.trim().startsWith('000201'))
      ? store.qris_payload.trim()
      : SAMPLE_WARKOP_QRIS;

    const isDynamic = store?.qris_dynamic_enabled !== false;
    if (!isDynamic) return rawBase;

    try {
      return generateDynamicQRIS(rawBase, totalAmount);
    } catch (err) {
      console.warn('Gagal generate dynamic QRIS:', err);
      return rawBase;
    }
  }, [store?.qris_payload, store?.qris_dynamic_enabled, totalAmount]);

  // Extract merchant info from QRIS payload
  const qrisInfo = useMemo(() => {
    return parseQrisMerchantInfo(qrisString);
  }, [qrisString]);

  const formatIDR = (num) => {
    return `Rp ${Number(num || 0).toLocaleString('id-ID')}`;
  };

  const changeAmount = Math.max(0, (Number(cashAmount) || 0) - totalAmount);
  const isCashSufficient = (Number(cashAmount) || 0) >= totalAmount;

  // Preset quick cash denominations
  const quickCashOptions = useMemo(() => {
    const opts = [{ label: 'Uang Pas', value: totalAmount }];
    const standard = [10000, 20000, 50000, 100000, 200000, 500000];

    const next10k = Math.ceil(totalAmount / 10000) * 10000;
    const next50k = Math.ceil(totalAmount / 50000) * 50000;
    const next100k = Math.ceil(totalAmount / 100000) * 100000;

    [next10k, next50k, next100k, ...standard].forEach(val => {
      if (val > totalAmount && !opts.some(o => o.value === val)) {
        opts.push({ label: val.toLocaleString('id-ID'), value: val });
      }
    });

    return opts.sort((a, b) => a.value - b.value).slice(0, 4);
  }, [totalAmount]);

  const handleConfirmPayment = () => {
    if (method === 'cash' && !isCashSufficient) {
      alert('Nominal uang tunai yang dimasukkan kurang dari total tagihan.');
      return;
    }

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }

    onProcessPayment({
      payment_method: method,
      amount_paid: method === 'cash' ? Number(cashAmount) : totalAmount,
      change_amount: method === 'cash' ? changeAmount : 0,
      bank: method === 'transfer' ? selectedBank : null
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <style>{`
        .payment-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 18px;
        }
        @media (max-width: 680px) {
          .payment-modal-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>

      <div 
        className="animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '760px',
          maxHeight: 'min(94vh, 640px)',
          background: 'linear-gradient(150deg, #171412 0%, #0d0a08 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.9), 0 0 35px -5px rgba(245, 158, 11, 0.15)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Top Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '0.2px' }}>
                Pembayaran Kasir
              </h2>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {customerName || 'Pelanggan'} • {orderType === 'dine_in' ? `Meja ${tableNumber || '-'}` : 'Bawa Pulang'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* 2-Column Responsive Body */}
        <div style={{
          padding: '18px 20px',
          flex: 1,
          minHeight: 0,
          overflowY: 'auto'
        }}>
          <div className="payment-modal-grid">
            
            {/* Left Column: Total & Payment Method Selectors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Total Tagihan Banner */}
              <div style={{
                padding: '12px 16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.06) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>
                    Total Tagihan
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '0.3px', lineHeight: '1.2' }}>
                    {formatIDR(totalAmount)}
                  </div>
                </div>

                <div style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Sparkles size={12} />
                  <span>Siap Bayar</span>
                </div>
              </div>

              {/* Method Selector Tabs */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  Pilih Cara Bayar:
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${availableMethods.length}, 1fr)`,
                  gap: '6px'
                }}>
                  {availableMethods.map(m => {
                    const Icon = m.icon;
                    const isSelected = method === m.id;

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        style={{
                          padding: '10px 6px',
                          borderRadius: '10px',
                          background: isSelected ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          color: isSelected ? '#fff' : 'var(--text-muted)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon size={18} color={isSelected ? 'var(--accent-primary)' : 'currentColor'} />
                        <span style={{ fontSize: '11px', fontWeight: isSelected ? 800 : 600 }}>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Left Column Dynamic Method Controls */}
              {method === 'cash' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Preset Buttons */}
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Pilihan Cepat Uang Diterima:
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {quickCashOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCashAmount(opt.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '7px',
                            background: cashAmount === opt.value ? 'rgba(245, 158, 11, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                            border: cashAmount === opt.value ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                            color: cashAmount === opt.value ? 'var(--accent-primary)' : '#fff',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {opt.label === 'Uang Pas' ? 'Uang Pas' : formatIDR(opt.value)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cash Input */}
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Nominal Uang Tunai (Rp):
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        position: 'absolute',
                        left: '12px',
                        fontSize: '15px',
                        fontWeight: 800,
                        color: 'var(--accent-primary)',
                        pointerEvents: 'none'
                      }}>
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cashAmount ? Number(cashAmount).toLocaleString('id-ID') : ''}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setCashAmount(raw ? Number(raw) : 0);
                        }}
                        placeholder="0"
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 38px',
                          borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          border: '1px solid var(--border-subtle)',
                          color: '#fff',
                          fontSize: '17px',
                          fontWeight: 800
                        }}
                      />
                    </div>
                  </div>

                  {/* Kembalian Pill */}
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: isCashSufficient ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: isCashSufficient ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isCashSufficient ? '#34d399' : '#f87171' }}>
                      {isCashSufficient ? 'Kembalian:' : 'Uang Kurang:'}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 900, color: isCashSufficient ? '#34d399' : '#f87171' }}>
                      {isCashSufficient ? formatIDR(changeAmount) : formatIDR(totalAmount - (Number(cashAmount) || 0))}
                    </span>
                  </div>
                </div>
              )}

              {method === 'qris' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Status Indicator */}
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(14, 165, 233, 0.1)',
                    border: '1px solid rgba(14, 165, 233, 0.25)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <ShieldCheck size={16} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '11px', color: '#e0f2fe', lineHeight: '1.4' }}>
                      <b>QRIS Terkunci Otomatis:</b> Pelanggan cukup scan dengan aplikasi apapun, nominal tagihan langsung terisi tanpa ketik manual.
                    </div>
                  </div>

                  {/* Supported Apps Badges */}
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                      Mendukung Semua Pembayaran:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {['BCA', 'Mandiri', 'BRI', 'BNI', 'GoPay', 'OVO', 'DANA', 'ShopeePay'].map(app => (
                        <span
                          key={app}
                          style={{
                            padding: '3px 6px',
                            borderRadius: '5px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '9px',
                            color: '#cbd5e1',
                            fontWeight: 600
                          }}
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Copy String Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (qrisString && typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(qrisString);
                        setCopiedQris(true);
                        setTimeout(() => setCopiedQris(false), 2500);
                      }
                    }}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: copiedQris ? 'var(--accent-emerald)' : 'var(--text-muted)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      alignSelf: 'flex-start'
                    }}
                  >
                    {copiedQris ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                    <span>{copiedQris ? 'String QRIS Tersalin!' : 'Salin String QRIS'}</span>
                  </button>
                </div>
              )}

              {method === 'transfer' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {['BCA', 'Mandiri', 'BRI'].map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          background: selectedBank === b ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: selectedBank === b ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          color: selectedBank === b ? 'var(--accent-primary)' : '#fff',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        Rekening {store?.bank_name ? `${store.bank_name} / ` : ''}{selectedBank}:
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>
                        {store?.bank_account_number || (selectedBank === 'BCA' ? '5410-8291-01' : selectedBank === 'Mandiri' ? '137-00-19283-4' : '0341-01-098273-50')}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--accent-primary)', marginTop: '1px' }}>
                        a.n. {store?.bank_account_name || store?.name || 'Warkop POS'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const accNum = store?.bank_account_number || (selectedBank === 'BCA' ? '5410829101' : selectedBank === 'Mandiri' ? '13700192834' : '03410109827350');
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(accNum);
                          setCopiedAccount(true);
                          setTimeout(() => setCopiedAccount(false), 2500);
                        }
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: copiedAccount ? 'var(--accent-emerald)' : '#fff',
                        fontSize: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {copiedAccount ? <Check size={11} color="var(--accent-emerald)" /> : <Copy size={11} />}
                      <span>{copiedAccount ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Visual Showcase Card */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {method === 'qris' && (
                <div style={{
                  width: '100%',
                  maxWidth: '280px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.65)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  {/* Official Red QRIS Header */}
                  <div style={{
                    background: '#ed1c24',
                    color: '#ffffff',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '0.8px' }}>QRIS</span>
                      <span style={{ fontSize: '8px', fontWeight: 600, opacity: 0.9 }}>PEMBAYARAN NASIONAL</span>
                    </div>
                    <div style={{
                      fontSize: '8px',
                      fontWeight: 900,
                      background: '#ffffff',
                      color: '#ed1c24',
                      padding: '2px 5px',
                      borderRadius: '4px'
                    }}>
                      BI / ASPI
                    </div>
                  </div>

                  {/* Card Interior */}
                  <div style={{
                    padding: '12px 14px 14px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {/* Legal Merchant Name */}
                    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 900,
                        color: '#0f172a',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        lineHeight: '1.2'
                      }}>
                        {qrisInfo.merchantName || store?.name || 'KASIR POS'}
                      </div>
                      <div style={{ fontSize: '9px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                        NMID: {qrisInfo.nmid || 'ID102541396857503'} • {qrisInfo.city || qrisInfo.merchantCity || 'INDONESIA'}
                      </div>
                    </div>

                    {/* Vector QR Code SVG */}
                    <div style={{
                      width: '176px',
                      height: '176px',
                      background: '#ffffff',
                      border: '2px solid #0f172a',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      boxSizing: 'border-box'
                    }}>
                      {qrisString ? (
                        <QRCodeSVG
                          value={qrisString}
                          size={164}
                          level="M"
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                          <QrCode size={60} />
                          <span style={{ fontSize: '10px', fontWeight: 600 }}>Membuat QR...</span>
                        </div>
                      )}
                    </div>

                    {/* Locked Nominal Indicator */}
                    <div style={{
                      marginTop: '10px',
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={12} color="#059669" />
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#047857' }}>Nominal Terkunci:</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: '#065f46' }}>
                        {formatIDR(totalAmount)}
                      </span>
                    </div>

                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '5px', textAlign: 'center' }}>
                      Arahkan kamera HP ke barcode di atas
                    </div>
                  </div>
                </div>
              )}

              {method === 'cash' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '220px',
                  borderRadius: '16px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: isCashSufficient ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCashSufficient ? '#34d399' : 'var(--accent-primary)'
                  }}>
                    <Banknote size={26} />
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status Pembayaran Tunai</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                      {isCashSufficient ? 'Uang Diterima Cukup' : 'Menunggu Uang Pas / Lebih'}
                    </div>
                  </div>

                  <div style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: isCashSufficient ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: isCashSufficient ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isCashSufficient ? '#34d399' : '#f87171'
                  }}>
                    {isCashSufficient ? `Kembalian: ${formatIDR(changeAmount)}` : `Kurang: ${formatIDR(totalAmount - (Number(cashAmount) || 0))}`}
                  </div>
                </div>
              )}

              {method === 'transfer' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '220px',
                  borderRadius: '16px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'rgba(14, 165, 233, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8'
                  }}>
                    <CreditCard size={26} />
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bank {selectedBank}</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                      Transfer / Debit EDC
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '200px' }}>
                    Pastikan struk transfer atau bukti struk EDC sudah dicek sebelum konfirmasi.
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(15, 12, 10, 0.9)',
          display: 'flex',
          gap: '10px',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleConfirmPayment}
            style={{
              flex: 1,
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-emerald) 0%, var(--accent-emerald-hover) 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px var(--accent-emerald-glow)'
            }}
          >
            <CheckCircle2 size={16} />
            <span>Selesaikan Pembayaran ({formatIDR(totalAmount)})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
