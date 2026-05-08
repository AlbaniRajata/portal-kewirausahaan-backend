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

const getPenugasanDb = async (id_juri, urutan, status_filter = null) => {
  const values = [id_juri, urutan];
  let statusClause = "";

  if (status_filter !== null && status_filter !== "") {
    statusClause = "AND d.status = $3";
    values.push(Number(status_filter));
  }

  const q = `
    SELECT
      d.id_distribusi,
      d.status,
      d.status AS status_juri,
      dr.status AS status_reviewer,
      d.tahap AS id_tahap,
      d.assigned_at,
      d.responded_at,
      d.catatan_juri,
      dr.id_distribusi AS id_distribusi_reviewer,
      p.id_program,
      p.id_proposal,
      p.judul,
      p.file_proposal,
      p.modal_diajukan,
      p.status AS status_proposal,
      k.nama_kategori,
      pr.nama_program,
      pr.keterangan,
      t.nama_tim,
      tp.urutan AS urutan_tahap,
      tp.penilaian_mulai,
      tp.penilaian_selesai
    FROM t_distribusi_juri d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN m_program pr ON pr.id_program = p.id_program
    LEFT JOIN m_tahap_penilaian tp ON tp.id_tahap = d.tahap
    LEFT JOIN t_distribusi_reviewer dr
      ON dr.id_proposal = d.id_proposal
      AND dr.tahap = d.tahap
      AND dr.status != 5
    WHERE d.id_juri = $1
      AND tp.urutan = $2
      AND d.status != 5
      ${statusClause}
    ORDER BY d.assigned_at DESC
  `;
  const { rows } = await pool.query(q, values);
  return rows;
};

const getDetailPenugasanDb = async (id_distribusi, id_juri) => {
  const q = `
    SELECT
      d.id_distribusi,
      d.id_proposal,
      d.id_juri,
      d.status,
      d.status AS status_juri,
      dr.status AS status_reviewer,
      d.tahap AS id_tahap,
      d.assigned_at,
      d.responded_at,
      d.catatan_juri,
      dr.id_distribusi AS id_distribusi_reviewer,
      p.id_program,
      p.judul,
      p.file_proposal,
      p.modal_diajukan,
      p.status AS status_proposal,
      k.nama_kategori,
      pr.nama_program,
      pr.keterangan,
      t.nama_tim,
      tp.nama_tahap,
      tp.urutan AS urutan_tahap,
      tp.penilaian_mulai,
      tp.penilaian_selesai
    FROM t_distribusi_juri d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN m_program pr ON pr.id_program = p.id_program
    LEFT JOIN m_tahap_penilaian tp ON tp.id_tahap = d.tahap
    LEFT JOIN t_distribusi_reviewer dr
      ON dr.id_proposal = d.id_proposal
      AND dr.tahap = d.tahap
      AND dr.status != 5
    WHERE d.id_distribusi = $1
      AND d.id_juri = $2
      AND d.status != 5
  `;
  const { rows } = await pool.query(q, [id_distribusi, id_juri]);
  return rows[0] || null;
};

const acceptDistribusiDb = async (id_distribusi, id_juri) => {
  const q = `
    UPDATE t_distribusi_juri
    SET status = 1, responded_at = now()
    WHERE id_distribusi = $1
      AND id_juri = $2
      AND status = 0
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_distribusi, id_juri]);
  return rows[0] || null;
};

const rejectDistribusiDb = async (id_distribusi, id_juri, catatan) => {
  const q = `
    UPDATE t_distribusi_juri
    SET status = 2,
        catatan_juri = $3,
        responded_at = now()
    WHERE id_distribusi = $1
      AND id_juri = $2
      AND status = 0
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_distribusi, id_juri, catatan]);
  return rows[0] || null;
};

module.exports = {
  getTahapAktifDb,
  getPenugasanDb,
  getDetailPenugasanDb,
  acceptDistribusiDb,
  rejectDistribusiDb,
};

const getPeringkatDb = async (id_juri, tahap) => {
  const q = `
    SELECT
      dj.id_distribusi,
      dj.status AS status_distribusi,
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
    FROM t_distribusi_juri dj
    JOIN t_proposal p ON p.id_proposal = dj.id_proposal
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN m_program pr ON pr.id_program = p.id_program
    JOIN t_penilaian_juri pen ON pen.id_distribusi = dj.id_distribusi
    LEFT JOIN t_penilaian_juri_detail prd ON prd.id_penilaian = pen.id_penilaian
    LEFT JOIN m_kriteria_penilaian mk ON mk.id_kriteria = prd.id_kriteria
    WHERE dj.id_juri = $1 
      AND dj.tahap = $2 
      AND pen.status IN (0, 1)
    GROUP BY dj.id_distribusi, dj.status, p.id_proposal, p.judul, t.nama_tim, k.nama_kategori, pr.nama_program
    ORDER BY total_nilai DESC
  `;
  const { rows } = await pool.query(q, [id_juri, tahap]);
  return rows;
};

module.exports.getPeringkatDb = getPeringkatDb;