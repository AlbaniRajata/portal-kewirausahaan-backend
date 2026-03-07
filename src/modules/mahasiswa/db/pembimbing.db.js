const pool = require("../../../config/db");

const getPesertaAktifDb = async (id_user) => {
  const q = `
    SELECT
      pp.id_user,
      pp.id_program,
      pp.id_tim,
      pp.tahun,
      pp.status_lolos,
      a.peran
    FROM t_peserta_program pp
    JOIN t_anggota_tim a ON a.id_tim = pp.id_tim AND a.id_user = pp.id_user
    WHERE pp.id_user = $1
      AND pp.status_lolos = 1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_user]);
  return rows[0] || null;
};

const getProposalLolosDb = async (id_tim) => {
  const q = `
    SELECT id_proposal, judul, status, file_proposal
    FROM t_proposal
    WHERE id_tim = $1
      AND status IN (7, 8, 9)
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

const updateStatusProposalDb = async (id_proposal, status) => {
  const q = `
    UPDATE t_proposal SET status = $2
    WHERE id_proposal = $1
    RETURNING id_proposal, status
  `;
  const { rows } = await pool.query(q, [id_proposal, status]);
  return rows[0] || null;
};

module.exports = {
  getPesertaAktifDb,
  getProposalLolosDb,
  listDosenDb,
  getDosenByIdDb,
  getPengajuanTimDb,
  upsertPengajuanDb,
  updateStatusProposalDb,
};