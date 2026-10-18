'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  UploadCloud, 
  ExternalLink,
  Code,
  Key,
  Globe
} from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../lib/supabase';
import { seedSupabaseFromLocal } from '../lib/dataService';

export default function SupabaseModal({
  isOpen,
  onClose,
  onConfigUpdated,
  onShowToast
}) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url || '');
      setAnonKey(config.key || '');
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Mohon isi Project URL dan Anon Key terlebih dahulu.'
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(url, anonKey);
    setTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey);
    onConfigUpdated();
    if (onShowToast) {
      onShowToast(url && anonKey ? 'Konfigurasi Supabase berhasil disimpan!' : 'Menggunakan mode penyimpanan lokal.', 'success');
    }
    onClose();
  };

  const handleClear = () => {
    saveSupabaseConfig('', '');
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    onConfigUpdated();
    if (onShowToast) {
      onShowToast('Kembali ke mode penyimpanan lokal warkop.', 'info');
    }
    onClose();
  };

  const handleSeedData = async () => {
    if (!url || !anonKey) {
      alert('Sambungkan ke Supabase terlebih dahulu.');
      return;
    }

    setSeeding(true);
    const res = await seedSupabaseFromLocal();
    setSeeding(false);

    if (res.success) {
      onConfigUpdated();
      if (onShowToast) {
        onShowToast('Data awal menu warkop berhasil disalin ke Supabase!', 'success');
      }
    } else {
      alert(`Gagal sync data: ${res.message}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 140,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div 
        className="animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(23, 20, 18, 0.8)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={18} color="#34d399" />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>
                Koneksi Database Supabase
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Sinkronkan menu warkop, pesanan, dan laporan ke cloud Supabase
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', color: 'var(--text-muted)', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {/* Info Banner */}
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: 1.5
          }}>
            <strong style={{ color: 'var(--accent-primary)' }}>Tips:</strong> File SQL skema sudah disiapkan di{' '}
            <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 5px', borderRadius: '4px', color: '#fff' }}>
              supabase/schema.sql
            </code>. Jalankan file tersebut di Supabase SQL Editor sekali saja untuk membuat tabel otomatis.
          </div>

          {/* Input URL */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '6px'
            }}>
              <Globe size={13} />
              Project URL Supabase
            </label>
            <input
              type="text"
              placeholder="https://xyzabcdefg.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Input Key */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '6px'
            }}>
              <Key size={13} />
              Project API Anon Key (public)
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: testResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: testResult.success ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '12px',
              color: testResult.success ? '#34d399' : '#f87171'
            }}>
              {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <div style={{ flex: 1, lineHeight: 1.4 }}>{testResult.message}</div>
            </div>
          )}

          {/* Action Row: Test & Seed Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              disabled={testing}
              onClick={handleTestConnection}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
              <span>{testing ? 'Menguji...' : 'Tes Koneksi'}</span>
            </button>

            <button
              type="button"
              disabled={seeding || !url || !anonKey}
              onClick={handleSeedData}
              title="Kirim 18 menu warkop bawaan ke Supabase"
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: 'var(--accent-primary)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <UploadCloud size={14} />
              <span>{seeding ? 'Mengirim Data...' : 'Kirim Menu Awal ke DB'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(15, 12, 10, 0.7)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'transparent',
              color: 'var(--text-faint)',
              fontSize: '12px'
            }}
          >
            Hapus / Mode Offline
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-emerald) 0%, var(--accent-emerald-hover) 100%)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              Simpan & Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
