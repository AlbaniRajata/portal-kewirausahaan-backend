const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

const seedDosen = async () => {
  const password_hash = await bcrypt.hash('password123', 10);
  
  const roleResult = await pool.query("SELECT id_role FROM public.m_role WHERE nama_role = 'Dosen'");
  const dosenRoleId = roleResult.rows[0].id_role;

  const prodiResult = await pool.query('SELECT id_prodi FROM public.m_prodi ORDER BY id_prodi');
  const prodiIds = prodiResult.rows.map(r => r.id_prodi);

  for (let i = 1; i <= 10; i++) {
    const nip = `NIP${String(i).padStart(6, '0')}`;
    const email = `dosen${i}@mail.com`;
    const username = `dosen${i}`;
    const nama_lengkap = `Dosen ${i}`;
    const id_prodi = prodiIds[(i - 1) % prodiIds.length];

    const userResult = await pool.query(
      `INSERT INTO public.m_user 
       (id_role, username, email, password_hash, nama_lengkap, is_active, email_verified_at) 
       VALUES ($1, $2, $3, $4, $5, true, NOW()) 
       ON CONFLICT (username) DO UPDATE SET 
         password_hash = EXCLUDED.password_hash, 
         is_active = true, 
         email_verified_at = NOW()
       RETURNING id_user`,
      [dosenRoleId, username, email, password_hash, nama_lengkap]
    );

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id_user;
      
      await pool.query(
        `INSERT INTO public.m_dosen 
         (id_user, nip, id_prodi, bidang_keahlian, status_verifikasi) 
         VALUES ($1, $2, $3, $4, 1) 
         ON CONFLICT (id_user) DO UPDATE SET 
           status_verifikasi = 1`,
        [userId, nip, id_prodi, `Bidang keahlian dosen ${i}`]
      );
    }
  }
  console.log('10 Dosen seeded (dosen1@mail.com - dosen10@mail.com)');
};

module.exports = seedDosen;
