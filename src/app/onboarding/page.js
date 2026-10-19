'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, MapPin, Phone, DollarSign, ArrowRight, Sparkles, Coffee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, store, loading, createStoreProfile } = useAuth();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [seedDefault, setSeedDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (store?.id) {
        router.push('/pos');
      }
    }
  }, [user, store, loading, router]);

  useEffect(() => {
    if (user?.user_metadata?.cafe_name && !name) {
      setName(user.user_metadata.cafe_name);
    }
  }, [user, name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Nama Kafe wajib diisi!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await createStoreProfile({
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        currency,
        seedDefaultMenu: seedDefault,
        tax_percentage: 10,
        tax_enabled: false,
        service_charge_percentage: 5,
        service_charge_enabled: false,
        payment_methods: { cash: true, qris: true, transfer: true }
      });

      addToast('Profil Kafe berhasil dibuat! Selamat datang di POS Warkop.', 'success');
      router.push('/pos');
    } catch (err) {
      console.error('Gagal onboarding store:', err);
      addToast(err.message || 'Gagal membuat profil kafe.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #231b14 0%, #0c0a09 100%)',
      padding: '24px 16px',
      boxSizing: 'border-box'
    }}>
      <div className="animate-scale-up" style={{
        width: '100%',
        maxWidth: '520px',
        background: 'rgba(23, 20, 18, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '24px',
        padding: '36px 32px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)'
          }}>
            <Store size={28} color="#fff" />
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
            Siapkan Profil Kafe Anda
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Data kafe ini akan digunakan sebagai identitas toko, kop struk kasir thermal, dan pemisahan data multi-tenant.
          </p>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Nama Kafe */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              Nama Kafe / Warkop <span style={{ color: 'var(--accent-rose)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Coffee size={16} color="var(--accent-primary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Contoh: Kopi Kenangan Senja / Warkop Berkah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          {/* Alamat Kafe */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Alamat Lengkap Kafe
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <textarea
                placeholder="Jl. Sabang No. 12, Kebayoran Baru, Jakarta"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '13px',
                  resize: 'none'
                }}
              />
            </div>
          </div>

          {/* No. Telepon & Mata Uang */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Nomor Telepon / WA
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="0812-3456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Mata Uang
              </label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                >
                  <option value="IDR">Rupiah (IDR)</option>
                  <option value="USD">Dollar (USD)</option>
                  <option value="MYR">Ringgit (MYR)</option>
                  <option value="SGD">Dollar (SGD)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Auto Seed Switch Banner */}
          <div style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginTop: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                  Muat 18 Menu Warkop Otomatis
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Kopi aren, indomie, es teh, roti bakar siap pakai
                </div>
              </div>
            </div>

            <input
              type="checkbox"
              checked={seedDefault}
              onChange={(e) => setSeedDefault(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-emerald) 0%, var(--accent-emerald-hover) 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '10px',
              boxShadow: '0 4px 16px var(--accent-emerald-glow)',
              opacity: submitting ? 0.7 : 1
            }}
          >
            <span>{submitting ? 'Membuat Profil Kafe...' : 'Simpan & Buka Mesin Kasir'}</span>
            <ArrowRight size={17} />
          </button>
        </form>
      </div>

      <Toast toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))} />
    </div>
  );
}
