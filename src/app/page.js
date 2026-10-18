'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Coffee } from 'lucide-react';

export default function RootHomePage() {
  const router = useRouter();
  const { user, store, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (!store) {
        router.replace('/onboarding');
      } else {
        router.replace('/pos');
      }
    }
  }, [user, store, loading, router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      color: '#fff',
      gap: '16px'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.35)',
        animation: 'pulse 1.8s infinite'
      }}>
        <Coffee size={32} color="#fff" />
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.2px', marginBottom: '4px' }}>
          WARKOP POS PRO
        </h2>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Menyiapkan data kafe & sistem kasir multi-tenant...
        </div>
      </div>
    </div>
  );
}
