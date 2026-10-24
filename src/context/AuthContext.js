'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabase } from '../lib/supabase';
import { getStoreByUserId, createStore, updateStore, DEMO_STORE, initLocalData } from '../lib/dataService';
import { formatAuthError, isValidEmail } from '../utils/authErrors';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // 1. Bersihkan semua cache tenant lokal warkop (keranjang kasir, cache lokal produk)
  const clearLocalTenantData = useCallback(() => {
    if (typeof window === 'undefined') return;

    const keysToRemove = [
      'warkop_demo_mode',
      'warkop_store_profile',
      'warkop_categories',
      'warkop_categories_v2',
      'warkop_products',
      'warkop_products_v2',
      'warkop_orders',
      'warkop_orders_v2',
      'warkop_pos_cart',
      'warkop_active_order'
    ];
    keysToRemove.forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch (e) {
        console.warn(`Gagal hapus ${k}:`, e);
      }
    });
  }, []);

  // 2. Bersihkan token autentikasi Supabase (HANYA dieksekusi saat LOGOUT / SIGN OUT!)
  const clearAuthTokens = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const storageKeys = Object.keys(localStorage);
      for (const k of storageKeys) {
        if (k.startsWith('sb-') || k.includes('-auth-token') || k.startsWith('supabase.')) {
          localStorage.removeItem(k);
        }
      }
      const sessionKeys = Object.keys(sessionStorage);
      for (const k of sessionKeys) {
        if (k.startsWith('sb-') || k.includes('-auth-token') || k.startsWith('supabase.')) {
          sessionStorage.removeItem(k);
        }
      }
    } catch (e) {
      console.warn('Gagal bersihkan token Supabase storage:', e);
    }
  }, []);

  // Muat sesi autentikasi dan profil kafe yang terisolasi
  const refreshAuth = useCallback(async () => {
    setLoading(true);

    // 1. Cek apakah pengguna memilih Mode Demo Offline secara eksplisit
    if (typeof window !== 'undefined' && localStorage.getItem('warkop_demo_mode') === 'true') {
      initLocalData();
      const localStore = JSON.parse(localStorage.getItem('warkop_store_profile') || JSON.stringify(DEMO_STORE));
      setUser({
        id: 'demo-user-001',
        email: 'owner@warkopkita.demo',
        user_metadata: { name: 'Owner Warkop', cafe_name: localStore.name }
      });
      setStore(localStore);
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    // 2. Cek koneksi Supabase Cloud
    const supabase = getSupabase();
    if (!supabase) {
      // Supabase belum terkonfigurasi dan user belum memilih demo mode
      setUser(null);
      setStore(null);
      setIsDemoMode(false);
      setLoading(false);
      return;
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn('Sesi Supabase kadaluarsa atau error:', sessionError.message);
        setUser(null);
        setStore(null);
        setIsDemoMode(false);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        setIsDemoMode(false);
        const storeData = await getStoreByUserId(session.user.id);
        setStore(storeData);
      } else {
        setUser(null);
        setStore(null);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.warn('Gagal membaca sesi Supabase:', err);
      setUser(null);
      setStore(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Pasang listener perubahan status autentikasi Supabase realtime
  useEffect(() => {
    refreshAuth();

    const supabase = getSupabase();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
      if (session?.user) {
        setUser(session.user);
        setIsDemoMode(false);
        const storeData = await getStoreByUserId(session.user.id);
        setStore(storeData);
      } else if (event === 'SIGNED_OUT') {
        clearLocalTenantData();
        clearAuthTokens();
        setUser(null);
        setStore(null);
        setIsDemoMode(false);
        setIsPasswordRecovery(false);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshAuth, clearLocalTenantData, clearAuthTokens]);

  // ==========================================
  // SIGN IN LOGIC (LOGIN)
  // ==========================================
  const signIn = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Alamat email wajib diisi.');
    }
    if (!isValidEmail(cleanEmail)) {
      throw new Error('Format alamat email tidak valid (contoh: kasir@warkop.id).');
    }
    if (!password) {
      throw new Error('Kata sandi wajib diisi.');
    }

    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase belum terhubung. Konfigurasikan URL dan Anon Key terlebih dahulu.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (error) {
      throw new Error(formatAuthError(error));
    }

    clearLocalTenantData();
    setIsDemoMode(false);
    setUser(data.user);

    if (data.user?.id) {
      const storeData = await getStoreByUserId(data.user.id);
      setStore(storeData);
    }

    return data;
  };

  // ==========================================
  // SIGN UP LOGIC (REGISTER)
  // ==========================================
  const signUp = async (email, password, metadata = {}) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Alamat email wajib diisi.');
    }
    if (!isValidEmail(cleanEmail)) {
      throw new Error('Format alamat email tidak valid (contoh: kasir@warkop.id).');
    }
    if (!password || password.length < 6) {
      throw new Error('Kata sandi minimal harus 6 karakter.');
    }

    // 1. Coba registrasi via Server API Route (Bypass rate limit email Supabase & auto-confirm)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          name: metadata.name || '',
          cafeName: metadata.cafeName || ''
        })
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || 'Gagal mendaftar akun.');
      }

      // Akun berhasil dibuat dan aktif! Langsung login otomatis untuk mendapatkan sesi JWT
      const loginData = await signIn(cleanEmail, password);

      return {
        user: loginData.user,
        session: loginData.session,
        needsEmailConfirmation: false
      };
    } catch (apiErr) {
      // Jika error spesifik dari server (misal email sudah terdaftar), langsung teruskan ke user
      const errLower = apiErr.message.toLowerCase();
      if (errLower.includes('sudah terdaftar') || errLower.includes('minimal') || errLower.includes('format')) {
        throw apiErr;
      }

      console.warn('Fallback ke client-side Supabase signUp:', apiErr.message);

      // 2. Fallback ke client-side Supabase auth jika API server bermasalah
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase belum terhubung. Konfigurasikan URL dan Anon Key terlebih dahulu.');
      }

      const userMetadata = {
        name: (metadata.name || cleanEmail.split('@')[0]).trim(),
        cafe_name: (metadata.cafeName || '').trim(),
        role: 'owner',
        ...metadata
      };

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: userMetadata
        }
      });

      if (error) {
        throw new Error(formatAuthError(error));
      }

      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new Error('Alamat email ini sudah terdaftar. Silakan masuk menggunakan tab Masuk Kasir.');
      }

      clearLocalTenantData();
      setIsDemoMode(false);

      const needsEmailConfirmation = !data.session;

      if (data.session && data.user) {
        setUser(data.user);
        const storeData = await getStoreByUserId(data.user.id);
        setStore(storeData);
      }

      return {
        user: data.user,
        session: data.session,
        needsEmailConfirmation
      };
    }
  };

  // ==========================================
  // PASSWORD RESET & RESEND VERIFICATION
  // ==========================================
  const resetPassword = async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      throw new Error('Format alamat email tidak valid.');
    }

    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase belum terhubung.');
    }

    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo
    });

    if (error) {
      throw new Error(formatAuthError(error));
    }

    return { success: true };
  };

  const resendConfirmationEmail = async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      throw new Error('Format alamat email tidak valid.');
    }

    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase belum terhubung.');
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: cleanEmail
    });

    if (error) {
      throw new Error(formatAuthError(error));
    }

    return { success: true };
  };

  const updateUserPassword = async (newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Kata sandi baru minimal harus 6 karakter.');
    }

    if (isDemoMode) {
      throw new Error('Mode demo offline tidak mendukung penggantian kata sandi cloud.');
    }

    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase belum terhubung.');
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new Error(formatAuthError(error));
    }

    return data;
  };

  // ==========================================
  // SIGN OUT (LOGOUT)
  // ==========================================
  const signOut = async () => {
    const supabase = getSupabase();

    // 1. Beritahu server Supabase untuk menghentikan sesi
    if (supabase) {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (e) {
        console.warn('Catatan: supabase.auth.signOut local scope:', e);
      }
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Catatan: supabase.auth.signOut global:', e);
      }
    }

    // 2. Bersihkan seluruh token & cache tenant di browser
    clearLocalTenantData();
    clearAuthTokens();
    setIsDemoMode(false);
    setIsPasswordRecovery(false);
    setUser(null);
    setStore(null);
  };

  // ==========================================
  // DEMO MODE (OFFLINE TRIAL)
  // ==========================================
  const activateDemoMode = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('warkop_demo_mode', 'true');
    }
    initLocalData();
    const localStore = JSON.parse(localStorage.getItem('warkop_store_profile') || JSON.stringify(DEMO_STORE));
    setUser({
      id: 'demo-user-001',
      email: 'owner@warkopkita.demo',
      user_metadata: { name: 'Owner Warkop', cafe_name: localStore.name }
    });
    setStore(localStore);
    setIsDemoMode(true);
    setLoading(false);
  };

  // ==========================================
  // STORE PROFILE CREATION & UPDATE
  // ==========================================
  const createStoreProfile = async (storeData) => {
    if (!user) throw new Error('User harus login untuk membuat profil kafe.');
    const newStore = await createStore(storeData, user.id);
    setStore(newStore);
    return newStore;
  };

  const updateStoreSettings = async (settings) => {
    if (!store?.id) throw new Error('Store tidak ditemukan.');
    const updated = await updateStore(store.id, settings);
    setStore(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{
      user,
      store,
      loading,
      isDemoMode,
      isPasswordRecovery,
      setIsPasswordRecovery,
      signIn,
      signUp,
      signOut,
      resetPassword,
      resendConfirmationEmail,
      updateUserPassword,
      activateDemoMode,
      refreshAuth,
      createStoreProfile,
      updateStoreSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
