'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Coffee, 
  ShoppingBag, 
  UtensilsCrossed, 
  Receipt, 
  Database, 
  Settings2, 
  Clock, 
  User, 
  LogOut,
  Sparkles,
  Store,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TutorialModal from './TutorialModal';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  cartCount = 0, 
  activeKitchenCount = 0, 
  isSupabaseConnected = false,
  onOpenSupabaseModal,
  onOpenTutorial
}) {
  const [mounted, setMounted] = useState(false);
  const [internalTutorialOpen, setInternalTutorialOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { user, store, signOut, isDemoMode } = useAuth();

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '.'));
      setDateStr(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'pos', path: '/pos', label: 'Kasir / POS', icon: ShoppingBag, badge: cartCount > 0 ? cartCount : null },
    { id: 'kitchen', path: '/kitchen', label: 'Dapur & Bar', icon: UtensilsCrossed, badge: activeKitchenCount > 0 ? activeKitchenCount : null, highlightBadge: true },
    { id: 'transactions', path: '/transactions', label: 'Riwayat Transaksi', icon: Receipt },
    { id: 'menu', path: '/menu', label: 'Kelola Menu', icon: Coffee },
    { id: 'settings', path: '/settings', label: 'Pengaturan Kafe', icon: Settings2 }
  ];

  const handleNavClick = (item) => {
    if (setActiveTab) {
      setActiveTab(item.id);
    }
    if (pathname !== item.path) {
      router.push(item.path);
    }
  };

  const handleOpenLogout = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      window.location.href = '/login';
    }
  };

  const cafeName = (mounted && store?.name) ? store.name : 'WARKOPKITA';
  const cafeLogo = mounted ? store?.logo_url : null;
  const userDisplayName = (mounted && user?.email) ? user.email.split('@')[0] : 'Kasir';

  return (
    <header className="no-print" style={{
      height: '68px',
      width: '100%',
      maxWidth: '100vw',
      boxSizing: 'border-box',
      background: 'rgba(18, 15, 13, 0.96)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'relative',
      zIndex: 50,
      userSelect: 'none',
      flexShrink: 0
    }}>
      {/* Brand & Dynamic Store Logo / Name */}
      <Link href="/pos" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          position: 'relative',
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
          overflow: 'hidden'
        }}>
          {cafeLogo ? (
            <img 
              src={cafeLogo} 
              alt={cafeName} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <>
              {/* Subtle steam */}
              <div style={{
                position: 'absolute',
                top: '-5px',
                fontSize: '11px',
                opacity: 0.8
              }} className="steam-effect">
                ♨️
              </div>
              <Coffee size={22} color="#fff" strokeWidth={2.4} />
            </>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontWeight: 800,
              fontSize: '16px',
              letterSpacing: '0.3px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              maxWidth: '220px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {cafeName}
            </span>
            <span style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              fontWeight: 700,
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--accent-primary)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '2px 5px',
              borderRadius: '4px'
            }}>
              POS
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {store?.address ? (
              <span style={{ maxWidth: '200px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {store.address}
              </span>
            ) : 'Sistem Kasir Warkop & Cafe'}
          </div>
        </div>
      </Link>

      {/* Main Tab Switcher */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.35)',
        padding: '4px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        gap: '4px'
      }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.path || activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: '9px',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : 'var(--text-muted)',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.15) 100%)' 
                  : 'transparent',
                border: isActive ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
              <span>{item.label}</span>

              {item.badge !== null && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: item.highlightBadge ? 'var(--accent-rose)' : 'var(--accent-primary)',
                  color: '#fff',
                  marginLeft: '2px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Clock, Profile, Supabase Status & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Tutorial / Panduan Button */}
        <button
          onClick={() => {
            if (onOpenTutorial) {
              onOpenTutorial();
            } else {
              setInternalTutorialOpen(true);
            }
          }}
          title="Buka Panduan & Tutorial Kasir Warkop POS"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 11px',
            borderRadius: '9px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: 'var(--accent-primary)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <HelpCircle size={13} />
          <span>Panduan</span>
        </button>

        {/* Real-time Clock & Day/Date Widget */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 12px',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          lineHeight: '1.2'
        }}>
          <Clock size={15} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.4px' }}>
              {mounted ? (timeStr || '--.--.--') : '--.--.--'}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '1px', whiteSpace: 'nowrap' }}>
              {mounted ? (dateStr || '') : ''}
            </span>
          </div>
        </div>

        {/* User / Store Badge */}
        <div 
          onClick={() => router.push('/settings')}
          title="Klik untuk buka Pengaturan Kafe"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '5px 10px',
            borderRadius: '9px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Store size={13} color="var(--accent-primary)" />
          </div>
          <div style={{ textAlign: 'left', maxWidth: '120px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {cafeName}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userDisplayName}
            </div>
          </div>
        </div>



        {/* Logout Button */}
        {mounted && (
          <button
            type="button"
            onClick={handleOpenLogout}
            title="Keluar / Logout Akun"
            style={{
              padding: '6px 10px',
              borderRadius: '9px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--accent-rose)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        )}
      </div>

      {/* Modal Konfirmasi Logout In-App (Bebas dari blokir popup browser) */}
      {isLogoutModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="animate-scale-up" style={{
            background: 'var(--bg-surface, #1e1b18)',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
            borderRadius: '20px',
            padding: '24px 28px',
            maxWidth: '380px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--accent-rose, #ef4444)'
            }}>
              <LogOut size={24} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Keluar dari Sistem Kasir?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted, #a1a1aa)', marginBottom: '22px', lineHeight: 1.5 }}>
              Sesi kasir kafe Anda akan ditutup. Anda harus login kembali untuk membuka transaksi kasir.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                disabled={loggingOut}
                style={{
                  padding: '11px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                style={{
                  padding: '11px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: loggingOut ? 'wait' : 'pointer',
                  opacity: loggingOut ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                  border: 'none'
                }}
              >
                {loggingOut ? 'Keluar...' : 'Ya, Keluar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <TutorialModal
        isOpen={internalTutorialOpen}
        onClose={() => setInternalTutorialOpen(false)}
      />
    </header>
  );
}
