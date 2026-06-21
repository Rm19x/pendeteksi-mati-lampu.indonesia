/**
 * PROJECT: DETEKSI MATI LAMPU INDONESIA
 * AUTHOR: Mr.Rm19 (https://github.com/Rm19x)
 * FILE: src/config/database.js
 * DESCRIPTION: Manajemen koneksi ke database PostgreSQL dengan dukungan query spasial (PostGIS).
 */

const { Pool } = require('pg');
const config = require('./env');

// Inisialisasi pool koneksi database
const pool = new Pool({
  connectionString: config.databaseUrl,
  // Konfigurasi tambahan untuk performa produksi
  max: 20, // Maksimal koneksi simultan
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test koneksi saat server pertama kali berjalan
pool.connect((err, client, release) => {
  if (err) {
    console.error('[DATABASE ERROR] Gagal menyambung ke PostgreSQL:', err.message);
    console.error('Pastikan PostgreSQL berjalan dan URL DATABASE_URL di .env sudah benar.');
    return;
  }
  console.log('[DATABASE] Berhasil terhubung ke database. Siap menampung data laporan dari Mr.Rm19.');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
