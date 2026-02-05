const createMahasiswaDb = async (
  { id_user, nim, id_prodi, tahun_masuk, foto_ktm },
  client
) => {
  const q = `
    INSERT INTO m_mahasiswa
    (id_user, nim, id_prodi, tahun_masuk, foto_ktm, status_verifikasi)
    VALUES ($1,$2,$3,$4,$5,0)
  `;
  await client.query(q, [
    id_user,
    nim,
    id_prodi,
    tahun_masuk,
    foto_ktm,
  ]);
};

module.exports = { createMahasiswaDb };
