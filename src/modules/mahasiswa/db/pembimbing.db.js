const pool = require("../../../config/db");

const getTimByUserDb = async (id_user) => {
  const q = `
    SELECT
      t.id_tim,
      t.nama_tim,
      t.id_program,
      a.peran
    FROM t_anggota_tim a
    JOIN t_tim t ON t.id_tim = a.id_tim
    WHERE a.id_user = $1
      AND a.status = 1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_user]);
  return rows[0] || null;
};

const getTimKetuaByUserDb = async (id_user) => {
  const q = `
    SELECT
      t.id_tim,
      t.nama_tim,
      t.id_program,
      a.id_user,
      a.peran
    FROM t_anggota_tim a
    JOIN t_tim t ON t.id_tim = a.id_tim
    WHERE a.id_user = $1
      AND a.peran = 1
      AND a.status = 1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_user]);
  return rows[0] || null;
};

const listDosenDb = async () => {
  const q = `
    SELECT
      d.id_user,
      u.nama_lengkap,
      d.nip,
      d.bidang_keahlian
    FROM m_dosen d
    JOIN m_user u ON u.id_user = d.id_user
    WHERE d.status_verifikasi = 1
    ORDER BY u.nama_lengkap ASC
  `;
  const { rows } = await pool.query(q);
  return rows;
};

const getDosenByIdDb = async (id_dosen) => {
  const q = `
    SELECT d.id_user, d.nip, d.bidang_keahlian, u.nama_lengkap
    FROM m_dosen d
    JOIN m_user u ON u.id_user = d.id_user
    WHERE d.id_user = $1
      AND d.status_verifikasi = 1
  `;
  const { rows } = await pool.query(q, [id_dosen]);
  return rows[0] || null;
};

const getPengajuanTimDb = async (id_tim) => {
  const q = `
    SELECT
      p.id_pengajuan,
      p.id_tim,
      p.id_program,
      p.id_dosen,
      p.status,
      p.catatan_dosen,
      CASE
        WHEN p.catatan_dosen = '[REASSIGN_ADMIN]' THEN true
        WHEN p.catatan_dosen ILIKE '%reassign%' THEN true
        ELSE false
      END AS is_reassigned,
      CASE
        WHEN p.catatan_dosen = '[REASSIGN_ADMIN]' THEN NULL
        ELSE p.catatan_dosen
      END AS catatan_dosen_display,
      p.created_at,
      p.responded_at,
      u.nama_lengkap AS nama_dosen,
      d.nip,
      d.bidang_keahlian
    FROM t_pengajuan_pembimbing p
    JOIN m_dosen d ON d.id_user = p.id_dosen
    JOIN m_user u ON u.id_user = d.id_user
    WHERE p.id_tim = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_tim]);
  return rows[0] || null;
};

const upsertPengajuanDb = async (id_tim, id_program, id_dosen, diajukan_oleh) => {
  const q = `
    INSERT INTO t_pengajuan_pembimbing
      (id_tim, id_program, id_dosen, diajukan_oleh, status)
    VALUES ($1, $2, $3, $4, 0)
    ON CONFLICT (id_tim)
    DO UPDATE SET
      id_dosen = EXCLUDED.id_dosen,
      diajukan_oleh = EXCLUDED.diajukan_oleh,
      status = 0,
      catatan_dosen = NULL,
      responded_at = NULL,
      created_at = now()
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_tim, id_program, id_dosen, diajukan_oleh]);
  return rows[0];
};

module.exports = {
  getTimByUserDb,
  getTimKetuaByUserDb,
  listDosenDb,
  getDosenByIdDb,
  getPengajuanTimDb,
  upsertPengajuanDb,
};