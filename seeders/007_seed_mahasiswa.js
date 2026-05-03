const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

const upsertUser = async ({ id_role, username, email, password_hash, nama_lengkap }) => {
  try {
    const result = await pool.query(
      `INSERT INTO public.m_user 
       (id_role, username, email, password_hash, nama_lengkap, is_active, email_verified_at) 
       VALUES ($1, $2, $3, $4, $5, true, NOW()) 
       RETURNING id_user`,
      [id_role, username, email, password_hash, nama_lengkap]
    );
    return result;
  } catch (error) {
    if (error.code === '23505') {
      const result = await pool.query(
        `UPDATE public.m_user 
         SET id_role = $1, username = $2, email = $3, password_hash = $4, nama_lengkap = $5, is_active = true, email_verified_at = NOW()
         WHERE username = $2 OR email = $3
         RETURNING id_user`,
        [id_role, username, email, password_hash, nama_lengkap]
      );
      return result;
    }
    throw error;
  }
};

const seedMahasiswa = async () => {
  const password_hash = await bcrypt.hash('password123', 10);
  
  const roleResult = await pool.query("SELECT id_role FROM public.m_role WHERE nama_role = 'Mahasiswa'");
  const mhsRoleId = roleResult.rows[0].id_role;

  const prodiResult = await pool.query('SELECT id_prodi FROM public.m_prodi ORDER BY id_prodi');
  const prodiIds = prodiResult.rows.map(r => r.id_prodi);

  const programResult = await pool.query('SELECT id_program FROM public.m_program');
  const programIds = programResult.rows.map(r => r.id_program);

  for (let i = 1; i <= 40; i++) {
    const nim = `NIM${String(i).padStart(6, '0')}`;
    const email = `mhs${i}@mail.com`;
    const username = `mhs${i}`;
    const nama_lengkap = `Mahasiswa ${i}`;
    const id_prodi = prodiIds[(i - 1) % prodiIds.length];
    const tahun_masuk = 2023 + (i % 4);

    const userResult = await upsertUser({
      id_role: mhsRoleId,
      username: username,
      email: email,
      password_hash: password_hash,
      nama_lengkap: nama_lengkap
    });

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id_user;
      
      await pool.query(
        `INSERT INTO public.m_mahasiswa 
         (id_user, nim, id_prodi, tahun_masuk, status_verifikasi, status_mahasiswa) 
         VALUES ($1, $2, $3, $4, 1, 1) 
         ON CONFLICT (id_user) DO UPDATE SET 
           status_verifikasi = 1, 
           status_mahasiswa = 1`,
        [userId, nim, id_prodi, tahun_masuk]
      );
    }
  }
  console.log('40 Mahasiswa seeded (mhs1@mail.com - mhs40@mail.com)');
};

module.exports = seedMahasiswa;
