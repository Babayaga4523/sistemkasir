'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Lock, Mail, ArrowRight, ShieldCheck, Database, Sparkles, AlertCircle, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SupabaseModal from '../../components/SupabaseModal';
import Toast from '../../components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { user, store, loading, signIn, signUp, activateDemoMode, isDemoMode } = useAuth();
  
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cafeName, setCafeName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  // If already logged in, redirect based on store profile
  useEffect(() => {
    if (!loading && user) {
      if (store?.id) {
        router.push('/pos');
      } else {
        router.push('/onboarding');
      }
    }
  }, [user, store, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Email dan password wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      if (tab === 'login') {
        await signIn(email, password);
        addToast('Login berhasil!', 'success');
      } else {
        await signUp(email, password);
        addToast('Pendaftaran akun berhasil! Silakan lengkapi profil kafe Anda.', 'success');
      }
    } catch (err) {
      console.error('Auth error:', err);
      let msg = err.message || 'Terjadi kesalahan autentikasi.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Email atau password salah. Periksa kembali atau daftar akun baru.';
      } else if (msg.includes('User already registered')) {
        msg = 'Email sudah terdaftar. Silakan pilih tab Masuk Kasir.';
      } else if (msg.includes('Supabase belum terhubung')) {
        msg = 'Supabase belum terhubung. Klik tombol "Koneksi Supabase" di bawah atau gunakan Mode Offline.';
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    activateDemoMode();
    addToast('Mode Offline Kafe aktif! Anda masuk sebagai Owner.', 'success');
    router.push('/pos');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #231b14 0%, #0c0a09 100%)',
      padding: '20px',
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      {/* Background Decorative Glow */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '350px',
        background: 'rgba(245, 158, 11, 0.08)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        pointerEvents: 'none'
      }} />

      <div className="animate-scale-up" style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(23, 20, 18, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '24px',
        padding: '32px 28px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
        zIndex: 10,
        position: 'relative'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: '-6px', fontSize: '13px' }} className="steam-effect">
              ♨️
            </div>
            <Coffee size={28} color="#fff" strokeWidth={2.4} />
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '0.4px', marginBottom: '4px' }}>
            WARKOP<span style={{ color: 'var(--accent-primary)' }}>KITA</span> POS
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Sistem Kasir Multi-Tenant & Manajemen Kafe Modern
          </p>
        </div>

        {/* Tab Switcher: Masuk vs Daftar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '22px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            style={{
              padding: '9px 12px',
              borderRadius: '9px',
              fontSize: '13px',
              fontWeight: tab === 'login' ? 700 : 500,
              background: tab === 'login' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: tab === 'login' ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: tab === 'login' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent'
            }}
          >
            Masuk Kasir
          </button>

          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMsg(''); }}
            style={{
              padding: '9px 12px',
              borderRadius: '9px',
              fontSize: '13px',
              fontWeight: tab === 'register' ? 700 : 500,
              background: tab === 'register' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: tab === 'register' ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: tab === 'register' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent'
            }}
          >
            Daftar Kafe Baru
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '12px',
            marginBottom: '18px',
            lineHeight: 1.45
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Alamat Email Kafe
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="owner@kafeanda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Kata Sandi / Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%)',
              color: '#000',
              fontWeight: 800,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
              opacity: submitting ? 0.7 : 1
            }}
          >
            <span>{submitting ? 'Memproses...' : tab === 'login' ? 'Masuk ke Kasir' : 'Daftarkan Kafe Baru'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '22px 0 16px',
          color: 'var(--text-faint)',
          fontSize: '11px'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span>ATAU</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Demo Mode Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '10px'
          }}
        >
          <Store size={15} color="var(--accent-primary)" />
          <span>Masuk Cepat (Mode Offline / Demo)</span>
        </button>

        {/* Supabase Connection Setup */}
        <button
          type="button"
          onClick={() => setIsSupabaseModalOpen(true)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '8px',
            background: 'transparent',
            color: 'var(--text-faint)',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Database size={13} color="#34d399" />
          <span>Atur URL & Anon Key Supabase</span>
        </button>
      </div>

      {/* Supabase Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigUpdated={() => addToast('Konfigurasi Supabase berhasil diperbarui!', 'success')}
        onShowToast={addToast}
      />

      <Toast toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))} />
    </div>
  );
}
