# Backend API - Bunda Bahagia Dapur

Backend API untuk sistem manajemen restoran Bunda Bahagia Dapur.

## Setup Database

### Menggunakan Database PostgreSQL yang Sudah Ada

Aplikasi ini sudah dikonfigurasi untuk menggunakan database PostgreSQL default (`postgres`) untuk menghindari masalah pembuatan database baru.

### Inisialisasi Tabel dan Data

Jalankan perintah berikut untuk membuat tabel-tabel yang diperlukan dan data awal:

```bash
cd backend
npm run db:init
```

Script ini akan:
- Membuat semua tabel yang diperlukan (users, categories, menu_items, orders, order_items, payments)
- Membuat index untuk performa yang lebih baik
- Membuat trigger untuk update timestamp otomatis
- Menambahkan kategori default:
  - Makanan Pembuka
  - Makanan Utama
  - Makanan Penutup
  - Minuman

## Menjalankan Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:8000`

## API Endpoints

### Categories
- `GET /api/categories` - Mendapatkan semua kategori
- `POST /api/categories` - Membuat kategori baru

### Menu Items
- `GET /api/menu-items` - Mendapatkan semua menu
- `POST /api/menu-items` - Membuat menu baru
- `PUT /api/menu-items/:id` - Update menu
- `DELETE /api/menu-items/:id` - Hapus menu

### Orders
- `GET /api/orders` - Mendapatkan semua pesanan
- `POST /api/orders` - Membuat pesanan baru
- `PUT /api/orders/:id/status` - Update status pesanan

### Users
- `GET /api/users` - Mendapatkan semua user
- `POST /api/users` - Membuat user baru
- `POST /api/users/login` - Login user

## Konfigurasi Database

Database dikonfigurasi melalui file `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=PasswordBaru123
DATABASE_URL=postgresql://postgres:PasswordBaru123@localhost:5432/postgres
```

## Testing API

Contoh menambahkan menu baru:

```bash
curl -X POST http://localhost:8000/api/menu-items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nasi Goreng",
    "description": "Nasi goreng spesial dengan telur dan ayam",
    "price": 25000,
    "category_id": "bb278c46-5dfd-42e5-876e-92762e1f0768",
    "stock": 10,
    "status": "available"
  }'
```

## Troubleshooting

### Error: relation "table_name" does not exist
Jalankan `npm run db:init` untuk membuat tabel-tabel yang diperlukan.

### Error: database "restaurant" does not exist
Pastikan konfigurasi database di `.env` menggunakan database yang sudah ada (default: `postgres`).