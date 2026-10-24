'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Coffee, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Store, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  KeyRound, 
  User, 
  RefreshCw,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail, getPasswordStrength } from '../../utils/authErrors';
import Toast from '../../components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { 
    user, 
    store, 
    loading, 
    isPasswordRecovery,
    setIsPasswordRecovery,
    signIn, 
    signUp, 
    resetPassword, 
    resendConfirmationEmail, 
    updateUserPassword,
    activateDemoMode 
  } = useAuth();
  
  // Tab: 'login' | 'register' | 'forgot' | 'verify_pending' | 'reset_password'
  const [tab, setTab] = useState('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newRecoveryPassword, setNewRecoveryPassword] = useState('');
  const [confirmRecoveryPassword, setConfirmRecoveryPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [cafeName, setCafeName] = useState('');
  
  // Password UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);
  
  // State submit & error
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Cooldown timer untuk tombol kirim ulang email verifikasi
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Cek parameter hash dan query params dari Supabase (misal link konfirmasi atau reset password)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    const search = window.location.search;

    if (hash || search) {
      const paramString = hash.startsWith('#') ? hash.substring(1) : search.startsWith('?') ? search.substring(1) : '';
      const params = new URLSearchParams(paramString);

      // Cek error dari link kadaluarsa (misal OTP expired)
      const errorDesc = params.get('error_description');
      const errorCode = params.get('error_code');
      if (errorDesc || errorCode) {
        let msg = 'Tautan verifikasi atau pemulihan kata sandi tidak valid atau telah kadaluarsa.';
        if (errorCode === 'otp_expired' || (errorDesc && errorDesc.toLowerCase().includes('expired'))) {
          msg = 'Tautan email telah kadaluarsa. Silakan masukkan email Anda untuk meminta tautan baru.';
        }
        setErrorMsg(msg);
      }

      // Cek apakah ini alur reset kata sandi
      const type = params.get('type');
      if (type === 'recovery') {
        setTab('reset_password');
        setIsPasswordRecovery?.(true);
      } else if (type === 'signup') {
        addToast('Email Anda berhasil dikonfirmasi! Silakan masuk.', 'success');
      }
    }
  }, [setIsPasswordRecovery]);

  // Sinkronisasi status recovery dari Supabase auth event
  useEffect(() => {
    if (isPasswordRecovery) {
      setTab('reset_password');
    }
  }, [isPasswordRecovery]);

  // Redirect otomatis jika user telah terautentikasi (KECUALI sedang dalam proses reset password)
  useEffect(() => {
    if (!loading && user && tab !== 'reset_password' && !isPasswordRecovery) {
      if (store?.id) {
        router.push('/pos');
      } else {
        router.push('/onboarding');
      }
    }
  }, [user, store, loading, tab, isPasswordRecovery, router]);

  const passwordStrength = getPasswordStrength(tab === 'reset_password' ? newRecoveryPassword : password);
  const passwordsMatch = tab === 'register' && password && confirmPassword && password === confirmPassword;
  const passwordsMismatch = tab === 'register' && password && confirmPassword && password !== confirmPassword;
  const recoveryPasswordsMatch = tab === 'reset_password' && newRecoveryPassword && confirmRecoveryPassword && newRecoveryPassword === confirmRecoveryPassword;
  const recoveryPasswordsMismatch = tab === 'reset_password' && newRecoveryPassword && confirmRecoveryPassword && newRecoveryPassword !== confirmRecoveryPassword;

  // Handler Submit Login / Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');

    const cleanEmail = email.trim().toLowerCase();

    // Validasi Dasar
    if (!cleanEmail) {
      setErrorMsg('Alamat email kafe wajib diisi.');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setErrorMsg('Format email tidak valid (contoh: owner@warkop.id).');
      return;
    }
    if (!password) {
      setErrorMsg('Kata sandi wajib diisi.');
      return;
    }

    if (tab === 'register') {
      if (password.length < 6) {
        setErrorMsg('Kata sandi minimal harus 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
        return;
      }
      if (!cafeName.trim()) {
        setErrorMsg('Nama kafe / warkop wajib diisi.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (tab === 'login') {
        await signIn(cleanEmail, password);
        addToast('Login berhasil! Mengalihkan ke mesin kasir...', 'success');
      } else if (tab === 'register') {
        const result = await signUp(cleanEmail, password, {
          name: fullName.trim(),
          cafeName: cafeName.trim()
        });

        if (result.needsEmailConfirmation) {
          setTab('verify_pending');
          setResendCooldown(60);
          addToast('Pendaftaran akun berhasil! Silakan cek kotak masuk email Anda.', 'success');
        } else {
          addToast('Pendaftaran akun berhasil! Selamat datang di Warkop POS.', 'success');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan autentikasi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler Lupa Kata Sandi (Kirim Email Reset)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setErrorMsg('Masukkan alamat email yang valid untuk menerima tautan reset kata sandi.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(cleanEmail);
      setSuccessNotice(`Tautan reset kata sandi telah dikirim ke ${cleanEmail}. Periksa folder Kotak Masuk atau Spam Anda.`);
      addToast('Tautan reset kata sandi berhasil dikirim!', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengirimkan email reset kata sandi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler Simpan Kata Sandi Baru (Setelah klik link recovery dari email)
  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');

    if (!newRecoveryPassword || newRecoveryPassword.length < 6) {
      setErrorMsg('Kata sandi baru minimal harus 6 karakter.');
      return;
    }
    if (newRecoveryPassword !== confirmRecoveryPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setSubmitting(true);
    try {
      await updateUserPassword(newRecoveryPassword);
      addToast('Kata sandi berhasil diperbarui! Mengalihkan ke aplikasi...', 'success');
      setIsPasswordRecovery?.(false);

      // Bersihkan hash recovery dari URL
      if (typeof window !== 'undefined' && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      if (store?.id) {
        router.push('/pos');
      } else {
        router.push('/onboarding');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan kata sandi baru.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler Kirim Ulang Email Konfirmasi
  const handleResendVerification = async () => {
    if (resendCooldown > 0 || resending) return;
    setErrorMsg('');
    setResending(true);
    try {
      await resendConfirmationEmail(email.trim().toLowerCase());
      setResendCooldown(60);
      addToast('Email verifikasi baru berhasil dikirim!', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengirim ulang email verifikasi.');
    } finally {
      setResending(false);
    }
  };

  // Handler Masuk Demo / Offline Mode
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
      background: 'radial-gradient(ellipse at top, #241c15 0%, #0c0a09 100%)',
      padding: '24px 16px',
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '560px',
        height: '380px',
        background: 'rgba(245, 158, 11, 0.08)',
        borderRadius: '50%',
        filter: 'blur(110px)',
        pointerEvents: 'none'
      }} />

      <style>{`
        .login-card {
          padding: 32px 28px;
        }
        @media (max-width: 480px) {
          .login-card {
            padding: 24px 18px !important;
            border-radius: 18px !important;
          }
        }
      `}</style>

      <div className="animate-scale-up login-card" style={{
        width: '100%',
        maxWidth: tab === 'register' ? '480px' : '440px',
        background: 'rgba(23, 20, 18, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '24px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85)',
        zIndex: 10,
        position: 'relative',
        transition: 'all 0.25s ease'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
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
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Sistem Kasir Multi-Tenant & Manajemen Kafe Modern
          </p>
        </div>

        {/* Tab Switcher (Hanya ditampilkan pada mode login/register) */}
        {(tab === 'login' || tab === 'register') && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.45)',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMsg(''); setSuccessNotice(''); }}
              style={{
                padding: '9px 12px',
                borderRadius: '9px',
                fontSize: '13px',
                fontWeight: tab === 'login' ? 700 : 500,
                background: tab === 'login' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: tab === 'login' ? 'var(--accent-primary)' : 'var(--text-muted)',
                border: tab === 'login' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Masuk Kasir
            </button>

            <button
              type="button"
              onClick={() => { setTab('register'); setErrorMsg(''); setSuccessNotice(''); }}
              style={{
                padding: '9px 12px',
                borderRadius: '9px',
                fontSize: '13px',
                fontWeight: tab === 'register' ? 700 : 500,
                background: tab === 'register' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: tab === 'register' ? 'var(--accent-primary)' : 'var(--text-muted)',
                border: tab === 'register' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Daftar Kafe Baru
            </button>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            fontSize: '12px',
            marginBottom: '16px',
            lineHeight: 1.45
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Notice Box */}
        {successNotice && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            fontSize: '12px',
            marginBottom: '16px',
            lineHeight: 1.45
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{successNotice}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: RESET PASSWORD (DARI TAUTAN RECOVERY EMAIL)          */}
        {/* ========================================================= */}
        {tab === 'reset_password' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <KeyRound size={24} color="var(--accent-primary)" />
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                Atur Kata Sandi Baru
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Sesi pemulihan terverifikasi. Masukkan kata sandi baru untuk akun kafe Anda.
              </p>
            </div>

            <form onSubmit={handleSaveNewPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Kata Sandi Baru (Min 6 Karakter)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    name="new-password"
                    type={showRecoveryPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={newRecoveryPassword}
                    onChange={(e) => setNewRecoveryPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 38px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRecoveryPassword(!showRecoveryPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px'
                    }}
                  >
                    {showRecoveryPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {newRecoveryPassword && (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Kekuatan Sandi:</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div style={{ height: '3px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(passwordStrength.score / 4) * 100}%`,
                        background: passwordStrength.color,
                        transition: 'width 0.25s ease'
                      }} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Ulangi Kata Sandi Baru
                  </label>
                  {recoveryPasswordsMatch && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={11} /> Cocok
                    </span>
                  )}
                  {recoveryPasswordsMismatch && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444' }}>
                      Belum Cocok
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    name="confirm-password"
                    type={showRecoveryPassword ? 'text' : 'password'}
                    placeholder="Ulangi kata sandi baru"
                    value={confirmRecoveryPassword}
                    onChange={(e) => setConfirmRecoveryPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '11px 12px 11px 38px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: recoveryPasswordsMismatch ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
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
                  background: 'linear-gradient(135deg, var(--accent-emerald) 0%, var(--accent-emerald-hover) 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: '0 4px 16px var(--accent-emerald-glow)',
                  marginTop: '6px'
                }}
              >
                <ShieldCheck size={16} />
                <span>{submitting ? 'Menyimpan Sandi...' : 'Simpan Kata Sandi & Buka Kasir'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setTab('login'); setIsPasswordRecovery?.(false); setErrorMsg(''); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  marginTop: '4px'
                }}
              >
                Batal & Kembali ke Halaman Masuk
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: VERIFY PENDING (EMAIL ACTIVATION NEEDED)             */}
        {/* ========================================================= */}
        {tab === 'verify_pending' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <Mail size={28} color="var(--accent-primary)" />
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Verifikasi Email Anda
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
              Kami telah mengirimkan tautan aktivasi akun ke alamat: <br />
              <strong style={{ color: '#fff', wordBreak: 'break-all' }}>{email}</strong>
              <br /><br />
              Silakan klik tautan di email tersebut (periksa folder Kotak Masuk atau Spam) untuk mengaktifkan akun kafe Anda.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending || resendCooldown > 0}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: resendCooldown > 0 ? 'var(--text-faint)' : 'var(--accent-primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <RefreshCw size={14} className={resending ? 'spin-anim' : ''} />
                <span>
                  {resending 
                    ? 'Mengirim ulang...' 
                    : resendCooldown > 0 
                      ? `Kirim Ulang Email (${resendCooldown}s)` 
                      : 'Kirim Ulang Email Verifikasi'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(''); setSuccessNotice(''); }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%)',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Sudah Verifikasi? Masuk Sekarang
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: FORGOT PASSWORD (RESET SANDI)                        */}
        {/* ========================================================= */}
        {tab === 'forgot' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(''); setSuccessNotice(''); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
              >
                <ArrowLeft size={18} />
              </button>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>
                Pemulihan Kata Sandi
              </h2>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
              Masukkan alamat email kafe Anda. Kami akan mengirimkan tautan aman untuk mengatur ulang kata sandi.
            </p>

            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Alamat Email Terdaftar
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    name="email"
                    type="email"
                    placeholder="owner@kafeanda.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
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
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%)',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                <KeyRound size={16} />
                <span>{submitting ? 'Mengirimkan Tautan...' : 'Kirim Tautan Reset Sandi'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(''); setSuccessNotice(''); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  marginTop: '4px'
                }}
              >
                Kembali ke Halaman Masuk
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* FORM: LOGIN ATAU REGISTER                                 */}
        {/* ========================================================= */}
        {(tab === 'login' || tab === 'register') && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Field Register: Nama Pemilik & Nama Kafe */}
            {tab === 'register' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Nama Pemilik / Kasir
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        name="name"
                        type="text"
                        placeholder="Yoga Krisna"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoComplete="name"
                        style={{
                          width: '100%',
                          padding: '10px 10px 10px 32px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle)',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Nama Kafe / Warkop <span style={{ color: 'var(--accent-rose)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Store size={14} color="var(--accent-primary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        name="organization"
                        type="text"
                        placeholder="Warkop Berkah"
                        value={cafeName}
                        onChange={(e) => setCafeName(e.target.value)}
                        required
                        autoComplete="organization"
                        style={{
                          width: '100%',
                          padding: '10px 10px 10px 32px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle)',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Alamat Email Kafe <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  name="email"
                  type="email"
                  placeholder="owner@kafeanda.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
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

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Kata Sandi <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setErrorMsg(''); setSuccessNotice(''); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Lupa Sandi?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 38px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px'
                  }}
                  title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator (Register mode) */}
              {tab === 'register' && password && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Kekuatan Sandi:</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div style={{ height: '3px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(passwordStrength.score / 4) * 100}%`,
                      background: passwordStrength.color,
                      transition: 'width 0.25s ease'
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field (Register mode) */}
            {tab === 'register' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Ulangi Kata Sandi <span style={{ color: 'var(--accent-rose)' }}>*</span>
                  </label>
                  {passwordsMatch && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={11} /> Cocok
                    </span>
                  )}
                  {passwordsMismatch && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444' }}>
                      Belum Cocok
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    name="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi kata sandi di atas"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 38px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: passwordsMismatch ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px'
                    }}
                    title={showConfirmPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
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
                marginTop: '6px',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? 'wait' : 'pointer'
              }}
            >
              <span>{submitting ? 'Memproses...' : tab === 'login' ? 'Masuk ke Kasir' : 'Daftarkan Kafe & Buat Akun'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Divider & Offline Fallback (Hanya pada mode login/register) */}
        {(tab === 'login' || tab === 'register') && (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '20px 0 14px',
              color: 'var(--text-faint)',
              fontSize: '11px'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              <span>OPSI LAIN</span>
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
                cursor: 'pointer'
              }}
            >
              <Store size={15} color="var(--accent-primary)" />
              <span>Masuk Cepat (Mode Offline / Uji Coba Demo)</span>
            </button>
          </>
        )}
      </div>

      <Toast toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))} />
    </div>
  );
}
