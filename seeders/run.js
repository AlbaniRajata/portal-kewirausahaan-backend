require('./env-loader');
const seedRoles = require('./001_seed_roles');
const seedJurusanKampus = require('./002_seed_jurusan_kampus');
const seedProdi = require('./003_seed_prodi');
const seedProgram = require('./004_seed_program');
const seedKategori = require('./005_seed_kategori');
const seedAdmin = require('./006_seed_admin');
const seedMahasiswa = require('./007_seed_mahasiswa');
const seedDosen = require('./008_seed_dosen');
const seedReviewer = require('./009_seed_reviewer');
const seedJuri = require('./010_seed_juri');
const seedTahapPenilaian = require('./011_seed_tahap_penilaian');
const seedKriteriaPenilaian = require('./012_seed_kriteria_penilaian');
const seedTim = require('./013_seed_tim');

const runSeeders = async () => {
  try {
    console.log('🔄 Starting seeders...\n');
    
    await seedRoles();
    await seedJurusanKampus();
    await seedProdi();
    await seedProgram();
    await seedKategori();
    await seedTahapPenilaian();
    await seedKriteriaPenilaian();
    await seedAdmin();
    await seedMahasiswa();
    await seedDosen();
    await seedReviewer();
    await seedJuri();
    await seedTim();
    
    console.log('\n✅ All seeders completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeder error:', err.message);
    process.exit(1);
  }
};

runSeeders();
