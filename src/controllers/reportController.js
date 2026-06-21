/**
 * PROJECT: DETEKSI MATI LAMPU INDONESIA
 * AUTHOR: Mr.Rm19 (https://github.com/Rm19x)
 * FILE: src/controllers/reportController.js
 * DESCRIPTION: Menangani logika laporan masuk, pencegahan spam, dan deteksi otomatis pemadaman massal.
 */

const db = require('../config/database');
const timezone = require('../utils/timezone');

// Penyimpanan sementara di memori untuk tracking anti-spam (Fitur A6)
// Struktur: { "identifier_atau_ip": timestamp_terakhir }
const antiSpamCache = new Map();

const reportController = {
  /**
   * Menerima laporan mati lampu baru dari berbagai platform (Web, Bot Telegram, WA, Scraper)
   */
  createNewReport: async (req, res) => {
    try {
      const { source, reporter_id, location_name, latitude, longitude, duration_estimate, operator_signal } = req.body;

      // 1. VALIDASI ANTI-SPAM (Fitur A6)
      // Mencegah user atau IP yang sama mengirim laporan berulang dalam waktu 5 menit
      const uniqueIdentifier = `${reporter_id || req.ip}_${location_name.toLowerCase().trim()}`;
      const now = Date.now();
      const cooldownTime = 5 * 60 * 1000; // 5 menit dalam milidetik

      if (antiSpamCache.has(uniqueIdentifier)) {
        const lastReportTime = antiSpamCache.get(uniqueIdentifier);
        if (now - lastReportTime < cooldownTime) {
          return res.status(429).json({
            success: false,
            message: 'Laporan Anda untuk wilayah ini sudah kami terima. Mohon tunggu 5 menit untuk mengirim laporan baru.'
          });
        }
      }

      // Ambil waktu lokal berdasarkan zona Indonesia (Fitur B9)
      const localTime = timezone.getIndonesianTime();

      // 2. SIMPAN DATA LAPORAN KE POSTGRESQL (Fitur A1, A2, A3, A10, D10)
      const queryText = `
        INSERT INTO reports (source, reporter_id, location_name, geom, duration_estimate, operator_signal, created_at)
        VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, $7, $8)
        RETURNING id, location_name;
      `;
      
      const values = [
        source, // web, telegram, whatsapp, atau twitter
        reporter_id || req.ip, 
        location_name, 
        longitude, 
        latitude, 
        duration_estimate || 'Baru saja', // Fitur A10
        operator_signal || 'Normal',      // Fitur D10
        localTime.timestamp
      ];

      const result = await db.query(queryText, values);

      // Perbarui waktu laporan terakhir user di cache anti-spam
      antiSpamCache.set(uniqueIdentifier, now);

      // 3. DETEKSI BLACKOUT MASSAL OTOMATIS (Fitur B8)
      // Jalankan fungsi pengecekan apakah terjadi lonjakan laporan di daerah sekitar dalam 15 menit terakhir
      const isBlackoutTriggered = await reportController.checkBlackoutThreshold(location_name);

      return res.status(201).json({
        success: true,
        message: 'Laporan berhasil dicatat di sistem github.com/Rm19x',
        data: {
          report_id: result.rows[0].id,
          location: result.rows[0].location_name,
          potential_blackout: isBlackoutTriggered
        }
      });

    } catch (error) {
      console.error('[REPORT ERROR] Gagal memproses laporan:', error.message);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server backend.' });
    }
  },

  /**
   * Logika Fitur B8: Mendeteksi potensi pemadaman massal tingkat wilayah
   */
  checkBlackoutThreshold: async (locationName) => {
    try {
      // Ambil 15 menit terakhir
      const queryText = `
        SELECT COUNT(*) as total_reports FROM reports 
        WHERE location_name ILIKE $1 
        AND created_at >= NOW() - INTERVAL '15 minutes';
      `;
      // Mencari kecocokan nama kota/kabupaten
      const result = await db.query(queryText, [`%${locationName}%`]);
      const reportCount = parseInt(result.rows[0].total_reports, 10);

      // Jika dalam 15 menit ada lebih dari 10 laporan di area yang sama, tandai sebagai Potensi Blackout
      if (reportCount >= 10) {
        console.warn(`[⚠️ ALERT BLACKOUT] Terdeteksi potensi mati lampu massal di wilayah: ${locationName}! Total laporan: ${reportCount}`);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[BLACKOUT CHECK ERROR]', err.message);
      return false;
    }
  }
};

module.exports = reportController;