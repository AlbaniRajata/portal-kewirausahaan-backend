require('./env-loader');
const pool = require('../src/config/db');

const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting database (disabling foreign key checks)...\n');
    
    // Disable foreign key checks temporarily
    await pool.query('SET session_replication_role = replica;');
    
    // Truncate all tables in correct order (child first, then parent)
    const tables = [
      't_penilaian_reviewer_detail',
      't_penilaian_reviewer',
      't_penilaian_juri_detail',
      't_penilaian_juri',
      't_distribusi_reviewer',
      't_distribusi_juri',
      't_bimbingan',
      't_proposal',
      't_peserta_program',
      't_pengajuan_pembimbing',
      't_luaran_tim',
      't_anggota_tim',
      't_tim',
      'm_kriteria_penilaian',
      'm_tahap_penilaian',
      'm_luaran',
      't_refresh_token',
      't_email_verification',
      't_berita',
      't_admin_program',
      'm_reviewer',
      'm_juri',
      'm_mahasiswa',
      'm_dosen',
      'm_user',
      'm_kategori',
      'm_prodi',
      'm_program',
      'm_role',
      'm_kampus',
      'm_jurusan'
    ];

    for (const table of tables) {
      try {
        await pool.query(`TRUNCATE TABLE public."${table}" RESTART IDENTITY CASCADE;`);
        console.log(`✓ ${table} truncated`);
      } catch (err) {
        console.log(`⚠ ${table}: ${err.message}`);
      }
    }
    
    // Re-enable foreign key checks
    await pool.query('SET session_replication_role = DEFAULT;');
    
    console.log('\n✅ Database reset completed!\n');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Reset error:', err.message);
    process.exit(1);
  }
};

resetDatabase();
