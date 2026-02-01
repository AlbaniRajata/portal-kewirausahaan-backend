const pool = require("../../../config/db");

const getPesertaAktifDb = async (id_user) => {
  const q = `
    SELECT *
    FROM t_peserta_program
    WHERE id_user = $1
      AND status_lolos = 1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_user]);
  return rows[0] || null;
};

const getProposalLolosDb = async (id_tim) => {
  const q = `
    SELECT *
    FROM t_proposal
    WHERE id_tim = $1
      AND status IN (8,9)
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_tim]);
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

const getPengajuanTimDb = async (id_tim) => {
  const q = `
    SELECT *
    FROM t_pengajuan_pembimbing
    WHERE id_tim = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_tim]);
  return rows[0] || null;
};

const upsertPengajuanDb = async (
  id_tim,
  id_program,
  id_dosen,
  diajukan_oleh
) => {
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
  const { rows } = await pool.query(q, [
    id_tim,
    id_program,
    id_dosen,
    diajukan_oleh,
  ]);
  return rows[0];
};

const updateStatusProposalDb = async (id_proposal, status) => {
  const q = `
    UPDATE t_proposal
    SET status = $2
    WHERE id_proposal = $1
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_proposal, status]);
  return rows[0];
};

module.exports = {
  getPesertaAktifDb,
  getProposalLolosDb,
  listDosenDb,
  getPengajuanTimDb,
  upsertPengajuanDb,
  updateStatusProposalDb,
};
