'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import KitchenScreen from '../../components/KitchenScreen';
import Toast from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import { getOrders, updateOrderStatus } from '../../lib/dataService';

export default function KitchenPage() {
  const router = useRouter();
  const { user, store, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
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

  // Load orders for store
  const loadOrders = useCallback(async () => {
    if (!store?.id) return;
    setLoadingOrders(true);
    try {
      const orderList = await getOrders(store.id);
      setOrders(orderList);
    } catch (err) {
      console.error('Gagal memuat order kitchen:', err);
      addToast('Gagal memuat pesanan dapur.', 'error');
    } finally {
      setLoadingOrders(false);
    }
  }, [store?.id]);

  useEffect(() => {
    if (store?.id) {
      loadOrders();
      // Polling refresh every 8 seconds for real-time kitchen updates
      const interval = setInterval(loadOrders, 8000);
      return () => clearInterval(interval);
    }
  }, [store?.id, loadOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, store.id);
      addToast(`Status pesanan diperbarui jadi ${newStatus.toUpperCase()}`, 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error(err);
      addToast('Gagal memperbarui status pesanan.', 'error');
    }
  };

  const activeKitchenCount = orders.filter(o => o.status === 'pending' || o.status === 'cooking' || o.status === 'brewing').length;

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
      <Header activeKitchenCount={activeKitchenCount} />

      <div style={{ flex: 1, minHeight: 0, width: '100%', height: 'calc(100vh - 68px)', overflow: 'hidden' }}>
        {loadingOrders ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            Memuat pesanan dapur & bar {store?.name || 'kafe'}...
          </div>
        ) : (
          <KitchenScreen
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
