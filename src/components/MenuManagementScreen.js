'use client';

import React, { useState } from 'react';
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
  EyeOff
} from 'lucide-react';

export default function MenuManagementScreen({
  categories,
  products,
  onSaveProduct,
  onDeleteProduct,
  onToggleAvailability,
  onResetDefaultMenu
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('cat-kopi');
  const [formPrice, setFormPrice] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formEmoji, setFormEmoji] = useState('☕');
  const [formDescription, setFormDescription] = useState('');
  const [formHasOptions, setFormHasOptions] = useState(false);
  const [formOptions, setFormOptions] = useState([]);

  // Presets for Quick 1-Click Variant Creation
  const PRESET_KOPI = [
    {
      name: 'Suhu',
      choices: [
        { name: 'Panas', extra: 0 },
        { name: 'Pakai Es (Dingin)', extra: 1000 }
      ]
    },
    {
      name: 'Tingkat Gula',
      choices: [
        { name: 'Normal (100%)', extra: 0 },
        { name: 'Sedikit Gula (50%)', extra: 0 },
        { name: 'Tanpa Gula (0%)', extra: 0 }
      ]
    }
  ];

  const PRESET_MIE = [
    {
      name: 'Level Pedas',
      choices: [
        { name: 'Level 0 (Tidak Pedas)', extra: 0 },
        { name: 'Level 1 (Sedang)', extra: 0 },
        { name: 'Level 2 (Pedas)', extra: 0 },
        { name: 'Level 3 (Ekstra Pedas)', extra: 0 }
      ]
    },
    {
      name: 'Topping Tambahan',
      choices: [
        { name: 'Original (Standar)', extra: 0 },
        { name: 'Tambah Telur', extra: 3000 },
        { name: 'Tambah Kornet', extra: 4000 },
        { name: 'Dobel Telur + Kornet', extra: 7000 }
      ]
    }
  ];

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num || 0);
  };

  const filteredProducts = products.filter(p => 
    selectedCategory === 'all' || p.category_id === selectedCategory
  );

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategoryId(categories[0]?.id || 'cat-kopi');
    setFormPrice('');
    setFormCostPrice('');
    setFormEmoji('☕');
    setFormDescription('');
    setFormHasOptions(false);
    setFormOptions([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategoryId(prod.category_id);
    setFormPrice(String(prod.price));
    setFormCostPrice(String(prod.cost_price || ''));
    setFormEmoji(prod.image || '☕');
    setFormDescription(prod.description || '');
    setFormHasOptions(Boolean(prod.has_options || (prod.options && prod.options.length > 0)));
    setFormOptions(Array.isArray(prod.options) ? JSON.parse(JSON.stringify(prod.options)) : []);
    setIsModalOpen(true);
  };

  // Variant editing handlers
  const handleApplyPreset = (presetArray) => {
    setFormHasOptions(true);
    setFormOptions(JSON.parse(JSON.stringify(presetArray)));
  };

  const handleAddOptionGroup = () => {
    setFormHasOptions(true);
    setFormOptions(prev => [
      ...prev,
      {
        name: `Varian Baru ${prev.length + 1}`,
        choices: [
          { name: 'Pilihan 1', extra: 0 },
          { name: 'Pilihan 2', extra: 1000 }
        ]
      }
    ]);
  };

  const handleUpdateGroupName = (groupIndex, newName) => {
    setFormOptions(prev => {
      const copy = [...prev];
      copy[groupIndex].name = newName;
      return copy;
    });
  };

  const handleRemoveOptionGroup = (groupIndex) => {
    setFormOptions(prev => prev.filter((_, idx) => idx !== groupIndex));
  };

  const handleAddChoiceToGroup = (groupIndex) => {
    setFormOptions(prev => {
      const copy = [...prev];
      copy[groupIndex].choices.push({ name: `Opsi ${copy[groupIndex].choices.length + 1}`, extra: 0 });
      return copy;
    });
  };

  const handleUpdateChoice = (groupIndex, choiceIndex, field, value) => {
    setFormOptions(prev => {
      const copy = [...prev];
      copy[groupIndex].choices[choiceIndex][field] = field === 'extra' ? (Number(value) || 0) : value;
      return copy;
    });
  };

  const handleRemoveChoice = (groupIndex, choiceIndex) => {
    setFormOptions(prev => {
      const copy = [...prev];
      copy[groupIndex].choices = copy[groupIndex].choices.filter((_, cIdx) => cIdx !== choiceIndex);
      return copy;
    });
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) {
      alert('Nama menu dan harga jual wajib diisi!');
      return;
    }

    const payload = {
      ...(editingProduct ? editingProduct : {}),
      name: formName.trim(),
      category_id: formCategoryId,
      price: Number(formPrice) || 0,
      cost_price: Number(formCostPrice) || 0,
      image: formEmoji || '☕',
      description: formDescription.trim(),
      has_options: formHasOptions && formOptions.length > 0,
      options: formHasOptions && formOptions.length > 0 ? formOptions : [],
      available: editingProduct ? editingProduct.available : true
    };

    onSaveProduct(payload);
    setIsModalOpen(false);
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-main)',
      overflowY: 'auto',
      minHeight: 0,
      padding: '16px 14px 100px 14px'
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>
            Manajemen Menu & Stok Warkop
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Kelola daftar minuman, makanan, harga jual, dan status ketersediaan
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={onResetDefaultMenu}
            title="Kembalikan ke daftar menu warkop bawaan"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '13px'
            }}
          >
            <RotateCcw size={14} />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%)',
              color: '#000',
              fontWeight: 700,
              fontSize: '13px',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
            }}
          >
            <Plus size={16} strokeWidth={2.6} />
            <span>Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="touch-scroll-x" style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '18px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '7px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: selectedCategory === 'all' ? 700 : 500,
            background: selectedCategory === 'all' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            color: selectedCategory === 'all' ? 'var(--accent-primary)' : 'var(--text-muted)',
            border: selectedCategory === 'all' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)'
          }}
        >
          Semua ({products.length})
        </button>

        {categories.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCategory(c.id)}
            style={{
              padding: '7px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: selectedCategory === c.id ? 700 : 500,
              background: selectedCategory === c.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedCategory === c.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: selectedCategory === c.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)'
            }}
          >
            {c.name} ({products.filter(p => p.category_id === c.id).length})
          </button>
        ))}
      </div>

      {/* Product List Table / Grid */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto', maxHeight: '520px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(23, 20, 18, 0.98)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Menu</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Kategori</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Harga Jual</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>HPP / Modal</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status Stok</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(prod => {
                const isAvail = prod.available !== false;
                const catObj = categories.find(c => c.id === prod.category_id);

                return (
                  <tr
                    key={prod.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      opacity: isAvail ? 1 : 0.65
                    }}
                  >
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px'
                        }}>
                          {prod.image || '☕'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{prod.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {prod.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      {catObj ? catObj.name : '-'}
                    </td>

                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {formatIDR(prod.price)}
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      {prod.cost_price ? formatIDR(prod.cost_price) : '-'}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <button
                        type="button"
                        onClick={() => onToggleAvailability(prod.id, !isAvail)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: isAvail ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isAvail ? '#34d399' : '#f87171',
                          border: isAvail ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                        }}
                      >
                        {isAvail ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{isAvail ? 'Tersedia' : 'Habis'}</span>
                      </button>
                    </td>

                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(prod)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: '#fff'
                          }}
                          title="Edit Menu"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Yakin ingin menghapus "${prod.name}"?`)) {
                              if (typeof onDeleteProduct === 'function') {
                                onDeleteProduct(prod.id);
                              }
                            }
                          }}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#f87171'
                          }}
                          title="Hapus Menu"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Menu Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 130,
          background: 'rgba(0, 0, 0, 0.8)',
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
              maxWidth: '480px',
              maxHeight: '92vh',
              overflowY: 'auto',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#fff' }}>
                {editingProduct ? 'Edit Menu Warkop' : 'Tambah Menu Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Nama Menu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kopi Susu Aren Spesial"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Kategori
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Emoji / Ikon
                  </label>
                  <input
                    type="text"
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                    placeholder="☕"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '16px',
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Harga Jual (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="15000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--accent-primary)',
                      fontWeight: 700,
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    HPP / Modal (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="7000"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Deskripsi Menu
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan bahan atau keistimewaan rasa..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '13px',
                    resize: 'none'
                  }}
                />
              </div>

              {/* === VARIAN & KUSTOMISASI PESANAN SECTION === */}
              <div style={{
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.35)',
                border: formHasOptions ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
                padding: '14px 16px',
                marginTop: '4px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: formHasOptions ? '14px' : '0'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <SlidersHorizontal size={15} color="var(--accent-primary)" />
                      <span>Aktifkan Varian & Opsi Pesanan</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Atur pilihan seperti Suhu (Panas/Es), Level Gula, atau Topping
                    </div>
                  </div>

                  <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formHasOptions}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormHasOptions(checked);
                        if (checked && formOptions.length === 0) {
                          handleApplyPreset(PRESET_KOPI);
                        }
                      }}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                    />
                  </label>
                </div>

                {formHasOptions && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Quick Presets */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Preset Cepat:</span>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(PRESET_KOPI)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: 'var(--accent-primary)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ☕ Preset Kopi (Suhu & Gula)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(PRESET_MIE)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          color: '#38bdf8',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        🍜 Preset Mie (Pedas & Topping)
                      </button>
                    </div>

                    {/* Variant Groups List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {formOptions.map((group, gIdx) => (
                        <div
                          key={gIdx}
                          style={{
                            padding: '12px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                          }}
                        >
                          {/* Group Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                            <input
                              type="text"
                              value={group.name}
                              onChange={(e) => handleUpdateGroupName(gIdx, e.target.value)}
                              placeholder="Nama Grup Varian (cth: Suhu, Gula, Topping)"
                              style={{
                                flex: 1,
                                padding: '6px 10px',
                                borderRadius: '6px',
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid var(--border-subtle)',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: 700
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionGroup(gIdx)}
                              title="Hapus Grup Varian"
                              style={{
                                padding: '6px',
                                borderRadius: '6px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                color: '#f87171',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Choices List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {group.choices.map((choice, cIdx) => (
                              <div key={cIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="text"
                                  value={choice.name}
                                  onChange={(e) => handleUpdateChoice(gIdx, cIdx, 'name', e.target.value)}
                                  placeholder="Pilihan (cth: Dingin / Es)"
                                  style={{
                                    flex: 2,
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--border-subtle)',
                                    color: '#fff',
                                    fontSize: '11px'
                                  }}
                                />
                                <div style={{ flex: 1.5, position: 'relative', display: 'flex', alignItems: 'center' }}>
                                  <span style={{ position: 'absolute', left: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>+Rp</span>
                                  <input
                                    type="number"
                                    value={choice.extra || ''}
                                    onChange={(e) => handleUpdateChoice(gIdx, cIdx, 'extra', e.target.value)}
                                    placeholder="0"
                                    style={{
                                      width: '100%',
                                      padding: '5px 8px 5px 28px',
                                      borderRadius: '6px',
                                      background: 'rgba(0,0,0,0.3)',
                                      border: '1px solid var(--border-subtle)',
                                      color: 'var(--accent-primary)',
                                      fontSize: '11px',
                                      fontWeight: 600
                                    }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveChoice(gIdx, cIdx)}
                                  style={{
                                    padding: '5px 8px',
                                    borderRadius: '5px',
                                    background: 'transparent',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => handleAddChoiceToGroup(gIdx)}
                              style={{
                                alignSelf: 'flex-start',
                                padding: '4px 8px',
                                borderRadius: '5px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px dashed var(--border-subtle)',
                                color: 'var(--accent-primary)',
                                fontSize: '11px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              <Plus size={11} />
                              <span>Tambah Pilihan</span>
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddOptionGroup}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px dashed var(--border-subtle)',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={14} color="var(--accent-primary)" />
                        <span>+ Tambah Grup Varian Baru</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%)',
                    color: '#000',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
