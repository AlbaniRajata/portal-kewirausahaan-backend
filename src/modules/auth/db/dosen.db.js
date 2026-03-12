const createDosenDb = async ({ id_user, nip, id_prodi, bidang_keahlian }, client) => {
  const q = `
    INSERT INTO m_dosen (id_user, nip, id_prodi, bidang_keahlian, status_verifikasi)
    VALUES ($1, $2, $3, $4, 0)
  `;
  await client.query(q, [id_user, nip, id_prodi, bidang_keahlian]);
};

const deleteRejectedDosenDb = async ({ email, username, nip }, client) => {
  const { rows } = await client.query(
    `SELECT u.id_user
     FROM m_user u
     JOIN m_dosen d ON d.id_user = u.id_user
     WHERE d.status_verifikasi = 2
       AND (u.email = $1 OR u.username = $2 OR d.nip = $3)`,
    [email, username, nip]
  );

  for (const row of rows) {
    const id = row.id_user;
    await client.query(`DELETE FROM t_email_verification WHERE id_user = $1`, [id]);
    await client.query(`DELETE FROM t_refresh_token WHERE id_user = $1`, [id]);
    await client.query(`DELETE FROM m_dosen WHERE id_user = $1`, [id]);
    await client.query(`DELETE FROM m_user WHERE id_user = $1`, [id]);
  }
};

module.exports = { createDosenDb, deleteRejectedDosenDb };