# KIYU - Sistem Manajemen Antrean Real-Time

KIYU adalah sistem manajemen antrean berbasis digital (*tenant-based queue system*) yang dirancang untuk mengoptimalkan alur pelayanan pelanggan menggunakan metode **FIFO (First-In, First-Out)**. Proyek ini dibangun sebagai bagian dari tugas UAS mata kuliah *Web Advanced* (WAdV) di Cakrawala University.

Sistem ini memisahkan hak akses antrean untuk **Public User** (memantau & mengambil tiket) dan **Tenant Admin** (memanggil & menyelesaikan antrean) secara *real-time*.

---

## 🚀 Fitur Utama

### 👥 Fitur Pengguna (Public API)
* **Lihat Tenant:** Menampilkan daftar toko/tenant aktif beserta estimasi waktu tunggu secara *real-time*.
* **Ambil Antrean:** Mengambil nomor antrean baru berbasis FIFO (Otomatis dicegah jika masih memiliki antrean aktif).
* **Tiket Saya:** Memantau status antrean aktif milik pengguna (`waiting` atau `called`).
* **Riwayat Antrean:** Melihat histori tiket yang sudah selesai dilayani (`done`).

### 🔑 Fitur Admin & Internal
* **Autentikasi JWT:** Pembatasan hak akses *endpoint* menggunakan JSON Web Token dan pengondisian *Role*.
* **Dashboard Tiket Global:** Fitur Super Admin untuk memantau seluruh antrean aktif di ekosistem KIYU.
* **Manajemen Antrean Tenant:** Admin toko dapat memanggil nomor antrean berikutnya (`/next`) dan menyelesaikan pelayanan (`/done`).

---

## 🛠️ Tech Stack

* **Runtime Environment:** Node.js
* **Backend Framework:** Express.js
* **Database ORM:** Prisma ORM
* **Database SQL:** PostgreSQL
* **Authentication:** JSON Web Token (JWT) & bcryptjs
* **Security & CORS:** Cors, dotenv

---

## 📦 Struktur Endpoint API

### 🔹 Autentikasi
* `POST /login` - Masuk akun (User / Admin)

### 🔹 Manajemen Tenant
* `GET /tenants` - Menampilkan seluruh tenant
* `GET /tenants/:id` - Menampilkan detail spesifik tenant

### 🔹 Sistem Tiket & Antrean (Butuh Login JWT)
* `POST /tenants/:id/tickets` - Mengambil nomor antrean baru
* `GET /tickets/me` - Melihat tiket aktif saat ini
* `GET /tickets/history` - Melihat riwayat antrean yang sudah selesai

### 🔹 Khusus Admin / Tenant Admin (Butuh JWT + Role)
* `GET /admin/all-tickets` - Memantau seluruh tiket aktif di sistem KIYU
* `GET /tenants/:id/tickets` - Melihat semua daftar antrean pada tenant tertentu
* `PUT /tenants/:id/next` - Memanggil nomor antrean berikutnya (Mengubah status ke `called`)
* `PUT /tickets/:id/done` - Menyelesaikan pelayanan tiket (Mengubah status ke `done`)

---

## ⚠️ Catatan Penting untuk Pengujian Endpoint

* **Simulasi Antrean:** Sebelum menguji endpoint berbasis ID tiket (seperti `PUT /tickets/:id/done`), pastikan Anda telah melakukan *order* tiket baru terlebih dahulu melalui `POST /tenants/:id/tickets` karena database otomatis dibersihkan dan di-reset kembali ke **ID 1** setiap kali skrip *seeding* dijalankan.
* **Penanganan Error:** Jika memasukkan ID tiket yang salah atau tidak ada di database, sistem akan mengembalikan respons `404 Not Found` (bukan crash), demi menjaga keamanan integrasi data.

---

## 🔧 Langkah Instalasi & Menjalankan Project

### 1. Backend (Server)
Buka terminal baru, masuk ke direktori backend, lalu install library dan siapkan database:
```bash
cd backend
npm install

# Generate Prisma Client & Sync Database
npx prisma generate
npx prisma db push

# Menjalankan Seeding Data Awal 
node prisma/seed.js

# Jalankan Server Backend
npm start