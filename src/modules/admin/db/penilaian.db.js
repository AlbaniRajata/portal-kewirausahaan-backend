const pool = require("../../../config/db");

const getRekapDb = async (id_proposal, id_tahap) => {
  const q = `
    SELECT
      'reviewer' AS tipe_penilai,

      pr.id_proposal,
      pr.judul,

      p.id_penilaian,
      p.submitted_at,

      u.id_user AS id_penilai,
      u.nama_lengkap AS nama_penilai,
      u.email AS email_penilai,

      k.id_kriteria,
      k.nama_kriteria,
      k.bobot,

      d.skor,
      d.nilai,
      d.catatan

    FROM t_penilaian_reviewer p
    JOIN t_distribusi_reviewer dr ON dr.id_distribusi = p.id_distribusi
    JOIN m_user u ON u.id_user = dr.id_reviewer
    JOIN t_proposal pr ON pr.id_proposal = dr.id_proposal
    JOIN t_penilaian_reviewer_detail d ON d.id_penilaian = p.id_penilaian
    JOIN m_kriteria_penilaian k ON k.id_kriteria = d.id_kriteria

    WHERE pr.id_proposal = $1
      AND p.id_tahap = $2
      AND p.status = 1

    UNION ALL

    SELECT
      'juri' AS tipe_penilai,

      pr.id_proposal,
      pr.judul,

      p.id_penilaian,
      p.submitted_at,

      u.id_user AS id_penilai,
      u.nama_lengkap AS nama_penilai,
      u.email AS email_penilai,

      k.id_kriteria,
      k.nama_kriteria,
      k.bobot,

      d.skor,
      d.nilai,
      d.catatan

    FROM t_penilaian_juri p
    JOIN t_distribusi_juri dj ON dj.id_distribusi = p.id_distribusi
    JOIN m_user u ON u.id_user = dj.id_juri
    JOIN t_proposal pr ON pr.id_proposal = dj.id_proposal
    JOIN t_penilaian_juri_detail d ON d.id_penilaian = p.id_penilaian
    JOIN m_kriteria_penilaian k ON k.id_kriteria = d.id_kriteria

    WHERE pr.id_proposal = $1
      AND p.id_tahap = $2
      AND p.status = 1

    ORDER BY tipe_penilai, id_penilai, k.urutan
  `;

  const { rows } = await pool.query(q, [id_proposal, id_tahap]);
  return rows;
};

module.exports = {
  getRekapDb,
};
