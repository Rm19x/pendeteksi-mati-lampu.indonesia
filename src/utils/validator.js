/**
 * PROJECT: DETEKSI MATI LAMPU INDONESIA
 * AUTHOR: Mr.Rm19 (https://github.com/Rm19x)
 * FILE: src/utils/validator.js
 * DESCRIPTION: Validasi skema input teks untuk memastikan integritas data spasial.
 */

const validator = {
  /**
   * Memvalidasi input laporan sebelum diproses oleh controller
   */
  validateReportInput: (data) => {
    const { location_name, source } = data;
    
    if (!location_name || location_name.trim().length < 3) {
      return { isValid: false, reason: 'Nama lokasi tidak valid atau terlalu pendek.' };
    }
    
    if (!source) {
      return { isValid: false, reason: 'Asal sumber laporan harus jelas.' };
    }

    return { isValid: true };
  }
};

module.exports = validator;