const pool = require('../src/config/db');

const seedKriteriaPenilaian = async () => {
  const tahapResult = await pool.query('SELECT id_tahap, urutan, id_program FROM public.m_tahap_penilaian ORDER BY id_program, urutan');
  
  const programMap = {};
  const progRes = await pool.query('SELECT id_program, nama_program FROM public.m_program');
  for (const p of progRes.rows) {
    programMap[p.id_program] = p.nama_program;
  }
  
  const kriteriaData = [
    { id_tahap_urutan: 1, nama: 'Deskripsi Bisnis', deskripsi: 'Bahan baku/sumber, Proses produksi, Mitra bisnis', bobot: 20, status: 1, urutan: 1 },
    { id_tahap_urutan: 1, nama: 'Produksi Barang/Jasa', deskripsi: 'Kreativitas dan inovasi produk/jasa', bobot: 15, status: 1, urutan: 2 },
    { id_tahap_urutan: 1, nama: 'Pemasaran', deskripsi: 'Jangkauan pasar dan strategi pemasaran', bobot: 20, status: 1, urutan: 3 },
    { id_tahap_urutan: 1, nama: 'Pengelolaan Bisnis', deskripsi: 'Kemampuan manajemen operasional', bobot: 10, status: 1, urutan: 4 },
    { id_tahap_urutan: 1, nama: 'Pengembangan Bisnis', deskripsi: 'Visi pertumbuhan dan skalabilitas', bobot: 15, status: 1, urutan: 5 },
    { id_tahap_urutan: 1, nama: 'Keuangan', deskripsi: 'Permodalan, arus kas, laporan keuangan', bobot: 20, status: 1, urutan: 6 },

    { id_tahap_urutan: 2, nama: 'Motivasi Tim', deskripsi: 'Komitmen, kesiapan, dan motivasi tim dalam menjalankan usaha', bobot: 15, status: 1, urutan: 1 },
    { id_tahap_urutan: 2, nama: 'Keunggulan Produk', deskripsi: 'Keunikan, nilai tambah, dan diferensiasi produk dibanding kompetitor', bobot: 20, status: 1, urutan: 2 },
    { id_tahap_urutan: 2, nama: 'Marketable', deskripsi: 'Potensi produk untuk diterima pasar dan peluang komersialisasi', bobot: 25, status: 1, urutan: 3 },
    { id_tahap_urutan: 2, nama: 'Strategi Promosi', deskripsi: 'Kejelasan strategi pemasaran dan cara promosi produk', bobot: 15, status: 1, urutan: 4 },
    { id_tahap_urutan: 2, nama: 'Aspek Keuangan', deskripsi: 'Kelayakan finansial, proyeksi usaha, dan kesiapan modal', bobot: 15, status: 1, urutan: 5 },
    { id_tahap_urutan: 2, nama: 'Presentasi', deskripsi: 'Kemampuan tim menyampaikan ide usaha secara jelas dan meyakinkan', bobot: 10, status: 1, urutan: 6 }
  ];

  for (const prog of progRes.rows) {
    const tahap1 = tahapResult.rows.find(r => r.id_program === prog.id_program && r.urutan === 1);
    const tahap2 = tahapResult.rows.find(r => r.id_program === prog.id_program && r.urutan === 2);
    
    if (!tahap1 || !tahap2) continue;
    
    for (const k of kriteriaData.filter(k => k.id_tahap_urutan === 1)) {
      await pool.query(
        `INSERT INTO public.m_kriteria_penilaian (id_tahap, nama_kriteria, deskripsi, bobot, status, urutan) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [tahap1.id_tahap, k.nama, k.deskripsi, k.bobot, k.status, k.urutan]
      );
    }
    
    for (const k of kriteriaData.filter(k => k.id_tahap_urutan === 2)) {
      await pool.query(
        `INSERT INTO public.m_kriteria_penilaian (id_tahap, nama_kriteria, deskripsi, bobot, status, urutan) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [tahap2.id_tahap, k.nama, k.deskripsi, k.bobot, k.status, k.urutan]
      );
    }
  }
  
  console.log('Kriteria Penilaian seeded (12 per program)');
};

module.exports = seedKriteriaPenilaian;
