const pool = require('../src/config/db');

const seedRoles = async () => {
  const roles = [
    { id: 1, nama_role: 'Mahasiswa', keterangan: 'Mahasiswa' },
    { id: 2, nama_role: 'Admin', keterangan: 'Administrator' },
    { id: 3, nama_role: 'Dosen', keterangan: 'Dosen pembimbing' },
    { id: 4, nama_role: 'Reviewer', keterangan: 'Reviewer Internal' },
    { id: 5, nama_role: 'Juri', keterangan: 'Juri Eksternal' },
    { id: 6, nama_role: 'Super Admin', keterangan: 'Super Administrator' }
  ];

  for (const role of roles) {
    await pool.query(
      `INSERT INTO public.m_role (id_role, nama_role, keterangan) 
       OVERRIDING SYSTEM VALUE
       VALUES ($1, $2, $3) 
       ON CONFLICT (id_role) DO UPDATE SET nama_role = $2, keterangan = $3`,
      [role.id, role.nama_role, role.keterangan]
    );
  }
  
  // Reset sequence
  await pool.query("SELECT setval('m_role_id_role_seq', (SELECT MAX(id_role) FROM m_role))");
  console.log('✓ Roles seeded (6 entries)');
};

module.exports = seedRoles;
