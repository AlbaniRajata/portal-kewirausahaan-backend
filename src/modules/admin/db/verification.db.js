const pool = require("../../../config/db");

const getPendingMahasiswaDb = async (filters = {}) => {
  const { page, limit } = filters;
  const offset = (page - 1) * limit;
  const conditions = ["u.id_role = 1"];
  const params = [];
  let idx = 1;

  if (filters.status_verifikasi !== undefined) {
    conditions.push(`m.status_verifikasi = $${idx++}`);
    params.push(filters.status_verifikasi);
  }

  if (filters.email_verified !== undefined) {
    conditions.push(filters.email_verified
      ? `u.email_verified_at IS NOT NULL`
      : `u.email_verified_at IS NULL`
    );
  }

  if (filters.id_prodi) {
    conditions.push(`m.id_prodi = $${idx++}`);
    params.push(filters.id_prodi);
  }

  if (filters.tanggal_dari) {
    conditions.push(`u.created_at >= $${idx++}`);
    params.push(filters.tanggal_dari);
  }

  if (filters.tanggal_sampai) {
    conditions.push(`u.created_at <= $${idx++}`);
    params.push(filters.tanggal_sampai);
  }

  let q = `
    SELECT
      u.id_user,
      u.nama_lengkap,
      u.username,
      u.email,
      m.nim,
      p.nama_prodi,
      p.jenjang,
      m.tahun_masuk,
      m.foto_ktm,
      u.email_verified_at,
      u.is_active,
      m.status_verifikasi,
      m.catatan,
      u.created_at
    FROM m_user u
    JOIN m_mahasiswa m ON m.id_user = u.id_user
    LEFT JOIN m_prodi p ON p.id_prodi = m.id_prodi
    WHERE ${conditions.join(" AND ")}
    ORDER BY u.created_at DESC
  `;

  if (page && limit) {
    q += ` LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, offset);
  }

  const { rows } = await pool.query(q, params);
  return rows;
};

const getPendingMahasiswaCountDb = async (filters = {}) => {
  const conditions = ["u.id_role = 1"];
  const params = [];
  let idx = 1;

  if (filters.status_verifikasi !== undefined) {
    conditions.push(`m.status_verifikasi = $${idx++}`);
    params.push(filters.status_verifikasi);
  }

  if (filters.email_verified !== undefined) {
    conditions.push(filters.email_verified
      ? `u.email_verified_at IS NOT NULL`
      : `u.email_verified_at IS NULL`
    );
  }

  if (filters.id_prodi) {
    conditions.push(`m.id_prodi = $${idx++}`);
    params.push(filters.id_prodi);
  }

  if (filters.tanggal_dari) {
    conditions.push(`u.created_at >= $${idx++}`);
    params.push(filters.tanggal_dari);
  }

  if (filters.tanggal_sampai) {
    conditions.push(`u.created_at <= $${idx++}`);
    params.push(filters.tanggal_sampai);
  }

  const q = `SELECT COUNT(*) as total FROM m_user u JOIN m_mahasiswa m ON m.id_user = u.id_user WHERE ${conditions.join(" AND ")}`;
  const { rows } = await pool.query(q, params);
  return parseInt(rows[0].total);
};

const getDetailMahasiswaDb = async (id_user) => {
  const q = `
    SELECT
      u.id_user,
      u.nama_lengkap,
      u.username,
      u.email,
      u.no_hp,
      u.alamat,
      u.foto,
      m.nim,
      m.id_prodi,
      p.nama_prodi,
      p.jenjang,
      j.nama_jurusan,
      k.nama_kampus,
      m.tahun_masuk,
      m.foto_ktm,
      m.status_verifikasi,
      m.status_mahasiswa,
      m.catatan,
      u.email_verified_at,
      u.is_active,
      u.created_at
    FROM m_user u
    JOIN m_mahasiswa m ON m.id_user = u.id_user
    LEFT JOIN m_prodi p ON p.id_prodi = m.id_prodi
    LEFT JOIN m_jurusan j ON j.id_jurusan = p.id_jurusan
    LEFT JOIN m_kampus k ON k.id_kampus = p.id_kampus
    WHERE u.id_user = $1
  `;
  const { rows } = await pool.query(q, [id_user]);
  return rows[0] || null;
};

const approveMahasiswaDb = async (id_user) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: check } = await client.query(
      `SELECT u.email_verified_at, m.status_verifikasi
       FROM m_user u JOIN m_mahasiswa m ON m.id_user = u.id_user
       WHERE u.id_user = $1`,
      [id_user]
    );

    if (check.length === 0) { await client.query("ROLLBACK"); return null; }
    if (!check[0].email_verified_at) { await client.query("ROLLBACK"); return { error: "EMAIL_NOT_VERIFIED" }; }
    if (check[0].status_verifikasi !== 0) {
      await client.query("ROLLBACK");
      return { error: "ALREADY_VERIFIED", status_verifikasi: check[0].status_verifikasi };
    }

    await client.query(`UPDATE m_user SET is_active = TRUE WHERE id_user = $1`, [id_user]);
    await client.query(`UPDATE m_mahasiswa SET status_verifikasi = 1, catatan = NULL WHERE id_user = $1`, [id_user]);

    const { rows } = await client.query(
      `SELECT u.id_user, u.username, u.email, u.is_active, m.nim, m.status_verifikasi
       FROM m_user u JOIN m_mahasiswa m ON m.id_user = u.id_user WHERE u.id_user = $1`,
      [id_user]
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const rejectMahasiswaDb = async (id_user, catatan) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: check } = await client.query(
      `SELECT status_verifikasi FROM m_mahasiswa WHERE id_user = $1`,
      [id_user]
    );

    if (check.length === 0) { await client.query("ROLLBACK"); return null; }
    if (check[0].status_verifikasi !== 0) {
      await client.query("ROLLBACK");
      return { error: "ALREADY_PROCESSED", status_verifikasi: check[0].status_verifikasi };
    }

    await client.query(
      `UPDATE m_mahasiswa SET status_verifikasi = 2, catatan = $2 WHERE id_user = $1`,
      [id_user, catatan]
    );

    const { rows } = await client.query(
      `SELECT u.id_user, u.username, u.email, m.nim, p.nama_prodi,
              m.tahun_masuk, m.status_verifikasi, m.catatan
       FROM m_user u
       JOIN m_mahasiswa m ON m.id_user = u.id_user
       LEFT JOIN m_prodi p ON p.id_prodi = m.id_prodi
       WHERE u.id_user = $1`,
      [id_user]
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getPendingMahasiswaDb,
  getPendingMahasiswaCountDb,
  getDetailMahasiswaDb,
  approveMahasiswaDb,
  rejectMahasiswaDb,
};