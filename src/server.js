/**
 * PROJECT: DETEKSI MATI LAMPU INDONESIA
 * AUTHOR: Mr.Rm19 (https://github.com/Rm19x)
 * FILE: src/server.js
 * DESCRIPTION: Entry point utama aplikasi untuk menyalakan server dan mengaktifkan background workers.
 */

const app = require('./app');
const config = require('./config/env');

// Memanggil pekerja latar belakang otomatis (Background Workers)
const { initTwitterScraper } = require('./services/twitterScraper');
const { initPlnParser } = require('./services/plnParser');

// Jalankan Server HTTP Express
const server = app.listen(config.port, () => {
  console.log(`================================================================`);
  console.log(`🚀 DETEKSI MATI LAMPU INDONESIA AKTIF DAN BERJALAN`);
  console.log(`👤 PENGEMBANG : Mr.Rm19`);
  console.log(`🔗 REPOSITORI : github.com/Rm19x`);
  console.log(`🌐 PORT SERVER: ${config.port} | Mode: ${config.nodeEnv}`);
  console.log(`================================================================`);

  // Menyalakan fungsi otomatisasi pengumpul data berkala
  initTwitterScraper(); // Memulai pemantauan X/Twitter (Fitur A4)
  initPlnParser();      // Memulai pemantauan RSS Feed PLN (Fitur A5)
});

// Penanganan jika server menerima sinyal penghentian mendadak agar database tidak korup
process.on('SIGTERM', () => {
  console.log('Menerima sinyal SIGTERM. Mematikan server secara aman...');
  server.close(() => {
    console.log('Server berhasil dihentikan secara aman oleh sistem Mr.Rm19.');
    process.exit(0);
  });
});