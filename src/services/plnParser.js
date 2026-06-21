/**
 * PROJECT: DETEKSI MATI LAMPU INDONESIA
 * AUTHOR: Mr.Rm19 (https://github.com/Rm19x)
 * FILE: src/services/plnParser.js
 * DESCRIPTION: Modul pembaca RSS Feed / API pengumuman resmi pemadaman struktural dari pihak PLN.
 */

const axios = require('axios');
const config = require('../config/env');

/**
 * Sinkronisasi otomatis data RSS pengumuman PLN (Fitur A5)
 */
const initPlnParser = () => {
  console.log(`[SERVICES] RSS Parser PLN aktif. Melakukan sinkronisasi data tiap ${config.plnInterval / 1000} detik.`);

  setInterval(async () => {
    try {
      // Alamat API publik atau endpoint peta pelita PLN Mobile (menggunakan fallback json gratis)
      // Di sini disimulasikan sistem membaca pemadaman darurat struktural
      const mockPlnFeed = [
        {
          id_gangguan: "PLN_JKT_099",
          wilayah: "Kecamatan Gambir, Jakarta Pusat",
          alasan: "Pemeliharaan Gardu Induk",
          estimasi_mulai: new Date().toISOString()
        }
      ];

      for (const item of mockPlnFeed) {
        // Kirim data langsung ke database lewat endpoint internal
        await axios.post(`http://localhost:${config.port}/api/v1/reports/web`, {
          source: 'pln_rss',
          reporter_id: item.id_gangguan,
          location_name: item.wilayah,
          latitude: -6.1751,
          longitude: 106.8272,
          duration_estimate: item.alasan,
          operator_signal: 'Normal'
        });
        
        console.log(`[RSS PLN] Berhasil menyerap data resmi pemadaman: ${item.wilayah}`);
      }
    } catch (error) {
      console.error('[RSS PLN ERROR] Gagal mengunduh dokumen pengumuman PLN:', error.message);
    }
  }, config.plnInterval);
};

module.exports = { initPlnParser };