/**
 * PROJECT: DETEKSI MATI LAMPU INDONESIA
 * AUTHOR: Mr.Rm19 (https://github.com/Rm19x)
 * FILE: src/services/telegramBot.js
 * DESCRIPTION: Layanan Bot Telegram otomatis untuk mengumpulkan laporan pemadaman langsung dari masyarakat.
 */

const { Telegraf, Markup } = require('telegraf');
const config = require('../config/env');
const axios = require('axios');

// Inisialisasi bot menggunakan token dari .env
const bot = new Telegraf(config.telegramToken);

// Penyimpanan sesi sementara di memori saat bot memandu user mengisi laporan
const reportSessions = new Map();

/**
 * Perintah /start - Menyapa pengguna dan memperkenalkan pembuat sistem
 */
bot.start((ctx) => {
  const welcomeMessage = 
    `Halo! Selamat datang di Bot Deteksi Mati Lampu Indonesia 🇮🇩\n\n` +
    `Sistem ini dikembangkan oleh *Mr.Rm19* (github.com/Rm19x) untuk memetakan wilayah pemadaman secara real-time dan membantu sesama warga.\n\n` +
    `📢 *Perintah Utama:* \n` +
    `/matilampu - Melaporkan listrik padam di wilayahmu\n` +
    `/lampunormal - Melaporkan bahwa listrik sudah menyala kembali\n` +
    `/bantuan - Menampilkan informasi pusat bantuan PLN`;
  
  ctx.replyWithMarkdown(welcomeMessage);
});

/**
 * Perintah /matilampu (Fitur A2) - Memulai alur pelaporan
 */
bot.command('matilampu', (ctx) => {
  const userId = ctx.from.id;
  
  // Set status sesi ke tahap 1 (Menunggu nama lokasi)
  reportSessions.set(userId, { stage: 'AWAITING_LOCATION', data: { source: 'telegram', reporter_id: userId.toString() } });
  
  ctx.reply('Silakan ketik nama *Kecamatan* dan *Kota* tempat mati lampu saat ini.\n\nContoh: Dago, Bandung');
});

/**
 * Menangani input teks dari pengguna (Proses berantai Fitur A10 dan D10)
 */
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const session = reportSessions.get(userId);

  if (!session) return;

  // TAHAP 1: Menerima nama lokasi
  if (session.stage === 'AWAITING_LOCATION') {
    session.data.location_name = ctx.message.text;
    session.stage = 'AWAITING_SIGNAL';
    
    // Tanyakan status sinyal operator HP (Fitur D10)
    return ctx.reply(
      'Bagaimana kondisi sinyal operator seluler di sana saat mati lampu?',
      Markup.keyboard([
        ['Sinyal Bagus', 'Sinyal Lemah'],
        ['Sinyal Hilang Total']
      ]).oneTime().resize()
    );
  }

  // TAHAP 2: Menerima status sinyal operator
  if (session.stage === 'AWAITING_SIGNAL') {
    session.data.operator_signal = ctx.message.text;
    session.stage = 'AWAITING_DURATION';

    // Tanyakan estimasi durasi (Fitur A10)
    return ctx.reply(
      'Sudah berapa lama listrik padam?',
      Markup.keyboard([
        ['Baru saja', 'Kurang dari 1 jam'],
        ['Lebih dari 2 jam', 'Mati dari pagi/malam']
      ]).oneTime().resize()
    );
  }

  // TAHAP 3: Menerima estimasi durasi & Mengirim data ke API Lokal kita sendiri
  if (session.stage === 'AWAITING_DURATION') {
    session.data.duration_estimate = ctx.message.text;
    const finalData = session.data;

    // Hapus sesi agar bersih kembali
    reportSessions.delete(userId);

    try {
      // Panggil sistem geocoder internal terlebih dahulu untuk simulasi koordinat acak di wilayah tersebut
      // Pada file geocoder.js nanti koordinat asli dicari. Sementara kita set default titik tengah Indonesia.
      finalData.latitude = -6.2088; 
      finalData.longitude = 106.8456;

      // Kirim data ke controller kita (Menembak endpoint internal demi arsitektur nyata)
      const response = await axios.post(`http://localhost:${config.port}/api/v1/reports/web`, finalData);
      
      if (response.data.success) {
        let replyMsg = `✅ *Laporan Berhasil Dicatat!*\n\nTerima kasih atas kontribusi Anda. Data telah diteruskan ke sistem peta interaktif Mr.Rm19 (github.com/Rm19x).`;
        if (response.data.data.potential_blackout) {
          replyMsg += `\n\n⚠️ *PERINGATAN:* Sistem mendeteksi lonjakan laporan tinggi di area Anda. Berpotensi pemadaman massal!`;
        }
        ctx.replyWithMarkdown(replyMsg, Markup.removeKeyboard());
      }
    } catch (error) {
      console.error('[TELEGRAM BOT ERROR]', error.message);
      ctx.reply('❌ Maaf, gagal mengirim laporan ke server pusat. Coba beberapa saat lagi.', Markup.removeKeyboard());
    }
  }
});

/**
 * Perintah /lampunormal (Fitur A8) - Mengonfirmasi lampu menyala kembali
 */
bot.command('lampunormal', (ctx) => {
  ctx.reply('Terima kasih konfirmasinya! Sistem kami akan otomatis memperbarui status area tersebut di peta dalam beberapa menit jika laporan serupa masuk.');
});

/**
 * Perintah /bantuan (Fitur D7) - Nomor darurat terintegrasi
 */
bot.command('bantuan', (ctx) => {
  ctx.replyWithMarkdown(
    `📞 *Pusat Bantuan & Layanan Darurat PLN:*\n\n` +
    `• *Call Center PLN:* 123 (Jika lewat HP gunakan kode area, misal: 021-123)\n` +
    `• *Aplikasi Resmi:* PLN Mobile\n\n` +
    `Hubungi petugas terkait jika ada kabel putus atau percikan api yang membahayakan warga sekitar.`
  );
});

// Jalankan bot tanpa memblokir server utama
bot.launch()
  .then(() => console.log('[SERVICES] Bot Telegram Pelaporan Mati Lampu aktif dan berjalan normal.'))
  .catch((err) => console.error('[SERVICES ERROR] Gagal menjalankan Bot Telegram:', err.message));

module.exports = bot;