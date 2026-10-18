'use client';

import React, { useState } from 'react';
import { Plus, SlidersHorizontal, AlertTriangle, Sparkles } from 'lucide-react';

export default function ProductCard({ product, onSelect, onQuickAdd }) {
  const [isHovered, setIsHovered] = useState(false);
  const isAvailable = product.available !== false;
  const hasOptions = product.has_options && product.options && product.options.length > 0;

  const formatIDR = (num) => {
    return Number(num || 0).toLocaleString('id-ID');
  };

  const handleClick = () => {
    if (!isAvailable) return;
    if (hasOptions) {
      onSelect(product);
    } else {
      onQuickAdd(product);
    }
  };

  const isImageUrl = product.image && (
    product.image.startsWith('http') || 
    product.image.startsWith('data:') || 
    product.image.startsWith('/')
  );

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="animate-fade-in"
      style={{
        background: isAvailable 
          ? 'linear-gradient(155deg, rgba(28, 23, 20, 0.95) 0%, rgba(16, 13, 11, 0.98) 100%)' 
          : 'rgba(23, 20, 18, 0.4)',
        border: isHovered && isAvailable 
          ? '1px solid rgba(245, 158, 11, 0.5)' 
          : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '200px',
        cursor: isAvailable ? 'pointer' : 'not-allowed',
        opacity: isAvailable ? 1 : 0.55,
        transform: isHovered && isAvailable ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: isHovered && isAvailable 
          ? '0 12px 28px -6px rgba(0, 0, 0, 0.75), 0 0 16px -4px rgba(245, 158, 11, 0.25)' 
          : '0 4px 14px rgba(0, 0, 0, 0.35)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        boxSizing: 'border-box',
        userSelect: 'none'
      }}
    >
      {/* Top Visual Showcase / Image Banner */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '90px',
        borderRadius: '12px',
        background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.12) 0%, rgba(10, 8, 7, 0.6) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: '10px'
      }}>
        {isImageUrl ? (
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.35s ease'
            }} 
          />
        ) : (
          <div style={{
            fontSize: '38px',
            filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6))',
            transform: isHovered ? 'scale(1.15) rotate(4deg)' : 'scale(1)',
            transition: 'transform 0.25s ease'
          }}>
            {product.image || '☕'}
          </div>
        )}

        {/* Floating Badges */}
        <div style={{
          position: 'absolute',
          top: '6px',
          right: '6px',
          display: 'flex',
          gap: '4px'
        }}>
          {!isAvailable ? (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '10px',
              fontWeight: 700,
              color: '#f87171',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              padding: '2px 7px',
              borderRadius: '999px'
            }}>
              <AlertTriangle size={10} />
              Habis
            </span>
          ) : hasOptions ? (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--accent-primary)',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: '2px 8px',
              borderRadius: '999px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
            }}>
              <Sparkles size={10} />
              Varian
            </span>
          ) : null}
        </div>
      </div>

      {/* Middle Section: Name & Description */}
      <div style={{ flex: 1, minHeight: 0, marginBottom: '10px' }}>
        <h3 style={{
          fontSize: '13.5px',
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: '1.3',
          marginBottom: '3px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          letterSpacing: '0.1px'
        }}>
          {product.name}
        </h3>
        <p style={{
          fontSize: '11px',
          color: '#94a3b8',
          lineHeight: '1.35',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {product.description || 'Pilihan nikmat khas warkop'}
        </p>
      </div>

      {/* Bottom Section: Price & Action Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)' }}>
            Rp
          </span>
          <span style={{
            fontSize: '16px',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '0.2px'
          }}>
            {formatIDR(product.price)}
          </span>
        </div>

        <button
          type="button"
          disabled={!isAvailable}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: isAvailable 
              ? (isHovered 
                  ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' 
                  : 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)')
              : 'rgba(255, 255, 255, 0.1)',
            color: isAvailable ? '#000' : 'rgba(255, 255, 255, 0.4)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isAvailable ? '0 4px 12px rgba(245, 158, 11, 0.35)' : 'none',
            transform: isHovered && isAvailable ? 'scale(1.08)' : 'scale(1)',
            transition: 'all 0.2s ease',
            cursor: isAvailable ? 'pointer' : 'not-allowed'
          }}
          title={hasOptions ? "Pilih varian item ini" : "Tambah langsung ke keranjang"}
        >
          {hasOptions ? <SlidersHorizontal size={14} strokeWidth={2.8} /> : <Plus size={17} strokeWidth={3} />}
        </button>
      </div>
    </div>
  );
}
