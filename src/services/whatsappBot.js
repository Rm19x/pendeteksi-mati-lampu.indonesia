/**
 * PROJECT: DETEKSI MATI LAMPU INDONESIA
 * AUTHOR: Mr.Rm19 (https://github.com/Rm19x)
 * FILE: src/services/whatsappBot.js
 * DESCRIPTION: Integrasi layanan pengiriman notifikasi dan pemrosesan pesan masuk via WhatsApp Gateway.
 */

const axios = require('axios');
const config = require('../config/env');

const whatsappBot = {
  /**
   * Mengirim pesan notifikasi keluar otomatis via WhatsApp Gateway jika ada laporan mendesak
   */
  sendWhatsAppAlert: async (toPhoneNumber, messageText) => {
    // Jika API gateway di .env belum diset secara komersial, jalankan mode simulasi agar tidak crash
    if (!config.waApiKey || config.waGatewayUrl.includes('gateway-publik')) {
      console.log(`[SIMULASI WA] Mengirim pesan ke ${toPhoneNumber}: ${messageText}`);
      return true;
    }

    try {
      const response = await axios.post(config.waGatewayUrl, {
        to: toPhoneNumber,
        message: messageText
      }, {
        headers: {
          'Authorization': `Bearer ${config.waApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.status === 200;
    } catch (error) {
      console.error('[WHATSAPP SERVICES ERROR] Gagal mengirim alert WA:', error.message);
      return false;
    }
  },

  /**
   * Memproses pesan teks mentah yang masuk dari webhook WhatsApp
   */
  processIncomingMessage: (rawMessage) => {
    // Logika dasar regex untuk menangkap format teks buatan warga (misal: "Lapor mati lampu di daerah Medan")
    const text = rawMessage.body.toLowerCase();
    if (text.includes('mati lampu') || text.includes('padam') || text.includes('mati listrik')) {
      return {
        is_report: true,
        extracted_location: text.replace('mati lampu di', '').replace('padam di', '').trim()
      };
    }
    return { is_report: false };
  }
};

module.exports = whatsappBot;