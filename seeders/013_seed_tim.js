const pool = require('../src/config/db');

const seedTim = async () => {
  const programResult = await pool.query("SELECT id_program FROM public.m_program WHERE nama_program = 'PMW'");
  if (programResult.rows.length === 0) {
    throw new Error('PMW program not found');
  }
  const id_program_pmw = programResult.rows[0].id_program;

  const kategoriResult = await pool.query('SELECT id_kategori FROM public.m_kategori');
  const kategoriIds = kategoriResult.rows.map(r => r.id_kategori);

  const dosenResult = await pool.query('SELECT id_user FROM public.m_dosen ORDER BY id_user LIMIT 2');
  const dosenIds = dosenResult.rows.map(r => r.id_user);

  const mahasiswaResult = await pool.query(`
    SELECT u.id_user, u.username 
    FROM public.m_user u 
    JOIN public.m_mahasiswa m ON u.id_user = m.id_user 
    WHERE u.username LIKE 'mhs%' 
    ORDER BY u.username 
    LIMIT 8
  `);
  const mahasiswaList = mahasiswaResult.rows;

  const currentYear = new Date().getFullYear();

  for (let t = 0; t < 2; t++) {
    const nama_tim = `Tim ${t + 1}`;
    
    const timResult = await pool.query(
      `INSERT INTO public.t_tim (id_program, nama_tim, status)
       VALUES ($1, $2, 1)
       ON CONFLICT ON CONSTRAINT unique_tim_per_program 
       DO UPDATE SET status = EXCLUDED.status
       RETURNING id_tim`,
      [id_program_pmw, nama_tim]
    );
    const id_tim = timResult.rows[0].id_tim;

    const teamMembers = mahasiswaList.slice(t * 4, t * 4 + 4);
    const ketua = teamMembers[0];
    
    for (let i = 0; i < teamMembers.length; i++) {
      await pool.query(
        `INSERT INTO public.t_anggota_tim (id_tim, id_user, peran, status)
         VALUES ($1, $2, $3, 1)
         ON CONFLICT ON CONSTRAINT t_anggota_tim_pkey 
         DO UPDATE SET peran = EXCLUDED.peran, status = EXCLUDED.status`,
        [id_tim, teamMembers[i].id_user, i === 0 ? 1 : 2]
      );
    }

    const id_kategori = kategoriIds[t % kategoriIds.length];
    
    const existingProposal = await pool.query(
      'SELECT 1 FROM public.t_proposal WHERE id_tim = $1',
      [id_tim]
    );
    
    if (existingProposal.rows.length === 0) {
      await pool.query(
        `INSERT INTO public.t_proposal (id_tim, judul, file_proposal, status, id_program, id_kategori, modal_diajukan, tanggal_submit)
         VALUES ($1, $2, $3, 1, $4, $5, $6, NOW())`,
        [id_tim, `Proposal ${nama_tim}`, `proposal_${id_tim}.pdf`, id_program_pmw, id_kategori, 5000000 + (t * 1000000)]
      );
    }

    const id_dosen = dosenIds[t % dosenIds.length];
    
    await pool.query(
      `INSERT INTO public.t_pengajuan_pembimbing (id_tim, id_program, id_dosen, diajukan_oleh, status, created_at, responded_at)
       VALUES ($1, $2, $3, $4, 1, NOW(), NOW())
       ON CONFLICT ON CONSTRAINT uq_pengajuan_pembimbing_id_tim 
       DO UPDATE SET id_dosen = EXCLUDED.id_dosen, status = EXCLUDED.status`,
      [id_tim, id_program_pmw, id_dosen, ketua.id_user]
    );

    for (const member of teamMembers) {
      await pool.query(
        `INSERT INTO public.t_peserta_program (id_user, id_program, tahun, status_lolos, id_tim, status_peserta)
         VALUES ($1, $2, $3, 0, $4, 1)
         ON CONFLICT ON CONSTRAINT t_peserta_program_pkey 
         DO UPDATE SET status_lolos = EXCLUDED.status_lolos, id_tim = EXCLUDED.id_tim`,
        [member.id_user, id_program_pmw, currentYear, id_tim]
      );
    }
  }

  console.log('2 Tim PMW (4 members each) with proposals, dosen pembimbing, and peserta program seeded');
};

module.exports = seedTim;
