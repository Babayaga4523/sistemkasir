/**
 * QRIS Service Proxy to src/utils/qris.js
 * Ensuring complete backwards-compatibility and standard compliance
 */

export * from '../utils/qris';
export {
  generateDynamicQRIS as generateDynamicQris,
  calculateCRC16 as crc16,
  extractQrisFromImage as scanQrisFromImageFile,
  parseQrisMerchantInfo as parseQrisInfo
} from '../utils/qris';
