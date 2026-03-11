const pool = require("../../../config/db");

const getHistoryPenilaianTahap1Db = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT
      p.id_proposal,
      p.judul,
      p.status AS status_proposal,
      p.tanggal_submit AS tanggal_finalisasi,
      t.nama_tim,
      k.nama_kategori,
      COUNT(DISTINCT dr.id_distribusi)                                            AS total_reviewer,
      COUNT(DISTINCT pr.id_penilaian) FILTER (WHERE pr.status = 1)               AS total_submit,
      ROUND(AVG(sub.total_nilai)::numeric, 2)                                     AS rata_rata_nilai
     FROM t_proposal p
     JOIN t_tim t       ON t.id_tim       = p.id_tim
     JOIN m_kategori k  ON k.id_kategori  = p.id_kategori
     JOIN t_distribusi_reviewer dr
       ON dr.id_proposal = p.id_proposal
     JOIN m_tahap_penilaian tp
       ON tp.id_program = p.id_program
      AND tp.urutan     = dr.tahap
      AND tp.urutan     = 1
     LEFT JOIN t_penilaian_reviewer pr
       ON pr.id_distribusi = dr.id_distribusi
     LEFT JOIN (
       SELECT pr2.id_distribusi, SUM(d.nilai) AS total_nilai
       FROM t_penilaian_reviewer pr2
       JOIN t_penilaian_reviewer_detail d ON d.id_penilaian = pr2.id_penilaian
       WHERE pr2.status = 1
       GROUP BY pr2.id_distribusi
     ) sub ON sub.id_distribusi = dr.id_distribusi
     WHERE p.id_program = $1
       AND p.status     >= 2
       AND EXISTS (
         SELECT 1 FROM t_penilaian_reviewer pr3
         JOIN t_distribusi_reviewer dr3 ON dr3.id_distribusi = pr3.id_distribusi
         JOIN m_tahap_penilaian tp3
           ON tp3.id_program = p.id_program
          AND tp3.urutan     = dr3.tahap
          AND tp3.urutan     = 1
         WHERE dr3.id_proposal = p.id_proposal
           AND pr3.status = 1
       )
     GROUP BY p.id_proposal, p.judul, p.status, p.tanggal_submit, t.nama_tim, k.nama_kategori
     ORDER BY p.tanggal_submit DESC NULLS LAST`,
    [id_program]
  );
  return rows;
};

const getHistoryPenilaianTahap2Db = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT
      p.id_proposal,
      p.judul,
      p.status AS status_proposal,
      p.wawancara_at AS tanggal_finalisasi,
      t.nama_tim,
      k.nama_kategori,
      (
        SELECT COUNT(DISTINCT dr.id_distribusi)
        FROM t_distribusi_reviewer dr
        JOIN m_tahap_penilaian tp
          ON tp.id_program = p.id_program AND tp.urutan = dr.tahap AND tp.urutan = 2
        WHERE dr.id_proposal = p.id_proposal
      ) AS total_reviewer,
      (
        SELECT COUNT(DISTINCT dj.id_distribusi)
        FROM t_distribusi_juri dj
        JOIN m_tahap_penilaian tp
          ON tp.id_program = p.id_program AND tp.urutan = dj.tahap AND tp.urutan = 2
        WHERE dj.id_proposal = p.id_proposal
      ) AS total_juri,
      COALESCE((
        SELECT ROUND(AVG(sub_r.total_nilai)::numeric, 2)
        FROM (
          SELECT pr.id_distribusi, SUM(d.nilai) AS total_nilai
          FROM t_penilaian_reviewer pr
          JOIN t_penilaian_reviewer_detail d ON d.id_penilaian = pr.id_penilaian
          JOIN t_distribusi_reviewer dr ON dr.id_distribusi = pr.id_distribusi
          JOIN m_tahap_penilaian tp
            ON tp.id_program = p.id_program AND tp.urutan = dr.tahap AND tp.urutan = 2
          WHERE dr.id_proposal = p.id_proposal AND pr.status = 1
          GROUP BY pr.id_distribusi
        ) sub_r
      ), 0) AS rata_rata_reviewer,
      COALESCE((
        SELECT ROUND(AVG(sub_j.total_nilai)::numeric, 2)
        FROM (
          SELECT pj.id_distribusi, SUM(d.nilai) AS total_nilai
          FROM t_penilaian_juri pj
          JOIN t_penilaian_juri_detail d ON d.id_penilaian = pj.id_penilaian
          JOIN t_distribusi_juri dj ON dj.id_distribusi = pj.id_distribusi
          JOIN m_tahap_penilaian tp
            ON tp.id_program = p.id_program AND tp.urutan = dj.tahap AND tp.urutan = 2
          WHERE dj.id_proposal = p.id_proposal AND pj.status = 1
          GROUP BY pj.id_distribusi
        ) sub_j
      ), 0) AS rata_rata_juri
     FROM t_proposal p
     JOIN t_tim t      ON t.id_tim      = p.id_tim
     JOIN m_kategori k ON k.id_kategori = p.id_kategori
     WHERE p.id_program = $1
       AND p.status     >= 5
       AND EXISTS (
         SELECT 1
         FROM t_penilaian_reviewer pr3
         JOIN t_distribusi_reviewer dr3 ON dr3.id_distribusi = pr3.id_distribusi
         JOIN m_tahap_penilaian tp3
           ON tp3.id_program = p.id_program
          AND tp3.urutan     = dr3.tahap
          AND tp3.urutan     = 2
         WHERE dr3.id_proposal = p.id_proposal AND pr3.status = 1
         UNION ALL
         SELECT 1
         FROM t_penilaian_juri pj3
         JOIN t_distribusi_juri dj3 ON dj3.id_distribusi = pj3.id_distribusi
         JOIN m_tahap_penilaian tp3
           ON tp3.id_program = p.id_program
          AND tp3.urutan     = dj3.tahap
          AND tp3.urutan     = 2
         WHERE dj3.id_proposal = p.id_proposal AND pj3.status = 1
       )
     ORDER BY p.wawancara_at DESC NULLS LAST`,
    [id_program]
  );
  return rows;
};

const getHistoryDetailTahap1Db = async (id_program, id_proposal) => {
  const { rows } = await pool.query(
    `SELECT
      pr.id_proposal,
      pr.judul,
      p.id_penilaian,
      p.submitted_at,
      u.id_user        AS id_reviewer,
      u.nama_lengkap   AS nama_reviewer,
      k.id_kriteria,
      k.nama_kriteria,
      k.bobot,
      d.skor,
      d.nilai,
      d.catatan
     FROM t_penilaian_reviewer p
     JOIN t_distribusi_reviewer dr  ON dr.id_distribusi = p.id_distribusi
     JOIN m_user u                  ON u.id_user        = dr.id_reviewer
     JOIN t_proposal pr             ON pr.id_proposal   = dr.id_proposal
     JOIN t_penilaian_reviewer_detail d ON d.id_penilaian = p.id_penilaian
     JOIN m_kriteria_penilaian k    ON k.id_kriteria    = d.id_kriteria
     JOIN m_tahap_penilaian tp
       ON tp.id_tahap  = p.id_tahap
      AND tp.id_program = $1
      AND tp.urutan    = 1
     WHERE pr.id_proposal = $2 AND p.status = 1
     ORDER BY u.id_user, k.urutan`,
    [id_program, id_proposal]
  );
  return rows;
};

const getHistoryDetailTahap2ReviewerDb = async (id_program, id_proposal) => {
  const { rows } = await pool.query(
    `SELECT
      pr.id_proposal,
      pr.judul,
      p.id_penilaian,
      p.submitted_at,
      u.id_user        AS id_reviewer,
      u.nama_lengkap   AS nama_reviewer,
      k.id_kriteria,
      k.nama_kriteria,
      k.bobot,
      d.skor,
      d.nilai,
      d.catatan
     FROM t_penilaian_reviewer p
     JOIN t_distribusi_reviewer dr  ON dr.id_distribusi = p.id_distribusi
     JOIN m_user u                  ON u.id_user        = dr.id_reviewer
     JOIN t_proposal pr             ON pr.id_proposal   = dr.id_proposal
     JOIN t_penilaian_reviewer_detail d ON d.id_penilaian = p.id_penilaian
     JOIN m_kriteria_penilaian k    ON k.id_kriteria    = d.id_kriteria
     JOIN m_tahap_penilaian tp
       ON tp.id_tahap  = p.id_tahap
      AND tp.id_program = $1
      AND tp.urutan    = 2
     WHERE pr.id_proposal = $2 AND p.status = 1
     ORDER BY u.id_user, k.urutan`,
    [id_program, id_proposal]
  );
  return rows;
};

const getHistoryDetailTahap2JuriDb = async (id_program, id_proposal) => {
  const { rows } = await pool.query(
    `SELECT
      pr.id_proposal,
      pr.judul,
      p.id_penilaian,
      p.submitted_at,
      u.id_user        AS id_juri,
      u.nama_lengkap   AS nama_juri,
      k.id_kriteria,
      k.nama_kriteria,
      k.bobot,
      d.skor,
      d.nilai,
      d.catatan
     FROM t_penilaian_juri p
     JOIN t_distribusi_juri dj      ON dj.id_distribusi = p.id_distribusi
     JOIN m_user u                  ON u.id_user        = dj.id_juri
     JOIN t_proposal pr             ON pr.id_proposal   = dj.id_proposal
     JOIN t_penilaian_juri_detail d ON d.id_penilaian   = p.id_penilaian
     JOIN m_kriteria_penilaian k    ON k.id_kriteria    = d.id_kriteria
     JOIN m_tahap_penilaian tp
       ON tp.id_tahap  = p.id_tahap
      AND tp.id_program = $1
      AND tp.urutan    = 2
     WHERE pr.id_proposal = $2 AND p.status = 1
     ORDER BY u.id_user, k.urutan`,
    [id_program, id_proposal]
  );
  return rows;
};

module.exports = {
  getHistoryPenilaianTahap1Db,
  getHistoryPenilaianTahap2Db,
  getHistoryDetailTahap1Db,
  getHistoryDetailTahap2ReviewerDb,
  getHistoryDetailTahap2JuriDb,
};