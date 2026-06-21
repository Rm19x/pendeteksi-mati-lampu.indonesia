/**
 * PROJECT: DETEKSI MATI LAMPU INDONESIA
 * AUTHOR: Mr.Rm19 (https://github.com/Rm19x)
 * FILE: src/config/env.js
 * DESCRIPTION: Validasi dan ekspor variabel lingkungan (.env) agar aman digunakan di file lain.
 */

const dotenv = require('dotenv');
const path = require('path');

// Muat file .env dari root folder
dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredEnv = [
  'PORT',
  'DATABASE_URL',
  'TELEGRAM_BOT_TOKEN'
];

// Validasi apakah variabel penting sudah diisi
for (const envName of requiredEnv) {
  if (!process.env[envName]) {
    console.error(`[ERROR] Variabel lingkungan ${envName} belum diatur di file .env!`);
    console.error(`Sistem dihentikan oleh konfigurasi Mr.Rm19.`);
    process.exit(1);
  }
}

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  waGatewayUrl: process.env.WHATSAPP_GATEWAY_URL,
  waApiKey: process.env.WHATSAPP_API_KEY,
  twitterInterval: parseInt(process.env.TWITTER_SCRAPE_INTERVAL, 10) || 300000,
  plnInterval: parseInt(process.env.PLN_RSS_INTERVAL, 10) || 300000,
  apiKey: process.env.API_PUBLIC_KEY
};