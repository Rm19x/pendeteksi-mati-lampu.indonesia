/**
 * PROJECT: DETEKSI MATI LAMPU INDONESIA
 * AUTHOR: Mr.Rm19 (https://github.com/Rm19x)
 * FILE: src/services/geocoder.js
 * DESCRIPTION: Layanan konversi nama wilayah/lokasi teks menjadi koordinat spasial (Geocoding API).
 */

const axios = require('axios');

const geocoder = {
  /**
   * Mengubah Nama Tempat menjadi Latitude & Longitude lewat API Nominatim OpenStreetMap (Fitur B5)
   * @param {string} locationName - Contoh: "Dago, Bandung"
   */
  getCoordinates: async (locationName) => {
    try {
      // Menambahkan parameter filter negara Indonesia secara ketat agar pencarian tidak melesat ke luar negeri
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}+Indonesia&limit=1`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'DeteksiMatiLampuIndonesia/1.0 (Contact: github.com/Rm19x)'
        }
      });

      if (response.data && response.data.length > 0) {
        const place = response.data[0];
        return {
          success: true,
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
          display_name: place.display_name
        };
      }

      // Jika wilayah pelosok tidak terindeks, gunakan koordinat pusat acak di Indonesia sebagai fallback keamanan
      return {
        success: false,
        latitude: -0.7893, 
        longitude: 113.9213,
        display_name: locationName
      };

    } catch (error) {
      console.error('[GEOCODER ERROR] Gagal menghubungi server OpenStreetMap Geocoding:', error.message);
      return {
        success: false,
        latitude: -0.7893,
        longitude: 113.9213,
        display_name: locationName
      };
    }
  }
};

module.exports = geocoder;
