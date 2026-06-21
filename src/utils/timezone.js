/**
 * PROJECT: DETEKSI MATI LAMPU INDONESIA
 * AUTHOR: Mr.Rm19 (https://github.com/Rm19x)
 * FILE: src/utils/timezone.js
 * DESCRIPTION: Utilitas penyesuaian zona waktu otomatis untuk wilayah kelistrikan Indonesia.
 */

const timezone = {
  /**
   * Mengambil waktu terstandarisasi Indonesia saat ini (Fitur B9)
   */
  getIndonesianTime: () => {
    const now = new Date();
    
    // Konversi string ramah dibaca untuk zona WIB (Asia/Jakarta)
    const wibString = now.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
    const witaString = now.toLocaleString("id-ID", { timeZone: "Asia/Makassar" });
    const witString = now.toLocaleString("id-ID", { timeZone: "Asia/Jayapura" });

    return {
      timestamp: now,
      wib: `${wibString} WIB`,
      wita: `${witaString} WITA`,
      wit: `${witString} WIT`,
    };
  }
};

module.exports = timezone;
