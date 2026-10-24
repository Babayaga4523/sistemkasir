'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Toast from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import { 
  getCategories, 
  saveCategory, 
  deleteCategory,
  getProducts, 
  saveProduct, 
  deleteProduct, 
  toggleProductAvailability,
  seedStoreDefaultMenu
} from '../../lib/dataService';
import { uploadImageToStorage } from '../../lib/supabase';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Coffee, 
  AlertCircle, 
  RotateCcw,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Upload,
  FolderPlus,
  Layers,
  Search,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const VARIANT_PRESETS = [
  {
    id: 'coffee',
    label: '☕ Suhu & Gula Kopi',
    groups: [
      {
        name: 'Suhu',
        choices: [
          { name: 'Dingin (Es)', extra: 0 },
          { name: 'Hangat / Panas', extra: 0 }
        ]
      },
      {
        name: 'Gula',
        choices: [
          { name: 'Normal Aren', extra: 0 },
          { name: 'Less Sugar', extra: 0 },
          { name: 'Tanpa Gula', extra: 0 }
        ]
      }
    ]
  },
  {
    id: 'serve',
    label: '🧊 Penyajian Es (+Rp 1.000)',
    groups: [
      {
        name: 'Penyajian',
        choices: [
          { name: 'Panas', extra: 0 },
          { name: 'Pakai Es', extra: 1000 }
        ]
      }
    ]
  },
  {
    id: 'spicy',
    label: '🌶️ Level Pedas',
    groups: [
      {
        name: 'Level Pedas',
        choices: [
          { name: 'Tidak Pedas', extra: 0 },
          { name: 'Sedang (Pedas Santai)', extra: 0 },
          { name: 'Pedas Gila (+Cabai)', extra: 2000 }
        ]
      }
    ]
  },
  {
    id: 'topping',
    label: '🧀 Topping Tambahan',
    groups: [
      {
        name: 'Extra Topping',
        choices: [
          { name: 'Tanpa Topping', extra: 0 },
          { name: 'Telur Mata Sapi', extra: 4000 },
          { name: 'Keju Parut', extra: 3000 },
          { name: 'Kornet Sapi', extra: 5000 }
        ]
      }
    ]
  }
];

export default function MenuPage() {
  const router = useRouter();
  const { user, store, loading: authLoading } = useAuth();

  // Data states
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('☕');
  const [formAvailable, setFormAvailable] = useState(true);
  const [imageMode, setImageMode] = useState('emoji'); // 'upload' or 'emoji'
  const [uploadingImage, setUploadingImage] = useState(false);

  // Variant & Customization States
  const [formHasOptions, setFormHasOptions] = useState(false);
  const [formOptions, setFormOptions] = useState([]);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Coffee');
  const [savingCategory, setSavingCategory] = useState(false);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toasts
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

  const formatIDR = (num) => {
    return `Rp ${Number(num || 0).toLocaleString('id-ID')}`;
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

  // Load Data for Store
  const loadData = useCallback(async () => {
    if (!store?.id) return;
    setLoadingData(true);
    try {
      const [cats, prods] = await Promise.all([
        getCategories(store.id),
        getProducts(store.id)
      ]);
      setCategories(cats);
      setProducts(prods);
      if (cats.length > 0 && !formCategoryId) {
        setFormCategoryId(cats[0].id);
      }
    } catch (err) {
      console.error('Gagal memuat data menu:', err);
      addToast('Gagal memuat data menu kafe.', 'error');
    } finally {
      setLoadingData(false);
    }
  }, [store?.id]);

  useEffect(() => {
    if (store?.id) {
      loadData();
    }
  }, [store?.id, loadData]);

  // Variant Helpers & Handlers
  const handleApplyPreset = (preset) => {
    setFormHasOptions(true);
    setFormOptions(prev => {
      const cloned = JSON.parse(JSON.stringify(preset.groups));
      return [...prev, ...cloned];
    });
    addToast(`Preset "${preset.label}" berhasil ditambahkan!`, 'info');
  };

  const handleAddVariantGroup = () => {
    setFormHasOptions(true);
    setFormOptions(prev => [
      ...prev,
      {
        name: `Varian #${prev.length + 1}`,
        choices: [
          { name: 'Pilihan 1', extra: 0 },
          { name: 'Pilihan 2', extra: 0 }
        ]
      }
    ]);
  };

  const handleRemoveVariantGroup = (gIdx) => {
    setFormOptions(prev => prev.filter((_, idx) => idx !== gIdx));
  };

  const handleUpdateGroupName = (gIdx, name) => {
    setFormOptions(prev => {
      const copy = [...prev];
      copy[gIdx] = { ...copy[gIdx], name };
      return copy;
    });
  };

  const handleAddChoice = (gIdx) => {
    setFormOptions(prev => {
      const copy = [...prev];
      const grp = { ...copy[gIdx] };
      grp.choices = [...(grp.choices || []), { name: `Pilihan ${(grp.choices?.length || 0) + 1}`, extra: 0 }];
      copy[gIdx] = grp;
      return copy;
    });
  };

  const handleUpdateChoice = (gIdx, cIdx, field, value) => {
    setFormOptions(prev => {
      const copy = [...prev];
      const grp = { ...copy[gIdx] };
      const choices = [...(grp.choices || [])];
      choices[cIdx] = {
        ...choices[cIdx],
        [field]: field === 'extra' ? (Number(value) || 0) : value
      };
      grp.choices = choices;
      copy[gIdx] = grp;
      return copy;
    });
  };

  const handleRemoveChoice = (gIdx, cIdx) => {
    setFormOptions(prev => {
      const copy = [...prev];
      const grp = { ...copy[gIdx] };
      grp.choices = (grp.choices || []).filter((_, idx) => idx !== cIdx);
      copy[gIdx] = grp;
      return copy;
    });
  };

  // Product CRUD
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategoryId(categories[0]?.id || '');
    setFormPrice('');
    setFormCostPrice('');
    setFormDescription('');
    setFormImage('☕');
    setFormAvailable(true);
    setImageMode('emoji');
    setFormHasOptions(false);
    setFormOptions([]);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setFormName(prod.name || '');
    setFormCategoryId(prod.category_id || categories[0]?.id || '');
    setFormPrice(String(prod.price || ''));
    setFormCostPrice(String(prod.cost_price || ''));
    setFormDescription(prod.description || '');
    const imgVal = prod.image_url || prod.image || '☕';
    setFormImage(imgVal);
    setFormAvailable(prod.available !== false);
    setImageMode(imgVal.startsWith('http') || imgVal.startsWith('data:') ? 'upload' : 'emoji');
    const hasOpts = Boolean(prod.has_options || (prod.options && prod.options.length > 0));
    setFormHasOptions(hasOpts);
    setFormOptions(Array.isArray(prod.options) ? JSON.parse(JSON.stringify(prod.options)) : []);
    setIsProductModalOpen(true);
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadImageToStorage('menu-images', file);
      if (url) {
        setFormImage(url);
        addToast('Foto menu berhasil dimuat!', 'success');
      }
    } catch (err) {
      console.warn('Gagal memproses file foto menu:', err);
      addToast('Gagal memproses file foto menu.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProductSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) {
      addToast('Nama menu dan harga jual wajib diisi!', 'warning');
      return;
    }

    const cleanOptions = formHasOptions 
      ? formOptions
          .map(g => ({
            name: (g.name || '').trim(),
            choices: (g.choices || [])
              .filter(c => c.name && c.name.trim())
              .map(c => ({
                name: c.name.trim(),
                extra: Math.max(0, Number(c.extra) || 0)
              }))
          }))
          .filter(g => g.name && g.choices.length > 0)
      : [];

    try {
      const payload = {
        ...(editingProduct ? editingProduct : {}),
        name: formName.trim(),
        category_id: formCategoryId,
        price: Number(formPrice) || 0,
        cost_price: Number(formCostPrice) || 0,
        image: formImage || '☕',
        image_url: formImage || '☕',
        description: formDescription.trim(),
        available: formAvailable,
        has_options: cleanOptions.length > 0,
        options: cleanOptions
      };

      await saveProduct(payload, store.id);
      addToast(editingProduct ? `Menu ${formName} berhasil diperbarui!` : `Menu ${formName} berhasil ditambahkan!`, 'success');
      setIsProductModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      addToast('Gagal menyimpan menu.', 'error');
    }
  };

  const handleDeleteProductClick = (prod) => {
    setDeleteTarget(prod);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const prod = deleteTarget;
    setIsDeleting(true);
    try {
      // Optimistic UI update so the menu item disappears immediately
      setProducts(prev => prev.filter(p => p.id !== prod.id));
      await deleteProduct(prod.id, store.id);
      addToast(`Menu "${prod.name}" berhasil dihapus`, 'info');
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error(err);
      addToast(`Gagal menghapus menu: ${err.message || 'Terjadi kesalahan'}`, 'error');
      await loadData();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAvailabilityClick = async (prod) => {
    const newStatus = prod.available === false ? true : false;
    try {
      await toggleProductAvailability(prod.id, newStatus, store.id);
      addToast(`${prod.name}: status diubah jadi ${newStatus ? 'Tersedia' : 'Habis'}`, 'info');
      setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, available: newStatus } : p));
    } catch (err) {
      console.error(err);
      addToast('Gagal mengubah ketersediaan produk.', 'error');
    }
  };

  // Category CRUD
  const handleSaveCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      addToast('Nama kategori wajib diisi!', 'warning');
      return;
    }

    setSavingCategory(true);
    try {
      const payload = {
        ...(editingCategory ? editingCategory : {}),
        name: newCategoryName.trim(),
        icon: newCategoryIcon || 'Coffee',
        sort_order: categories.length + 1
      };
      await saveCategory(payload, store.id);
      addToast(editingCategory ? 'Kategori berhasil diperbarui!' : 'Kategori baru berhasil ditambahkan!', 'success');
      setNewCategoryName('');
      setEditingCategory(null);
      loadData();
    } catch (err) {
      console.error(err);
      addToast('Gagal menyimpan kategori.', 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategoryClick = async (cat) => {
    const relatedCount = products.filter(p => p.category_id === cat.id).length;
    if (relatedCount > 0) {
      if (!window.confirm(`Kategori "${cat.name}" memiliki ${relatedCount} menu. Yakin ingin menghapus kategori ini?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Hapus kategori "${cat.name}"?`)) return;
    }

    try {
      await deleteCategory(cat.id, store.id);
      addToast(`Kategori ${cat.name} berhasil dihapus.`, 'info');
      if (selectedCategory === cat.id) setSelectedCategory('all');
      loadData();
    } catch (err) {
      console.error(err);
      addToast('Gagal menghapus kategori.', 'error');
    }
  };

  const handleResetDefaultMenuClick = async () => {
    if (!window.confirm('Reset dan muat ulang menu standar warkop lengkap (18 menu)? Menu yang sudah ada akan dilengkapi.')) return;
    try {
      await seedStoreDefaultMenu(store.id);
      addToast('Menu standar warkop berhasil dimuat!', 'success');
      loadData();
    } catch (err) {
      console.error(err);
      addToast('Gagal memuat menu default.', 'error');
    }
  };

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

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
      <Header />

      <style>{`
        .menu-page-container {
          padding: 20px 24px calc(var(--mobile-nav-height, 62px) + var(--safe-bottom, 0px) + 24px) 24px;
        }
        @media (max-width: 768px) {
          .menu-page-container {
            padding: 12px 10px calc(var(--mobile-nav-height, 62px) + var(--safe-bottom, 0px) + 24px) 10px !important;
          }
        }
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }
        @media (max-width: 600px) {
          .menu-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
        }
      `}</style>

      <div 
        className="menu-page-container"
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          height: 'calc(100vh - 68px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Header & Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <Coffee size={20} />
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                  Kelola Menu & Kategori — {store?.name || 'Kafe Anda'}
                </h1>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Data terisolasi di kafe Anda (Store ID: <code style={{ color: 'var(--accent-primary)' }}>{store?.id?.slice(0, 12)}...</code>)
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 15px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              <Layers size={15} color="var(--accent-primary)" />
              <span>Kelola Kategori ({categories.length})</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaultMenuClick}
              title="Reset / Muat ulang menu standar warkop"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 13px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontSize: '13px'
              }}
            >
              <RotateCcw size={14} />
              <span>Muat Menu Standar</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddProduct}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%)',
                color: '#000',
                fontSize: '13px',
                fontWeight: 700,
                boxShadow: '0 4px 14px var(--accent-primary-glow)'
              }}
            >
              <Plus size={16} />
              <span>Tambah Menu Baru</span>
            </button>
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {/* Categories Filter Pills */}
          <div className="touch-scroll-x" style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '7px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                background: selectedCategory === 'all' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedCategory === 'all' ? '#000' : 'var(--text-muted)',
                border: selectedCategory === 'all' ? 'none' : '1px solid var(--border-subtle)',
                cursor: 'pointer'
              }}
            >
              Semua ({products.length})
            </button>

            {categories.map(cat => {
              const count = products.filter(p => p.category_id === cat.id).length;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? '#000' : 'var(--text-muted)',
                    border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari menu kafe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13px'
              }}
            />
          </div>
        </div>

        {/* Product Grid */}
        {loadingData ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Memuat daftar menu...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Coffee size={28} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              {products.length === 0 ? 'Katalog Menu Kafe Anda Masih Kosong' : 'Menu Tidak Ditemukan'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              {products.length === 0 
                ? 'Mulai buat menu kopi, makanan, atau snack pertama Anda dengan harga modal (HPP) & harga jual, atau muat menu template siap pakai.'
                : 'Coba gunakan kata kunci pencarian lain atau pilih kategori yang berbeda.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleOpenAddProduct}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
              >
                <Plus size={16} />
                <span>+ Tambah Menu Baru</span>
              </button>

              {products.length === 0 && (
                <button
                  type="button"
                  onClick={handleResetDefaultMenuClick}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#34d399',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={15} />
                  <span>✨ Muat 18 Menu Template</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredProducts.map(prod => {
              const catName = categories.find(c => c.id === prod.category_id)?.name || 'Lainnya';
              const margin = prod.cost_price && prod.cost_price > 0 
                ? Math.round(((prod.price - prod.cost_price) / prod.price) * 100) 
                : null;
              const isAvailable = prod.available !== false;
              const isImgUrl = prod.image && (prod.image.startsWith('http') || prod.image.startsWith('data:') || prod.image.startsWith('/'));

              return (
                <div
                  key={prod.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    opacity: isAvailable ? 1 : 0.65,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Top Item Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {isImgUrl ? (
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        prod.image || '☕'
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: 'var(--text-muted)'
                        }}>
                          {catName}
                        </span>

                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isAvailable ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                        }}>
                          {isAvailable ? 'Tersedia' : 'Habis'}
                        </span>
                      </div>

                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prod.name}
                      </div>

                      {prod.description && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prod.description}
                        </div>
                      )}

                      {prod.options && prod.options.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                          {prod.options.map((grp, gIdx) => (
                            <span key={gIdx} style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(245, 158, 11, 0.12)',
                              color: 'var(--accent-primary)',
                              border: '1px solid rgba(245, 158, 11, 0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              <SlidersHorizontal size={10} />
                              {grp.name} ({grp.choices?.length || 0})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & Margin Breakdown */}
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-faint)' }}>Harga Jual</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                        {formatIDR(prod.price)}
                      </div>
                    </div>

                    {prod.cost_price > 0 && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-faint)' }}>HPP / Modal</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {formatIDR(prod.cost_price)} {margin ? `(${margin}% margin)` : ''}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Item Actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    {/* Toggle Availability */}
                    <button
                      type="button"
                      onClick={() => handleToggleAvailabilityClick(prod)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: isAvailable ? 'var(--text-muted)' : 'var(--accent-emerald)',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isAvailable ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{isAvailable ? 'Tandai Habis' : 'Aktifkan'}</span>
                    </button>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditProduct(prod)}
                        title="Edit Menu"
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(245, 158, 11, 0.1)',
                          color: 'var(--accent-primary)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          fontSize: '11px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProductClick(prod)}
                        title="Hapus Menu"
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: 'var(--accent-rose)',
                          border: '1px solid rgba(239, 68, 68, 0.25)'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {/* ======================================================== */}
      {isProductModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '640px',
            maxHeight: '92vh',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(23, 20, 18, 0.8)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                {editingProduct ? 'Ubah Menu Warkop' : 'Tambah Menu Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                style={{
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} style={{
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Product Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Nama Menu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kopi Susu Aren, Indomie Goreng Telur..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Kategori Menu *
                </label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#1c1917',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px',
                    colorScheme: 'dark',
                    cursor: 'pointer'
                  }}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#1c1917', color: '#fff' }}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Harga Jual (Rp) *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '12px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', pointerEvents: 'none' }}>
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="15.000"
                      value={formPrice ? Number(formPrice).toLocaleString('id-ID') : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setFormPrice(raw);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--accent-primary)',
                        fontSize: '15px',
                        fontWeight: 700
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Harga Modal / HPP (Opsional)
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '12px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', pointerEvents: 'none' }}>
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="8.000"
                      value={formCostPrice ? Number(formCostPrice).toLocaleString('id-ID') : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setFormCostPrice(raw);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: '#fff',
                        fontSize: '15px',
                        fontWeight: 600
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Image Option: File Upload to Supabase Storage or Emoji */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Gambar Menu (Upload ke Supabase Storage bucket <code>menu-images</code> atau Emoji)
                </label>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: imageMode === 'upload' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: imageMode === 'upload' ? 'var(--accent-primary)' : 'var(--text-muted)',
                      border: imageMode === 'upload' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)'
                    }}
                  >
                    Upload Gambar (Storage)
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageMode('emoji')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: imageMode === 'emoji' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: imageMode === 'emoji' ? 'var(--accent-primary)' : 'var(--text-muted)',
                      border: imageMode === 'emoji' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)'
                    }}
                  >
                    Pilih Emoji / Ikon
                  </button>
                </div>

                {imageMode === 'upload' ? (
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px dashed var(--border-subtle)',
                    background: 'rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      fontSize: '28px',
                      flexShrink: 0
                    }}>
                      {formImage && (formImage.startsWith('http') || formImage.startsWith('data:')) ? (
                        <img src={formImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ImageIcon size={28} color="var(--text-muted)" />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        style={{ display: 'none' }}
                        id="menu-photo-upload"
                      />
                      <label
                        htmlFor="menu-photo-upload"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          marginBottom: '6px'
                        }}
                      >
                        <Upload size={14} />
                        <span>{uploadingImage ? 'Mengunggah...' : 'Pilih File Foto Menu'}</span>
                      </label>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Format PNG/JPG, otomatis diunggah ke bucket <code>menu-images</code> Supabase.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['☕', '🍵', '🧋', '🥛', '🥤', '🧊', '🍜', '🍲', '🥪', '🍞', '🍟', '🍳', '🍛', '🍰', '🍪', '🥟'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormImage(emoji)}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            fontSize: '20px',
                            background: formImage === emoji ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                            border: formImage === emoji ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                            cursor: 'pointer'
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Ketersediaan */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={formAvailable}
                    onChange={(e) => setFormAvailable(e.target.checked)}
                    style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
                  />
                  <span>Menu Tersedia (bisa dipesan di kasir POS)</span>
                </label>
              </div>

              {/* Varian & Kustomisasi Menu (Suhu, Gula, Penyajian, Topping) */}
              <div style={{
                padding: '16px',
                borderRadius: '14px',
                background: formHasOptions ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                border: formHasOptions ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                transition: 'all 0.2s ease'
              }}>
                {/* Header Toggle */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: formHasOptions ? 'linear-gradient(135deg, var(--accent-primary) 0%, #b45309 100%)' : 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: formHasOptions ? '#fff' : 'var(--text-muted)'
                    }}>
                      <SlidersHorizontal size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                        Varian & Kustomisasi Menu
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Opsi suhu, gula, penyajian dingin/panas, level pedas, atau topping ekstra
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label style={{ position: 'relative', display: 'inline-block', width: '42px', height: '22px', cursor: 'pointer', flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={formHasOptions}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormHasOptions(checked);
                        if (checked && formOptions.length === 0) {
                          handleAddVariantGroup();
                        }
                      }}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      inset: 0,
                      background: formHasOptions ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '999px',
                      transition: '0.2s ease'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '16px',
                        width: '16px',
                        left: formHasOptions ? '22px' : '3px',
                        bottom: '3px',
                        background: '#fff',
                        borderRadius: '50%',
                        transition: '0.2s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }} />
                    </span>
                  </label>
                </div>

                {/* Variant Body when enabled */}
                {formHasOptions && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>
                    {/* Quick Presets Bar */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Pilih Preset Cepat Siap Pakai (1-Klik):
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {VARIANT_PRESETS.map(preset => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            style={{
                              padding: '6px 11px',
                              borderRadius: '8px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--border-subtle)',
                              color: '#fef3c7',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Sparkles size={12} color="var(--accent-primary)" />
                            <span>{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* List of Variant Groups */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {formOptions.map((group, gIdx) => (
                        <div
                          key={gIdx}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            background: 'rgba(0, 0, 0, 0.35)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                        >
                          {/* Group Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '3px 7px',
                                borderRadius: '5px',
                                background: 'var(--accent-primary)',
                                color: '#000',
                                whiteSpace: 'nowrap'
                              }}>
                                GRUP #{gIdx + 1}
                              </span>
                              <input
                                type="text"
                                placeholder="Nama Grup (misal: Suhu / Gula / Penyajian)"
                                value={group.name}
                                onChange={(e) => handleUpdateGroupName(gIdx, e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: '7px 10px',
                                  borderRadius: '8px',
                                  background: 'rgba(255, 255, 255, 0.06)',
                                  border: '1px solid var(--border-subtle)',
                                  color: '#fff',
                                  fontSize: '12px',
                                  fontWeight: 700
                                }}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveVariantGroup(gIdx)}
                              title="Hapus grup varian ini"
                              style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                color: 'var(--accent-rose)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: 600
                              }}
                            >
                              <Trash2 size={13} />
                              <span>Hapus Grup</span>
                            </button>
                          </div>

                          {/* Choices List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '4px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.1fr 32px', gap: '8px', fontSize: '11px', color: 'var(--text-faint)', fontWeight: 600 }}>
                              <span>Pilihan Opsi</span>
                              <span>Biaya Tambahan (+Rp)</span>
                              <span></span>
                            </div>

                            {(group.choices || []).map((choice, cIdx) => (
                              <div key={cIdx} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.1fr 32px', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  placeholder="Contoh: Dingin (Es) / Less Sugar"
                                  value={choice.name}
                                  onChange={(e) => handleUpdateChoice(gIdx, cIdx, 'name', e.target.value)}
                                  style={{
                                    padding: '7px 10px',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid var(--border-subtle)',
                                    color: '#fff',
                                    fontSize: '12px'
                                  }}
                                />

                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                  <span style={{ position: 'absolute', left: '8px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, pointerEvents: 'none' }}>
                                    +Rp
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={choice.extra ? Number(choice.extra).toLocaleString('id-ID') : ''}
                                    onChange={(e) => {
                                      const raw = e.target.value.replace(/\D/g, '');
                                      handleUpdateChoice(gIdx, cIdx, 'extra', raw ? Number(raw) : 0);
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '7px 8px 7px 34px',
                                      borderRadius: '8px',
                                      background: 'rgba(255, 255, 255, 0.04)',
                                      border: '1px solid var(--border-subtle)',
                                      color: choice.extra > 0 ? '#34d399' : '#fff',
                                      fontSize: '12px',
                                      fontWeight: choice.extra > 0 ? 700 : 400
                                    }}
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveChoice(gIdx, cIdx)}
                                  disabled={(group.choices || []).length <= 1}
                                  title="Hapus opsi ini"
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'transparent',
                                    border: '1px solid transparent',
                                    color: 'var(--text-muted)',
                                    cursor: (group.choices || []).length <= 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: (group.choices || []).length <= 1 ? 0.3 : 1
                                  }}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => handleAddChoice(gIdx)}
                              style={{
                                alignSelf: 'flex-start',
                                padding: '5px 10px',
                                borderRadius: '7px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px dashed var(--border-subtle)',
                                color: 'var(--accent-primary)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '4px'
                              }}
                            >
                              <Plus size={12} />
                              <span>+ Tambah Pilihan Opsi</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Button to Add More Variant Groups */}
                    <button
                      type="button"
                      onClick={handleAddVariantGroup}
                      style={{
                        padding: '9px 14px',
                        borderRadius: '10px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px dashed rgba(245, 158, 11, 0.4)',
                        color: 'var(--accent-primary)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={15} />
                      <span>+ Tambah Grup Varian Baru (misal: Suhu, Topping)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Deskripsi / Komposisi (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Biji kopi robusta Lampung racikan khas warkop..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: '13px'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'var(--accent-primary)',
                    color: '#000',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  <Check size={16} />
                  <span>{editingProduct ? 'Simpan Perubahan' : 'Tambah Menu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CATEGORY MANAGEMENT */}
      {/* ======================================================== */}
      {isCategoryModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            maxHeight: '90vh',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(23, 20, 18, 0.8)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                  Kelola Kategori Menu
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                  setNewCategoryName('');
                }}
                style={{ background: 'transparent', color: 'var(--text-muted)', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Add / Edit Category Form */}
              <form onSubmit={handleSaveCategorySubmit} style={{
                padding: '14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {editingCategory ? `Ubah Kategori: "${editingCategory.name}"` : '+ Tambah Kategori Baru'}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kopi, Non-Kopi, Makanan, Snack..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  />

                  <button
                    type="submit"
                    disabled={savingCategory}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'var(--accent-primary)',
                      color: '#000',
                      fontWeight: 700,
                      fontSize: '12px'
                    }}
                  >
                    {editingCategory ? 'Update' : 'Tambah'}
                  </button>

                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setNewCategoryName('');
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        fontSize: '12px'
                      }}
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>

              {/* Categories List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Daftar Kategori Aktif:
                </div>

                {categories.map(cat => {
                  const prodCount = products.filter(p => p.category_id === cat.id).length;

                  return (
                    <div
                      key={cat.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Coffee size={15} color="var(--accent-primary)" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{cat.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({prodCount} menu)</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(cat);
                            setNewCategoryName(cat.name);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-muted)',
                            fontSize: '11px'
                          }}
                        >
                          <Edit3 size={12} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCategoryClick(cat)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--accent-rose)',
                            fontSize: '11px'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE PRODUCT CONFIRMATION MODAL */}
      {deleteTarget && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'scaleIn 0.15s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Trash2 size={22} color="var(--accent-rose)" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Hapus Menu Permanen?
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Menu akan dihapus dari daftar katalog kasir
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '13px',
              color: 'var(--text-secondary)'
            }}>
              Apakah Anda yakin ingin menghapus menu <strong style={{ color: '#fff' }}>"{deleteTarget.name}"</strong>? Jika menu ini ada dalam riwayat pesanan sebelumnya, data laporan tetap aman.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                id="btn-confirm-delete-menu"
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                  opacity: isDeleting ? 0.7 : 1
                }}
              >
                <Trash2 size={14} />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
