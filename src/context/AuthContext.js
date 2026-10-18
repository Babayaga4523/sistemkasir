'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabase } from '../lib/supabase';
import { getStoreByUserId, createStore, updateStore, DEMO_STORE, initLocalData } from '../lib/dataService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Load user session & store profile
  const refreshAuth = useCallback(async () => {
    setLoading(true);
    initLocalData();

    // Check if demo mode is active
    if (typeof window !== 'undefined' && localStorage.getItem('warkop_demo_mode') === 'true') {
      const localStore = JSON.parse(localStorage.getItem('warkop_store_profile') || JSON.stringify(DEMO_STORE));
      setUser({ id: 'demo-user-001', email: 'owner@warkopkita.demo', user_metadata: { name: 'Owner Warkop' } });
      setStore(localStore);
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      // Supabase not configured -> default to demo mode or prompt
      const localStore = JSON.parse(localStorage.getItem('warkop_store_profile') || JSON.stringify(DEMO_STORE));
      setUser({ id: 'demo-user-001', email: 'demo@warkopkita.id' });
      setStore(localStore);
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        setIsDemoMode(false);
        const storeData = await getStoreByUserId(session.user.id);
        setStore(storeData);
      } else {
        setUser(null);
        setStore(null);
      }
    } catch (err) {
      console.warn('Error fetching Supabase auth session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();

    const supabase = getSupabase();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsDemoMode(false);
        const storeData = await getStoreByUserId(session.user.id);
        setStore(storeData);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setStore(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshAuth]);

  const clearLocalTenantCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('warkop_demo_mode');
      localStorage.removeItem('warkop_store_profile');
      localStorage.removeItem('warkop_categories');
      localStorage.removeItem('warkop_products');
      localStorage.removeItem('warkop_orders');
    }
  };

  // Sign In
  const signIn = async (email, password) => {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase belum terhubung. Konfigurasikan URL dan Anon Key terlebih dahulu.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) throw error;
    clearLocalTenantCache();
    setIsDemoMode(false);
    await refreshAuth();
    return data;
  };

  // Sign Up
  const signUp = async (email, password) => {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase belum terhubung. Konfigurasikan URL dan Anon Key terlebih dahulu.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password
    });

    if (error) throw error;
    clearLocalTenantCache();
    setIsDemoMode(false);
    await refreshAuth();
    return data;
  };

  // Sign Out
  const signOut = async () => {
    const supabase = getSupabase();
    clearLocalTenantCache();
    setIsDemoMode(false);
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error(e);
      }
    }
    setUser(null);
    setStore(null);
  };

  // Demo mode
  const activateDemoMode = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('warkop_demo_mode', 'true');
    }
    initLocalData();
    const localStore = JSON.parse(localStorage.getItem('warkop_store_profile') || JSON.stringify(DEMO_STORE));
    setUser({ id: 'demo-user-001', email: 'owner@warkopkita.demo' });
    setStore(localStore);
    setIsDemoMode(true);
    setLoading(false);
  };

  // Create Store Profile (during Onboarding)
  const createStoreProfile = async (storeData) => {
    if (!user) throw new Error('User harus login untuk membuat profil kafe.');
    const newStore = await createStore(storeData, user.id);
    setStore(newStore);
    return newStore;
  };

  // Update Store Settings
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
      signIn,
      signUp,
      signOut,
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
