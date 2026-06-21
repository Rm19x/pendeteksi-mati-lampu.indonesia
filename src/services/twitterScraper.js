/**
 * PROJECT: DETEKSI MATI LAMPU INDONESIA
 * AUTHOR: Mr.Rm19 (https://github.com/Rm19x)
 * FILE: src/services/twitterScraper.js
 * DESCRIPTION: Otomatisasi pemantauan kata kunci keluhan pemadaman listrik di platform X (Twitter).
 */

const axios = require('axios');
const config = require('../config/env');

/**
 * Menjalankan mesin pemantau Twitter berbasis interval waktu (Fitur A4)
 */
const initTwitterScraper = () => {
  console.log(`[SERVICES] Scraper Twitter aktif. Memantau keyword tiap ${config.twitterInterval / 1000} detik.`);

  setInterval(async () => {
    try {
      // Catatan: Menggunakan API Publik / Skema RSS Feed Twitter gratisan untuk menghindari rate limit API Premium
      // Di sini kita membuat simulasi penarikan payload data tweet publik yang relevan di Indonesia
      const keywords = ['mati lampu', 'listrik padam', '@pln_123'];
      
      // Simulasi hasil tangkapan bot scraper terhadap tweet real-time dari warga
      const mockScrapedTweets = [
        { id: "tw_1001", user: "warga_bekasi", text: "Mati lampu nih di daerah Tambun Bekasi, panas banget!", created_at: new Date().toISOString() },
        { id: "tw_1002", user: "netizen_jogja", text: "@pln_123 daerah Sleman mati listrik ya min? Tolong dicek", created_at: new Date().toISOString() }
      ];

      for (const tweet of mockScrapedTweets) {
        // Logika ekstraksi lokasi sederhana dari teks tweet
        let detectedLocation = '';
        if (tweet.text.includes('Bekasi')) detectedLocation = 'Tambun, Bekasi';
        if (tweet.text.includes('Sleman')) detectedLocation = 'Sleman, Yogyakarta';

        if (detectedLocation) {
          // Kirim data secara internal ke endpoint penampung laporan kita sendiri
          await axios.post(`http://localhost:${config.port}/api/v1/reports/web`, {
            source: 'twitter',
            reporter_id: tweet.user,
            location_name: detectedLocation,
            latitude: -6.2349, // Default sementara sebelum dilempar ke geocoder asli
            longitude: 106.9896,
            duration_estimate: 'Baru saja',
            operator_signal: 'Normal'
          });
          
          console.log(`[SCRAPER TWITTER] Berhasil menangkap keluhan dari @${tweet.user} di ${detectedLocation}`);
        }
      }
    } catch (error) {
      console.error('[SCRAPER TWITTER ERROR] Gagal melakukan sinkronisasi data X:', error.message);
    }
  }, config.twitterInterval);
};

module.exports = { initTwitterScraper };