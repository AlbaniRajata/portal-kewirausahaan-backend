const pool = require("../../../config/db");
const { hashPassword } = require("../../../helpers/password.helper");
const { ROLE } = require("../../../constants/role");

const getMahasiswaListDb = async (filters = {}) => {
  const { is_active, id_prodi, id_jurusan, search, page, limit } = filters;
  const values = [];
  let idx = 1;
  const offset = (page - 1) * limit;

  let q = `
    SELECT
      u.id_user, u.username, u.email, u.nama_lengkap, u.no_hp, u.alamat,
      u.is_active, u.email_verified_at, u.created_at,
      m.nim, m.tahun_masuk, m.status_verifikasi, m.status_mahasiswa, m.catatan,
      p.id_prodi, p.nama_prodi, p.jenjang,
      j.id_jurusan, j.nama_jurusan,
      k.id_kampus, k.nama_kampus
    FROM m_user u
    JOIN m_mahasiswa m ON m.id_user = u.id_user
    JOIN m_prodi p ON p.id_prodi = m.id_prodi
    JOIN m_jurusan j ON j.id_jurusan = p.id_jurusan
    JOIN m_kampus k ON k.id_kampus = p.id_kampus
    WHERE 1=1
  `;

  if (is_active !== undefined && is_active !== null) { q += ` AND u.is_active = $${idx++}`; values.push(is_active); }
  if (id_prodi) { q += ` AND m.id_prodi = $${idx++}`; values.push(id_prodi); }
  if (id_jurusan) { q += ` AND j.id_jurusan = $${idx++}`; values.push(id_jurusan); }
  if (search) {
    q += ` AND (u.username ILIKE $${idx} OR u.email ILIKE $${idx} OR u.nama_lengkap ILIKE $${idx} OR m.nim ILIKE $${idx})`;
    values.push(`%${search}%`); idx++;
  }
  q += ` ORDER BY u.created_at DESC`;
  if (page && limit) {
    q += ` LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
  }
  const { rows } = await pool.query(q, values);
  return rows;
};

const getMahasiswaCountDb = async (filters = {}) => {
  const { is_active, id_prodi, id_jurusan, search } = filters;
  const values = [];
  let idx = 1;

  let q = `SELECT COUNT(*) as total FROM m_user u JOIN m_mahasiswa m ON m.id_user = u.id_user JOIN m_prodi p ON p.id_prodi = m.id_prodi JOIN m_jurusan j ON j.id_jurusan = p.id_jurusan WHERE 1=1`;

  if (is_active !== undefined && is_active !== null) { q += ` AND u.is_active = $${idx++}`; values.push(is_active); }
  if (id_prodi) { q += ` AND m.id_prodi = $${idx++}`; values.push(id_prodi); }
  if (id_jurusan) { q += ` AND j.id_jurusan = $${idx++}`; values.push(id_jurusan); }
  if (search) {
    q += ` AND (u.username ILIKE $${idx} OR u.email ILIKE $${idx} OR u.nama_lengkap ILIKE $${idx} OR m.nim ILIKE $${idx})`;
    values.push(`%${search}%`); idx++;
  }
  const { rows } = await pool.query(q, values);
  return parseInt(rows[0].total);
};

const getDosenListDb = async (filters = {}) => {
  const { is_active, id_prodi, search, page, limit } = filters;
  const values = [];
  let idx = 1;
  const offset = (page - 1) * limit;

  let q = `
    SELECT
      u.id_user, u.username, u.email, u.nama_lengkap, u.no_hp, u.alamat,
      u.is_active, u.email_verified_at, u.created_at,
      d.nip, d.bidang_keahlian, d.status_verifikasi,
      p.id_prodi, p.nama_prodi, p.jenjang,
      j.id_jurusan, j.nama_jurusan,
      k.id_kampus, k.nama_kampus
    FROM m_user u
    JOIN m_dosen d ON d.id_user = u.id_user
    JOIN m_prodi p ON p.id_prodi = d.id_prodi
    JOIN m_jurusan j ON j.id_jurusan = p.id_jurusan
    JOIN m_kampus k ON k.id_kampus = p.id_kampus
    WHERE 1=1
  `;

  if (is_active !== undefined && is_active !== null) { q += ` AND u.is_active = $${idx++}`; values.push(is_active); }
  if (id_prodi) { q += ` AND d.id_prodi = $${idx++}`; values.push(id_prodi); }
  if (search) {
    q += ` AND (u.username ILIKE $${idx} OR u.email ILIKE $${idx} OR u.nama_lengkap ILIKE $${idx} OR d.nip ILIKE $${idx})`;
    values.push(`%${search}%`); idx++;
  }
  q += ` ORDER BY u.created_at DESC`;
  if (page && limit) {
    q += ` LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
  }
  const { rows } = await pool.query(q, values);
  return rows;
};

const getDosenCountDb = async (filters = {}) => {
  const { is_active, id_prodi, search } = filters;
  const values = [];
  let idx = 1;

  let q = `SELECT COUNT(*) as total FROM m_user u JOIN m_dosen d ON d.id_user = u.id_user JOIN m_prodi p ON p.id_prodi = d.id_prodi WHERE 1=1`;

  if (is_active !== undefined && is_active !== null) { q += ` AND u.is_active = $${idx++}`; values.push(is_active); }
  if (id_prodi) { q += ` AND d.id_prodi = $${idx++}`; values.push(id_prodi); }
  if (search) {
    q += ` AND (u.username ILIKE $${idx} OR u.email ILIKE $${idx} OR u.nama_lengkap ILIKE $${idx} OR d.nip ILIKE $${idx})`;
    values.push(`%${search}%`); idx++;
  }
  const { rows } = await pool.query(q, values);
  return parseInt(rows[0].total);
};

const getReviewerListDb = async (filters = {}) => {
  const { is_active, search, page, limit } = filters;
  const values = [];
  let idx = 1;
  const offset = (page - 1) * limit;

  let q = `
    SELECT
      u.id_user, u.username, u.email, u.nama_lengkap, u.no_hp, u.alamat,
      u.is_active, u.email_verified_at, u.created_at,
      rv.institusi, rv.bidang_keahlian
    FROM m_user u
    JOIN m_reviewer rv ON rv.id_user = u.id_user
    WHERE 1=1
  `;

  if (is_active !== undefined && is_active !== null) { q += ` AND u.is_active = $${idx++}`; values.push(is_active); }
  if (search) {
    q += ` AND (u.username ILIKE $${idx} OR u.email ILIKE $${idx} OR u.nama_lengkap ILIKE $${idx})`;
    values.push(`%${search}%`); idx++;
  }
  q += ` ORDER BY u.created_at DESC`;
  if (page && limit) {
    q += ` LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
  }
  const { rows } = await pool.query(q, values);
  return rows;
};

const getReviewerCountDb = async (filters = {}) => {
  const { is_active, search } = filters;
  const values = [];
  let idx = 1;

  let q = `SELECT COUNT(*) as total FROM m_user u JOIN m_reviewer rv ON rv.id_user = u.id_user WHERE 1=1`;

  if (is_active !== undefined && is_active !== null) { q += ` AND u.is_active = $${idx++}`; values.push(is_active); }
  if (search) {
    q += ` AND (u.username ILIKE $${idx} OR u.email ILIKE $${idx} OR u.nama_lengkap ILIKE $${idx})`;
    values.push(`%${search}%`); idx++;
  }
  const { rows } = await pool.query(q, values);
  return parseInt(rows[0].total);
};

const getJuriListDb = async (filters = {}) => {
  const { is_active, search, page, limit } = filters;
  const values = [];
  let idx = 1;
  const offset = (page - 1) * limit;

  let q = `
    SELECT
      u.id_user, u.username, u.email, u.nama_lengkap, u.no_hp, u.alamat,
      u.is_active, u.email_verified_at, u.created_at,
      jr.institusi, jr.bidang_keahlian
    FROM m_user u
    JOIN m_juri jr ON jr.id_user = u.id_user
    WHERE 1=1
  `;

  if (is_active !== undefined && is_active !== null) { q += ` AND u.is_active = $${idx++}`; values.push(is_active); }
  if (search) {
    q += ` AND (u.username ILIKE $${idx} OR u.email ILIKE $${idx} OR u.nama_lengkap ILIKE $${idx})`;
    values.push(`%${search}%`); idx++;
  }
  q += ` ORDER BY u.created_at DESC`;
  if (page && limit) {
    q += ` LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
  }
  const { rows } = await pool.query(q, values);
  return rows;
};

const getJuriCountDb = async (filters = {}) => {
  const { is_active, search } = filters;
  const values = [];
  let idx = 1;

  let q = `SELECT COUNT(*) as total FROM m_user u JOIN m_juri jr ON jr.id_user = u.id_user WHERE 1=1`;

  if (is_active !== undefined && is_active !== null) { q += ` AND u.is_active = $${idx++}`; values.push(is_active); }
  if (search) {
    q += ` AND (u.username ILIKE $${idx} OR u.email ILIKE $${idx} OR u.nama_lengkap ILIKE $${idx})`;
    values.push(`%${search}%`); idx++;
  }
  const { rows } = await pool.query(q, values);
  return parseInt(rows[0].total);
};

const getUserByIdDb = async (id_user) => {
  const { rows } = await pool.query(
    `SELECT u.id_user, u.username, u.email, u.nama_lengkap, u.no_hp, u.alamat, u.is_active, r.id_role, r.nama_role
     FROM m_user u JOIN m_role r ON r.id_role = u.id_role WHERE u.id_user = $1`,
    [id_user]
  );
  return rows[0] || null;
};

const checkEmailExistsDb = async (email, exclude_id = null) => {
  let q = `SELECT id_user FROM m_user WHERE email = $1`;
  const values = [email];
  if (exclude_id) { q += ` AND id_user != $2`; values.push(exclude_id); }
  const { rows } = await pool.query(q, values);
  return rows.length > 0;
};

const checkUsernameExistsDb = async (username, exclude_id = null) => {
  let q = `SELECT id_user FROM m_user WHERE username = $1`;
  const values = [username];
  if (exclude_id) { q += ` AND id_user != $2`; values.push(exclude_id); }
  const { rows } = await pool.query(q, values);
  return rows.length > 0;
};

const checkNimExistsDb = async (nim, exclude_id = null) => {
  let q = `SELECT id_user FROM m_mahasiswa WHERE nim = $1`;
  const values = [nim];
  if (exclude_id) { q += ` AND id_user != $2`; values.push(exclude_id); }
  const { rows } = await pool.query(q, values);
  return rows.length > 0;
};

const checkNipExistsDb = async (nip, exclude_id = null) => {
  let q = `SELECT id_user FROM m_dosen WHERE nip = $1`;
  const values = [nip];
  if (exclude_id) { q += ` AND id_user != $2`; values.push(exclude_id); }
  const { rows } = await pool.query(q, values);
  return rows.length > 0;
};

const insertMahasiswaDb = async (client, userData, mahasiswaData) => {
  const password_hash = await hashPassword(userData.password);
  const { rows } = await client.query(
    `INSERT INTO m_user (id_role, username, email, password_hash, nama_lengkap, no_hp, alamat, is_active, email_verified_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, false, NULL) RETURNING id_user`,
    [ROLE.MAHASISWA, userData.username, userData.email, password_hash, userData.nama_lengkap, userData.no_hp || null, userData.alamat || null]
  );
  const id_user = rows[0].id_user;
  await client.query(
    `INSERT INTO m_mahasiswa (id_user, nim, id_prodi, tahun_masuk, status_verifikasi) VALUES ($1, $2, $3, $4, 0)`,
    [id_user, mahasiswaData.nim, mahasiswaData.id_prodi, mahasiswaData.tahun_masuk]
  );
  return id_user;
};

const insertDosenDb = async (client, userData, dosenData) => {
  const password_hash = await hashPassword(userData.password);
  const { rows } = await client.query(
    `INSERT INTO m_user (id_role, username, email, password_hash, nama_lengkap, no_hp, alamat, is_active, email_verified_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, false, NULL) RETURNING id_user`,
    [ROLE.DOSEN, userData.username, userData.email, password_hash, userData.nama_lengkap, userData.no_hp || null, userData.alamat || null]
  );
  const id_user = rows[0].id_user;
  await client.query(
    `INSERT INTO m_dosen (id_user, nip, id_prodi, bidang_keahlian, status_verifikasi) VALUES ($1, $2, $3, $4, 0)`,
    [id_user, dosenData.nip, dosenData.id_prodi, dosenData.bidang_keahlian || null]
  );
  return id_user;
};

const insertReviewerDb = async (client, userData, reviewerData) => {
  const password_hash = await hashPassword(userData.password);
  const { rows } = await client.query(
    `INSERT INTO m_user (id_role, username, email, password_hash, nama_lengkap, no_hp, alamat, is_active, email_verified_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, false, NULL) RETURNING id_user`,
    [ROLE.REVIEWER, userData.username, userData.email, password_hash, userData.nama_lengkap, userData.no_hp || null, userData.alamat || null]
  );
  const id_user = rows[0].id_user;
  await client.query(
    `INSERT INTO m_reviewer (id_user, institusi, bidang_keahlian) VALUES ($1, $2, $3)`,
    [id_user, reviewerData.institusi || null, reviewerData.bidang_keahlian || null]
  );
  return id_user;
};

const insertJuriDb = async (client, userData, juriData) => {
  const password_hash = await hashPassword(userData.password);
  const { rows } = await client.query(
    `INSERT INTO m_user (id_role, username, email, password_hash, nama_lengkap, no_hp, alamat, is_active, email_verified_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, false, NULL) RETURNING id_user`,
    [ROLE.JURI, userData.username, userData.email, password_hash, userData.nama_lengkap, userData.no_hp || null, userData.alamat || null]
  );
  const id_user = rows[0].id_user;
  await client.query(
    `INSERT INTO m_juri (id_user, institusi, bidang_keahlian) VALUES ($1, $2, $3)`,
    [id_user, juriData.institusi || null, juriData.bidang_keahlian || null]
  );
  return id_user;
};

const updateUserBaseDb = async (client, id_user, data) => {
  const { rows } = await client.query(
    `UPDATE m_user SET nama_lengkap = $2, email = $3, no_hp = $4, alamat = $5 WHERE id_user = $1 RETURNING id_user`,
    [id_user, data.nama_lengkap, data.email, data.no_hp || null, data.alamat || null]
  );
  return rows[0] || null;
};

const updateMahasiswaDetailDb = async (client, id_user, data) => {
  await client.query(
    `UPDATE m_mahasiswa SET nim = $2, id_prodi = $3, tahun_masuk = $4 WHERE id_user = $1`,
    [id_user, data.nim, data.id_prodi, data.tahun_masuk]
  );
};

const updateDosenDetailDb = async (client, id_user, data) => {
  await client.query(
    `UPDATE m_dosen SET nip = $2, id_prodi = $3, bidang_keahlian = $4 WHERE id_user = $1`,
    [id_user, data.nip, data.id_prodi, data.bidang_keahlian || null]
  );
};

const updateReviewerDetailDb = async (client, id_user, data) => {
  await client.query(
    `UPDATE m_reviewer SET institusi = $2, bidang_keahlian = $3 WHERE id_user = $1`,
    [id_user, data.institusi || null, data.bidang_keahlian || null]
  );
};

const updateJuriDetailDb = async (client, id_user, data) => {
  await client.query(
    `UPDATE m_juri SET institusi = $2, bidang_keahlian = $3 WHERE id_user = $1`,
    [id_user, data.institusi || null, data.bidang_keahlian || null]
  );
};

const toggleUserActiveDb = async (id_user, is_active) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: updated } = await client.query(
      `UPDATE m_user SET is_active = $2 WHERE id_user = $1 RETURNING id_user, is_active`,
      [id_user, is_active]
    );
    if (!updated.length) { await client.query("ROLLBACK"); return null; }

    const { rows: mahasiswa } = await client.query(`SELECT id_user FROM m_mahasiswa WHERE id_user = $1`, [id_user]);
    if (mahasiswa.length) {
      await client.query(`UPDATE m_mahasiswa SET status_verifikasi = $2 WHERE id_user = $1`, [id_user, is_active ? 1 : 0]);
    }

    const { rows: dosen } = await client.query(`SELECT id_user FROM m_dosen WHERE id_user = $1`, [id_user]);
    if (dosen.length) {
      await client.query(`UPDATE m_dosen SET status_verifikasi = $2 WHERE id_user = $1`, [id_user, is_active ? 1 : 0]);
    }

    await client.query("COMMIT");
    return updated[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const resetPasswordDb = async (id_user, password_hash) => {
  const { rows } = await pool.query(
    `UPDATE m_user SET password_hash = $2 WHERE id_user = $1 RETURNING id_user`,
    [id_user, password_hash]
  );
  return rows[0] || null;
};

const getPoolClient = () => pool.connect();

module.exports = {
  getMahasiswaListDb, getMahasiswaCountDb,
  getDosenListDb, getDosenCountDb,
  getReviewerListDb, getReviewerCountDb,
  getJuriListDb, getJuriCountDb,
  getUserByIdDb,
  checkEmailExistsDb, checkUsernameExistsDb, checkNimExistsDb, checkNipExistsDb,
  insertMahasiswaDb, insertDosenDb, insertReviewerDb, insertJuriDb,
  updateUserBaseDb, updateMahasiswaDetailDb, updateDosenDetailDb, updateReviewerDetailDb, updateJuriDetailDb,
  toggleUserActiveDb, resetPasswordDb, getPoolClient,
};