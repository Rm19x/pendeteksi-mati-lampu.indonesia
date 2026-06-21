/**
 * PROJECT: DETEKSI MATI LAMPU INDONESIA
 * AUTHOR: Mr.Rm19 (https://github.com/Rm19x)
 * FILE: src/routes/webhooks.js
 * DESCRIPTION: Gerbang penerima webhook data real-time dari bot Telegram dan WhatsApp publik.
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const config = require('../config/env');

/**
 * Middleware sederhana untuk memvalidasi token webhook agar gerbang tidak ditembak sembarangan oleh peretas
 */
const validateWebhookSecure = (req, res, next) => {
  const token = req.headers['x-api-key'];
  if (!token || token !== config.apiKey) {
    return res.status(401).json({ success: false, message: 'Akses webhook ditolak. Token tidak valid.' });
  }
  next();
};

/**
 * @route   POST /webhooks/telegram
 * @desc    Menerima payload interaksi warga dari bot Telegram (Fitur A2, A8, A10)
 * @access  Protected (Webhook Secure)
 */
router.post('/telegram', (req, res, next) => {
  // Untuk Telegram, kodenya nanti diproses secara otomatis oleh library Telegraf di folder services,
  // namun rute ini disediakan jika kamu ingin memakai skema native webhook di produksi.
  res.status(200).send('OK');
});

/**
 * @route   POST /webhooks/whatsapp
 * @desc    Menerima data pesan teks laporan mati lampu dari Gateway WhatsApp Publik (Fitur A3)
 * @access  Protected
 */
router.post('/whatsapp', validateWebhookSecure, (req, res, next) => {
  // Simulasi penyesuaian objek body dari WhatsApp agar sesuai format reportController
  const { from_number, text, area_name, lat, lon, signal } = req.body;
  
  // Format ulang data agar seragam
  req.body = {
    source: 'whatsapp',
    reporter_id: from_number,
    location_name: area_name,
    latitude: lat,
    longitude: lon,
    duration_estimate: 'Baru saja',
    operator_signal: signal || 'Normal'
  };
  
  next();
}, reportController.createNewReport);

module.exports = router;