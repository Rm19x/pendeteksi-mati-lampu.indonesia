#  Sistem Deteksi Mati Lampu Real-Time Indonesia 🇮🇩

[![Node.js Version](https://img.shields.io/badge/node->=%2020.0.0-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL%20%2B%20PostGIS-blue.svg)](https://www.postgresql.org/)
[![Developer](https://img.shields.io/badge/developer-Mr.Rm19-orange.svg)](https://github.com/Rm19x)
[![License](https://img.shields.io/badge/license-MIT-informational.svg)](LICENSE)

Sistem Deteksi Mati Lampu Real-Time Indonesia adalah platform backend berbasis **Node.js (Express.js)** dan database spasial **PostgreSQL/PostGIS**. Sistem ini dirancang untuk mengumpulkan, memproses, memvalidasi, dan memetakan laporan pemadaman listrik di seluruh wilayah kelistrikan Indonesia secara otomatis dan real-time dari berbagai pintu masuk (*multi-channel data ingestion*).

##  Pengembang Proyek
* **Nama Developer:** Mr.Rm19
* **Repositori Resmi:** [github.com/Rm19x](https://github.com/Rm19x)

---

##  Fitur Utama Sistem

Sistem ini dibangun dengan arsitektur modular yang memisahkan logika rute, pengolahan data (*controllers*), utilitas validasi, dan layanan otomatisasi latar belakang (*background workers*):

###  1. Multi-Channel Data Ingestion & Automation (Latar Belakang)
* **X / Twitter Scraper:** Mesin pemantau berkala yang mengekstraksi keluhan atau tweet publik warga terkait pemadaman listrik (menggunakan kata kunci taktis seperti *'mati lampu'*, *'listrik padam'*, atau mention `@pln_123`).
* **PLN RSS Parser / Mobile API Sync:** Sinkronisasi otomatis terjadwal untuk menarik pengumuman resmi pemadaman struktural akibat pemeliharaan gardu/jaringan langsung dari data pihak PLN.
* **Telegram Interactive Reporting Bot:** Menggunakan framework `Telegraf` untuk memandu masyarakat mengirim laporan terstruktur lewat perintah khusus (`/matilampu`, `/lampunormal`, dan `/bantuan`).
* **WhatsApp Gateway Webhook Router:** Gerbang aman (*secure gateway*) yang siap memproses kiriman data pesan pelaporan masuk dari masyarakat via aplikasi WhatsApp.

###  2. Core Intelligent Engines (Logika Backend)
* **Pencegahan Spam Spasial (Anti-Spam Engine):** Sistem membatasi pengiriman laporan berulang dari pengguna atau IP yang sama pada area yang sama dalam radius waktu *cooldown* 5 menit.
* **Ambang Batas Pemadaman Massal (Blackout Threshold Trigger):** Detektor otomatis yang akan memicu status peringatan (*potential blackout massal*) jika terjadi lonjakan laporan (>10 laporan) dalam kurun waktu 15 menit pada satu wilayah tertentu.
* **Integrasi OpenStreetMap Geocoding:** Konversi otomatis nama lokasi teks buatan pengguna (contoh: *"Sleman"*, *"Tambun"*) menjadi koordinat lintang dan bujur (*Latitude & Longitude*) menggunakan Nominatim API dengan filter ketat regional Indonesia.
* **Automated System Recommendation (Dark Mode Trigger):** Menyediakan fitur deteksi jam server lokal untuk memberikan sinyal rekomendasi pengaktifan *Dark Mode* otomatis pada aplikasi frontend ketika area tersebut memasuki waktu malam/padam.
* **Standarisasi Tiga Zona Waktu:** Utilitas penyesuaian penanda waktu (*timestamping*) otomatis yang mendukung pembagian wilayah waktu kelistrikan Indonesia (WIB, WITA, WIT).

---

##  Prasyarat & Stack Teknologi

Sebelum menjalankan aplikasi di lingkungan lokal, pastikan komputer Anda telah terpasang komponen berikut:
1. **Node.js** (Sangat direkomendasikan Versi Long Term Support / LTS Terbaru)
2. **PostgreSQL** (Versi 14 atau di atasnya)
3. **Ekstensi PostGIS** (Wajib diaktifkan pada database PostgreSQL untuk mendukung query koordinat spasial `ST_X`, `ST_Y`, dan tipe data `GEOMETRY`).

---

##  Pasang Package Dependencies
Unduh semua pustaka (library) node modules yang diperlukan lewat NPM:


```
npm install
```

## Konfigurasi Database (pgAdmin / PostgreSQL Shell)
Buat database baru bernama deteksi_mati_lampu, lalu masuk ke dalam query tool dan jalankan perintah ekstensi PostGIS berikut:

SQL


Mengaktifkan modul fitur spasial koordinat map
```
CREATE EXTENSION postgis;

-- Membuat tabel penampung laporan (Sesuaikan dengan skema sistem)
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL,
    reporter_id VARCHAR(100),
    location_name VARCHAR(255) NOT NULL,
    duration_estimate VARCHAR(100),
    operator_signal VARCHAR(50),
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Environment Variables (.env)
Buat sebuah file baru bernama .env di direktori utama (root) proyek, kemudian sesuaikan konfigurasinya sebagai berikut:

Cuplikan kode


PORT=3000
NODE_ENV=development

## Database Connection URL (Ganti 'password_kamu' dengan password asli PostgreSQL Anda)
DATABASE_URL=postgres://postgres:password_kamu@localhost:5432/deteksi_mati_lampu

## API & Bot Credentials
TELEGRAM_BOT_TOKEN=isi_dengan_token_bot_telegram_kamu
WHATSAPP_GATEWAY_URL=[https://api.whatsapp-gateway-publik.com/v1/messages](https://api.whatsapp-gateway-publik.com/v1/messages)
WHATSAPP_API_KEY=isi_dengan_api_key_wa_kamu

## Pengaturan Interval Sinkronisasi Latar Belakang (300000 ms = 5 Menit)
TWITTER_SCRAPE_INTERVAL=300000
PLN_RSS_INTERVAL=300000

# Kunci Keamanan Akses Webhook
API_PUBLIC_KEY=rm19x_indonesia_bisa_2026


## Cara Menjalankan Aplikasi

Aplikasi backend ini mendukung reload otomatis saat kodingan diubah dengan menggunakan nodemon:



```
npm run dev
Mode Produksi (Production)



npm start
Saat berhasil berjalan, terminal Anda akan menampilkan log resmi sistem:
================================================================
 DETEKSI MATI LAMPU INDONESIA AKTIF DAN BERJALAN
 PENGEMBANG : Mr.Rm19
 REPOSITORI : [github.com/Rm19x](https://github.com/Rm19x)
 PORT SERVER: 3000 | Mode: development
================================================================
[SERVICES] Scraper Twitter aktif. Memantau keyword tiap 300 detik.
[SERVICES] RSS Parser PLN aktif. Melakukan sinkronisasi data tiap 300 detik.
[DATABASE] Berhasil terhubung ke database. Siap menampung data laporan dari Mr.Rm19.
[RSS PLN] Berhasil menyerap data resmi pemadaman: Kecamatan Gambir, Jakarta Pusat
[SCRAPER TWITTER] Berhasil menangkap keluhan dari @warga_bekasi di Tambun, Bekasi
[SCRAPER TWITTER] Berhasil menangkap keluhan dari @netizen_jogja di Sleman, Yogyakarta
[SCRAPER TWITTER ERROR] Gagal melakukan sinkronisasi data X: Request failed with status code 429
[RSS PLN ERROR] Gagal mengunduh dokumen pengumuman PLN: Request failed with status code 429
[SCRAPER TWITTER] Berhasil menangkap keluhan dari @warga_bekasi di Tambun, Bekasi
[RSS PLN] Berhasil menyerap data resmi pemadaman: Kecamatan Gambir, Jakarta Pusat
[SCRAPER TWITTER] Berhasil menangkap keluhan dari @netizen_jogja di Sleman, Yogyakarta
[SCRAPER TWITTER] Berhasil menangkap keluhan dari @warga_bekasi di Tambun, Bekasi
[SCRAPER TWITTER] Berhasil menangkap keluhan dari @netizen_jogja di Sleman, Yogyakarta
[RSS PLN] Berhasil menyerap data resmi pemadaman: Kecamatan Gambir, Jakarta Pusat
[SCRAPER TWITTER] Berhasil menangkap keluhan dari @warga_bekasi di Tambun, Bekasi
[RSS PLN] Berhasil menyerap data resmi pemadaman: Kecamatan Gambir, Jakarta Pusat
[SCRAPER TWITTER] Berhasil menangkap keluhan dari @netizen_jogja di Sleman, Yogyakarta
[SCRAPER TWITTER] Berhasil menangkap keluhan dari @warga_bekasi di Tambun, Bekasi
[RSS PLN] Berhasil menyerap data resmi pemadaman: Kecamatan Gambir, Jakarta Pusat
[SCRAPER TWITTER] Berhasil menangkap keluhan dari @netizen_jogja di Sleman, Yogyakarta
[SCRAPER TWITTER] Berhasil menangkap keluhan dari @warga_bekasi di Tambun, Bekasi
[RSS PLN] Berhasil menyerap data resmi pemadaman: Kecamatan Gambir, Jakarta Pusat
[SCRAPER TWITTER] Berhasil menangkap keluhan dari @netizen_jogja di Sleman, Yogyakarta
```

##  Dokumentasi Struktur API Endpoints

Alamat Dasar API Lokal: `http://localhost:3000`

###  1. API Publik (Public Routes)

| HTTP Method | Endpoint URL | Deskripsi Fungsi Utama |
| :--- | :--- | :--- |
| **GET** | `/` | Cek status operasional server, informasi author, dan trigger rekomendasi *Dark Mode* otomatis. |
| **GET** | `/api/v1/maps/heatmap` | Mengambil seluruh titik koordinat spasial aktif untuk merender peta *Heatmap* (Mendukung parameter query: `?filter=today` atau `?filter=yesterday`). |
| **GET** | `/api/v1/maps/search` | Kolom pencarian status kondisi kelistrikan real-time di area tertentu (Contoh penggunaan: `?q=Sleman`). |
| **GET** | `/api/v1/maps/stats` | Menyediakan data statistik agregat laporan dari 10 area teratas untuk kebutuhan grafik batang pada frontend. |
| **POST** | `/api/v1/reports/web` | Endpoint internal sebagai penampung suntikan data laporan baru yang ditangkap oleh mesin scraper. |

---

### 🔐 2. API Webhooks (Protected Routes)

* **POST** `/webhooks/whatsapp`
  * **Deskripsi:** Menerima kiriman payload data pesan laporan mati lampu langsung dari sistem Gerbang API WhatsApp Publik.
  * **Keamanan:** Memerlukan Header Otentikasi ketat: 
    ```http
    x-api-key: rm19x_indonesia_bisa_2026
    ```

* **POST** `/webhooks/telegram`
  * **Deskripsi:** Endpoint khusus penerima native data callback/webhook interaksi warga dengan Bot Telegraf.

  <img src="https://raw.githubusercontent.com/Rm19x/pendeteksi-mati-lampu.indonesia/refs/heads/main/qq.png"><br>  <img src="https://raw.githubusercontent.com/Rm19x/pendeteksi-mati-lampu.indonesia/refs/heads/main/qq2.png">

##  


Made Mr.Rm19 for a brighter Indonesia 🇮🇩
