# Panduan Penggunaan - Bunda Bahagia Dapur

## 🚀 Cara Menjalankan Aplikasi

### 1. Setup Database (Sekali Saja)
```bash
cd backend
npm run db:init
```

### 2. Menjalankan Server
```bash
# Terminal 1: Backend Server
cd backend && npm run dev

# Terminal 2: Frontend Server  
npm run dev
```

### 3. Akses Aplikasi
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api

## 👥 Akun Demo

### Admin
- **Email**: `admin@dapurbunda.com`
- **Password**: `admin123`
- **Akses**: Dashboard Admin untuk mengelola menu, kategori, pesanan, dan user

### Customer
- **Email**: `customer@example.com`
- **Password**: `customer123`
- **Akses**: Dashboard Customer untuk memesan makanan

## 🍽️ Fitur Customer

### 1. Login/Register
- Buka http://localhost:5173
- Klik "Masuk" atau "Daftar"
- Gunakan akun demo atau buat akun baru

### 2. Melihat Menu
- **Tab "Semua Menu"**: Lihat semua makanan dari semua kategori
- **Tab Kategori**: Filter menu berdasarkan kategori (Makanan Pembuka, Utama, Penutup, Minuman)
- Setiap menu menampilkan nama, deskripsi, harga, dan stok

### 3. Memesan Makanan
1. Pilih menu yang diinginkan
2. Klik "Tambah ke Keranjang"
3. Atur quantity di keranjang (+ / -)
4. Pilih **Tipe Pesanan**:
   - **Dine In**: Makan di tempat (wajib isi nomor meja)
   - **Takeaway**: Bawa pulang
5. Pilih **Metode Pembayaran**:
   - **Tunai**: Bayar cash
   - **Kartu Debit**: Bayar dengan debit
   - **Kartu Kredit**: Bayar dengan kredit
6. Klik "Pesan Sekarang"

### 4. Riwayat Pesanan
- Lihat status pesanan (Menunggu, Diproses, Siap, Selesai)
- Lihat detail pesanan dan total pembayaran

## 👨‍💼 Fitur Admin

### 1. Dashboard Overview
- Statistik total pesanan, pendapatan, user aktif, dan item menu
- Pesanan terbaru dan menu tersedia

### 2. Manajemen Kategori
- Tab "Kategori" untuk mengelola kategori menu
- Tambah kategori baru dengan nama dan deskripsi
- Edit/hapus kategori yang ada
- Lihat jumlah menu per kategori

### 3. Manajemen Menu
- Tab "Menu" untuk mengelola item menu
- Tambah menu baru dengan:
  - Nama menu
  - Kategori (dropdown otomatis terisi)
  - Harga
  - Stok
  - Deskripsi
  - URL gambar (opsional)
- Edit/hapus menu yang ada
- Update status ketersediaan

### 4. Manajemen Pesanan
- Tab "Pesanan" untuk melihat semua pesanan
- Update status pesanan (Pending → Processing → Ready → Completed)
- Cetak struk pembayaran
- Lihat detail pesanan lengkap

### 5. Manajemen User
- Tab "Users" untuk melihat semua pengguna
- Lihat detail user (nama, email, role, status)
- Hapus user jika diperlukan

### 6. Laporan
- Tab "Laporan" untuk melihat:
  - Laporan penjualan (total, rata-rata per pesanan)
  - Laporan stok menu
  - Statistik bisnis

## 🔧 Troubleshooting

### Masalah Login/Register
- Pastikan backend server berjalan di port 8000
- Pastikan database sudah diinisialisasi dengan `npm run db:init`

### Masalah Database
- Jalankan `cd backend && npm run db:init` untuk setup ulang
- Pastikan PostgreSQL berjalan dan dapat diakses

### Masalah Frontend
- Pastikan frontend server berjalan di port 5173
- Refresh browser jika ada error

## 📊 Status Pesanan

- **Pending**: Pesanan baru masuk, menunggu konfirmasi
- **Processing**: Pesanan sedang diproses di dapur
- **Ready**: Pesanan siap diambil/disajikan
- **Completed**: Pesanan selesai dan sudah diterima customer

## 💳 Metode Pembayaran

- **Tunai**: Pembayaran cash langsung
- **Kartu Debit**: Pembayaran menggunakan kartu debit
- **Kartu Kredit**: Pembayaran menggunakan kartu kredit

## 🎯 Tips Penggunaan

1. **Admin**: Selalu buat kategori terlebih dahulu sebelum menambah menu
2. **Customer**: Gunakan tab "Semua Menu" untuk melihat semua pilihan makanan
3. **Stok**: Sistem otomatis mengurangi stok saat pesanan dibuat
4. **Refresh**: Gunakan tombol refresh untuk update data terbaru