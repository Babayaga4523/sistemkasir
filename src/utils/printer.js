/**
 * Utility Cetak Struk Thermal POS Warkop & Cafe
 * Mendukung:
 * 1. Cetak Thermal USB / Browser via isolated iframe (58mm & 80mm)
 * 2. Cetak Bluetooth Portable via Web Bluetooth API (ESC/POS)
 * 3. Format teks struk untuk WhatsApp
 */

// Konstanta Lebar Kolom Monospace
export const PAPER_WIDTHS = {
  '58mm': { chars: 32, cssWidth: '48mm', label: '58mm (Standar Warkop/Mini)' },
  '80mm': { chars: 42, cssWidth: '72mm', label: '80mm (Lebar/Resto)' }
};

// Ambil pengaturan printer dari LocalStorage
export function getPrinterSettings() {
  if (typeof window === 'undefined') return { paperWidth: '58mm', autoPrint: false, showWifi: true };
  try {
    const saved = localStorage.getItem('warkop_pos_printer_settings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Gagal membaca printer settings:', err);
  }
  return { paperWidth: '58mm', autoPrint: false, showWifi: true };
}

// Simpan pengaturan printer
export function savePrinterSettings(settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('warkop_pos_printer_settings', JSON.stringify(settings));
  } catch (err) {
    console.error('Gagal menyimpan printer settings:', err);
  }
}

// Format Rupiah
const formatIDR = (num) => `Rp ${Number(num || 0).toLocaleString('id-ID')}`;

/**
 * Format baris teks dua kolom rata kiri dan kanan (misal: "Kopi Tubruk" dan "Rp 10.000")
 */
function padLine(left, right, maxLen = 32) {
  left = String(left || '');
  right = String(right || '');
  const spaceNeeded = maxLen - left.length - right.length;
  if (spaceNeeded <= 0) {
    // Jika terlalu panjang, potong teks kiri
    const truncatedLeft = left.slice(0, Math.max(1, maxLen - right.length - 1)) + ' ';
    return truncatedLeft + right;
  }
  return left + ' '.repeat(spaceNeeded) + right;
}

/**
 * Buat dokumen HTML struk thermal yang terisolasi dan siap dicetak
 */
export function buildThermalReceiptHtml({ order, store, paperWidth = '58mm', showWifi = true }) {
  const cafeName = store?.name || 'Warkop & Cafe POS';
  const cafeAddress = store?.address || 'Jl. Kopi Nusantara No. 1';
  const cafePhone = store?.phone || '';
  const cafeFooter = store?.receipt_footer || 'Matur suwun sampun rawuh!\nSilakan berkunjung kembali ☕';
  const cafeLogo = store?.logo_url;
  const wifiSsid = store?.wifi_ssid;
  const wifiPass = store?.wifi_password;

  const widthConfig = PAPER_WIDTHS[paperWidth] || PAPER_WIDTHS['58mm'];
  const is80 = paperWidth === '80mm';

  const dateFormatted = new Date(order.created_at || Date.now()).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeFormatted = new Date(order.created_at || Date.now()).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const isUnpaid = order.payment_method === 'unpaid' || order.payment_status === 'unpaid';

  return `
    <div class="thermal-ticket">
      <!-- Logo Toko -->
      ${cafeLogo ? `
        <div style="text-align: center; margin-bottom: 6px;">
          <img src="${cafeLogo}" alt="${cafeName}" style="max-height: 48px; max-width: 140px; object-fit: contain;" />
        </div>
      ` : ''}

      <!-- Header Struk -->
      <div style="text-align: center; margin-bottom: 8px;">
        <div style="font-size: ${is80 ? '16px' : '14px'}; font-weight: 900; letter-spacing: 0.3px; text-transform: uppercase;">
          ${cafeName}
        </div>
        ${cafeAddress ? `<div style="font-size: 10px; margin-top: 2px;">${cafeAddress}</div>` : ''}
        ${cafePhone ? `<div style="font-size: 10px;">Telp/WA: ${cafePhone}</div>` : ''}
      </div>

      <div class="dashed-line"></div>

      <!-- Info Pesanan -->
      <div class="info-block" style="font-size: 10.5px; line-height: 1.4;">
        <div style="display: flex; justify-content: space-between;">
          <span>No. Nota:</span>
          <span style="font-weight: 700;">#${order.order_number || '-'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Tanggal:</span>
          <span>${dateFormatted} ${timeFormatted}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Kasir:</span>
          <span>${order.cashier_name || 'Kasir'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Pelanggan:</span>
          <span style="font-weight: 700;">${order.customer_name || 'Pelanggan'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Layanan:</span>
          <span style="font-weight: 700;">${order.order_type === 'dine_in' ? `Dine-In (Meja ${order.table_number || '-'})` : 'Takeaway / Bawa Pulang'}</span>
        </div>
      </div>

      <div class="dashed-line"></div>

      <!-- Tabel Item Menu -->
      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
        ${(order.items || []).map(it => {
          const variantText = it.selected_options && Object.keys(it.selected_options).length > 0 
            ? ` (${Object.values(it.selected_options).join(', ')})` 
            : '';
          const subtotalText = formatIDR(it.subtotal || it.price * it.quantity);
          return `
            <div style="margin-bottom: 2px;">
              <div style="display: flex; justify-content: space-between; font-weight: 700;">
                <span style="flex: 1; word-break: break-word; padding-right: 4px;">${it.product_name}</span>
                <span style="white-space: nowrap;">${subtotalText}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 9.5px; color: #444;">
                <span>${it.quantity} x ${formatIDR(it.price)}${variantText}</span>
              </div>
              ${it.notes ? `<div style="font-size: 9px; font-style: italic; color: #555;">Catatan: ${it.notes}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div class="dashed-line"></div>

      <!-- Rincian Biaya -->
      <div style="display: flex; flex-direction: column; gap: 2px; font-size: 11px;">
        <div style="display: flex; justify-content: space-between;">
          <span>Subtotal</span>
          <span>${formatIDR(order.subtotal)}</span>
        </div>
        ${order.discount > 0 ? `
          <div style="display: flex; justify-content: space-between;">
            <span>Diskon Promo</span>
            <span>-${formatIDR(order.discount)}</span>
          </div>
        ` : ''}
        ${order.tax > 0 ? `
          <div style="display: flex; justify-content: space-between;">
            <span>Pajak (PB1)</span>
            <span>${formatIDR(order.tax)}</span>
          </div>
        ` : ''}
        ${order.service_charge > 0 ? `
          <div style="display: flex; justify-content: space-between;">
            <span>Biaya Layanan</span>
            <span>${formatIDR(order.service_charge)}</span>
          </div>
        ` : ''}

        <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: ${is80 ? '14px' : '13px'}; padding-top: 4px; border-top: 1px solid #000; margin-top: 3px;">
          <span>TOTAL</span>
          <span>${formatIDR(order.total)}</span>
        </div>
      </div>

      <div class="dashed-line"></div>

      <!-- Status Pembayaran -->
      <div style="font-size: 10.5px; line-height: 1.4;">
        ${isUnpaid ? `
          <div style="text-align: center; font-weight: 900; font-size: 11px; padding: 3px 0; border: 1px solid #000; margin-bottom: 4px;">
            *** BELUM LUNAS (OPEN BILL) ***
          </div>
        ` : `
          <div style="text-align: center; font-weight: 900; font-size: 11px; padding: 3px 0; border: 1px solid #000; margin-bottom: 4px;">
            *** LUNAS ***
          </div>
        `}

        <div style="display: flex; justify-content: space-between;">
          <span>Metode Bayar:</span>
          <span style="font-weight: 700; text-transform: uppercase;">${isUnpaid ? 'OPEN BILL' : (order.payment_method || 'CASH')}</span>
        </div>
        ${!isUnpaid ? `
          <div style="display: flex; justify-content: space-between;">
            <span>Nominal Bayar:</span>
            <span>${formatIDR(order.amount_paid || order.total)}</span>
          </div>
          ${order.change_amount > 0 ? `
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span>Kembalian:</span>
              <span>${formatIDR(order.change_amount)}</span>
            </div>
          ` : ''}
        ` : ''}
      </div>

      <!-- Info WiFi (Jika ada dan diaktifkan) -->
      ${(showWifi && (wifiSsid || wifiPass)) ? `
        <div class="dashed-line"></div>
        <div style="text-align: center; font-size: 10px; line-height: 1.3;">
          <div style="font-weight: 700;">📶 Fasilitas WiFi Warkop</div>
          ${wifiSsid ? `<div>SSID: <strong>${wifiSsid}</strong></div>` : ''}
          ${wifiPass ? `<div>Password: <strong>${wifiPass}</strong></div>` : ''}
        </div>
      ` : ''}

      <div class="dashed-line"></div>

      <!-- Ucapan Footer -->
      <div style="text-align: center; font-size: 9.5px; line-height: 1.35; white-space: pre-line; margin-top: 4px;">
        ${cafeFooter}
      </div>
      <div style="text-align: center; font-size: 8px; color: #666; margin-top: 6px;">
        Sistem Kasir Warkop POS
      </div>
    </div>
  `;
}

/**
 * Cetak Struk via Iframe Terisolasi (Thermal USB / Browser Dialog)
 * Menjamin 100% halaman POS tidak terpengaruh, zero background overlay hitam, ukuran 58mm/80mm presisi.
 */
export function printThermalIframe({ order, store, paperWidth = '58mm', showWifi = true }) {
  if (typeof window === 'undefined') return Promise.resolve(false);

  return new Promise((resolve) => {
    try {
      const existingIframe = document.getElementById('thermal-print-iframe');
      if (existingIframe) {
        existingIframe.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'thermal-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      document.body.appendChild(iframe);

      const is80 = paperWidth === '80mm';
      const printableWidth = is80 ? '72mm' : '48mm';
      const paperSize = is80 ? '80mm' : '58mm';

      const receiptBody = buildThermalReceiptHtml({ order, store, paperWidth, showWifi });

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Struk_${order.order_number || 'Warkop'}</title>
            <style>
              @page {
                size: ${paperSize} auto;
                margin: 0;
              }
              *, *:before, *:after {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              body {
                background: #ffffff !important;
                color: #000000 !important;
                font-family: 'Courier New', Courier, monospace, monospace;
                font-size: 11px;
                line-height: 1.35;
                padding: 4mm 3mm;
                width: ${printableWidth};
                margin: 0 auto;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .dashed-line {
                border-top: 1px dashed #000000;
                margin: 6px 0;
                width: 100%;
              }
              @media screen {
                body {
                  border: 1px solid #ccc;
                  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
              }
            </style>
          </head>
          <body>
            ${receiptBody}
          </body>
        </html>
      `);
      doc.close();

      // Tunggu font dan image termuat lalu panggil print dialog
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        // Bersihkan iframe setelah delay aman
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
          resolve(true);
        }, 1500);
      }, 300);

    } catch (err) {
      console.error('Gagal mencetak thermal iframe:', err);
      // Fallback ke window.print biasa
      window.print();
      resolve(false);
    }
  });
}

/**
 * Format Teks WhatsApp Struk
 */
export function formatWhatsAppReceipt({ order, store, showWifi = true }) {
  const cafeName = store?.name || 'Warkop & Cafe';
  const cafeAddress = store?.address || '';
  const cafePhone = store?.phone || '';
  const cafeFooter = store?.receipt_footer || 'Matur suwun sampun rawuh! Silakan berkunjung kembali ☕';
  const wifiSsid = store?.wifi_ssid;
  const wifiPass = store?.wifi_password;

  const lines = [
    `☕ *${cafeName.toUpperCase()}*`,
    cafeAddress ? `${cafeAddress}` : null,
    cafePhone ? `Telp: ${cafePhone}` : null,
    `---------------------------------`,
    `📋 No. Nota : *#${order.order_number}*`,
    `📅 Waktu    : ${new Date(order.created_at || Date.now()).toLocaleString('id-ID')}`,
    `👤 Kasir    : ${order.cashier_name || 'Kasir'}`,
    `🙋 Pelanggan: *${order.customer_name || 'Pelanggan'}*`,
    `📍 Layanan  : ${order.order_type === 'dine_in' ? `Meja ${order.table_number || '-'}` : 'Takeaway'}`,
    `---------------------------------`,
    `*PESANAN:*`,
    ...(order.items || []).map(it => {
      const variantText = it.selected_options && Object.keys(it.selected_options).length > 0 
        ? ` (${Object.values(it.selected_options).join(', ')})` 
        : '';
      const notes = it.notes ? `\n   _Catatan: ${it.notes}_` : '';
      return `• ${it.quantity}x ${it.product_name}${variantText}\n   = ${formatIDR(it.subtotal || it.price * it.quantity)}${notes}`;
    }),
    `---------------------------------`,
    `Subtotal   : ${formatIDR(order.subtotal)}`,
    order.discount > 0 ? `Diskon     : -${formatIDR(order.discount)}` : null,
    order.tax > 0 ? `Pajak      : ${formatIDR(order.tax)}` : null,
    order.service_charge > 0 ? `Biaya Svc  : ${formatIDR(order.service_charge)}` : null,
    `*TOTAL BAYAR: ${formatIDR(order.total)}*`,
    `---------------------------------`,
    (order.payment_method === 'unpaid' || order.payment_status === 'unpaid')
      ? `*STATUS    : BELUM LUNAS (OPEN BILL)*`
      : `*STATUS    : LUNAS (${(order.payment_method || 'CASH').toUpperCase()})*`,
    order.payment_method !== 'unpaid' ? `Diterima   : ${formatIDR(order.amount_paid || order.total)}` : null,
    order.change_amount > 0 ? `Kembalian  : ${formatIDR(order.change_amount)}` : null,
    (showWifi && (wifiSsid || wifiPass)) ? `---------------------------------\n📶 *Info WiFi:* ${wifiSsid || ''} (Pass: ${wifiPass || '-'})` : null,
    `---------------------------------`,
    `${cafeFooter}`
  ].filter(Boolean).join('\n');

  return lines;
}

/**
 * Cetak langsung ke Mini Printer Bluetooth via Web Bluetooth API (ESC/POS)
 * Cocok untuk printer thermal portable kasir Bluetooth (Panda, VSC, POS-5802, Goojprt, dll)
 */
export async function printBluetoothThermal({ order, store, paperWidth = '58mm', showWifi = true }) {
  if (typeof navigator === 'undefined' || !navigator.bluetooth) {
    throw new Error('Web Bluetooth tidak didukung pada browser ini. Gunakan Google Chrome pada Windows/Android/Mac, atau gunakan tombol Cetak Thermal USB.');
  }

  const is80 = paperWidth === '80mm';
  const maxChars = is80 ? 42 : 32;

  // Daftar Service UUID umum printer thermal Bluetooth
  const PRINTER_SERVICES = [
    '000018f0-0000-1000-8000-00805f9b34fb', // Standard Print Service
    'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
    '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC
    '0000ff00-0000-1000-8000-00805f9b34fb',
    '0000ae30-0000-1000-8000-00805f9b34fb'
  ];

  let device;
  try {
    device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: PRINTER_SERVICES
    });
  } catch (err) {
    // Tangani jika kasir menekan tombol "Batal" atau menutup jendela pairing Bluetooth
    if (
      err.name === 'NotFoundError' || 
      err.name === 'AbortError' || 
      (err.message && err.message.toLowerCase().includes('user cancelled'))
    ) {
      return { success: false, cancelled: true };
    }
    throw new Error('Pencarian Bluetooth gagal: ' + (err.message || 'Perangkat tidak ditemukan'));
  }

  if (!device || !device.gatt) {
    throw new Error('Gagal menghubungkan ke perangkat Bluetooth printer.');
  }

  const server = await device.gatt.connect();

  // Cari service dan characteristic write yang tersedia
  let targetCharacteristic = null;
  for (const serviceUuid of PRINTER_SERVICES) {
    try {
      const service = await server.getPrimaryService(serviceUuid);
      const characteristics = await service.getCharacteristics();
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          targetCharacteristic = char;
          break;
        }
      }
      if (targetCharacteristic) break;
    } catch {
      // Lanjutkan cek service berikutnya
    }
  }

  // Fallback: telusuri semua primary services yang di-expose perangkat
  if (!targetCharacteristic) {
    try {
      const services = await server.getPrimaryServices();
      for (const service of services) {
        try {
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              targetCharacteristic = char;
              break;
            }
          }
          if (targetCharacteristic) break;
        } catch {
          // lanjut
        }
      }
    } catch {
      // abaikan
    }
  }

  if (!targetCharacteristic) {
    throw new Error('Karakteristik Write printer Bluetooth tidak ditemukan.');
  }

  // Bangun perintah ESC/POS Binary
  const encoder = new TextEncoder();
  const commands = [];

  const addBytes = (...bytes) => {
    commands.push(...bytes);
  };

  const addText = (text) => {
    const encoded = encoder.encode(text);
    for (let i = 0; i < encoded.length; i++) {
      commands.push(encoded[i]);
    }
  };

  const addLine = (text = '') => {
    addText(text + '\n');
  };

  const addDashedLine = () => {
    addLine('-'.repeat(maxChars));
  };

  const addTwoColumnLine = (left, right) => {
    addLine(padLine(left, right, maxChars));
  };

  const cafeName = store?.name || 'Warkop & Cafe POS';
  const cafeAddress = store?.address || '';
  const cafePhone = store?.phone || '';
  const cafeFooter = store?.receipt_footer || 'Matur suwun sampun rawuh!\nSilakan berkunjung kembali';
  const wifiSsid = store?.wifi_ssid;
  const wifiPass = store?.wifi_password;

  // ESC @ (Init)
  addBytes(0x1B, 0x40);

  // ESC a 1 (Center)
  addBytes(0x1B, 0x61, 0x01);

  // ESC E 1 (Bold ON) & GS ! 0x11 (Double size)
  addBytes(0x1B, 0x45, 0x01);
  addBytes(0x1D, 0x21, is80 ? 0x11 : 0x01);
  addLine(cafeName.toUpperCase());

  // GS ! 0x00 (Normal size) & ESC E 0 (Bold OFF)
  addBytes(0x1D, 0x21, 0x00);
  addBytes(0x1B, 0x45, 0x00);

  if (cafeAddress) addLine(cafeAddress);
  if (cafePhone) addLine('Telp/WA: ' + cafePhone);

  addDashedLine();

  // ESC a 0 (Left align)
  addBytes(0x1B, 0x61, 0x00);

  addTwoColumnLine('No. Nota:', '#' + (order.order_number || '-'));
  addTwoColumnLine('Waktu:', new Date(order.created_at || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(order.created_at || Date.now()).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }));
  addTwoColumnLine('Kasir:', order.cashier_name || 'Kasir');
  addTwoColumnLine('Pelanggan:', order.customer_name || 'Pelanggan');
  addTwoColumnLine('Layanan:', order.order_type === 'dine_in' ? `Dine-In (M${order.table_number || '-'})` : 'Takeaway');

  addDashedLine();

  // Items
  for (const it of (order.items || [])) {
    const variantText = it.selected_options && Object.keys(it.selected_options).length > 0 
      ? ` (${Object.values(it.selected_options).join(', ')})` 
      : '';
    const itemTitle = `${it.product_name}${variantText}`;
    const subtotalText = formatIDR(it.subtotal || it.price * it.quantity);

    addBytes(0x1B, 0x45, 0x01); // Bold item
    addTwoColumnLine(itemTitle, subtotalText);
    addBytes(0x1B, 0x45, 0x00); // Normal

    addLine(`  ${it.quantity} x ${formatIDR(it.price)}`);
    if (it.notes) {
      addLine(`  *Catatan: ${it.notes}`);
    }
  }

  addDashedLine();

  // Subtotal & Totals
  addTwoColumnLine('Subtotal', formatIDR(order.subtotal));
  if (order.discount > 0) addTwoColumnLine('Diskon Promo', '-' + formatIDR(order.discount));
  if (order.tax > 0) addTwoColumnLine('Pajak (PB1)', formatIDR(order.tax));
  if (order.service_charge > 0) addTwoColumnLine('Biaya Layanan', formatIDR(order.service_charge));

  // TOTAL BOLD
  addBytes(0x1B, 0x45, 0x01);
  addBytes(0x1D, 0x21, 0x01);
  addTwoColumnLine('TOTAL', formatIDR(order.total));
  addBytes(0x1D, 0x21, 0x00);
  addBytes(0x1B, 0x45, 0x00);

  addDashedLine();

  // Payment Status
  const isUnpaid = order.payment_method === 'unpaid' || order.payment_status === 'unpaid';
  addBytes(0x1B, 0x61, 0x01); // Center
  addBytes(0x1B, 0x45, 0x01);
  addLine(isUnpaid ? '*** BELUM LUNAS (OPEN BILL) ***' : '*** LUNAS ***');
  addBytes(0x1B, 0x45, 0x00);
  addBytes(0x1B, 0x61, 0x00); // Left

  addTwoColumnLine('Metode Bayar:', isUnpaid ? 'OPEN BILL' : (order.payment_method || 'CASH').toUpperCase());
  if (!isUnpaid) {
    addTwoColumnLine('Nominal Bayar:', formatIDR(order.amount_paid || order.total));
    if (order.change_amount > 0) {
      addTwoColumnLine('Kembalian:', formatIDR(order.change_amount));
    }
  }

  // WiFi Info
  if (showWifi && (wifiSsid || wifiPass)) {
    addDashedLine();
    addBytes(0x1B, 0x61, 0x01); // Center
    addLine('📶 WiFi: ' + (wifiSsid || '-'));
    if (wifiPass) addLine('Password: ' + wifiPass);
    addBytes(0x1B, 0x61, 0x00); // Left
  }

  addDashedLine();

  // Footer Center
  addBytes(0x1B, 0x61, 0x01);
  const footerLines = cafeFooter.split('\n');
  for (const fLine of footerLines) {
    addLine(fLine);
  }
  addLine('Warkop POS');

  // Feed 4 baris & Cut
  addBytes(0x1B, 0x64, 0x04);
  addBytes(0x1D, 0x56, 0x42, 0x00);

  // Kirim data dalam chunk (max 100 bytes per chunk untuk stabilitas BLE)
  const data = new Uint8Array(commands);
  const CHUNK_SIZE = 100;
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    if (targetCharacteristic.properties.writeWithoutResponse) {
      await targetCharacteristic.writeValueWithoutResponse(chunk);
    } else {
      await targetCharacteristic.writeValue(chunk);
    }
    // Delay kecil antar chunk agar buffer printer tidak meluap
    await new Promise(r => setTimeout(r, 20));
  }

  // Selesai
  setTimeout(() => {
    try {
      device.gatt.disconnect();
    } catch {
      // abaikan
    }
  }, 1000);

  return true;
}
