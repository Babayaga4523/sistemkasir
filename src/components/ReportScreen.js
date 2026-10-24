'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Download, 
  Printer, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  LayoutGrid,
  Table as TableIcon,
  PieChart as LucidePieChart,
  Filter,
  RotateCcw,
  Flame,
  Award,
  CreditCard
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

function CustomAreaTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div style={{
        background: 'rgba(23, 20, 18, 0.96)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        borderRadius: '10px',
        padding: '8px 14px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.7)',
        fontSize: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: '3px', fontWeight: 600 }}>{label}</div>
        <div style={{ color: 'var(--accent-primary)', fontWeight: 800, fontSize: '14px' }}>
          {`Rp ${Number(item.value || 0).toLocaleString('id-ID')}`}
        </div>
        {payload[1] && (
          <div style={{ color: '#38bdf8', fontSize: '11px', marginTop: '2px', fontWeight: 600 }}>
            {payload[1].value} Transaksi
          </div>
        )}
      </div>
    );
  }
  return null;
}

function CustomBarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div style={{
        background: 'rgba(23, 20, 18, 0.96)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        borderRadius: '10px',
        padding: '8px 12px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.7)',
        fontSize: '12px'
      }}>
        <div style={{ color: '#fff', fontWeight: 700, marginBottom: '2px' }}>
          {item.payload.fullName || item.payload.name}
        </div>
        <div style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>
          {item.value} porsi terjual
        </div>
      </div>
    );
  }
  return null;
}

function CustomPeakTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div style={{
        background: 'rgba(23, 20, 18, 0.96)',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '10px',
        padding: '8px 12px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.7)',
        fontSize: '12px'
      }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Pukul {label}</div>
        <div style={{ color: '#34d399', fontWeight: 800 }}>
          {item.value} Transaksi
        </div>
      </div>
    );
  }
  return null;
}

function CustomDonutTooltip({ active, payload, totalRevenue }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    const percent = totalRevenue > 0 ? Math.round((item.value / totalRevenue) * 100) : 0;
    return (
      <div style={{
        background: 'rgba(23, 20, 18, 0.96)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '10px',
        padding: '8px 12px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.7)',
        fontSize: '12px'
      }}>
        <div style={{ color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.payload.color }} />
          <span>{item.name}</span>
        </div>
        <div style={{ color: item.payload.color, fontWeight: 800, marginTop: '2px' }}>
          {`Rp ${Number(item.value || 0).toLocaleString('id-ID')}`} ({percent}%)
        </div>
      </div>
    );
  }
  return null;
}

export default function ReportScreen({ orders, onReprintReceipt, onSettleOrder }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('today'); // 'today', 'yesterday', 'last7', 'month', 'custom', 'all'
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [activeView, setActiveView] = useState('split'); // 'split', 'table', 'analytics'

  const formatIDR = (num) => {
    return `Rp ${Number(num || 0).toLocaleString('id-ID')}`;
  };

  const getLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handlePresetClick = (type) => {
    setPeriodFilter(type);
    const now = new Date();
    if (type === 'today') {
      const todayStr = getLocalDateString(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = getLocalDateString(y);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (type === 'last7') {
      const past7 = new Date();
      past7.setDate(past7.getDate() - 6);
      setStartDate(getLocalDateString(past7));
      setEndDate(getLocalDateString(now));
    } else if (type === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(getLocalDateString(firstDay));
      setEndDate(getLocalDateString(now));
    } else if (type === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  // 1. Period & Custom Date Filter
  const periodOrders = orders.filter(o => {
    if (periodFilter === 'all' && !startDate && !endDate) return true;

    const orderDate = new Date(o.created_at || Date.now());

    if (startDate) {
      const [sY, sM, sD] = startDate.split('-').map(Number);
      const start = new Date(sY, sM - 1, sD, 0, 0, 0, 0);
      if (orderDate < start) return false;
    }

    if (endDate) {
      const [eY, eM, eD] = endDate.split('-').map(Number);
      const end = new Date(eY, eM - 1, eD, 23, 59, 59, 999);
      if (orderDate > end) return false;
    }

    return true;
  });

  // Exclude cancelled orders from financial calculations
  const nonCancelledOrders = periodOrders.filter(o => o.status !== 'cancelled');

  // Metrics calculation based on selected period
  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrdersCount = nonCancelledOrders.length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  
  let totalItemsSold = 0;
  const productSalesMap = {};
  const paymentMethodMap = { cash: 0, qris: 0, debit: 0, transfer: 0, unpaid: 0 };

  nonCancelledOrders.forEach(order => {
    const rawPm = (order.payment_method || (order.payment_status === 'unpaid' ? 'unpaid' : 'cash')).toLowerCase();
    
    if (rawPm === 'cash' || rawPm === 'tunai') {
      paymentMethodMap.cash += (Number(order.total) || 0);
    } else if (rawPm === 'qris') {
      paymentMethodMap.qris += (Number(order.total) || 0);
    } else if (rawPm === 'debit') {
      paymentMethodMap.debit += (Number(order.total) || 0);
    } else if (rawPm === 'transfer') {
      paymentMethodMap.transfer += (Number(order.total) || 0);
    } else if (rawPm === 'unpaid') {
      paymentMethodMap.unpaid += (Number(order.total) || 0);
    } else {
      paymentMethodMap.cash += (Number(order.total) || 0);
    }

    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(it => {
        const qty = Number(it.quantity) || 1;
        totalItemsSold += qty;
        const pName = it.product_name || 'Item Tanpa Nama';
        productSalesMap[pName] = (productSalesMap[pName] || 0) + qty;
      });
    }
  });

  // Top 5 best sellers
  const topProducts = Object.entries(productSalesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxSold = topProducts.length > 0 ? topProducts[0][1] : 1;

  // 1. Trend chart data (Hourly for single day, Daily for multi-day period)
  const isSingleDay = periodFilter === 'today' || periodFilter === 'yesterday' || (startDate && endDate && startDate === endDate);
  
  let trendChartData = [];
  if (isSingleDay) {
    const hourlyMap = {};
    for (let h = 8; h <= 23; h++) {
      const label = `${String(h).padStart(2, '0')}:00`;
      hourlyMap[label] = { time: label, hour: h, omzet: 0, transaksi: 0 };
    }
    nonCancelledOrders.forEach(o => {
      const d = new Date(o.created_at || Date.now());
      const h = d.getHours();
      const label = `${String(h).padStart(2, '0')}:00`;
      if (!hourlyMap[label]) {
        hourlyMap[label] = { time: label, hour: h, omzet: 0, transaksi: 0 };
      }
      hourlyMap[label].omzet += (Number(o.total) || 0);
      hourlyMap[label].transaksi += 1;
    });
    // Ensure chronological order regardless of when extra early or late orders occurred
    trendChartData = Object.values(hourlyMap).sort((a, b) => a.hour - b.hour);
  } else {
    const dailyMap = {};
    const sortedOrders = [...nonCancelledOrders].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    sortedOrders.forEach(o => {
      const d = new Date(o.created_at || Date.now());
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { time: label, dateKey, omzet: 0, transaksi: 0 };
      }
      dailyMap[dateKey].omzet += (Number(o.total) || 0);
      dailyMap[dateKey].transaksi += 1;
    });
    trendChartData = Object.values(dailyMap).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    if (trendChartData.length === 0) {
      trendChartData = [{ time: 'Hari Ini', omzet: 0, transaksi: 0 }];
    }
  }

  // 2. Top Products for Horizontal BarChart
  const topProductsChartData = topProducts.map(([name, qty]) => ({
    name: name.length > 18 ? name.slice(0, 16) + '..' : name,
    fullName: name,
    terjual: qty
  })).reverse();

  // 3. Payment Methods for Donut Chart (combines transfer + debit and shows unpaid clearly)
  const paymentMethodChartData = [
    { name: 'Tunai (Cash)', value: paymentMethodMap.cash || 0, color: '#10b981' },
    { name: 'QRIS Instan', value: paymentMethodMap.qris || 0, color: '#f59e0b' },
    { name: 'Transfer / Debit', value: (paymentMethodMap.transfer || 0) + (paymentMethodMap.debit || 0), color: '#0ea5e9' },
    ...(paymentMethodMap.unpaid > 0 ? [{ name: 'Belum Lunas (Open Bill)', value: paymentMethodMap.unpaid, color: '#f43f5e' }] : [])
  ].filter(m => m.value > 0);

  // 4. Peak Hours for Vertical BarChart
  const peakHoursMap = {};
  for (let h = 8; h <= 23; h++) {
    const label = `${String(h).padStart(2, '0')}:00`;
    peakHoursMap[label] = { jam: label, hour: h, transaksi: 0 };
  }
  nonCancelledOrders.forEach(o => {
    const d = new Date(o.created_at || Date.now());
    const h = d.getHours();
    const label = `${String(h).padStart(2, '0')}:00`;
    if (!peakHoursMap[label]) {
      peakHoursMap[label] = { jam: label, hour: h, transaksi: 0 };
    }
    peakHoursMap[label].transaksi += 1;
  });
  const peakHoursData = Object.values(peakHoursMap).sort((a, b) => a.hour - b.hour);

  // Filtered orders list by search and status
  const filteredOrders = periodOrders.filter(o => {
    const matchesSearch = o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const isUnpaid = o.payment_method === 'unpaid' || o.payment_status === 'unpaid';
    const matchesStatus = statusFilter === 'all'
      ? true
      : statusFilter === 'unpaid'
        ? isUnpaid
        : o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPeriodDescription = () => {
    if (periodFilter === 'today') {
      return `Hari Ini (${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})`;
    }
    if (periodFilter === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return `Kemarin (${y.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})`;
    }
    if (periodFilter === 'last7') {
      return `7 Hari Terakhir (${startDate} s/d ${endDate})`;
    }
    if (periodFilter === 'month') {
      return `Bulan Ini (${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})`;
    }
    if (startDate && endDate) {
      if (startDate === endDate) return `Tanggal: ${startDate}`;
      return `${startDate} s/d ${endDate}`;
    }
    if (startDate) return `Sejak ${startDate}`;
    if (endDate) return `Hingga ${endDate}`;
    return 'Semua Waktu (Seluruh Transaksi)';
  };

  const handleExportCSV = () => {
    const headers = ['No Nota', 'Tanggal', 'Jam', 'Pelanggan', 'Tipe', 'Subtotal', 'Diskon', 'Pajak', 'Total', 'Metode Pembayaran', 'Status'];
    const rows = filteredOrders.map(o => {
      const d = new Date(o.created_at || Date.now());
      return [
        o.order_number,
        d.toLocaleDateString('id-ID'),
        d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        `"${(o.customer_name || 'Pelanggan').replace(/"/g, '""')}"`,
        o.order_type === 'dine_in' ? `Meja ${o.table_number || '-'}` : 'Bungkus',
        o.subtotal || 0,
        o.discount || 0,
        o.tax || 0,
        o.total || 0,
        o.payment_method || 'cash',
        o.status
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateSuffix = startDate && endDate ? `${startDate}_sd_${endDate}` : periodFilter;
    link.setAttribute('download', `laporan-warkop-${dateSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-main)',
      overflowY: 'auto',
      minHeight: 0,
      padding: '14px 12px calc(var(--mobile-nav-height, 62px) + var(--safe-bottom, 0px) + 24px) 12px'
    }}>
      <style>{`
        .report-main-grid {
          display: grid;
          grid-template-columns: ${activeView === 'split' ? '1.25fr 0.85fr' : '1fr'};
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .report-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .report-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        @media (max-width: 640px) {
          .report-kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
        }
        @media (max-width: 360px) {
          .report-kpi-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      {/* 1. Header Bar: Title, View Switcher & Export */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '12px',
        flexShrink: 0
      }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <span>Laporan & Transaksi</span>
          </h1>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Rekap omzet keuangan warkop, metode bayar, dan nota transaksi kasir
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
          {/* View Mode Toggle */}
          <div className="touch-scroll-x" style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            gap: '3px',
            maxWidth: '100%',
            overflowX: 'auto'
          }}>
            <button
              type="button"
              onClick={() => setActiveView('split')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '7px',
                fontSize: '11.5px',
                fontWeight: activeView === 'split' ? 700 : 500,
                background: activeView === 'split' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: activeView === 'split' ? 'var(--accent-primary)' : 'var(--text-muted)',
                border: activeView === 'split' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
                whiteSpace: 'nowrap'
              }}
              title="Tampilkan Ringkasan & Riwayat berdampingan"
            >
              <LayoutGrid size={13} />
              <span>Semua</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '7px',
                fontSize: '11.5px',
                fontWeight: activeView === 'table' ? 700 : 500,
                background: activeView === 'table' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: activeView === 'table' ? 'var(--accent-primary)' : 'var(--text-muted)',
                border: activeView === 'table' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
                whiteSpace: 'nowrap'
              }}
              title="Fokus ke Tabel Riwayat Transaksi"
            >
              <TableIcon size={13} />
              <span>Riwayat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('analytics')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '7px',
                fontSize: '11.5px',
                fontWeight: activeView === 'analytics' ? 700 : 500,
                background: activeView === 'analytics' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: activeView === 'analytics' ? 'var(--accent-primary)' : 'var(--text-muted)',
                border: activeView === 'analytics' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
                whiteSpace: 'nowrap'
              }}
              title="Fokus ke Analitik Menu & Pembayaran"
            >
              <LucidePieChart size={13} />
              <span>Grafik</span>
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '9px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Download size={13} color="var(--accent-primary)" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. DEDICATED DATE FILTER TOOLBAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        background: 'var(--bg-surface)',
        padding: '10px 14px',
        borderRadius: '14px',
        border: '1px solid var(--border-subtle)',
        marginBottom: '14px',
        flexWrap: 'wrap',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Preset Buttons with touch-scroll */}
        <div className="touch-scroll-x" style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', width: '100%', paddingBottom: '2px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--accent-primary)',
            marginRight: '2px',
            paddingRight: '6px',
            borderRight: '1px solid var(--border-subtle)',
            whiteSpace: 'nowrap'
          }}>
            <Calendar size={13} />
            <span>Filter:</span>
          </div>

          {[
            { id: 'today', label: 'Hari Ini' },
            { id: 'yesterday', label: 'Kemarin' },
            { id: 'last7', label: '7 Hari Terakhir' },
            { id: 'month', label: 'Bulan Ini' },
            { id: 'all', label: 'Semua Waktu' }
          ].map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetClick(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: periodFilter === p.id ? 700 : 500,
                background: periodFilter === p.id ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.04)',
                color: periodFilter === p.id ? '#000' : 'var(--text-muted)',
                border: periodFilter === p.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Date Range Inputs: Dari - Sampai */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '5px 10px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPeriodFilter('custom');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                colorScheme: 'dark'
              }}
            />
          </div>

          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>s/d</span>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '5px 10px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPeriodFilter('custom');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                colorScheme: 'dark'
              }}
            />
          </div>

          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => handlePresetClick('all')}
              title="Reset filter tanggal ke Semua Waktu"
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--accent-rose)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Period Indicator Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        borderRadius: '10px',
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        marginBottom: '14px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fef3c7' }}>
          <Clock size={14} color="var(--accent-primary)" />
          <span>Menampilkan Laporan Periode: <strong>{getPeriodDescription()}</strong></span>
        </div>
        <div style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
          {totalOrdersCount} Transaksi Ditemukan
        </div>
      </div>

      {/* 2. Top Sleek KPI Chips */}
      <div className="report-kpi-grid" style={{ flexShrink: 0 }}>
        {/* KPI 1: Omzet */}
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <DollarSign size={18} color="#34d399" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Omzet
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-emerald)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {formatIDR(totalRevenue)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
              Dari {totalOrdersCount} pesanan
            </div>
          </div>
        </div>

        {/* KPI 2: Transaksi */}
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShoppingBag size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Transaksi
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
              {totalOrdersCount} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>nota</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
              Transaksi tersimpan
            </div>
          </div>
        </div>

        {/* KPI 3: AOV */}
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <TrendingUp size={18} color="#38bdf8" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Rata-rata Nota (AOV)
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {formatIDR(averageOrderValue)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
              Per pelanggan/meja
            </div>
          </div>
        </div>

        {/* KPI 4: Total Items */}
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(168, 85, 247, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Users size={18} color="#c084fc" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Porsi Terjual
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
              {totalItemsSold} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>item</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
              Kopi, mie, & camilan
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Body Section: Split or Single Column */}
      <div className="report-main-grid">
        {/* === SECTION A: TRANSACTION TABLE === */}
        {(activeView === 'split' || activeView === 'table') && (
          <div style={{
            borderRadius: '14px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Table Control Bar */}
            <div style={{
              padding: '12px 18px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              background: 'rgba(23, 20, 18, 0.7)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TableIcon size={16} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                  Riwayat Transaksi ({filteredOrders.length})
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                  <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Cari nota / nama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: '6px 10px 6px 28px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '12px',
                      width: '160px'
                    }}
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#1c1917',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '12px',
                    colorScheme: 'dark',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all" style={{ background: '#1c1917', color: '#fff' }}>Semua Status</option>
                  <option value="unpaid" style={{ background: '#1c1917', color: '#f87171' }}>⏳ Belum Lunas (Open Bill)</option>
                  <option value="completed" style={{ background: '#1c1917', color: '#fff' }}>Selesai</option>
                  <option value="ready" style={{ background: '#1c1917', color: '#fff' }}>Siap Disajikan</option>
                  <option value="brewing" style={{ background: '#1c1917', color: '#fff' }}>Sedang Diracik</option>
                  <option value="pending" style={{ background: '#1c1917', color: '#fff' }}>Pending</option>
                </select>
              </div>
            </div>

            {/* Table Rows with Sticky Header */}
            <div style={{ overflowX: 'auto', maxHeight: activeView === 'split' ? '440px' : '520px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(23, 20, 18, 0.98)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>No. Nota</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Waktu</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Pelanggan</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Tipe</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Metode</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Total</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Tidak ada transaksi yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr
                        key={order.id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '11px 14px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                          {order.order_number}
                        </td>
                        <td style={{ padding: '11px 12px', color: 'var(--text-muted)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                          <div style={{ color: '#fff', fontWeight: 600 }}>
                            {new Date(order.created_at || Date.now()).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
                            {new Date(order.created_at || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </div>
                        </td>
                        <td style={{ padding: '11px 12px', color: '#fff', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.customer_name || 'Pelanggan'}
                        </td>
                        <td style={{ padding: '11px 12px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 7px',
                            borderRadius: '5px',
                            background: order.order_type === 'dine_in' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(168, 85, 247, 0.12)',
                            color: order.order_type === 'dine_in' ? '#38bdf8' : '#c084fc',
                            fontWeight: 600
                          }}>
                            {order.order_type === 'dine_in' ? `Meja ${order.table_number || '-'}` : 'Bungkus'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 12px', whiteSpace: 'nowrap' }}>
                          {(order.payment_method === 'unpaid' || order.payment_status === 'unpaid') ? (
                            <span style={{
                              fontSize: '10px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <span>⏳ Belum Lunas</span>
                            </span>
                          ) : (
                            <span style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>
                              {order.payment_method || 'cash'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '11px 12px', fontWeight: 700, color: 'var(--accent-primary)', whiteSpace: 'nowrap' }}>
                          {formatIDR(order.total)}
                        </td>
                        <td style={{ padding: '11px 12px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 7px',
                            borderRadius: '999px',
                            background: order.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: order.status === 'completed' ? '#34d399' : '#fbbf24',
                            fontWeight: 600
                          }}>
                            {order.status === 'completed' ? 'Selesai' : order.status === 'ready' ? 'Siap' : 'Proses'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {(order.payment_method === 'unpaid' || order.payment_status === 'unpaid') && onSettleOrder && (
                              <button
                                type="button"
                                onClick={() => onSettleOrder(order)}
                                title="Lunasi Tagihan Open Bill"
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  background: 'linear-gradient(135deg, var(--accent-emerald) 0%, var(--accent-emerald-hover) 100%)',
                                  color: '#fff',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: '0 2px 8px var(--accent-emerald-glow)'
                                }}
                              >
                                <CreditCard size={12} />
                                <span>Lunasi</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onReprintReceipt(order)}
                              title="Cetak Ulang Struk"
                              style={{
                                padding: '5px 9px',
                                borderRadius: '6px',
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid var(--border-subtle)',
                                color: '#fff',
                                fontSize: '11px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Printer size={12} color="var(--accent-primary)" />
                              <span>Struk</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === SECTION B: CHARTS & ANALYTICS === */}
        {activeView === 'split' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Card 1: Tren Omzet Area Chart */}
            <div style={{
              padding: '16px 18px',
              borderRadius: '14px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={15} color="var(--accent-primary)" />
                  <span>Tren Omzet ({isSingleDay ? 'Per Jam' : 'Harian'})</span>
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  {formatIDR(totalRevenue)}
                </span>
              </div>

              {isMounted && (
                <div style={{ width: '100%', height: '170px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="splitOmzetGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--text-faint)" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis stroke="var(--text-faint)" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(val) => `${val >= 1000 ? val / 1000 + 'k' : val}`} />
                      <RechartsTooltip content={<CustomAreaTooltip />} />
                      <Area type="monotone" dataKey="omzet" stroke="#f59e0b" strokeWidth={2.5} fill="url(#splitOmzetGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Card 2: Top 5 Menu Paling Laris (Horizontal Bar Chart) */}
            <div style={{
              padding: '16px 18px',
              borderRadius: '14px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={15} color="var(--accent-primary)" />
                  <span>Top 5 Menu Paling Laris</span>
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Berdasarkan porsi</span>
              </div>

              {topProductsChartData.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>
                  Belum ada data penjualan pada periode ini.
                </div>
              ) : (
                isMounted && (
                  <div style={{ width: '100%', height: '170px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={topProductsChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" horizontal={false} />
                        <XAxis type="number" stroke="var(--text-faint)" tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                        <YAxis dataKey="name" type="category" stroke="var(--text-faint)" width={90} tick={{ fill: '#f8fafc', fontSize: 11 }} />
                        <RechartsTooltip content={<CustomBarTooltip />} />
                        <Bar dataKey="terjual" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )
              )}
            </div>

            {/* Card 3: Pembagian Metode Bayar (Donut Chart) */}
            <div style={{
              padding: '16px 18px',
              borderRadius: '14px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LucidePieChart size={15} color="#34d399" />
                  <span>Metode Pembayaran</span>
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Proporsi nominal</span>
              </div>

              {paymentMethodChartData.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>
                  Belum ada transaksi pembayaran.
                </div>
              ) : (
                isMounted && (
                  <div>
                    <div style={{ width: '100%', height: '150px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={paymentMethodChartData}
                            innerRadius={42}
                            outerRadius={65}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {paymentMethodChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomDonutTooltip totalRevenue={totalRevenue} />} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {paymentMethodChartData.map(m => {
                        const pct = totalRevenue > 0 ? Math.round((m.value / totalRevenue) * 100) : 0;
                        return (
                          <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.color }} />
                            <span style={{ color: 'var(--text-muted)' }}>{m.name}:</span>
                            <span style={{ color: '#fff', fontWeight: 700 }}>{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* FULL ANALYTICS DASHBOARD VIEW */}
        {activeView === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Row 1: Hero Area Chart (Tren Pergerakan Omzet) */}
            <div style={{
              padding: '20px 24px',
              borderRadius: '16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="var(--accent-primary)" />
                    <span>Tren Pergerakan Omzet & Penjualan ({isSingleDay ? 'Per Jam' : 'Harian'})</span>
                  </h2>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Visualisasi volume perputaran uang warkop berdasarkan waktu transaksi
                  </div>
                </div>

                <div style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: 'var(--accent-primary)',
                  fontWeight: 800,
                  fontSize: '15px'
                }}>
                  {formatIDR(totalRevenue)}
                </div>
              </div>

              {isMounted && (
                <div style={{ width: '100%', height: '260px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="analyticsOmzetGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--text-faint)" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis
                        stroke="var(--text-faint)"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickFormatter={(val) => (val >= 1000 ? `Rp ${val / 1000}k` : `Rp ${val}`)}
                      />
                      <RechartsTooltip content={<CustomAreaTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="omzet"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        fill="url(#analyticsOmzetGradient)"
                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 6, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Row 2: 3-Column Analytics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
              gap: '16px'
            }}>
              {/* Chart 2: Top 5 Menu Paling Laris (Horizontal Bar Chart) */}
              <div style={{
                padding: '18px 20px',
                borderRadius: '16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={16} color="var(--accent-primary)" />
                    <span>Top 5 Menu Terlaris (Porsi)</span>
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Porsi terjual</span>
                </div>

                {topProductsChartData.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>
                    Belum ada menu yang terjual pada periode ini.
                  </div>
                ) : (
                  isMounted && (
                    <div style={{ width: '100%', height: '240px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={topProductsChartData} margin={{ top: 5, right: 25, left: 15, bottom: 5 }}>
                          <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" horizontal={false} />
                          <XAxis type="number" stroke="var(--text-faint)" tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                          <YAxis dataKey="name" type="category" stroke="var(--text-faint)" width={105} tick={{ fill: '#f8fafc', fontSize: 11 }} />
                          <RechartsTooltip content={<CustomBarTooltip />} />
                          <Bar dataKey="terjual" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )
                )}
              </div>

              {/* Chart 3: Proporsi Metode Bayar (Donut Chart) */}
              <div style={{
                padding: '18px 20px',
                borderRadius: '16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LucidePieChart size={16} color="#34d399" />
                    <span>Metode Pembayaran (Donut)</span>
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Total nominal</span>
                </div>

                {paymentMethodChartData.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>
                    Belum ada data pembayaran pada periode ini.
                  </div>
                ) : (
                  isMounted && (
                    <div>
                      <div style={{ width: '100%', height: '180px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={paymentMethodChartData}
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {paymentMethodChartData.map((entry, index) => (
                                <Cell key={`cell-analytics-${index}`} fill={entry.color} stroke="transparent" />
                              ))}
                            </Pie>
                            <RechartsTooltip content={<CustomDonutTooltip totalRevenue={totalRevenue} />} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                        {paymentMethodChartData.map(m => {
                          const pct = totalRevenue > 0 ? Math.round((m.value / totalRevenue) * 100) : 0;
                          return (
                            <div key={m.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.color }} />
                                <span style={{ color: '#fff' }}>{m.name}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                                <span style={{ color: m.color, fontWeight: 700 }}>{formatIDR(m.value)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Chart 4: Jam Sibuk Warkop (Peak Hours Bar Chart) */}
              <div style={{
                padding: '18px 20px',
                borderRadius: '16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="#38bdf8" />
                    <span>Jam Sibuk Warkop (Peak Hours)</span>
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>08:00 - 23:00</span>
                </div>

                {isMounted && (
                  <div style={{ width: '100%', height: '240px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="jam" stroke="var(--text-faint)" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <YAxis stroke="var(--text-faint)" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <RechartsTooltip content={<CustomPeakTooltip />} />
                        <Bar dataKey="transaksi" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
