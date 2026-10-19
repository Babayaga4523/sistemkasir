'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import ReportScreen from '../../components/ReportScreen';
import ReceiptModal from '../../components/ReceiptModal';
import PaymentModal from '../../components/PaymentModal';
import Toast from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import { getOrders, settleOrderPayment } from '../../lib/dataService';

export default function TransactionsPage() {
  const router = useRouter();
  const { user, store, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState(null);
  const [settleTargetOrder, setSettleTargetOrder] = useState(null);
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

  // Load orders for this store
  const loadOrders = useCallback(async () => {
    if (!store?.id) return;
    setLoadingOrders(true);
    try {
      const orderList = await getOrders(store.id);
      setOrders(orderList);
    } catch (err) {
      console.error('Gagal memuat transaksi store:', err);
      addToast('Gagal memuat riwayat transaksi.', 'error');
    } finally {
      setLoadingOrders(false);
    }
  }, [store?.id]);

  useEffect(() => {
    if (store?.id) {
      loadOrders();
    }
  }, [store?.id, loadOrders]);

  const handleReprintReceipt = (order) => {
    setCurrentReceiptOrder(order);
  };

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
      await loadOrders();
    } catch (err) {
      console.error(err);
      addToast('Gagal memproses pelunasan: ' + (err.message || 'Error'), 'error');
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-main)',
      color: '#fff',
      overflow: 'hidden'
    }}>
      <Header />

      <div style={{ flex: 1, minHeight: 0, width: '100%', height: 'calc(100vh - 68px)', overflow: 'hidden' }}>
        {loadingOrders ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            Memuat transaksi & omzet {store?.name || 'kafe'}...
          </div>
        ) : (
          <ReportScreen
            orders={orders}
            onReprintReceipt={handleReprintReceipt}
            onSettleOrder={(order) => setSettleTargetOrder(order)}
          />
        )}
      </div>

      {/* Payment Modal for Settling Open Bill */}
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

      {/* Receipt Modal for Reprinting or newly settled bill */}
      <ReceiptModal
        isOpen={Boolean(currentReceiptOrder)}
        onClose={() => setCurrentReceiptOrder(null)}
        order={currentReceiptOrder}
        store={store}
        onNewTransaction={() => setCurrentReceiptOrder(null)}
      />

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
