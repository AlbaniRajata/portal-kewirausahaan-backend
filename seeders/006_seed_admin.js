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

const seedAdmin = async () => {
  const password_hash = await bcrypt.hash('password123', 10);
  
  const roleResult = await pool.query("SELECT id_role FROM public.m_role WHERE nama_role = 'Admin'");
  const adminRoleId = roleResult.rows[0].id_role;

  const admins = [
    { 
      username: 'admin.pmw', 
      email: 'admin.pmw@mail.com', 
      nama_lengkap: 'Admin PMW',
      program: 'PMW'
    },
    { 
      username: 'admin.inbis', 
      email: 'admin.inbis@mail.com', 
      nama_lengkap: 'Admin INBIS',
      program: 'INBIS'
    }
  ];

  for (const admin of admins) {
    const userResult = await upsertUser({
      id_role: adminRoleId,
      username: admin.username,
      email: admin.email,
      password_hash: password_hash,
      nama_lengkap: admin.nama_lengkap
    });

    const userId = userResult.rows[0].id_user;
    const programResult = await pool.query(
      "SELECT id_program FROM public.m_program WHERE nama_program = $1",
      [admin.program]
    );
    
    if (programResult.rows.length > 0) {
      await pool.query(
        `INSERT INTO public.t_admin_program (id_user, id_program, is_active) 
         VALUES ($1, $2, true) 
         ON CONFLICT DO NOTHING`,
        [userId, programResult.rows[0].id_program]
      );
    }
  }
  console.log('Admin users seeded (admin.pmw & admin.inbis)');
};

module.exports = seedAdmin;
