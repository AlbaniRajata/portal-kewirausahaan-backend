const pool = require("../../../config/db");

const getDistribusiForPenilaianDb = async (id_distribusi) => {
  const q = `
    SELECT
      d.id_distribusi,
      d.id_reviewer,
      d.status AS status_distribusi,
      d.tahap AS id_tahap,

      t.penilaian_mulai,
      t.penilaian_selesai,

      p.id_proposal,
      p.judul,
      p.status AS status_proposal
    FROM t_distribusi_reviewer d
    JOIN m_tahap_penilaian t ON t.id_tahap = d.tahap
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    WHERE d.id_distribusi = $1
  `;

  const { rows } = await pool.query(q, [id_distribusi]);
  return rows[0] || null;
};

const getKriteriaByTahapDb = async (id_tahap) => {
  const q = `
    SELECT
      id_kriteria,
      nama_kriteria,
      deskripsi,
      bobot
    FROM m_kriteria_penilaian
    WHERE id_tahap = $1
      AND status = 1
    ORDER BY urutan ASC
  `;

  const { rows } = await pool.query(q, [id_tahap]);
  return rows;
};

const getOrCreatePenilaianDb = async (id_distribusi, id_tahap) => {
  const insert = `
    INSERT INTO t_penilaian_reviewer (id_distribusi, id_tahap)
    VALUES ($1, $2)
    ON CONFLICT (id_distribusi)
    DO NOTHING
  `;

  await pool.query(insert, [id_distribusi, id_tahap]);

  const q = `
    SELECT *
    FROM t_penilaian_reviewer
    WHERE id_distribusi = $1
  `;

  const { rows } = await pool.query(q, [id_distribusi]);
  return rows[0];
};

const getDetailNilaiDb = async (id_penilaian) => {
  const q = `
    SELECT
      d.id_kriteria,
      k.nama_kriteria,
      k.bobot,
      d.skor,
      d.nilai,
      d.catatan
    FROM t_penilaian_reviewer_detail d
    JOIN m_kriteria_penilaian k ON k.id_kriteria = d.id_kriteria
    WHERE d.id_penilaian = $1
    ORDER BY k.urutan ASC
  `;

  const { rows } = await pool.query(q, [id_penilaian]);
  return rows;
};

const upsertNilaiDb = async (
  id_penilaian,
  id_kriteria,
  skor,
  nilai,
  catatan
) => {
  const q = `
    INSERT INTO t_penilaian_reviewer_detail
      (id_penilaian, id_kriteria, skor, nilai, catatan)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id_penilaian, id_kriteria)
    DO UPDATE SET
      skor = EXCLUDED.skor,
      nilai = EXCLUDED.nilai,
      catatan = EXCLUDED.catatan,
      updated_at = now()
    RETURNING *
  `;

  const { rows } = await pool.query(q, [
    id_penilaian,
    id_kriteria,
    skor,
    nilai,
    catatan,
  ]);

  return rows[0];
};

const submitPenilaianDb = async (id_penilaian) => {
  const q = `
    UPDATE t_penilaian_reviewer
    SET status = 1,
        submitted_at = now()
    WHERE id_penilaian = $1
    RETURNING *
  `;

  const { rows } = await pool.query(q, [id_penilaian]);
  return rows[0];
};

const markDistribusiSelesaiDb = async (id_distribusi) => {
  const q = `
    UPDATE t_distribusi_reviewer
    SET status = 3,
        responded_at = now()
    WHERE id_distribusi = $1
    RETURNING *
  `;

  const { rows } = await pool.query(q, [id_distribusi]);
  return rows[0];
};

module.exports = {
  getDistribusiForPenilaianDb,
  getKriteriaByTahapDb,
  getOrCreatePenilaianDb,
  getDetailNilaiDb,
  upsertNilaiDb,
  submitPenilaianDb,
  markDistribusiSelesaiDb,
};
