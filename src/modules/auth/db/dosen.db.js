const createDosenDb = async (
  { id_user, nip, id_prodi, bidang_keahlian },
  client
) => {
  const q = `
    INSERT INTO m_dosen
    (id_user, nip, id_prodi, bidang_keahlian, status_verifikasi)
    VALUES ($1,$2,$3,$4,0)
  `;
  await client.query(q, [
    id_user,
    nip,
    id_prodi,
    bidang_keahlian,
  ]);
};

module.exports = { createDosenDb };
