const pool = require("../../../config/db");
const PROGRAM = require("../../../constants/program");

const getTimMahasiswaDb = async (id_user) => {
  const q = `
    SELECT
      t.id_tim,
      t.nama_tim,
      t.id_program,
      prog.nama_program,
      prog.keterangan,
      a.peran,
      a.status AS status_anggota
    FROM t_anggota_tim a
    JOIN t_tim t ON t.id_tim = a.id_tim
    JOIN m_program prog ON prog.id_program = t.id_program
    WHERE a.id_user = $1 AND a.status = 1
  `;
  const { rows } = await pool.query(q, [id_user]);
  return rows[0] || null;
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

const getLuaranMahasiswaDb = async (id_tim, id_program) => {
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
      lt.reviewed_at
    FROM m_luaran ml
    LEFT JOIN t_luaran_tim lt ON lt.id_luaran = ml.id_luaran AND lt.id_tim = $1
    WHERE ml.id_program = $2
    ORDER BY ml.urutan ASC
  `;
  const { rows } = await pool.query(q, [id_tim, id_program]);
  return rows;
};

const getLuaranTimByTimAndLuaranDb = async (id_tim, id_luaran) => {
  const q = `
    SELECT
      lt.*,
      ml.id_program,
      ml.nama_luaran,
      ml.tipe,
      ml.deadline
    FROM t_luaran_tim lt
    JOIN m_luaran ml ON ml.id_luaran = lt.id_luaran
    WHERE lt.id_tim = $1 AND lt.id_luaran = $2
  `;
  const { rows } = await pool.query(q, [id_tim, id_luaran]);
  return rows[0] || null;
};

const upsertLuaranTimDb = async (id_tim, id_luaran, data) => {
  const q = `
    INSERT INTO t_luaran_tim (id_tim, id_luaran, file_luaran, link_luaran, status, submitted_at)
    VALUES ($1, $2, $3, $4, 1, now())
    ON CONFLICT (id_tim, id_luaran) DO UPDATE
    SET file_luaran = EXCLUDED.file_luaran,
        link_luaran = EXCLUDED.link_luaran,
        status = 1,
        catatan_admin = NULL,
        reviewed_by = NULL,
        reviewed_at = NULL,
        submitted_at = now()
    RETURNING *
  `;
  const { rows } = await pool.query(q, [
    id_tim,
    id_luaran,
    data.file_luaran,
    data.link_luaran ? JSON.stringify(data.link_luaran) : null,
  ]);
  return rows[0];
};

const getCekMonevLulusDb = async (id_user) => {
  const q = `
    SELECT
      COUNT(ml.id_luaran) AS total_luaran,
      COUNT(lt.id_luaran_tim) FILTER (WHERE lt.status = 2) AS total_disetujui
    FROM t_peserta_program pp
    JOIN t_tim t ON t.id_tim = pp.id_tim
    JOIN m_luaran ml ON ml.id_program = pp.id_program
    LEFT JOIN t_luaran_tim lt ON lt.id_tim = t.id_tim AND lt.id_luaran = ml.id_luaran
    WHERE pp.id_user = $1 AND pp.id_program = $2
  `;
  const { rows } = await pool.query(q, [id_user, PROGRAM.PMW]);
  return rows[0] || null;
};

module.exports = {
  getTimMahasiswaDb,
  getLuaranByIdDb,
  getLuaranMahasiswaDb,
  getLuaranTimByTimAndLuaranDb,
  upsertLuaranTimDb,
  getCekMonevLulusDb,
};