# Seeders

## Menjalankan Seeder

Pastikan database sudah dibuat dan migration sudah dijalankan.

```bash
cd portal-kewirausahaan-backend/seeders
node run.js
```

## Data yang di-seed

### Users
- **Admin (2)**: adminpmw@mail.com, admininbis@mail.com
- **Mahasiswa (40)**: mhs1@mail.com s/d mhs40@mail.com
- **Dosen (10)**: dosen1@mail.com s/d dosen10@mail.com
- **Reviewer (5)**: reviewer1@mail.com s/d reviewer5@mail.com
- **Juri (3)**: juri1@mail.com s/d juri3@mail.com

Password semua: `password123`

### Master Data
- **Jurusan (7)**: Teknik Elektro, Teknik Mesin, Teknik Sipil, Akuntansi, Administrasi Niaga, Teknik Kimia, Teknologi Informasi
- **Kampus (4)**: Kampus Pusat, PSDKU Kota Kediri, PSDKU Kabupaten Lumajang, PSDKU Kabupaten Pamekasan
- **Prodi (43)**: Sesuai data user
- **Program (2)**: PMW, INBIS
- **Kategori (4)**: Teknologi Pangan, Desain Kreatif, Jasa dan Dagang, Technopreneur
- **Tahap Penilaian (4)**: 2 tahap per program
- **Kriteria Penilaian (24)**: 12 kriteria per program
