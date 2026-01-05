/**
 * Konstanta untuk tanggal-tanggal penting dalam aplikasi
 * Ubah file ini untuk menyesuaikan tahun dan tanggal periode pengumpulan data
 */

export const CURRENT_YEAR = 2026;
export const COPYRIGHT_YEAR = 2025;

// Date objects untuk manipulasi tanggal
// Format component menggunakan toLocaleDateString('id-ID') atau Intl.DateTimeFormat
export const DATES = {
  collectionStart: new Date(2026, 0, 12), // 12 Januari 2026 (month is 0-indexed)
  collectionEnd: new Date(2026, 1, 13), // 13 Februari 2026
  dimensionChangeDeadline: new Date(2026, 0, 31), // 31 Januari 2026
  fgd: new Date(2026, 1, 18), // 18 Februari 2026
};
