const pool = require('../src/config/db');

const seedJurusanKampus = async () => {
  const jurusan = [
    { id: 1, nama: 'Teknik Elektro' },
    { id: 2, nama: 'Teknik Mesin' },
    { id: 3, nama: 'Teknik Sipil' },
    { id: 4, nama: 'Akuntansi' },
    { id: 5, nama: 'Administrasi Niaga' },
    { id: 6, nama: 'Teknik Kimia' },
    { id: 7, nama: 'Teknologi Informasi' }
  ];

  for (const j of jurusan) {
    await pool.query(
      `INSERT INTO public.m_jurusan (id_jurusan, nama_jurusan) 
       OVERRIDING SYSTEM VALUE
       VALUES ($1, $2) 
       ON CONFLICT (id_jurusan) DO UPDATE SET nama_jurusan = $2`,
      [j.id, j.nama]
    );
  }
  await pool.query("SELECT setval('m_jurusan_id_jurusan_seq', (SELECT MAX(id_jurusan) FROM m_jurusan))");
  console.log('Jurusan seeded (7 entries)');

  const kampus = [
    { id: 1, nama: 'Kampus Pusat' },
    { id: 2, nama: 'PSDKU Kota Kediri' },
    { id: 3, nama: 'PSDKU Kabupaten Lumajang' },
    { id: 4, nama: 'PSDKU Kabupaten Pamekasan' }
  ];

  for (const k of kampus) {
    await pool.query(
      `INSERT INTO public.m_kampus (id_kampus, nama_kampus) 
       OVERRIDING SYSTEM VALUE
       VALUES ($1, $2) 
       ON CONFLICT (id_kampus) DO UPDATE SET nama_kampus = $2`,
      [k.id, k.nama]
    );
  }
  await pool.query("SELECT setval('m_kampus_id_kampus_seq', (SELECT MAX(id_kampus) FROM m_kampus))");
  console.log('Kampus seeded (4 entries)');
};

module.exports = seedJurusanKampus;
