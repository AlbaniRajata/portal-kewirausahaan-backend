# Portal Kewirausahaan Backend

Backend API untuk aplikasi Portal Kewirausahaan.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi database dan JWT_SECRET

# Run migrations
node migrations/run.js

# Start server
npm run dev
```

## API Documentation

Akses Swagger UI di: **http://localhost:3000/api-docs**

## API Endpoints

### Auth (`/api/auth`)
- `POST /register/mahasiswa` - Register mahasiswa (dengan upload KTM)
- `POST /register/dosen` - Register dosen
- `POST /login` - Login user
- `POST /refresh` - Refresh access token
- `POST /forgot-password` - Request reset password
- `POST /reset-password` - Reset password dengan token
- `POST /verify-email` - Verifikasi email
- `POST /logout` - Logout (perlu auth)

### Mahasiswa (`/api/mahasiswa`) - *Butuh Auth (Role: 1)*
- Profile, Tim, Proposal, Pembimbing, Bimbingan, Monev

### Admin (`/api/admin`) - *Butuh Auth (Role: 2, 6)*
- CRUD: User, Program, Kategori, Prodi, Jurusan, Kampus
- Management: Proposal, Penilaian, Penugasan

### Dosen (`/api/dosen`) - *Butuh Auth (Role: 3)*
- Profile, Pembimbing, Bimbingan, Monev

### Reviewer (`/api/reviewer`) - *Butuh Auth (Role: 4)*
- Profile, Penugasan, Penilaian

### Juri (`/api/juri`) - *Butuh Auth (Role: 5)*
- Profile, Penugasan, Penilaian

### Public (`/api/public`)
- `GET /prodi` - List program studi
- `GET /jurusan` - List jurusan
- `GET /program` - List program
- `GET /kategori` - List kategori

## Response Format

```json
{
  "success": true,
  "message": "Pesan sukses/error",
  "timestamp": "2026-05-02T10:30:00.000Z",
  "version": "1.0.0",
  "data": { ... }
}
```

## Authentication

Gunakan Bearer Token di header:
```
Authorization: Bearer <access_token>
```

## Security Features

- ✅ JWT Authentication (Access + Refresh Token)
- ✅ Role-Based Access Control (6 roles)
- ✅ Rate Limiting (Login: 10x/15min, Register: 5x/15min)
- ✅ Password Hashing (BCrypt)
- ✅ SQL Injection Protection
- ✅ Input Sanitization
- ✅ CORS Protection

## Tech Stack

- Node.js + Express.js
- PostgreSQL + node-postgres
- JWT + BCrypt
- Swagger (API Documentation)
- Jest + Supertest (Testing)
