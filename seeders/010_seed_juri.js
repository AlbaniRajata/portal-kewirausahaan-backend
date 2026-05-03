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

const seedJuri = async () => {
  const password_hash = await bcrypt.hash('password123', 10);
  
  const roleResult = await pool.query("SELECT id_role FROM public.m_role WHERE nama_role = 'Juri'");
  const juriRoleId = roleResult.rows[0].id_role;

  for (let i = 1; i <= 3; i++) {
    const email = `juri${i}@mail.com`;
    const username = `juri${i}`;
    const nama_lengkap = `Juri ${i}`;

    const userResult = await upsertUser({
      id_role: juriRoleId,
      username: username,
      email: email,
      password_hash: password_hash,
      nama_lengkap: nama_lengkap
    });

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id_user;
      
      await pool.query(
        `INSERT INTO public.m_juri 
         (id_user, institusi, bidang_keahlian) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (id_user) DO NOTHING`,
        [userId, `Institusi Juri ${i}`, `Bidang keahlian juri ${i}`]
      );
    }
  }
  console.log('3 Juri seeded');
};

module.exports = seedJuri;
