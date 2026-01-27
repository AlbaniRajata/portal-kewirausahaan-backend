const pool = require("../../../config/db");

const getSubmittedPenilaianDb = async (id_proposal, id_tahap) => {
  const q = `
    SELECT p.id_penilaian
    FROM t_penilaian p
    JOIN t_distribusi_reviewer d ON d.id_distribusi = p.id_distribusi
    WHERE d.id_proposal = $1
      AND p.id_tahap = $2
      AND p.status = 1
  `;
  const { rows } = await pool.query(q, [id_proposal, id_tahap]);
  return rows;
};

const hitungNilaiAkhirDb = async (id_penilaian) => {
  const q = `
    SELECT SUM(nilai) AS total
    FROM t_penilaian_detail
    WHERE id_penilaian = $1
  `;
  const { rows } = await pool.query(q, [id_penilaian]);
  return Number(rows[0]?.total || 0);
};

const getRekapDb = async (id_proposal, id_tahap) => {
  const q = `
    SELECT
      p.id_penilaian,
      p.id_distribusi,
      p.submitted_at,

      u.id_user AS id_reviewer,
      u.nama_lengkap AS nama_reviewer,
      u.email AS email_reviewer,

      pr.id_proposal,
      pr.judul,

      k.id_kriteria,
      k.nama_kriteria,
      k.bobot,

      d.skor,
      d.nilai,
      d.catatan
    FROM t_penilaian p
    JOIN t_distribusi_reviewer dr ON dr.id_distribusi = p.id_distribusi
    JOIN m_user u ON u.id_user = dr.id_reviewer
    JOIN t_proposal pr ON pr.id_proposal = dr.id_proposal
    JOIN t_penilaian_detail d ON d.id_penilaian = p.id_penilaian
    JOIN m_kriteria_penilaian k ON k.id_kriteria = d.id_kriteria
    WHERE dr.id_proposal = $1
      AND p.id_tahap = $2
      AND p.status = 1
    ORDER BY u.id_user, k.urutan
  `;
  const { rows } = await pool.query(q, [id_proposal, id_tahap]);
  return rows;
};

const insertRekapDb = async (
  id_proposal,
  id_tahap,
  nilai_akhir,
  status_lolos,
  finalized_by
) => {
  const q = `
    INSERT INTO t_rekap_penilaian
    (id_proposal, id_tahap, nilai_akhir, status_lolos, finalized_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const { rows } = await pool.query(q, [
    id_proposal,
    id_tahap,
    nilai_akhir,
    status_lolos,
    finalized_by,
  ]);
  return rows[0];
};

const updateStatusProposalDb = async (id_proposal, status) => {
  const q = `
    UPDATE t_proposal
    SET status = $1
    WHERE id_proposal = $2
    RETURNING *
  `;
  const { rows } = await pool.query(q, [status, id_proposal]);
  return rows[0];
};

module.exports = {
  getSubmittedPenilaianDb,
  hitungNilaiAkhirDb,
  getRekapDb,
  insertRekapDb,
  updateStatusProposalDb,
};
