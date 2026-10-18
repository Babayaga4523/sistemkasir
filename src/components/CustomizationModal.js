'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, MessageSquare } from 'lucide-react';

export default function CustomizationModal({ product, isOpen, onClose, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product && product.options) {
      // Set default selected options to first choice of each group
      const initial = {};
      product.options.forEach(group => {
        if (group.choices && group.choices.length > 0) {
          initial[group.name] = group.choices[0].name;
        }
      });
      setSelectedOptions(initial);
      setNotes('');
      setQuantity(1);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const formatIDR = (num) => {
    return `Rp ${Number(num || 0).toLocaleString('id-ID')}`;
  };

  // Calculate extra cost from options
  let extraCostPerItem = 0;
  if (product.options) {
    product.options.forEach(group => {
      const selectedChoiceName = selectedOptions[group.name];
      if (selectedChoiceName && group.choices) {
        const choiceObj = group.choices.find(c => c.name === selectedChoiceName);
        if (choiceObj && choiceObj.extra) {
          extraCostPerItem += Number(choiceObj.extra);
        }
      }
    });
  }

  const unitPrice = (Number(product.price) || 0) + extraCostPerItem;
  const totalPrice = unitPrice * quantity;

  const handleOptionSelect = (groupName, choiceName) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupName]: choiceName
    }));
  };

  const handleConfirm = () => {
    onAddToCart({
      product_id: product.id,
      product_name: product.name,
      price: unitPrice,
      base_price: product.price,
      quantity,
      selected_options: selectedOptions,
      notes: notes.trim(),
      subtotal: totalPrice,
      image: product.image
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(0, 0, 0, 0.75)',
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
          maxWidth: '520px',
          maxHeight: '90vh',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              fontSize: '24px'
            }}>
              {product.image && (product.image.startsWith('http') || product.image.startsWith('data:') || product.image.startsWith('/')) ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                product.image || '☕'
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{product.name}</h2>
              <div style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                Harga Dasar: {formatIDR(product.price)}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Options Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {product.options && product.options.map((group, idx) => (
            <div key={idx}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.6px'
              }}>
                {group.name}
              </label>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px'
              }}>
                {group.choices && group.choices.map((choice, cIdx) => {
                  const isSelected = selectedOptions[group.name] === choice.name;

                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => handleOptionSelect(group.name, choice.name)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        textAlign: 'left',
                        background: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        color: isSelected ? '#fff' : 'var(--text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 500 }}>
                          {choice.name}
                        </span>
                        {isSelected && <Check size={14} color="var(--accent-primary)" />}
                      </div>

                      {choice.extra > 0 && (
                        <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                          +{formatIDR(choice.extra)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Notes for Chef / Barista */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px'
            }}>
              <MessageSquare size={13} />
              Catatan Khusus (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Sawi banyakan, es dipisah, jangan manis-manis..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '13px'
              }}
            />
          </div>
        </div>

        {/* Footer with Quantity & Add Button */}
        <div style={{
          padding: '18px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(15, 12, 10, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Quantity Stepper */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '4px'
          }}>
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'transparent',
                color: quantity <= 1 ? 'rgba(255,255,255,0.2)' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Minus size={15} />
            </button>

            <span style={{
              width: '36px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 700,
              color: '#fff'
            }}>
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'transparent',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Plus size={15} />
            </button>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%)',
              color: '#000',
              fontWeight: 700,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)'
            }}
          >
            <span>Tambahkan Pesanan</span>
            <span style={{ background: 'rgba(0,0,0,0.15)', padding: '3px 8px', borderRadius: '6px' }}>
              {formatIDR(totalPrice)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
