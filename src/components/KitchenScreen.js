'use client';

import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Coffee, 
  Bell, 
  ChefHat, 
  ArrowRight,
  PackageCheck
} from 'lucide-react';

export default function KitchenScreen({ orders, onUpdateStatus }) {
  const [filterType, setFilterType] = useState('all'); // 'all', 'barista', 'kitchen'

  // Sort orders: oldest active first
  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const completedOrders = orders.filter(o => o.status === 'completed').slice(0, 8);

  const getElapsedTimeText = (created_at) => {
    if (!created_at) return '';
    const diffMs = Date.now() - new Date(created_at).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} mnt lalu`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} jam lalu`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Pesanan Masuk', bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      case 'brewing':
        return { label: 'Sedang Diracik', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'ready':
        return { label: 'Siap Disajikan', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      default:
        return { label: 'Selesai', bg: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', border: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-main)',
      overflow: 'hidden'
    }}>
      {/* Top Bar */}
      <div style={{
        padding: '16px 28px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(23, 20, 18, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ChefHat size={20} color="var(--accent-primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
              Kitchen & Bar Display System (KDS)
            </h1>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Pantau antrean pesanan makanan & racikan kopi secara real-time
            </div>
          </div>
        </div>

        {/* Status Counts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '6px 14px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Flame size={14} />
            <span>{activeOrders.length} Pesanan Aktif</span>
          </div>
        </div>
      </div>

      {/* Main Kanban / Queue Columns */}
      <div style={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '24px 28px 80px 28px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
        alignContent: 'start',
        boxSizing: 'border-box'
      }}>
        {activeOrders.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            padding: '80px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={36} color="#34d399" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              Semua Pesanan Sudah Selesai!
            </h3>
            <p style={{ fontSize: '13px' }}>
              Tidak ada antrean pesanan di dapur atau bar saat ini.
            </p>
          </div>
        ) : (
          activeOrders.map(order => {
            const badge = getStatusBadge(order.status);
            const isBrewing = order.status === 'brewing';
            const isReady = order.status === 'ready';

            return (
              <div
                key={order.id}
                className="animate-fade-in"
                style={{
                  background: 'var(--bg-surface)',
                  border: isBrewing ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isBrewing ? '0 0 20px -5px rgba(245, 158, 11, 0.25)' : 'var(--shadow-md)',
                  overflow: 'hidden'
                }}
              >
                {/* Ticket Header */}
                <div style={{
                  padding: '14px 18px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
                        {order.order_number}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: order.order_type === 'dine_in' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                        color: order.order_type === 'dine_in' ? '#38bdf8' : '#c084fc'
                      }}>
                        {order.order_type === 'dine_in' ? `Meja ${order.table_number || '-'}` : 'Bungkus'}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {order.customer_name || 'Pelanggan'}
                    </div>
                  </div>

                  {/* Elapsed Timer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: 'var(--accent-primary)',
                    fontWeight: 600,
                    background: 'rgba(245, 158, 11, 0.08)',
                    padding: '4px 8px',
                    borderRadius: '6px'
                  }}>
                    <Clock size={12} />
                    <span>{getElapsedTimeText(order.created_at)}</span>
                  </div>
                </div>

                {/* Items Ticket Body */}
                <div style={{
                  padding: '16px 18px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {(order.items || []).map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                          <strong style={{ color: 'var(--accent-primary)', marginRight: '6px' }}>{it.quantity}x</strong>
                          {it.product_name}
                        </span>
                      </div>

                      {/* Options */}
                      {it.selected_options && Object.keys(it.selected_options).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                          {Object.entries(it.selected_options).map(([k, v], vIdx) => (
                            <span
                              key={vIdx}
                              style={{
                                fontSize: '11px',
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

                      {/* Notes */}
                      {it.notes && (
                        <div style={{
                          marginTop: '6px',
                          fontSize: '11px',
                          color: '#f87171',
                          fontWeight: 600,
                          background: 'rgba(239, 68, 68, 0.1)',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}>
                          ⚠️ {it.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Footer */}
                <div style={{
                  padding: '12px 18px',
                  borderTop: '1px solid var(--border-subtle)',
                  background: 'rgba(20, 16, 14, 0.8)',
                  display: 'flex',
                  gap: '8px'
                }}>
                  {order.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(order.id, 'brewing')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%)',
                        color: '#000',
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Flame size={15} />
                      <span>Mulai Racik / Masak</span>
                    </button>
                  )}

                  {order.status === 'brewing' && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(order.id, 'ready')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--accent-emerald) 0%, var(--accent-emerald-hover) 100%)',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Bell size={15} />
                      <span>Siap Disajikan</span>
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(order.id, 'completed')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid var(--border-subtle)',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <PackageCheck size={15} color="#34d399" />
                      <span>Selesai / Sudah Diantar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
