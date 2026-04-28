const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

const seedReviewer = async () => {
  const password_hash = await bcrypt.hash('password123', 10);
  
  const roleResult = await pool.query("SELECT id_role FROM public.m_role WHERE nama_role = 'Reviewer'");
  const reviewerRoleId = roleResult.rows[0].id_role;

  for (let i = 1; i <= 5; i++) {
    const email = `reviewer${i}@mail.com`;
    const username = `reviewer${i}`;
    const nama_lengkap = `Reviewer ${i}`;

    const userResult = await pool.query(
      `INSERT INTO public.m_user 
       (id_role, username, email, password_hash, nama_lengkap, is_active, email_verified_at) 
       VALUES ($1, $2, $3, $4, $5, true, NOW()) 
       ON CONFLICT (username) DO UPDATE SET 
         password_hash = EXCLUDED.password_hash, 
         is_active = true, 
         email_verified_at = NOW()
       RETURNING id_user`,
      [reviewerRoleId, username, email, password_hash, nama_lengkap]
    );

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id_user;
      
      await pool.query(
        `INSERT INTO public.m_reviewer 
         (id_user, institusi, bidang_keahlian) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (id_user) DO NOTHING`,
        [userId, `Institusi Reviewer ${i}`, `Bidang keahlian reviewer ${i}`]
      );
    }
  }
  console.log('5 Reviewer seeded');
};

module.exports = seedReviewer;
