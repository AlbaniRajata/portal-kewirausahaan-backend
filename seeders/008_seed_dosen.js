const bcrypt = require('bcrypt');
const pool = require('../src/config/db');
const teams = require('./tim_data.json');

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
         SET id_role = $1, password_hash = $4, nama_lengkap = $5, is_active = true, email_verified_at = NOW()
         WHERE username = $2 OR email = $3
         RETURNING id_user`,
        [id_role, username, email, password_hash, nama_lengkap]
      );
      return result;
    }
    throw error;
  }
};

const seedDosen = async () => {
  const password_hash = await bcrypt.hash('password123', 10);
  
  const roleResult = await pool.query("SELECT id_role FROM public.m_role WHERE nama_role = 'Dosen'");
  const dosenRoleId = roleResult.rows[0].id_role;

  const prodiResult = await pool.query('SELECT id_prodi FROM public.m_prodi ORDER BY id_prodi LIMIT 1');
  const defaultProdiId = prodiResult.rows[0].id_prodi;

  const dosenSet = new Set();
  for (const team of teams) {
    if (team.dosenPembimbing) {
      dosenSet.add(team.dosenPembimbing);
    }
  }

  const dosenList = [...dosenSet];
  console.log(`Total dosen pembimbing unik dari JSON: ${dosenList.length}`);

  let seededCount = 0;

  for (let i = 0; i < dosenList.length; i++) {
    const namaLengkap = dosenList[i];
    const idx = i + 1;
    const nip = `NIP${String(idx).padStart(6, '0')}`;
    const username = `dosen${idx}`;
    const email = `dosen${idx}@polinema.ac.id`;

    try {
      const userResult = await upsertUser({
        id_role: dosenRoleId,
        username: username,
        email: email,
        password_hash: password_hash,
        nama_lengkap: namaLengkap
      });

      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id_user;
        
        await pool.query(
          `INSERT INTO public.m_dosen 
           (id_user, nip, id_prodi, bidang_keahlian, status_verifikasi) 
           VALUES ($1, $2, $3, $4, 1) 
           ON CONFLICT (id_user) DO UPDATE SET 
             nip = EXCLUDED.nip,
             status_verifikasi = 1`,
          [userId, nip, defaultProdiId, `Pembimbing PMW`]
        );
        seededCount++;
      }
    } catch (error) {
      console.error(`Error seeding dosen "${namaLengkap}": ${error.message}`);
    }
  }

  console.log(`${seededCount} Dosen pembimbing seeded dari JSON (password: password123)`);
};

module.exports = seedDosen;
