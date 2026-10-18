/**
 * QRIS Utility (Standar EMVCo TLV & CRC16-CCITT)
 * Mengubah QRIS Statis Toko menjadi QRIS Dinamis Otomatis dengan Nominal Terkunci
 */

import jsQR from "jsqr";

/**
 * 1. Fungsi hitung ulang Checksum standar EMVCo (CRC-16/CCITT-FALSE)
 * Polynomial 0x1021, Initial 0xFFFF
 */
export function calculateCRC16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Helper: Parse string EMVCo TLV menjadi array objek { id, len, value }
 */
export function parseTLV(cleanQris) {
  const tags = [];
  let i = 0;
  while (i < cleanQris.length) {
    const id = cleanQris.substr(i, 2);
    const lenStr = cleanQris.substr(i + 2, 2);
    const len = parseInt(lenStr, 10);
    if (isNaN(len) || i + 4 + len > cleanQris.length) break;
    const value = cleanQris.substr(i + 4, len);
    tags.push({ id, len, value });
    i += 4 + len;
  }
  return tags;
}

/**
 * 2. Fungsi ubah QRIS Statis menjadi QRIS Dinamis sesuai nominal tagihan belanja
 * Menggunakan rekonstruksi EMVCo TLV murni agar tidak merusak tag lain (misal Tag 52 Merchant Category)
 * @param {string} staticQris - String QRIS asli toko (berawalan 000201...)
 * @param {number} amount - Nominal tagihan dalam Rupiah bulat (misal 25000)
 * @returns {string} - String QRIS Dinamis berstandar nasional
 */
export function generateDynamicQRIS(staticQris, amount) {
  if (!staticQris || typeof staticQris !== "string") {
    throw new Error("Kode QRIS tidak ditemukan.");
  }

  const cleanQris = staticQris.trim();

  if (!cleanQris.startsWith("000201")) {
    throw new Error("Format kode QRIS tidak valid: Harus diawali 000201.");
  }

  const tags = parseTLV(cleanQris);
  if (tags.length === 0) {
    throw new Error("Gagal membaca struktur TLV QRIS.");
  }

  // 1. Ubah Tag 01 (Point of Initiation Method): '11' (Statis) -> '12' (Dinamis)
  const tag01 = tags.find(t => t.id === "01");
  if (tag01) {
    tag01.value = "12";
    tag01.len = 2;
  }

  // 2. Siapkan Tag 54 (Transaction Amount dalam Rupiah bulat tanpa desimal)
  const amountStr = Math.round(amount).toString();
  const tag54 = {
    id: "54",
    len: amountStr.length,
    value: amountStr
  };

  // 3. Saring keluar Tag 54 lama (jika sebelumnya sudah ada) dan Tag 63 (Checksum CRC lama)
  const filteredTags = tags.filter(t => t.id !== "54" && t.id !== "63");

  // Sisipkan Tag 54 tepat sebelum Tag 58 (Kode Negara 'ID'), atau setelah Tag 53 (Mata Uang 360)
  const idx58 = filteredTags.findIndex(t => t.id === "58");
  if (idx58 !== -1) {
    filteredTags.splice(idx58, 0, tag54);
  } else {
    const idx53 = filteredTags.findIndex(t => t.id === "53");
    if (idx53 !== -1) {
      filteredTags.splice(idx53 + 1, 0, tag54);
    } else {
      filteredTags.push(tag54);
    }
  }

  // 4. Rekonstruksi string payload lengkap
  let payload = "";
  for (const t of filteredTags) {
    const lenStr = t.value.length.toString().padStart(2, "0");
    payload += t.id + lenStr + t.value;
  }

  // 5. Tambahkan penanda Tag 63 (panjang 04) lalu hitung CRC16-CCITT baru
  payload += "6304";
  const newCrc = calculateCRC16(payload);
  return `${payload}${newCrc}`;
}

/**
 * 3. Fungsi ekstrak string QRIS langsung dari file gambar foto poster QRIS toko
 * Dilengkapi multi-pass scan (skala proporsional & center crop) agar mendukung foto resolusi tinggi kamera HP
 * @param {File} file 
 * @returns {Promise<string>}
 */
export async function extractQrisFromImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("File tidak ditemukan."));

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const scanCanvas = (w, h, sx = 0, sy = 0, sw = w, sh = h) => {
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return null;
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
          const imageData = ctx.getImageData(0, 0, w, h);
          return jsQR(imageData.data, w, h, { inversionAttempts: "attemptBoth" });
        };

        // Percobaan 1: Skala yang dioptimasi (maks 1200px) untuk kecepatan & akurasi pattern finder
        let w = img.width;
        let h = img.height;
        const maxDim = 1200;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        let code = scanCanvas(w, h);

        // Percobaan 2: Ukuran asli foto
        if ((!code || !code.data) && (w !== img.width || h !== img.height)) {
          code = scanCanvas(img.width, img.height);
        }

        // Percobaan 3: Center-crop (fokus pada barcode di tengah poster)
        if (!code || !code.data) {
          const cropW = Math.round(img.width * 0.85);
          const cropH = Math.round(img.height * 0.85);
          const startX = Math.round((img.width - cropW) / 2);
          const startY = Math.round((img.height - cropH) / 2);
          code = scanCanvas(cropW, cropH, startX, startY, cropW, cropH);
        }

        if (code && code.data && code.data.trim().startsWith("000201")) {
          resolve(code.data.trim());
        } else {
          reject(new Error("QRIS tidak terbaca dari foto. Pastikan barcode terlihat jelas, terang, dan tidak blur."));
        }
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Gagal membaca file gambar."));
    };
  });
}

/**
 * 4. Ekstrak data merchant (Nama, Kota, NMID) untuk tampilan antarmuka
 */
export function parseQrisMerchantInfo(rawQris) {
  if (!rawQris || typeof rawQris !== "string") {
    return { isValid: false, merchantName: "", nmid: "", city: "", merchantCity: "", isSample: false };
  }
  const clean = rawQris.trim();
  if (!clean.startsWith("000201")) {
    return { isValid: false, merchantName: "", nmid: "", city: "", merchantCity: "", isSample: false };
  }

  const tags = parseTLV(clean);
  const tag59 = tags.find(t => t.id === "59");
  const tag60 = tags.find(t => t.id === "60");
  const tag51 = tags.find(t => t.id === "51");
  const tag26 = tags.find(t => t.id === "26");

  const merchantName = tag59 ? tag59.value : "Warkop / Cafe";
  const city = tag60 ? tag60.value : "Indonesia";

  const searchStr = (tag51?.value || "") + " " + (tag26?.value || "");
  const nmidMatch = searchStr.match(/0215(ID[0-9]{11,15})/);
  const nmid = nmidMatch ? nmidMatch[1] : (searchStr.match(/(ID[0-9]{11,15})/) || [])[1] || "-";

  const isSample = clean.includes("WARKOP BAHAGIA") || nmid === "ID1024301928475";

  return {
    isValid: true,
    merchantName,
    city,
    merchantCity: city,
    nmid,
    isSample
  };
}

/**
 * Template QRIS Standar (Contoh simulasi struktur valid)
 */
export const SAMPLE_WARKOP_QRIS = 
  '00020101021126660014ID.CO.QRIS.WWW01189360091530000845340215ID10243019284750303UMI' +
  '51630011ID.DANA.WWW01189360091530000845340215ID10243019284750303UMI' +
  '5204581253033605802ID5914WARKOP BAHAGIA6007JAKARTA6105123406304C4B2';
