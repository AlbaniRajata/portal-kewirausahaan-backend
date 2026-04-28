const pool = require('../src/config/db');

const seedProgram = async () => {
  const programs = [
    { 
      nama_program: 'PMW', 
      keterangan: 'Program Mahasiswa Wirausaha',
      pendaftaran_mulai: '2026-01-18 23:00:00',
      pendaftaran_selesai: '2026-04-30 05:59:00'
    },
    { 
      nama_program: 'INBIS', 
      keterangan: 'Inkubator Bisnis',
      pendaftaran_mulai: '2026-03-28 05:41:00',
      pendaftaran_selesai: '2026-04-04 05:41:00'
    }
  ];

  for (const prog of programs) {
    await pool.query(
      `INSERT INTO public.m_program (nama_program, keterangan, pendaftaran_mulai, pendaftaran_selesai) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (nama_program) DO UPDATE SET 
         keterangan = $2, 
         pendaftaran_mulai = $3, 
         pendaftaran_selesai = $4`,
      [prog.nama_program, prog.keterangan, prog.pendaftaran_mulai, prog.pendaftaran_selesai]
    );
  }
  console.log('Programs seeded (PMW & INBIS)');
};

module.exports = seedProgram;
