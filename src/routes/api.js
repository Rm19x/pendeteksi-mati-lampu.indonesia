/**
 * PROJECT: DETEKSI MATI LAMPU INDONESIA
 * AUTHOR: Mr.Rm19 (https://github.com/Rm19x)
 * FILE: src/routes/api.js
 * DESCRIPTION: Mengatur rute API publik untuk dashboard peta, pencarian wilayah, dan statistik.
 */

const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');
const reportController = require('../controllers/reportController');

/**
 * @route   GET /api/v1/maps/heatmap
 * @desc    Mengambil data koordinat aktif untuk merender Heatmap di peta (Fitur C1, C6, C7)
 * @access  Public
 */
router.get('/maps/heatmap', mapController.getHeatmapData);

/**
 * @route   GET /api/v1/maps/search
 * @desc    Fitur kolom pencarian status kelistrikan suatu wilayah secara real-time (Fitur C2)
 * @access  Public
 */
router.get('/maps/search', mapController.searchLocationStatus);

/**
 * @route   GET /api/v1/maps/stats
 * @desc    Menyediakan data statistik agregat laporan untuk diagram grafik batang di frontend (Fitur C4)
 * @access  Public
 */
router.get('/maps/stats', mapController.getProvinceStats);

/**
 * @route   POST /api/v1/reports/web
 * @desc    Menerima laporan mati lampu langsung dari form klik di website utama (Fitur A1, A6, A10)
 * @access  Public (Menggunakan deteksi IP/Geolokasi)
 */
router.post('/reports/web', reportController.createNewReport);

module.exports = router;
