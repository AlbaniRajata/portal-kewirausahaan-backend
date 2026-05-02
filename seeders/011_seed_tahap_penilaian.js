const pool = require('../src/config/db');

const seedTahapPenilaian = async () => {
  const programs = await pool.query('SELECT id_program, nama_program FROM public.m_program');
  
  for (const prog of programs.rows) {
    const tahap1 = {
      nama_tahap: 'Tahap 1 - Desk Evaluasi',
      urutan: 1,
      penilaian_mulai: '2026-05-01 00:00:00',
      penilaian_selesai: '2026-05-15 23:59:59',
      status: 1,
      id_program: prog.id_program
    };
    
    const tahap2 = {
      nama_tahap: 'Tahap 2 - Wawancara',
      urutan: 2,
      penilaian_mulai: '2026-05-16 00:00:00',
      penilaian_selesai: '2026-05-31 23:59:59',
      status: 1,
      id_program: prog.id_program
    };

    for (const tahap of [tahap1, tahap2]) {
      await pool.query(
        `INSERT INTO public.m_tahap_penilaian 
         (nama_tahap, urutan, penilaian_mulai, penilaian_selesai, status, id_program) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT ON CONSTRAINT unique_tahap_per_program DO NOTHING`,
        [tahap.nama_tahap, tahap.urutan, tahap.penilaian_mulai, tahap.penilaian_selesai, tahap.status, tahap.id_program]
      );
    }
  }
  console.log('Tahap Penilaian seeded (2 per program)');
};

module.exports = seedTahapPenilaian;
