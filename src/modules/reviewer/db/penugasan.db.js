const pool = require("../../../config/db");

const getTahapAktifDb = async (id_program, urutan) => {
  const q = `
    SELECT id_tahap, status
    FROM m_tahap_penilaian
    WHERE id_program = $1
      AND urutan = $2
      AND status = 1
  `;
  const { rows } = await pool.query(q, [id_program, urutan]);
  return rows[0] || null;
};

const getPenugasanDb = async (id_reviewer, urutan, status_filter = null, page, limit) => {
  const values = [id_reviewer, urutan];
  let idx = 3;
  let statusClause = "";
  const offset = (page - 1) * limit;

  if (status_filter !== null && status_filter !== "") {
    statusClause = `AND d.status = $${idx++}`;
    values.push(Number(status_filter));
  }

  let q = `
    SELECT
      d.id_distribusi,
      d.status,
      d.status AS status_reviewer,
      dj.status AS status_juri,
      d.tahap AS id_tahap,
      d.assigned_at,
      d.responded_at,
      d.catatan_reviewer,
      dj.id_distribusi AS id_distribusi_juri,
      p.id_program,
      p.id_proposal,
      p.judul,
      p.file_proposal,
      p.status AS status_proposal,
      k.nama_kategori,
      pr.nama_program,
      pr.keterangan,
      t.nama_tim,
      tp.urutan AS urutan_tahap,
      tp.penilaian_mulai,
      tp.penilaian_selesai
    FROM t_distribusi_reviewer d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN m_program pr ON pr.id_program = p.id_program
    LEFT JOIN m_tahap_penilaian tp ON tp.id_tahap = d.tahap
    LEFT JOIN t_distribusi_juri dj
      ON dj.id_proposal = d.id_proposal
      AND dj.tahap = d.tahap
      AND dj.status != 5
    WHERE d.id_reviewer = $1
      AND tp.urutan = $2
      AND d.status != 5
      ${statusClause}
    ORDER BY d.assigned_at DESC
  `;

  if (page && limit) {
    q += ` LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
  }

  const { rows } = await pool.query(q, values);
  return rows;
};

const getPenugasanCountDb = async (id_reviewer, urutan, status_filter = null) => {
  const values = [id_reviewer, urutan];
  let idx = 3;
  let statusClause = "";

  if (status_filter !== null && status_filter !== "") {
    statusClause = `AND d.status = $${idx++}`;
    values.push(Number(status_filter));
  }

  const q = `SELECT COUNT(*) as total FROM t_distribusi_reviewer d JOIN m_tahap_penilaian tp ON tp.id_tahap = d.tahap WHERE d.id_reviewer = $1 AND tp.urutan = $2 AND d.status != 5 ${statusClause}`;
  const { rows } = await pool.query(q, values);
  return parseInt(rows[0].total);
};

const getDetailPenugasanDb = async (id_distribusi, id_reviewer) => {
  const q = `
    SELECT
      d.id_distribusi,
      d.id_proposal,
      d.id_reviewer,
      d.status,
      d.status AS status_reviewer,
      dj.status AS status_juri,
      d.tahap AS id_tahap,
      d.assigned_at,
      d.responded_at,
      d.catatan_reviewer,
      dj.id_distribusi AS id_distribusi_juri,
      p.id_program,
      p.judul,
      p.file_proposal,
      p.modal_diajukan,
      p.status AS status_proposal,
      k.nama_kategori,
      pr.nama_program,
      pr.keterangan,
      tm.nama_tim,
      tp.nama_tahap,
      tp.urutan AS urutan_tahap,
      tp.penilaian_mulai,
      tp.penilaian_selesai
    FROM t_distribusi_reviewer d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN t_tim tm ON tm.id_tim = p.id_tim
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN m_program pr ON pr.id_program = p.id_program
    LEFT JOIN m_tahap_penilaian tp ON tp.id_tahap = d.tahap
    LEFT JOIN t_distribusi_juri dj
      ON dj.id_proposal = d.id_proposal
      AND dj.tahap = d.tahap
      AND dj.status != 5
    WHERE d.id_distribusi = $1
      AND d.id_reviewer = $2
      AND d.status != 5
  `;
  const { rows } = await pool.query(q, [id_distribusi, id_reviewer]);
  return rows[0] || null;
};

const acceptDistribusiDb = async (id_distribusi, id_reviewer) => {
  const q = `
    UPDATE t_distribusi_reviewer
    SET status = 1, responded_at = now()
    WHERE id_distribusi = $1
      AND id_reviewer = $2
      AND status = 0
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_distribusi, id_reviewer]);
  return rows[0] || null;
};

const rejectDistribusiDb = async (id_distribusi, id_reviewer, catatan) => {
  const q = `
    UPDATE t_distribusi_reviewer
    SET status = 2,
        catatan_reviewer = $3,
        responded_at = now()
    WHERE id_distribusi = $1
      AND id_reviewer = $2
      AND status = 0
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_distribusi, id_reviewer, catatan]);
  return rows[0] || null;
};

module.exports = {
  getTahapAktifDb,
  getPenugasanDb,
  getPenugasanCountDb,
  getDetailPenugasanDb,
  acceptDistribusiDb,
  rejectDistribusiDb,
};

const getPeringkatDb = async (id_reviewer, tahap) => {
  const q = `
    SELECT
      dr.id_distribusi,
      dr.status AS status_distribusi,
      p.id_proposal,
      p.judul,
      t.nama_tim,
      k.nama_kategori,
      pr.nama_program,
      COALESCE(SUM(prd.nilai), 0) AS total_nilai,
      RANK() OVER (ORDER BY COALESCE(SUM(prd.nilai), 0) DESC) AS peringkat,
      json_agg(
        json_build_object(
          'id_kriteria', mk.id_kriteria,
          'nama_kriteria', mk.nama_kriteria,
          'bobot', mk.bobot,
          'skor', prd.skor,
          'nilai', prd.nilai
        ) ORDER BY mk.urutan ASC
      ) FILTER (WHERE prd.id_kriteria IS NOT NULL) AS detail_nilai
    FROM t_distribusi_reviewer dr
    JOIN t_proposal p ON p.id_proposal = dr.id_proposal
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN m_program pr ON pr.id_program = p.id_program
    JOIN t_penilaian_reviewer pen ON pen.id_distribusi = dr.id_distribusi
    LEFT JOIN t_penilaian_reviewer_detail prd ON prd.id_penilaian = pen.id_penilaian
    LEFT JOIN m_kriteria_penilaian mk ON mk.id_kriteria = prd.id_kriteria
    WHERE dr.id_reviewer = $1 
      AND dr.tahap = $2 
      AND pen.status IN (0, 1)
    GROUP BY dr.id_distribusi, dr.status, p.id_proposal, p.judul, t.nama_tim, k.nama_kategori, pr.nama_program
    ORDER BY total_nilai DESC
  `;
  const { rows } = await pool.query(q, [id_reviewer, tahap]);
  return rows;
};

module.exports.getPeringkatDb = getPeringkatDb;