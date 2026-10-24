'use client';

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  Utensils, 
  Package, 
  Percent, 
  Receipt,
  ArrowRight,
  CookingPot,
  MessageSquare,
  Check,
  Edit2,
  X
} from 'lucide-react';

export default function CartSidebar({
  cart,
  customerName,
  setCustomerName,
  tableNumber,
  setTableNumber,
  orderType,
  setOrderType,
  discount,
  setDiscount,
  taxEnabled,
  setTaxEnabled,
  taxPercentage = 10,
  serviceChargeEnabled = false,
  setServiceChargeEnabled,
  serviceChargePercentage = 5,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateItemNotes,
  onClearCart,
  onOpenPayment,
  onSendToKitchenDirect,
  openBillsCount = 0,
  onOpenActiveBills,
  isMobileDrawer = false,
  onCloseMobileDrawer,
  discounts = []
}) {
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [customDiscInput, setCustomDiscInput] = useState('');
  const [editingNoteIdx, setEditingNoteIdx] = useState(null);
  const [tempNoteText, setTempNoteText] = useState('');

  const formatIDR = (num) => {
    return `Rp ${Number(num || 0).toLocaleString('id-ID')}`;
  };

  const taxRate = Number(taxPercentage) || 10;
  const serviceRate = Number(serviceChargePercentage) || 5;

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.subtotal || item.price * item.quantity), 0);
  const discountAmount = Math.min(discount, subtotal);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxEnabled ? Math.round(taxableAmount * (taxRate / 100)) : 0;
  const serviceChargeAmount = serviceChargeEnabled ? Math.round(taxableAmount * (serviceRate / 100)) : 0;
  const grandTotal = Math.max(0, taxableAmount + taxAmount + serviceChargeAmount);

  const isEmpty = cart.length === 0;

  const handleStartEditNote = (idx, currentNote) => {
    setEditingNoteIdx(idx);
    setTempNoteText(currentNote || '');
  };

  const handleSaveNote = (idx) => {
    if (onUpdateItemNotes) {
      onUpdateItemNotes(idx, tempNoteText.trim());
    }
    setEditingNoteIdx(null);
  };

  return (
    <aside className="no-print" style={{
      width: isMobileDrawer ? '100%' : '380px',
      maxWidth: '100%',
      height: '100%',
      background: 'var(--bg-sidebar)',
      borderLeft: isMobileDrawer ? 'none' : '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden',
      borderRadius: isMobileDrawer ? '20px 20px 0 0' : 0
    }}>
      {/* 1. Header & Customer / Table Info */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(23, 20, 18, 0.7)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Pesanan Aktif</h2>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--accent-primary)',
              padding: '2px 7px',
              borderRadius: '999px'
            }}>
              {cart.reduce((sum, it) => sum + it.quantity, 0)} item
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {openBillsCount > 0 && onOpenActiveBills && (
              <button
                type="button"
                onClick={onOpenActiveBills}
                title="Lihat tagihan meja yang belum lunas"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Receipt size={12} />
                <span>Open Bill ({openBillsCount})</span>
              </button>
            )}

            {!isEmpty && (
              <button
                onClick={onClearCart}
                title="Kosongkan Keranjang"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--accent-rose)',
                  background: 'transparent',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                <Trash2 size={13} />
                <span>Batal</span>
              </button>
            )}

            {onCloseMobileDrawer && (
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                title="Tutup Keranjang"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  marginLeft: '4px'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Order Type Toggle: Dine In vs Takeaway */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '12px'
        }}>
          <button
            type="button"
            onClick={() => setOrderType('dine_in')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: orderType === 'dine_in' ? 600 : 500,
              background: orderType === 'dine_in' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: orderType === 'dine_in' ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: orderType === 'dine_in' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent'
            }}
          >
            <Utensils size={13} />
            <span>Makan di Sini</span>
          </button>

          <button
            type="button"
            onClick={() => setOrderType('takeaway')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: orderType === 'takeaway' ? 600 : 500,
              background: orderType === 'takeaway' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: orderType === 'takeaway' ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: orderType === 'takeaway' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent'
            }}
          >
            <Package size={13} />
            <span>Bawa Pulang</span>
          </button>
        </div>

        {/* Customer Name & Table Number */}
        <div style={{ display: 'grid', gridTemplateColumns: orderType === 'dine_in' ? '1fr 96px' : '1fr', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <User size={13} color="var(--text-faint)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Nama Pelanggan"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px'
              }}
            />
          </div>

          {orderType === 'dine_in' && (
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                pointerEvents: 'none'
              }}>
                Meja
              </span>
              <input
                type="text"
                placeholder="01"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 6px 7px 40px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                  textAlign: 'center'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Scrollable Cart Items List */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {isEmpty ? (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-faint)',
            textAlign: 'center',
            padding: '20px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <ShoppingBag size={28} opacity={0.4} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              Keranjang Masih Kosong
            </div>
            <p style={{ fontSize: '12px', maxWidth: '220px', lineHeight: 1.4 }}>
              Pilih menu dari katalog untuk memulai pesanan warkop
            </p>
          </div>
        ) : (
          cart.map((item, index) => {
            const hasVariants = item.selected_options && Object.keys(item.selected_options).length > 0;

            return (
              <div
                key={index}
                className="animate-fade-in"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                {/* Top line: Name and Total */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
                      {item.product_name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      @{formatIDR(item.price)}
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {formatIDR(item.subtotal || item.price * item.quantity)}
                  </div>
                </div>

                {/* Selected Options Pills */}
                {hasVariants && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {Object.entries(item.selected_options).map(([k, v], vIdx) => (
                      <span
                        key={vIdx}
                        style={{
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes & Note Editor */}
                {editingNoteIdx === index ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Contoh: less sugar, pedas, tanpa es..."
                      value={tempNoteText}
                      onChange={(e) => setTempNoteText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(index)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-focus)',
                        color: '#fff',
                        fontSize: '11px',
                        width: '100%'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {['Less Sugar', 'Tanpa Es', 'Pedas', 'Ekstra Manis', 'Panas'].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTempNoteText(prev => prev ? `${prev}, ${preset}` : preset)}
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          +{preset}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '2px' }}>
                      <button
                        type="button"
                        onClick={() => setEditingNoteIdx(null)}
                        style={{
                          fontSize: '10px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          color: 'var(--text-muted)',
                          background: 'transparent'
                        }}
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveNote(index)}
                        style={{
                          fontSize: '10px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: 'var(--accent-primary)',
                          color: '#000',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Check size={10} />
                        Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    {item.notes ? (
                      <div 
                        onClick={() => handleStartEditNote(index, item.notes)}
                        title="Klik untuk ubah catatan"
                        style={{
                          fontSize: '11px',
                          fontStyle: 'italic',
                          color: 'var(--accent-primary)',
                          background: 'rgba(245, 158, 11, 0.08)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <MessageSquare size={11} />
                        <span>&ldquo;{item.notes}&rdquo;</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartEditNote(index, '')}
                        style={{
                          fontSize: '10px',
                          color: 'var(--text-faint)',
                          background: 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 4px'
                        }}
                      >
                        <MessageSquare size={10} />
                        <span>+ Catatan</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Bottom line: Stepper & Remove */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '6px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '2px'
                  }}>
                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                      style={{
                        width: '24px',
                        height: '24px',
                        background: 'transparent',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px'
                      }}
                    >
                      <Minus size={12} />
                    </button>

                    <span style={{
                      width: '26px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#fff'
                    }}>
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                      style={{
                        width: '24px',
                        height: '24px',
                        background: 'transparent',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px'
                      }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(index)}
                    style={{
                      background: 'transparent',
                      color: 'var(--text-faint)',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                    title="Hapus item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Summary & Payment Action */}
      <div style={{
        padding: '14px 18px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(23, 20, 18, 0.98)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        flexShrink: 0
      }}>
        {/* Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span>{formatIDR(subtotal)}</span>
          </div>

          {/* Diskon / Promo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <button
              type="button"
              onClick={() => setShowDiscountInput(!showDiscountInput)}
              style={{
                background: 'transparent',
                color: discount > 0 ? 'var(--accent-emerald)' : 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              <Percent size={12} />
              <span>{discount > 0 ? `Diskon (${formatIDR(discount)})` : '+ Tambah Diskon'}</span>
            </button>

            {discount > 0 && (
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                -{formatIDR(discountAmount)}
              </span>
            )}
          </div>

          {showDiscountInput && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginTop: '4px',
              padding: '8px 10px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Pilih Diskon Promo:
              </div>

              {/* Tombol Diskon Aktif */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '5px' }}>
                {(Array.isArray(discounts) && discounts.filter(d => d.is_active !== false).length > 0 
                  ? discounts.filter(d => d.is_active !== false)
                  : [
                      { id: 'def-1', name: '10% Member', type: 'percentage', value: 10, min_order: 0 },
                      { id: 'def-2', name: 'Rp 5.000', type: 'fixed', value: 5000, min_order: 0 }
                    ]
                ).map(d => {
                  const isEligible = !d.min_order || subtotal >= Number(d.min_order);
                  const calculatedDiscount = d.type === 'percentage'
                    ? Math.round(subtotal * (Number(d.value) / 100))
                    : Math.min(subtotal, Number(d.value) || 0);

                  return (
                    <button
                      key={d.id}
                      type="button"
                      disabled={!isEligible}
                      onClick={() => {
                        setDiscount(calculatedDiscount);
                        setShowDiscountInput(false);
                      }}
                      title={!isEligible ? `Minimal belanja Rp ${Number(d.min_order).toLocaleString('id-ID')}` : d.name}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: isEligible ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        color: isEligible ? '#fff' : 'var(--text-faint)',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        cursor: isEligible ? 'pointer' : 'not-allowed',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
                      <div style={{ fontSize: '9px', color: isEligible ? 'var(--accent-primary)' : 'var(--text-faint)', fontWeight: 700 }}>
                        {d.type === 'percentage' ? `${d.value}% (-${formatIDR(calculatedDiscount)})` : `-${formatIDR(d.value)}`}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Input Nominal Diskon Kustom */}
              <div style={{ display: 'flex', gap: '5px', marginTop: '3px' }}>
                <input
                  type="number"
                  placeholder="Nominal manual (Rp)..."
                  value={customDiscInput}
                  onChange={(e) => setCustomDiscInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = Number(customDiscInput);
                    if (!isNaN(val) && val > 0) {
                      setDiscount(Math.min(subtotal, val));
                      setCustomDiscInput('');
                      setShowDiscountInput(false);
                    }
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'var(--accent-primary)',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '10.5px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Terapkan
                </button>
                {discount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDiscount(0);
                      setShowDiscountInput(false);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: 'var(--accent-rose)',
                      fontSize: '10.5px',
                      cursor: 'pointer'
                    }}
                  >
                    Reset (0)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PB1 Tax Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px' }}>
              <input
                type="checkbox"
                checked={taxEnabled}
                onChange={(e) => setTaxEnabled(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <span>Pajak Resto / PB1 ({taxRate}%)</span>
            </label>

            {taxEnabled && <span>{formatIDR(taxAmount)}</span>}
          </div>

          {/* Service Charge Toggle (if configured in store) */}
          {(serviceChargeEnabled || setServiceChargeEnabled) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px' }}>
                <input
                  type="checkbox"
                  checked={serviceChargeEnabled}
                  onChange={(e) => setServiceChargeEnabled && setServiceChargeEnabled(e.target.checked)}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                <span>Biaya Layanan ({serviceRate}%)</span>
              </label>

              {serviceChargeEnabled && <span>{formatIDR(serviceChargeAmount)}</span>}
            </div>
          )}

          {/* Grand Total */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingTop: '8px',
            borderTop: '1px dashed var(--border-subtle)',
            marginTop: '4px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Total Tagihan</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '0.2px' }}>
              {formatIDR(grandTotal)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Pay Button */}
          <button
            type="button"
            disabled={isEmpty}
            onClick={onOpenPayment}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '12px',
              background: isEmpty 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'linear-gradient(135deg, var(--accent-emerald) 0%, var(--accent-emerald-hover) 100%)',
              color: isEmpty ? 'rgba(255, 255, 255, 0.3)' : '#fff',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: isEmpty ? 'none' : '0 4px 15px var(--accent-emerald-glow)'
            }}
          >
            <Receipt size={17} />
            <span>Bayar Sekarang ({formatIDR(grandTotal)})</span>
            <ArrowRight size={16} />
          </button>

          {/* Kirim ke Dapur Dulu (Open Tab) */}
          <button
            type="button"
            disabled={isEmpty}
            onClick={onSendToKitchenDirect}
            title="Kirim ke Dapur / Bar sekarang, bayar nanti saat selesai nongkrong"
            style={{
              width: '100%',
              padding: '9px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: isEmpty ? 'rgba(255, 255, 255, 0.25)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <CookingPot size={14} color="var(--accent-primary)" />
            <span>Kirim Dapur Dulu (Open Bill)</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
