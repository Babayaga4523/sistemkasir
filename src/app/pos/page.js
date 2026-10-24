'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import POSScreen from '../../components/POSScreen';
import CustomizationModal from '../../components/CustomizationModal';
import PaymentModal from '../../components/PaymentModal';
import ReceiptModal from '../../components/ReceiptModal';
import SupabaseModal from '../../components/SupabaseModal';
import Toast from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import { 
  getCategories, 
  getProducts, 
  getOrders, 
  createOrder,
  seedStoreDefaultMenu,
  settleOrderPayment
} from '../../lib/dataService';
import { getSupabaseConfig, getSupabase } from '../../lib/supabase';
import TutorialModal from '../../components/TutorialModal';
import { Receipt, CreditCard, Clock, Utensils, X, Printer } from 'lucide-react';

export default function POSPage() {
  const router = useRouter();
  const { user, store, loading: authLoading } = useAuth();

  // Data states
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [seedingTemplate, setSeedingTemplate] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Cart states
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Pelanggan');
  const [tableNumber, setTableNumber] = useState('01');
  const [orderType, setOrderType] = useState('dine_in'); // 'dine_in' or 'takeaway'
  const [discount, setDiscount] = useState(0);

  // Multi-tenant Tax & Service Charge from Store Profile
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState(false);

  // Modals
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Open Bill / Bayar Nanti States
  const [isOpenBillsModalOpen, setIsOpenBillsModalOpen] = useState(false);
  const [settleTargetOrder, setSettleTargetOrder] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth Guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!store) {
        router.push('/onboarding');
      }
    }
  }, [user, store, authLoading, router]);

  // Sync initial tax & service charge state from store profile
  useEffect(() => {
    if (store) {
      setTaxEnabled(Boolean(store.tax_enabled));
      setServiceChargeEnabled(Boolean(store.service_charge_enabled));
    }
  }, [store]);

  // Check Supabase connection
  const checkSupabaseStatus = useCallback(() => {
    const cfg = getSupabaseConfig();
    const hasConfig = Boolean(cfg.url && cfg.key);
    const client = getSupabase();
    setIsSupabaseConnected(hasConfig && Boolean(client));
  }, []);

  // Load Data for Store
  const loadData = useCallback(async () => {
    if (!store?.id) return;
    setLoadingData(true);
    checkSupabaseStatus();

    try {
      const [catList, prodList, orderList] = await Promise.all([
        getCategories(store.id),
        getProducts(store.id),
        getOrders(store.id)
      ]);

      setCategories(catList);
      setProducts(prodList);
      setOrders(orderList);
    } catch (err) {
      console.error('Gagal memuat data POS:', err);
      addToast('Gagal memuat katalog menu.', 'error');
    } finally {
      setLoadingData(false);
    }
  }, [store?.id, checkSupabaseStatus]);

  useEffect(() => {
    if (store?.id) {
      loadData();
    }
  }, [store?.id, loadData]);

  // Cart operations
  const handleQuickAddProduct = (product) => {
    const existingIndex = cart.findIndex(
      item => item.product_id === product.id && 
      (!item.selected_options || Object.keys(item.selected_options).length === 0)
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].price;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: 1,
          selected_options: {},
          notes: '',
          subtotal: product.price,
          image: product.image
        }
      ]);
    }
    addToast(`${product.name} ditambahkan`, 'success');
  };

  const handleSelectProduct = (product) => {
    setCustomizingProduct(product);
  };

  const handleAddToCartWithCustomization = (itemData) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(it => 
        it.product_id === itemData.product_id &&
        JSON.stringify(it.selected_options || {}) === JSON.stringify(itemData.selected_options || {}) &&
        (it.notes || '').trim() === (itemData.notes || '').trim()
      );

      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += (itemData.quantity || 1);
        copy[existingIdx].subtotal = copy[existingIdx].quantity * copy[existingIdx].price;
        return copy;
      }
      return [...prev, itemData];
    });
    addToast(`${itemData.product_name} ditambahkan ke pesanan`, 'success');
  };

  const handleUpdateQuantity = (index, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCart(prev => {
      const copy = [...prev];
      copy[index].quantity = newQty;
      copy[index].subtotal = copy[index].price * newQty;
      return copy;
    });
  };

  const handleUpdateItemNotes = (index, newNote) => {
    setCart(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], notes: newNote };
      return copy;
    });
    addToast('Catatan item diperbarui', 'info');
  };

  const handleRemoveItem = (index) => {
    const itemName = cart[index]?.product_name;
    setCart(prev => prev.filter((_, i) => i !== index));
    if (itemName) addToast(`${itemName} dihapus`, 'info');
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Kosongkan semua item di keranjang?')) {
      setCart([]);
      setDiscount(0);
      addToast('Keranjang dikosongkan', 'info');
    }
  };

  // Calculations
  const taxRate = Number(store?.tax_percentage) || 10;
  const serviceRate = Number(store?.service_charge_percentage) || 5;

  const subtotal = cart.reduce((acc, item) => acc + (item.subtotal || item.price * item.quantity), 0);
  const discountAmount = Math.min(discount, subtotal);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxEnabled ? Math.round(taxableAmount * (taxRate / 100)) : 0;
  const serviceChargeAmount = serviceChargeEnabled ? Math.round(taxableAmount * (serviceRate / 100)) : 0;
  const grandTotal = Math.max(0, taxableAmount + taxAmount + serviceChargeAmount);

  // Open Payment Modal
  const handleOpenPayment = () => {
    if (cart.length === 0) {
      addToast('Keranjang masih kosong!', 'warning');
      return;
    }
    setIsPaymentOpen(true);
  };

  // Direct Send to Kitchen (Open Bill / Bayar Nanti)
  const handleSendToKitchenDirect = async () => {
    if (cart.length === 0) {
      addToast('Keranjang masih kosong!', 'warning');
      return;
    }

    try {
      const orderPayload = {
        store_id: store.id,
        customer_name: customerName || 'Pelanggan',
        table_number: orderType === 'dine_in' ? tableNumber : null,
        order_type: orderType,
        items: cart,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        service_charge: serviceChargeAmount,
        total: grandTotal,
        payment_method: 'unpaid',
        payment_status: 'unpaid',
        status: 'pending'
      };

      const created = await createOrder(orderPayload, store.id);
      addToast(`Pesanan #${created.order_number} dikirim ke Dapur / Bar!`, 'success');
      setCart([]);
      setDiscount(0);
      loadData();
    } catch (err) {
      console.error(err);
      addToast('Gagal mengirim pesanan ke dapur.', 'error');
    }
  };

  // Process Completed Payment
  const handleProcessPayment = async (paymentDetails) => {
    try {
      const orderPayload = {
        store_id: store.id,
        customer_name: customerName || 'Pelanggan',
        table_number: orderType === 'dine_in' ? tableNumber : null,
        order_type: orderType,
        items: cart,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        service_charge: serviceChargeAmount,
        total: grandTotal,
        payment_method: paymentDetails.payment_method,
        payment_status: 'paid',
        amount_paid: paymentDetails.amount_paid,
        change_amount: paymentDetails.change_amount,
        bank: paymentDetails.bank || null,
        status: 'pending' // Send to Kitchen for brewing/cooking
      };

      const created = await createOrder(orderPayload, store.id);
      setIsPaymentOpen(false);
      setCurrentReceiptOrder(created);
      setCart([]);
      setDiscount(0);
      loadData();
      addToast('Pembayaran berhasil diproses!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Gagal memproses pembayaran.', 'error');
    }
  };

  const activeKitchenCount = orders.filter(o => o.status === 'pending' || o.status === 'cooking').length;

  const handleSeedTemplate = async () => {
    if (!store?.id) return;
    setSeedingTemplate(true);
    try {
      await seedStoreDefaultMenu(store.id);
      addToast('18 Menu Warkop template berhasil dimuat!', 'success');
      await loadData();
      setIsTutorialOpen(false);
    } catch (err) {
      console.error(err);
      addToast('Gagal memuat template menu.', 'error');
    } finally {
      setSeedingTemplate(false);
    }
  };

  // Open Bills list
  const openBills = orders.filter(o => o.payment_method === 'unpaid' || o.payment_status === 'unpaid');

  // Settle Open Bill Payment
  const handleProcessSettlePayment = async (paymentDetails) => {
    if (!settleTargetOrder || !store?.id) return;
    try {
      await settleOrderPayment(settleTargetOrder.id, paymentDetails, store.id);
      addToast(`Tagihan #${settleTargetOrder.order_number} berhasil dilunasi via ${paymentDetails.payment_method.toUpperCase()}!`, 'success');
      const orderForReceipt = {
        ...settleTargetOrder,
        ...paymentDetails,
        payment_status: 'paid',
        status: 'completed'
      };
      setSettleTargetOrder(null);
      setCurrentReceiptOrder(orderForReceipt);
      await loadData();
    } catch (err) {
      console.error(err);
      addToast('Gagal memproses pelunasan: ' + (err.message || 'Error'), 'error');
    }
  };

  return (
    <main style={{
      height: '100vh',
      width: '100vw',
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-main)',
      overflow: 'hidden',
      color: 'var(--text-main)'
    }}>
      <Header 
        cartCount={cart.reduce((sum, it) => sum + it.quantity, 0)}
        activeKitchenCount={activeKitchenCount}
        isSupabaseConnected={isSupabaseConnected}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      {/* Screen Views */}
      <div style={{ flex: 1, minHeight: 0, height: 'calc(100vh - 68px)', width: '100%', overflow: 'hidden' }}>
        <POSScreen
          categories={categories}
          products={products}
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
          taxPercentage={taxRate}
          serviceChargeEnabled={serviceChargeEnabled}
          setServiceChargeEnabled={setServiceChargeEnabled}
          serviceChargePercentage={serviceRate}
          onSelectProduct={handleSelectProduct}
          onQuickAddProduct={handleQuickAddProduct}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onUpdateItemNotes={handleUpdateItemNotes}
          onClearCart={handleClearCart}
          onOpenPayment={handleOpenPayment}
          onSendToKitchenDirect={handleSendToKitchenDirect}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          onSeedTemplate={handleSeedTemplate}
          loadingSeed={seedingTemplate}
          storeName={store?.name}
          openBillsCount={openBills.length}
          onOpenActiveBills={() => setIsOpenBillsModalOpen(true)}
          discounts={store?.discounts || []}
        />
      </div>

      {/* Modals & Overlays */}
      <CustomizationModal
        product={customizingProduct}
        isOpen={Boolean(customizingProduct)}
        onClose={() => setCustomizingProduct(null)}
        onAddToCart={handleAddToCartWithCustomization}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        totalAmount={grandTotal}
        customerName={customerName}
        tableNumber={tableNumber}
        orderType={orderType}
        storePaymentMethods={store?.payment_methods}
        store={store}
        onProcessPayment={handleProcessPayment}
      />

      <ReceiptModal
        isOpen={Boolean(currentReceiptOrder)}
        onClose={() => setCurrentReceiptOrder(null)}
        order={currentReceiptOrder}
        store={store}
        onNewTransaction={() => {
          setCurrentReceiptOrder(null);
        }}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigUpdated={loadData}
        onShowToast={addToast}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onSeedTemplate={handleSeedTemplate}
        loadingSeed={seedingTemplate}
      />

      {/* Active Open Bills Modal */}
      {isOpenBillsModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 140,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '18px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.85)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(23, 20, 18, 0.8)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Receipt size={18} color="var(--accent-primary)" />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Tagihan Meja / Open Bill Aktif ({openBills.length})
                  </h2>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Pelanggan yang makan/minum dulu dan belum melakukan pembayaran
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpenBillsModalOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {openBills.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Tidak ada tagihan Open Bill yang aktif saat ini. Semua pesanan sudah lunas! ☕
                </div>
              ) : (
                openBills.map(bill => {
                  const billTime = new Date(bill.created_at || Date.now());
                  return (
                    <div
                      key={bill.id}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '14px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: bill.order_type === 'dine_in' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                            color: bill.order_type === 'dine_in' ? '#38bdf8' : '#c084fc',
                            fontSize: '11px',
                            fontWeight: 700
                          }}>
                            {bill.order_type === 'dine_in' ? `Meja ${bill.table_number || '-'}` : 'Bungkus'}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                            {bill.customer_name || 'Pelanggan'}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            • #{bill.order_number}
                          </span>
                        </div>

                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={12} color="var(--accent-primary)" />
                          <span>{billTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                          <span>•</span>
                          <span>{(bill.items || []).map(it => `${it.quantity}x ${it.product_name}`).join(', ') || 'Item Pesanan'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                            Rp {Number(bill.total || 0).toLocaleString('id-ID')}
                          </div>
                          <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 700 }}>
                            Belum Lunas
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentReceiptOrder(bill);
                            }}
                            title="Cetak Tagihan Sementara"
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid var(--border-subtle)',
                              color: '#fff',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Printer size={13} color="var(--accent-primary)" />
                            <span>Struk</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsOpenBillsModalOpen(false);
                              setSettleTargetOrder(bill);
                            }}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, var(--accent-emerald) 0%, var(--accent-emerald-hover) 100%)',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 4px 12px var(--accent-emerald-glow)',
                              border: 'none'
                            }}
                          >
                            <CreditCard size={13} />
                            <span>Lunasi</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settle Open Bill Payment Modal */}
      {settleTargetOrder && (
        <PaymentModal
          isOpen={Boolean(settleTargetOrder)}
          onClose={() => setSettleTargetOrder(null)}
          totalAmount={settleTargetOrder.total || 0}
          customerName={settleTargetOrder.customer_name}
          tableNumber={settleTargetOrder.table_number}
          orderType={settleTargetOrder.order_type}
          storePaymentMethods={store?.payment_methods}
          store={store}
          onProcessPayment={handleProcessSettlePayment}
        />
      )}

      {/* Toast System */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </main>
  );
}
