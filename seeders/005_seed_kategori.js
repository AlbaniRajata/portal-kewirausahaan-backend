const pool = require('../src/config/db');

const seedKategori = async () => {
  const kategori = [
    { nama_kategori: 'Teknologi Pangan', keterangan: 'Bidang teknologi pangan dan agribisnis' },
    { nama_kategori: 'Desain Kreatif', keterangan: 'Bidang desain dan kreatif industri' },
    { nama_kategori: 'Jasa dan Dagang', keterangan: 'Bidang jasa dan perdagangan' },
    { nama_kategori: 'Technopreneur', keterangan: 'Bidang teknologi dan inovasi digital' }
  ];

  for (const kat of kategori) {
    await pool.query(
      `INSERT INTO public.m_kategori (nama_kategori, keterangan) 
       VALUES ($1, $2) 
       ON CONFLICT (nama_kategori) DO NOTHING`,
      [kat.nama_kategori, kat.keterangan]
    );
  }
  console.log('Kategori seeded (4 entries)');
};

module.exports = seedKategori;
