/**
 * PROJECT: DETEKSI MATI LAMPU INDONESIA
 * AUTHOR: Mr.Rm19 (https://github.com/Rm19x)
 * FILE: src/controllers/mapController.js
 * DESCRIPTION: Mengolah data laporan spasial untuk diubah menjadi heatmap real-time di frontend.
 */

const db = require('../config/database');

const mapController = {
  /**
   * Mengambil data titik koordinat untuk Heatmap di Peta (Fitur C1, C3, C6, C7)
   */
  getHeatmapData: async (req, res) => {
    try {
      // Mengakomodasi filter waktu (Fitur C7): default mengambil 3 jam terakhir
      let timeInterval = "3 hours";
      if (req.query.filter === 'today') timeInterval = "24 hours";
      if (req.query.filter === 'yesterday') timeInterval = "48 hours";

      const queryText = `
        SELECT 
          id, 
          location_name, 
          ST_X(geom) as longitude, 
          ST_Y(geom) as latitude, 
          duration_estimate,
          operator_signal,
          created_at
        FROM reports 
        WHERE created_at >= NOW() - INTERVAL '${timeInterval}'
        ORDER BY created_at DESC;
      `;

      const result = await db.query(queryText);

      return res.status(200).json({
        success: true,
        author: 'Mr.Rm19',
        total_active_reports: result.rows.length,
        last_updated: new Date().toISOString(), // Fitur C6
        points: result.rows
      });

    } catch (error) {
      console.error('[MAP ERROR] Gagal menarik data heatmap:', error.message);
      return res.status(500).json({ success: false, message: 'Gagal memproses data peta.' });
    }
  },

  /**
   * Fitur C2: Kolom pencarian status kelistrikan daerah tertentu
   */
  searchLocationStatus: async (req, res) => {
    try {
      const { q } = req.query; // Menangkap kata kunci pencarian (misal ?q=Medan)
      if (!q) {
        return res.status(400).json({ success: false, message: 'Parameter pencarian (q) wajib diisi.' });
      }

      const queryText = `
        SELECT COUNT(*) as total_reports,
               CASE WHEN COUNT(*) >= 3 THEN '⚠️ Mati Lampu (Siaga)' 
                    WHEN COUNT(*) > 0 THEN '⚠️ Ada Laporan Pemadaman'
                    ELSE '✅ Normal (Aman)' END as status
        FROM reports 
        WHERE location_name ILIKE $1 
        AND created_at >= NOW() - INTERVAL '2 hours';
      `;

      const result = await db.query(queryText, [`%${q}%`]);

      return res.status(200).json({
        success: true,
        search_query: q,
        result: {
          location: q,
          status: result.rows[0].status,
          active_reports_2_hours: parseInt(result.rows[0].total_reports, 10)
        }
      });

    } catch (error) {
      console.error('[SEARCH ERROR] Gagal melakukan pencarian:', error.message);
      return res.status(500).json({ success: false, message: 'Gagal melakukan pencarian lokasi.' });
    }
  },

  /**
   * Fitur C4: Grafik real-time statistik wilayah per provinsi (dikirim dalam bentuk data agregat)
   */
  getProvinceStats: async (req, res) => {
    try {
      // Query agregasi sederhana untuk menghitung laporan per area
      const queryText = `
        SELECT location_name as area, COUNT(*) as total 
        FROM reports 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY location_name 
        ORDER BY total DESC 
        LIMIT 10;
      `;
      const result = await db.query(queryText);

      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('[STATS ERROR] Gagal menarik data statistik:', error.message);
      return res.status(500).json({ success: false, message: 'Gagal menarik data statistik.' });
    }
  }
};

module.exports = mapController;
