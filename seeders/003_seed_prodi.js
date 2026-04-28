const pool = require('../src/config/db');

const seedProdi = async () => {
  const prodi = [
    { id_prodi: 1, id_jurusan: 4, id_kampus: 1, nama: 'Akuntansi Manajemen', jenjang: 'D4' },
    { id_prodi: 2, id_jurusan: 5, id_kampus: 1, nama: 'Bahasa Inggris untuk Komunikasi Bisnis dan Profesional', jenjang: 'D4' },
    { id_prodi: 3, id_jurusan: 4, id_kampus: 1, nama: 'Keuangan', jenjang: 'D4' },
    { id_prodi: 4, id_jurusan: 5, id_kampus: 1, nama: 'Manajemen Pemasaran', jenjang: 'D4' },
    { id_prodi: 5, id_jurusan: 3, id_kampus: 1, nama: 'Manajemen Rekayasa Konstruksi', jenjang: 'D4' },
    { id_prodi: 6, id_jurusan: 5, id_kampus: 1, nama: 'Pengelolaan Arsip dan Rekaman Informasi', jenjang: 'D4' },
    { id_prodi: 7, id_jurusan: 1, id_kampus: 1, nama: 'Sistem Kelistrikan', jenjang: 'D4' },
    { id_prodi: 8, id_jurusan: 1, id_kampus: 1, nama: 'Teknik Elektronika', jenjang: 'D4' },
    { id_prodi: 9, id_jurusan: 7, id_kampus: 1, nama: 'Teknik Informatika', jenjang: 'D4' },
    { id_prodi: 10, id_jurusan: 1, id_kampus: 1, nama: 'Teknik Jaringan Telekomunikasi Digital', jenjang: 'D4' },
    { id_prodi: 11, id_jurusan: 6, id_kampus: 1, nama: 'Teknologi Kimia Industri', jenjang: 'D4' },
    { id_prodi: 12, id_jurusan: 2, id_kampus: 1, nama: 'Teknik Mesin Produksi dan Perawatan', jenjang: 'D4' },
    { id_prodi: 13, id_jurusan: 2, id_kampus: 1, nama: 'Teknik Otomotif Elektronik', jenjang: 'D4' },
    { id_prodi: 14, id_jurusan: 3, id_kampus: 1, nama: 'Teknologi Rekayasa Konstruksi Jalan dan Jembatan', jenjang: 'D4' },
    { id_prodi: 15, id_jurusan: 5, id_kampus: 1, nama: 'Usaha Perjalanan Wisata', jenjang: 'D4' },
    { id_prodi: 16, id_jurusan: 7, id_kampus: 1, nama: 'Sistem Informasi Bisnis', jenjang: 'D4' },
    { id_prodi: 17, id_jurusan: 5, id_kampus: 1, nama: 'Bahasa Inggris Untuk Industri Pariwisata', jenjang: 'D4' },
    { id_prodi: 18, id_jurusan: 5, id_kampus: 1, nama: 'Administrasi Bisnis', jenjang: 'D3' },
    { id_prodi: 19, id_jurusan: 4, id_kampus: 1, nama: 'Akuntansi', jenjang: 'D3' },
    { id_prodi: 20, id_jurusan: 1, id_kampus: 1, nama: 'Teknik Elektronika', jenjang: 'D3' },
    { id_prodi: 21, id_jurusan: 6, id_kampus: 1, nama: 'Teknik Kimia', jenjang: 'D3' },
    { id_prodi: 22, id_jurusan: 3, id_kampus: 1, nama: 'Teknologi Konstruksi Jalan, Jembatan, dan Bangunan Air', jenjang: 'D3' },
    { id_prodi: 23, id_jurusan: 1, id_kampus: 1, nama: 'Teknik Listrik', jenjang: 'D3' },
    { id_prodi: 24, id_jurusan: 2, id_kampus: 1, nama: 'Teknik Mesin', jenjang: 'D3' },
    { id_prodi: 25, id_jurusan: 2, id_kampus: 1, nama: 'Teknologi Pemeliharaan Pesawat Udara', jenjang: 'D3' },
    { id_prodi: 26, id_jurusan: 6, id_kampus: 1, nama: 'Teknologi Pertambangan', jenjang: 'D3' },
    { id_prodi: 27, id_jurusan: 3, id_kampus: 1, nama: 'Teknik Sipil', jenjang: 'D3' },
    { id_prodi: 28, id_jurusan: 1, id_kampus: 1, nama: 'Teknik Telekomunikasi', jenjang: 'D3' },
    { id_prodi: 29, id_jurusan: 7, id_kampus: 1, nama: 'Pengembangan Piranti Lunak Situs', jenjang: 'D2' },
    { id_prodi: 30, id_jurusan: 1, id_kampus: 2, nama: 'Teknik Elektronika', jenjang: 'D4' },
    { id_prodi: 31, id_jurusan: 2, id_kampus: 2, nama: 'Teknik Mesin Produksi dan Perawatan', jenjang: 'D4' },
    { id_prodi: 32, id_jurusan: 4, id_kampus: 2, nama: 'Keuangan', jenjang: 'D4' },
    { id_prodi: 33, id_jurusan: 2, id_kampus: 2, nama: 'Teknik Mesin', jenjang: 'D3' },
    { id_prodi: 34, id_jurusan: 4, id_kampus: 2, nama: 'Akuntansi', jenjang: 'D3' },
    { id_prodi: 35, id_jurusan: 7, id_kampus: 2, nama: 'Manajemen Informatika', jenjang: 'D3' },
    { id_prodi: 37, id_jurusan: 2, id_kampus: 3, nama: 'Teknologi Rekayasa Otomotif', jenjang: 'D4' },
    { id_prodi: 38, id_jurusan: 3, id_kampus: 3, nama: 'Teknologi Sipil', jenjang: 'D3' },
    { id_prodi: 39, id_jurusan: 4, id_kampus: 3, nama: 'Akuntansi', jenjang: 'D3' },
    { id_prodi: 40, id_jurusan: 7, id_kampus: 3, nama: 'Teknologi Informasi', jenjang: 'D3' },
    { id_prodi: 41, id_jurusan: 4, id_kampus: 4, nama: 'Akuntansi Manajemen', jenjang: 'D4' },
    { id_prodi: 42, id_jurusan: 2, id_kampus: 4, nama: 'Teknik Otomotif Elektronik', jenjang: 'D4' },
    { id_prodi: 43, id_jurusan: 7, id_kampus: 4, nama: 'Manajemen Informatika', jenjang: 'D3' }
  ];

  for (const p of prodi) {
    await pool.query(
      `INSERT INTO public.m_prodi (id_prodi, id_jurusan, id_kampus, nama_prodi, jenjang) 
       OVERRIDING SYSTEM VALUE
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT ON CONSTRAINT m_prodi_id_kampus_nama_prodi_jenjang_key DO NOTHING`,
      [p.id_prodi, p.id_jurusan, p.id_kampus, p.nama, p.jenjang]
    );
  }
  
  await pool.query("SELECT setval('m_prodi_id_prodi_seq', (SELECT MAX(id_prodi) FROM m_prodi))");
  console.log('Prodi seeded (43 entries)');
};

module.exports = seedProdi;
