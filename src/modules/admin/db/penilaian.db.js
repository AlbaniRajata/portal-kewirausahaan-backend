const pool = require("../../../config/db");

let reviewerSchemaReady = null;

const ensureReviewerPenilaianSchema = async () => {
  if (reviewerSchemaReady) return reviewerSchemaReady;

  reviewerSchemaReady = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.t_penilaian_reviewer (
          id_penilaian serial4 NOT NULL,
          id_distribusi int4 NOT NULL,
          id_tahap int4 NOT NULL,
          status int4 DEFAULT 0 NOT NULL,
          submitted_at timestamp NULL,
          CONSTRAINT t_penilaian_reviewer_pkey PRIMARY KEY (id_penilaian),
          CONSTRAINT uq_penilaian_reviewer_distribusi UNIQUE (id_distribusi),
          CONSTRAINT fk_penilaian_reviewer_distribusi FOREIGN KEY (id_distribusi) REFERENCES public.t_distribusi_reviewer(id_distribusi) ON DELETE CASCADE,
          CONSTRAINT fk_penilaian_reviewer_tahap FOREIGN KEY (id_tahap) REFERENCES public.m_tahap_penilaian(id_tahap)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.t_penilaian_reviewer_detail (
          id_detail serial4 NOT NULL,
          id_penilaian int4 NOT NULL,
          id_kriteria int4 NOT NULL,
          skor int4 NOT NULL,
          nilai int4 NOT NULL,
          catatan text NULL,
          created_at timestamp DEFAULT now() NULL,
          updated_at timestamp DEFAULT now() NULL,
          CONSTRAINT skor_check_reviewer CHECK ((skor = ANY (ARRAY[1, 2, 3, 5, 6, 7]))),
          CONSTRAINT t_penilaian_reviewer_detail_pkey PRIMARY KEY (id_detail),
          CONSTRAINT uq_penilaian_reviewer_kriteria UNIQUE (id_penilaian, id_kriteria),
          CONSTRAINT fk_pd_penilaian_reviewer FOREIGN KEY (id_penilaian) REFERENCES public.t_penilaian_reviewer(id_penilaian) ON DELETE CASCADE,
          CONSTRAINT fk_pd_reviewer_kriteria FOREIGN KEY (id_kriteria) REFERENCES public.m_kriteria_penilaian(id_kriteria)
      )
    `);
  })();

  return reviewerSchemaReady;
};

const getRekapReviewerTahap1Db = async (id_program, id_proposal) => {
  await ensureReviewerPenilaianSchema();
  const { rows } = await pool.query(
    `SELECT
      pr.id_proposal, pr.judul,
      p.id_penilaian, p.submitted_at,
      u.id_user AS id_reviewer, u.nama_lengkap AS nama_reviewer,
      k.id_kriteria, k.nama_kriteria, k.bobot,
      d.skor, d.nilai, d.catatan
     FROM t_penilaian_reviewer p
     JOIN t_distribusi_reviewer dr ON dr.id_distribusi = p.id_distribusi
     JOIN m_user u ON u.id_user = dr.id_reviewer
     JOIN t_proposal pr ON pr.id_proposal = dr.id_proposal
     JOIN t_penilaian_reviewer_detail d ON d.id_penilaian = p.id_penilaian
     JOIN m_kriteria_penilaian k ON k.id_kriteria = d.id_kriteria
     JOIN m_tahap_penilaian t ON t.id_tahap = p.id_tahap
     WHERE pr.id_program = $1 AND pr.id_proposal = $2 AND t.urutan = 1 AND p.status = 1
     ORDER BY u.id_user, k.urutan`,
    [id_program, id_proposal]
  );
  return rows;
};

const countDistribusiReviewerTahap1Db = async (id_program, id_proposal) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM t_distribusi_reviewer dr
     JOIN t_proposal p ON p.id_proposal = dr.id_proposal
     JOIN m_tahap_penilaian t ON t.id_program = p.id_program AND t.urutan = dr.tahap
     WHERE p.id_program = $1 AND dr.id_proposal = $2 AND t.urutan = 1 AND dr.status IN (1, 3, 4)`,
    [id_program, id_proposal]
  );
  return rows[0].total;
};

const countSubmittedReviewerTahap1Db = async (id_program, id_proposal) => {
  await ensureReviewerPenilaianSchema();
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM t_penilaian_reviewer pr
     JOIN t_distribusi_reviewer dr ON dr.id_distribusi = pr.id_distribusi
     JOIN t_proposal p ON p.id_proposal = dr.id_proposal
     JOIN m_tahap_penilaian t ON t.id_program = p.id_program AND t.urutan = pr.id_tahap
     WHERE p.id_program = $1 AND dr.id_proposal = $2 AND t.urutan = 1 AND pr.status = 1`,
    [id_program, id_proposal]
  );
  return rows[0].total;
};

const updateStatusProposalTahap1Db = async (id_program, id_proposal, status) => {
  const { rows } = await pool.query(
    `UPDATE t_proposal SET status = $3
     WHERE id_program = $1 AND id_proposal = $2
     RETURNING *`,
    [id_program, id_proposal, status]
  );
  return rows[0];
};

const getListProposalRekapTahap1Db = async (id_program) => {
  await ensureReviewerPenilaianSchema();
  const { rows } = await pool.query(
    `SELECT DISTINCT
      p.id_proposal, p.judul, p.status,
      t.nama_tim, k.nama_kategori,
      COUNT(DISTINCT dr.id_distribusi) FILTER (WHERE dr.status IN (1, 3, 4)) AS total_reviewer,
      COUNT(DISTINCT pr.id_penilaian) FILTER (WHERE pr.status = 1) AS total_submit
     FROM t_proposal p
     JOIN t_tim t ON t.id_tim = p.id_tim
     JOIN m_kategori k ON k.id_kategori = p.id_kategori
     LEFT JOIN t_distribusi_reviewer dr ON dr.id_proposal = p.id_proposal
     LEFT JOIN m_tahap_penilaian tp ON tp.id_program = p.id_program AND tp.urutan = dr.tahap AND tp.urutan = 1
     LEFT JOIN t_penilaian_reviewer pr ON pr.id_distribusi = dr.id_distribusi
     WHERE p.id_program = $1 AND p.status IN (2, 3, 4)
     GROUP BY p.id_proposal, p.judul, p.status, t.nama_tim, k.nama_kategori
     ORDER BY p.id_proposal ASC`,
    [id_program]
  );
  return rows;
};

const getListProposalRekapTahap2Db = async (id_program) => {
  await ensureReviewerPenilaianSchema();
  const { rows } = await pool.query(
    `SELECT
      p.id_proposal, p.judul, p.status,
      t.nama_tim, k.nama_kategori,
      (
        SELECT COUNT(DISTINCT dr.id_distribusi) FROM t_distribusi_reviewer dr
        JOIN m_tahap_penilaian tp ON tp.id_program = p.id_program AND tp.urutan = dr.tahap AND tp.urutan = 2
        WHERE dr.id_proposal = p.id_proposal AND dr.status IN (1, 3, 4)
      ) + (
        SELECT COUNT(DISTINCT dj.id_distribusi) FROM t_distribusi_juri dj
        JOIN m_tahap_penilaian tp ON tp.id_program = p.id_program AND tp.urutan = dj.tahap AND tp.urutan = 2
        WHERE dj.id_proposal = p.id_proposal AND dj.status IN (1, 3, 4)
      ) AS total_panel,
      (
        SELECT COUNT(DISTINCT pr.id_penilaian) FROM t_penilaian_reviewer pr
        JOIN t_distribusi_reviewer dr ON dr.id_distribusi = pr.id_distribusi
        JOIN m_tahap_penilaian tp ON tp.id_program = p.id_program AND tp.urutan = pr.id_tahap AND tp.urutan = 2
        WHERE dr.id_proposal = p.id_proposal AND pr.status = 1
      ) + (
        SELECT COUNT(DISTINCT pj.id_penilaian) FROM t_penilaian_juri pj
        JOIN t_distribusi_juri dj ON dj.id_distribusi = pj.id_distribusi
        JOIN m_tahap_penilaian tp ON tp.id_program = p.id_program AND tp.urutan = pj.id_tahap AND tp.urutan = 2
        WHERE dj.id_proposal = p.id_proposal AND pj.status = 1
      ) AS total_submit
     FROM t_proposal p
     JOIN t_tim t ON t.id_tim = p.id_tim
     JOIN m_kategori k ON k.id_kategori = p.id_kategori
     WHERE p.id_program = $1 AND p.status IN (5, 6, 7, 8)
     ORDER BY p.id_proposal ASC`,
    [id_program]
  );
  return rows;
};

const countDistribusiPanelTahap2Db = async (id_program, id_proposal) => {
  const { rows } = await pool.query(
    `SELECT (
       SELECT COUNT(*) FROM t_distribusi_reviewer dr
       JOIN t_proposal p ON p.id_proposal = dr.id_proposal
       JOIN m_tahap_penilaian t ON t.id_program = p.id_program AND t.urutan = dr.tahap
       WHERE p.id_program = $1 AND dr.id_proposal = $2 AND t.urutan = 2 AND dr.status IN (1, 3, 4)
     ) + (
       SELECT COUNT(*) FROM t_distribusi_juri dj
       JOIN t_proposal p ON p.id_proposal = dj.id_proposal
       JOIN m_tahap_penilaian t ON t.id_program = p.id_program AND t.urutan = dj.tahap
       WHERE p.id_program = $1 AND dj.id_proposal = $2 AND t.urutan = 2 AND dj.status IN (1, 3, 4)
     ) AS total`,
    [id_program, id_proposal]
  );
  return Number(rows[0].total);
};

const countSubmittedPanelTahap2Db = async (id_program, id_proposal) => {
  await ensureReviewerPenilaianSchema();
  const { rows } = await pool.query(
    `SELECT (
       SELECT COUNT(*) FROM t_penilaian_reviewer pr
       JOIN t_distribusi_reviewer dr ON dr.id_distribusi = pr.id_distribusi
       JOIN t_proposal p ON p.id_proposal = dr.id_proposal
       JOIN m_tahap_penilaian t ON t.id_program = p.id_program AND t.urutan = pr.id_tahap
       WHERE p.id_program = $1 AND dr.id_proposal = $2 AND t.urutan = 2 AND pr.status = 1
     ) + (
       SELECT COUNT(*) FROM t_penilaian_juri pj
       JOIN t_distribusi_juri dj ON dj.id_distribusi = pj.id_distribusi
       JOIN t_proposal p ON p.id_proposal = dj.id_proposal
       JOIN m_tahap_penilaian t ON t.id_program = p.id_program AND t.urutan = pj.id_tahap
       WHERE p.id_program = $1 AND dj.id_proposal = $2 AND t.urutan = 2 AND pj.status = 1
     ) AS total`,
    [id_program, id_proposal]
  );
  return Number(rows[0].total);
};

const updateStatusProposalTahap2Db = async (client, id_program, id_proposal, status) => {
  const { rows } = await client.query(
    `UPDATE t_proposal SET status = $3
     WHERE id_program = $1 AND id_proposal = $2
     RETURNING *`,
    [id_program, id_proposal, status]
  );
  return rows[0];
};

const getRekapReviewerTahap2Db = async (id_program, id_proposal) => {
  await ensureReviewerPenilaianSchema();
  const { rows } = await pool.query(
    `SELECT
      pr.id_proposal, pr.judul,
      p.id_penilaian, p.submitted_at,
      u.id_user AS id_reviewer, u.nama_lengkap AS nama_reviewer,
      k.id_kriteria, k.nama_kriteria, k.bobot,
      d.skor, d.nilai, d.catatan
     FROM t_penilaian_reviewer p
     JOIN t_distribusi_reviewer dr ON dr.id_distribusi = p.id_distribusi
     JOIN m_user u ON u.id_user = dr.id_reviewer
     JOIN t_proposal pr ON pr.id_proposal = dr.id_proposal
     JOIN t_penilaian_reviewer_detail d ON d.id_penilaian = p.id_penilaian
     JOIN m_kriteria_penilaian k ON k.id_kriteria = d.id_kriteria
     JOIN m_tahap_penilaian t ON t.id_tahap = p.id_tahap
     WHERE pr.id_program = $1 AND pr.id_proposal = $2 AND t.urutan = 2 AND p.status = 1
     ORDER BY u.id_user, k.urutan`,
    [id_program, id_proposal]
  );
  return rows;
};

const getRekapJuriTahap2Db = async (id_program, id_proposal) => {
  const { rows } = await pool.query(
    `SELECT
      pr.id_proposal, pr.judul,
      p.id_penilaian, p.submitted_at,
      u.id_user AS id_juri, u.nama_lengkap AS nama_juri,
      k.id_kriteria, k.nama_kriteria, k.bobot,
      d.skor, d.nilai, d.catatan
     FROM t_penilaian_juri p
     JOIN t_distribusi_juri dj ON dj.id_distribusi = p.id_distribusi
     JOIN m_user u ON u.id_user = dj.id_juri
     JOIN t_proposal pr ON pr.id_proposal = dj.id_proposal
     JOIN t_penilaian_juri_detail d ON d.id_penilaian = p.id_penilaian
     JOIN m_kriteria_penilaian k ON k.id_kriteria = d.id_kriteria
     JOIN m_tahap_penilaian t ON t.id_tahap = p.id_tahap
     WHERE pr.id_program = $1 AND pr.id_proposal = $2 AND t.urutan = 2 AND p.status = 1
     ORDER BY u.id_user, k.urutan`,
    [id_program, id_proposal]
  );
  return rows;
};

const insertPesertaProgramByTimDb = async (client, id_tim, id_program) => {
  const { rows } = await client.query(
    `INSERT INTO t_peserta_program (id_user, id_program, tahun, status_lolos, id_tim)
     SELECT a.id_user, $2, EXTRACT(YEAR FROM now())::int, 1, $1
     FROM t_anggota_tim a WHERE a.id_tim = $1 AND a.status = 1
     ON CONFLICT (id_user, id_program)
     DO UPDATE SET status_lolos = 1, id_tim = EXCLUDED.id_tim
     RETURNING *`,
    [id_tim, id_program]
  );
  return rows;
};

const getProposalTimDb = async (id_program, id_proposal) => {
  const { rows } = await pool.query(
    `SELECT id_tim FROM t_proposal WHERE id_program = $1 AND id_proposal = $2`,
    [id_program, id_proposal]
  );
  return rows[0] || null;
};

module.exports = {
  getRekapReviewerTahap1Db,
  countDistribusiReviewerTahap1Db,
  countSubmittedReviewerTahap1Db,
  updateStatusProposalTahap1Db,
  getListProposalRekapTahap1Db,
  getListProposalRekapTahap2Db,
  countDistribusiPanelTahap2Db,
  countSubmittedPanelTahap2Db,
  updateStatusProposalTahap2Db,
  getRekapReviewerTahap2Db,
  getRekapJuriTahap2Db,
  insertPesertaProgramByTimDb,
  getProposalTimDb,
};