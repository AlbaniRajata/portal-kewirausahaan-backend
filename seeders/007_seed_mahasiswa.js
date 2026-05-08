const bcrypt = require('bcrypt');
const pool = require('../src/config/db');
const teams = require('./tim_data.json');

const upsertUser = async ({ id_role, username, email, password_hash, nama_lengkap, no_hp }) => {
  try {
    const result = await pool.query(
      `INSERT INTO public.m_user 
       (id_role, username, email, password_hash, nama_lengkap, no_hp, is_active, email_verified_at) 
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW()) 
       RETURNING id_user`,
      [id_role, username, email, password_hash, nama_lengkap, no_hp]
    );
    return result;
  } catch (error) {
    if (error.code === '23505') {
      const result = await pool.query(
        `UPDATE public.m_user 
         SET id_role = $1, password_hash = $4, nama_lengkap = $5, no_hp = $6, is_active = true, email_verified_at = NOW()
         WHERE username = $2 OR email = $3
         RETURNING id_user`,
        [id_role, username, email, password_hash, nama_lengkap, no_hp]
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

  const mahasiswaMap = new Map();
  for (const team of teams) {
    for (const member of team.anggota) {
      if (!mahasiswaMap.has(member.nim)) {
        mahasiswaMap.set(member.nim, member);
      }
    }
  }

  const allMahasiswa = [...mahasiswaMap.values()];
  console.log(`Total mahasiswa unik dari JSON: ${allMahasiswa.length}`);

  let seededCount = 0;
  let errorCount = 0;

  for (const mhs of allMahasiswa) {
    try {
      const username = mhs.nim.toLowerCase();
      const email = `${mhs.nim.toLowerCase()}@student.polinema.ac.id`;
      
      const userResult = await upsertUser({
        id_role: mhsRoleId,
        username: username,
        email: email,
        password_hash: password_hash,
        nama_lengkap: mhs.nama,
        no_hp: mhs.noHp
      });

      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id_user;
        
        await pool.query(
          `INSERT INTO public.m_mahasiswa 
           (id_user, nim, id_prodi, tahun_masuk, status_verifikasi, status_mahasiswa) 
           VALUES ($1, $2, $3, $4, 1, 1) 
           ON CONFLICT (id_user) DO UPDATE SET 
             nim = EXCLUDED.nim,
             id_prodi = EXCLUDED.id_prodi,
             tahun_masuk = EXCLUDED.tahun_masuk,
             status_verifikasi = 1, 
             status_mahasiswa = 1`,
          [userId, mhs.nim, mhs.id_prodi, mhs.tahun_masuk]
        );
        seededCount++;
      }
    } catch (error) {
      console.error(`Error seeding ${mhs.nama} (${mhs.nim}): ${error.message}`);
      errorCount++;
    }
  }

  console.log(`${seededCount} Mahasiswa seeded dari JSON (password: password123)`);
  if (errorCount > 0) {
    console.log(`⚠ ${errorCount} mahasiswa gagal di-seed`);
  }
};

module.exports = seedMahasiswa;
