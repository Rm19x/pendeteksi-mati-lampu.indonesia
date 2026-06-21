/**
 * PROJECT: DETEKSI MATI LAMPU INDONESIA
 * AUTHOR: Mr.Rm19 (https://github.com/Rm19x)
 * FILE: src/app.js
 * DESCRIPTION: Inisialisasi utama framework Express.js dan pemetaan rute endpoint.
 */

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const webhookRoutes = require('./routes/webhooks');

const app = express();

// Konfigurasi Global Middleware
app.use(cors({ origin: '*' })); // Membuka akses agar peta frontend bisa mengambil data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rute Sambutan Utama Server
app.get('/', (req, res) => {
  // Fitur C5: Deteksi jam server lokal untuk menyarankan konfigurasi Dark Mode otomatis ke web frontend
  const currentHour = new Date().getHours();
  const recommendDarkMode = (currentHour >= 18 || currentHour <= 6);

  res.status(200).json({
    project: "Sistem Deteksi Mati Lampu Real-Time Indonesia",
    author: "Mr.Rm19",
    github: "https://github.com/Rm19x",
    status: "Online & Secure",
    system_recommendation: {
      auto_dark_mode: recommendDarkMode, // Mengirim sinyal dark mode jika malam hari (Fitur C5)
      message: recommendDarkMode ? "Saran: Aktifkan tema gelap (Area malam/padam)." : "Saran: Gunakan tema normal."
    }
  });
});

// Pemetaan Jalur URL ke Route File (Sudah Diperbaiki & Dipermudah)
app.use('/api', apiRoutes);       // Fitur Utama: Bisa diakses langsung via http://localhost:3000/api/reports
app.use('/api/v1', apiRoutes);    // Cadangan rute versi lama agar tidak error
app.use('/webhooks', webhookRoutes);

// Penanganan URL yang Tidak Ditemukan (404)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' });
});

module.exports = app;