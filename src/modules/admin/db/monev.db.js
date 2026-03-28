const pool = require("../../../config/db");

const getLuaranByProgramDb = async (id_program) => {
  const q = `
    SELECT id_luaran, id_program, nama_luaran, keterangan, tipe, deadline, urutan
    FROM m_luaran
    WHERE id_program = $1
    ORDER BY urutan ASC
  `;
  const { rows } = await pool.query(q, [id_program]);
  return rows;
};

const getLuaranByIdDb = async (id_luaran) => {
  const q = `
    SELECT id_luaran, id_program, nama_luaran, keterangan, tipe, deadline, urutan
    FROM m_luaran
    WHERE id_luaran = $1
  `;
  const { rows } = await pool.query(q, [id_luaran]);
  return rows[0] || null;
};

const checkUrutanLuaranExistsDb = async (id_program, urutan, exclude_id = null) => {
  const q = exclude_id
    ? `SELECT 1 FROM m_luaran WHERE id_program = $1 AND urutan = $2 AND id_luaran != $3`
    : `SELECT 1 FROM m_luaran WHERE id_program = $1 AND urutan = $2`;
  const values = exclude_id ? [id_program, urutan, exclude_id] : [id_program, urutan];
  const { rowCount } = await pool.query(q, values);
  return rowCount > 0;
};

const insertLuaranDb = async (id_program, data) => {
  const q = `
    INSERT INTO m_luaran (id_program, nama_luaran, keterangan, tipe, deadline, urutan)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const { rows } = await pool.query(q, [
    id_program,
    data.nama_luaran,
    data.keterangan,
    data.tipe,
    data.deadline,
    data.urutan,
  ]);
  return rows[0];
};

const updateLuaranDb = async (id_luaran, data) => {
  const q = `
    UPDATE m_luaran
    SET nama_luaran = $1, keterangan = $2, tipe = $3, deadline = $4, urutan = $5
    WHERE id_luaran = $6
    RETURNING *
  `;
  const { rows } = await pool.query(q, [
    data.nama_luaran,
    data.keterangan,
    data.tipe,
    data.deadline,
    data.urutan,
    id_luaran,
  ]);
  return rows[0] || null;
};

const cekLuaranDipakaTimDb = async (id_luaran) => {
  const q = `SELECT 1 FROM t_luaran_tim WHERE id_luaran = $1 LIMIT 1`;
  const { rowCount } = await pool.query(q, [id_luaran]);
  return rowCount > 0;
};

const deleteLuaranDb = async (id_luaran) => {
  const q = `DELETE FROM m_luaran WHERE id_luaran = $1 RETURNING *`;
  const { rows } = await pool.query(q, [id_luaran]);
  return rows[0] || null;
};

const getProgressLuaranTimDb = async (id_program) => {
  const q = `
    SELECT
      t.id_tim,
      t.nama_tim,
      u.id_user AS id_ketua,
      u.nama_lengkap AS nama_ketua,
      mhs.nim,
      COUNT(ml.id_luaran) AS total_luaran,
      COUNT(lt.id_luaran_tim) FILTER (WHERE lt.status = 2) AS total_disetujui,
      COUNT(lt.id_luaran_tim) FILTER (WHERE lt.status = 1) AS total_submitted,
      COUNT(lt.id_luaran_tim) FILTER (WHERE lt.status = 3) AS total_ditolak
    FROM t_tim t
    JOIN t_anggota_tim a ON a.id_tim = t.id_tim AND a.peran = 1
    JOIN m_user u ON u.id_user = a.id_user
    JOIN m_mahasiswa mhs ON mhs.id_user = u.id_user
    JOIN m_luaran ml ON ml.id_program = t.id_program
    LEFT JOIN t_luaran_tim lt ON lt.id_tim = t.id_tim AND lt.id_luaran = ml.id_luaran
    WHERE t.id_program = $1
    GROUP BY t.id_tim, t.nama_tim, u.id_user, u.nama_lengkap, mhs.nim
    ORDER BY t.nama_tim ASC
  `;
  const { rows } = await pool.query(q, [id_program]);
  return rows;
};

const getDetailLuaranTimDb = async (id_tim, id_program) => {
  const q = `
    SELECT
      ml.id_luaran,
      ml.nama_luaran,
      ml.keterangan,
      ml.tipe,
      ml.deadline,
      ml.urutan,
      lt.id_luaran_tim,
      lt.file_luaran,
      lt.link_luaran,
      lt.status,
      lt.catatan_admin,
      lt.submitted_at,
      lt.reviewed_at,
      u.nama_lengkap AS reviewed_by_nama
    FROM m_luaran ml
    LEFT JOIN t_luaran_tim lt ON lt.id_luaran = ml.id_luaran AND lt.id_tim = $1
    LEFT JOIN m_user u ON u.id_user = lt.reviewed_by
    WHERE ml.id_program = $2
    ORDER BY ml.urutan ASC
  `;
  const { rows } = await pool.query(q, [id_tim, id_program]);
  return rows;
};

const getLuaranTimByIdDb = async (id_luaran_tim) => {
  const q = `
    SELECT
      lt.*,
      ml.id_program,
      ml.nama_luaran,
      ml.tipe,
      ml.deadline
    FROM t_luaran_tim lt
    JOIN m_luaran ml ON ml.id_luaran = lt.id_luaran
    WHERE lt.id_luaran_tim = $1
  `;
  const { rows } = await pool.query(q, [id_luaran_tim]);
  return rows[0] || null;
};

const reviewLuaranTimDb = async (id_luaran_tim, status, catatan_admin, reviewed_by) => {
  const q = `
    UPDATE t_luaran_tim
    SET status = $1, catatan_admin = $2, reviewed_by = $3, reviewed_at = now()
    WHERE id_luaran_tim = $4
    RETURNING *
  `;
  const { rows } = await pool.query(q, [status, catatan_admin, reviewed_by, id_luaran_tim]);
  return rows[0] || null;
};

module.exports = {
  getLuaranByProgramDb,
  getLuaranByIdDb,
  checkUrutanLuaranExistsDb,
  insertLuaranDb,
  updateLuaranDb,
  cekLuaranDipakaTimDb,
  deleteLuaranDb,
  getProgressLuaranTimDb,
  getDetailLuaranTimDb,
  getLuaranTimByIdDb,
  reviewLuaranTimDb,
};