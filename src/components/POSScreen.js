'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  X, 
  Sparkles, 
  Filter, 
  Coffee, 
  Utensils, 
  CupSoda, 
  Cookie,
  ArrowRight,
  BookOpen,
  Sliders,
  Store,
  ShoppingBag,
  Receipt
} from 'lucide-react';
import ProductCard from './ProductCard';
import CartSidebar from './CartSidebar';

export default function POSScreen({
  categories,
  products,
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
  onSelectProduct,
  onQuickAddProduct,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateItemNotes,
  onClearCart,
  onOpenPayment,
  onSendToKitchenDirect,
  onOpenTutorial,
  onSeedTemplate,
  loadingSeed = false,
  storeName = '',
  openBillsCount = 0,
  onOpenActiveBills,
  discounts = []
}) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const totalCartItems = cart.reduce((sum, it) => sum + it.quantity, 0);
  const cartSubtotal = cart.reduce((sum, it) => sum + (it.subtotal || it.price * it.quantity), 0);

  // Filtering products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Coffee': return Coffee;
      case 'CupSoda': return CupSoda;
      case 'Utensils': return Utensils;
      case 'Cookie': return Cookie;
      default: return Sparkles;
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      width: '100%',
      overflow: 'hidden'
    }}>
      <style>{`
        .pos-catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
          gap: 10px;
          align-content: start;
        }
        @media (max-width: 640px) {
          .pos-catalog-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            padding: 10px 10px calc(var(--mobile-nav-height) + var(--safe-bottom) + 85px) 10px !important;
          }
        }
        @media (max-width: 340px) {
          .pos-catalog-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      {/* Left / Center: Catalog Section */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        background: 'var(--bg-main)'
      }}>
        {/* Top Control Bar: Search & Quick Stat */}
        <div style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap',
          background: 'rgba(23, 20, 18, 0.5)'
        }}>
          {/* Search Box */}
          <div style={{
            position: 'relative',
            flex: 1,
            minWidth: '180px',
            maxWidth: '480px'
          }}>
            <Search 
              size={16} 
              color="var(--text-muted)" 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Cari kopi, indomie, cireng, es teh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 34px 9px 38px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13px'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Mobile Open Bills shortcut */}
            {openBillsCount > 0 && onOpenActiveBills && (
              <button
                type="button"
                onClick={onOpenActiveBills}
                title="Buka daftar tagihan meja / open bill yang belum lunas"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '7px 11px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.16)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: 'var(--accent-primary)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Receipt size={13} />
                <span>Tagihan ({openBillsCount})</span>
              </button>
            )}

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              <strong style={{ color: '#fff' }}>{filteredProducts.length}</strong> menu
            </div>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="touch-scroll-x" style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          background: 'rgba(18, 15, 13, 0.5)'
        }}>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '7px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: selectedCategory === 'all' ? 700 : 500,
              background: selectedCategory === 'all' 
                ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%)' 
                : 'rgba(255, 255, 255, 0.04)',
              color: selectedCategory === 'all' ? '#000' : 'var(--text-muted)',
              border: selectedCategory === 'all' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              whiteSpace: 'nowrap',
              boxShadow: selectedCategory === 'all' ? '0 2px 10px rgba(245, 158, 11, 0.3)' : 'none'
            }}
          >
            Semua ({products.length})
          </button>

          {categories.map(cat => {
            const Icon = getCategoryIcon(cat.icon);
            const isSelected = selectedCategory === cat.id;
            const count = products.filter(p => p.category_id === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected 
                    ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%)' 
                    : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#000' : 'var(--text-muted)',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: isSelected ? '0 2px 10px rgba(245, 158, 11, 0.3)' : 'none'
                }}
              >
                <Icon size={13} color={isSelected ? '#000' : 'var(--accent-primary)'} />
                <span>{cat.name} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div 
          className="pos-catalog-grid"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '12px 12px 90px 12px'
          }}
        >
          {products.length === 0 ? (
            /* Getting Started / Tutorial Guide for New Store */
            <div style={{
              gridColumn: '1 / -1',
              padding: '36px 28px',
              background: 'rgba(23, 20, 18, 0.85)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '24px',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              margin: '12px auto',
              maxWidth: '720px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)'
              }}>
                <Sparkles size={30} color="#fff" />
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                Selamat Datang di Kasir {storeName || 'Kafe Anda'}!
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.5 }}>
                Toko Anda baru saja didaftarkan dan masih bersih dari data. Ikuti 3 langkah awal di bawah untuk mulai berjualan:
              </p>

              {/* 3 Step Action Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: '12px',
                textAlign: 'left',
                marginBottom: '24px'
              }}>
                {/* Step 1 */}
                <div style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        color: '#000',
                        fontWeight: 800,
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>1</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Input Menu</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                      Tambahkan produk kopi, makanan, cemilan, harga modal HPP & jual.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/menu')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Kelola Menu</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* Step 2 */}
                <div style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: '#3b82f6',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>2</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Logo & Struk</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                      Pasang logo kafe untuk kop struk thermal, nomor WA, dan pajak PB1.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/settings')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Pengaturan Kafe</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* Step 3 */}
                <div style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: '#10b981',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>3</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Template Instan</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                      Ingin langsung coba kasir? Muat 18 menu warkop siap pakai.
                    </p>
                  </div>
                  <button
                    onClick={onSeedTemplate}
                    disabled={loadingSeed}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: loadingSeed ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      opacity: loadingSeed ? 0.7 : 1
                    }}
                  >
                    <Sparkles size={13} />
                    <span>{loadingSeed ? 'Memuat...' : 'Muat Template'}</span>
                  </button>
                </div>
              </div>

              {/* Tutorial Modal Button */}
              {onOpenTutorial && (
                <button
                  onClick={onOpenTutorial}
                  style={{
                    padding: '11px 22px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: '#fef3c7',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <BookOpen size={16} color="var(--accent-primary)" />
                  <span>Buka Panduan Tutorial Lengkap (5 Langkah Kasir)</span>
                </button>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <Coffee size={40} opacity={0.3} style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                Menu Tidak Ditemukan
              </h4>
              <p style={{ fontSize: '13px' }}>
                Coba gunakan kata kunci pencarian lain atau pilih kategori yang berbeda.
              </p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onQuickAdd={onQuickAddProduct}
              />
            ))
          )}
        </div>
      </div>

      {/* Right: Sticky Cart Sidebar (Desktop only) */}
      <div className="hide-on-tablet" style={{ height: '100%' }}>
        <CartSidebar
          cart={cart}
          customerName={customerName}
          setCustomerName={setCustomerName}
          tableNumber={tableNumber}
          setTableNumber={setTableNumber}
          orderType={orderType}
          setOrderType={setOrderType}
          discount={discount}
          setDiscount={setDiscount}
          taxEnabled={taxEnabled}
          setTaxEnabled={setTaxEnabled}
          taxPercentage={taxPercentage}
          serviceChargeEnabled={serviceChargeEnabled}
          setServiceChargeEnabled={setServiceChargeEnabled}
          serviceChargePercentage={serviceChargePercentage}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onUpdateItemNotes={onUpdateItemNotes}
          onClearCart={onClearCart}
          onOpenPayment={onOpenPayment}
          onSendToKitchenDirect={onSendToKitchenDirect}
          openBillsCount={openBillsCount}
          onOpenActiveBills={onOpenActiveBills}
          discounts={discounts}
        />
      </div>

      {/* Floating Mobile / Tablet Cart Trigger Bar */}
      {cart.length > 0 && (
        <div 
          className="show-on-tablet" 
          style={{
            display: 'none',
            position: 'fixed',
            bottom: 'calc(var(--mobile-nav-height, 62px) + var(--safe-bottom, 0px) + 8px)',
            left: '12px',
            right: '12px',
            zIndex: 60
          }}
        >
          <button
            type="button"
            onClick={() => setIsMobileCartOpen(true)}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%)',
              color: '#000',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 800,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                background: 'rgba(0, 0, 0, 0.15)',
                padding: '4px 8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <ShoppingBag size={16} color="#000" />
                <span>{totalCartItems} Item</span>
              </div>
              <span>•</span>
              <span style={{ fontSize: '14px', fontWeight: 800 }}>Rp {cartSubtotal.toLocaleString('id-ID')}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
              <span>Lihat Pesanan</span>
              <ArrowRight size={15} />
            </div>
          </button>
        </div>
      )}

      {/* Mobile Cart Drawer Overlay */}
      {isMobileCartOpen && (
        <div 
          className="show-on-tablet"
          style={{
            display: 'none',
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}
        >
          <div 
            className="animate-slide-up-sheet"
            style={{
              width: '100%',
              maxHeight: '90vh',
              height: '90vh',
              background: 'var(--bg-sidebar)',
              borderRadius: '24px 24px 0 0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.85)'
            }}
          >
            <div className="bottom-sheet-drag-handle" />
            <CartSidebar
              cart={cart}
              customerName={customerName}
              setCustomerName={setCustomerName}
              tableNumber={tableNumber}
              setTableNumber={setTableNumber}
              orderType={orderType}
              setOrderType={setOrderType}
              discount={discount}
              setDiscount={setDiscount}
              taxEnabled={taxEnabled}
              setTaxEnabled={setTaxEnabled}
              taxPercentage={taxPercentage}
              serviceChargeEnabled={serviceChargeEnabled}
              setServiceChargeEnabled={setServiceChargeEnabled}
              serviceChargePercentage={serviceChargePercentage}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
              onUpdateItemNotes={onUpdateItemNotes}
              onClearCart={onClearCart}
              onOpenPayment={() => {
                setIsMobileCartOpen(false);
                onOpenPayment();
              }}
              onSendToKitchenDirect={() => {
                setIsMobileCartOpen(false);
                onSendToKitchenDirect();
              }}
              openBillsCount={openBillsCount}
              onOpenActiveBills={() => {
                setIsMobileCartOpen(false);
                if (onOpenActiveBills) onOpenActiveBills();
              }}
              discounts={discounts}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setIsMobileCartOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
