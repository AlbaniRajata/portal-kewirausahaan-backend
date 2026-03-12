const createMahasiswaDb = async ({ id_user, nim, id_prodi, tahun_masuk, foto_ktm }, client) => {
  const q = `
    INSERT INTO m_mahasiswa (id_user, nim, id_prodi, tahun_masuk, foto_ktm, status_verifikasi)
    VALUES ($1, $2, $3, $4, $5, 0)
  `;
  await client.query(q, [id_user, nim, id_prodi, tahun_masuk, foto_ktm]);
};

const deleteRejectedMahasiswaDb = async ({ email, username, nim }, client) => {
  const { rows } = await client.query(
    `SELECT u.id_user
     FROM m_user u
     JOIN m_mahasiswa m ON m.id_user = u.id_user
     WHERE m.status_verifikasi = 2
       AND (u.email = $1 OR u.username = $2 OR m.nim = $3)`,
    [email, username, nim]
  );

  for (const row of rows) {
    const id = row.id_user;
    await client.query(`DELETE FROM t_email_verification WHERE id_user = $1`, [id]);
    await client.query(`DELETE FROM t_refresh_token WHERE id_user = $1`, [id]);
    await client.query(`DELETE FROM m_mahasiswa WHERE id_user = $1`, [id]);
    await client.query(`DELETE FROM m_user WHERE id_user = $1`, [id]);
  }
};

module.exports = { createMahasiswaDb, deleteRejectedMahasiswaDb };