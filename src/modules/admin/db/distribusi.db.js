const pool = require("../../../config/db");

const getReviewerAktifDb = async () => {
  const q = `
    SELECT r.id_user, u.nama_lengkap
    FROM m_reviewer r
    JOIN m_user u ON u.id_user = r.id_user
    WHERE u.is_active = true
    ORDER BY u.nama_lengkap
  `;
  const { rows } = await pool.query(q);
  return rows;
};

const getJuriAktifDb = async () => {
  const q = `
    SELECT j.id_user, u.nama_lengkap
    FROM m_juri j
    JOIN m_user u ON u.id_user = j.id_user
    WHERE u.is_active = true
    ORDER BY u.nama_lengkap
  `;
  const { rows } = await pool.query(q);
  return rows;
};

const getProposalSiapDistribusiDb = async (tahap) => {
  const statusProposal = tahap === 1 ? 1 : 5;

  const q = `
    SELECT
      p.id_proposal,
      p.judul,
      p.modal_diajukan,
      p.status,
      p.tanggal_submit,
      t.id_tim,
      t.nama_tim,
      pr.id_program,
      pr.nama_program,
      k.id_kategori,
      k.nama_kategori
    FROM t_proposal p
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_program pr ON pr.id_program = p.id_program
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    WHERE p.status = $1
      AND NOT EXISTS (
        SELECT 1 FROM t_distribusi_reviewer d
        WHERE d.id_proposal = p.id_proposal
          AND d.tahap = $2
      )
    ORDER BY p.id_proposal
  `;
  const { rows } = await pool.query(q, [statusProposal, tahap]);
  return rows;
};

const insertDistribusiReviewerDb = async (client, data) => {
  const q = `
    INSERT INTO t_distribusi_reviewer
      (id_proposal, id_reviewer, tahap, assigned_by)
    VALUES ($1,$2,$3,$4)
  `;
  await client.query(q, data);
};

const insertDistribusiJuriDb = async (client, data) => {
  const q = `
    INSERT INTO t_distribusi_juri
      (id_proposal, id_juri, tahap, assigned_by)
    VALUES ($1,$2,$3,$4)
  `;
  await client.query(q, data);
};

const checkDistribusiReviewerExistsDb = async (
  id_proposal,
  id_reviewer,
  tahap
) => {
  const q = `
    SELECT 1
    FROM t_distribusi_reviewer
    WHERE id_proposal=$1 AND id_reviewer=$2 AND tahap=$3
  `;
  const { rows } = await pool.query(q, [id_proposal, id_reviewer, tahap]);
  return rows.length > 0;
};

const checkDistribusiJuriExistsDb = async (id_proposal, id_juri, tahap) => {
  const q = `
    SELECT 1
    FROM t_distribusi_juri
    WHERE id_proposal=$1 AND id_juri=$2 AND tahap=$3
  `;
  const { rows } = await pool.query(q, [id_proposal, id_juri, tahap]);
  return rows.length > 0;
};

const updateStatusProposalDistribusiDb = async (client, id_proposal, tahap) => {
  const newStatus = tahap === 1 ? 2 : 6;

  const q = `
    UPDATE t_proposal
    SET status = $1
    WHERE id_proposal = $2
    RETURNING *
  `;
  const { rows } = await client.query(q, [newStatus, id_proposal]);
  return rows[0];
};

module.exports = {
  getReviewerAktifDb,
  getJuriAktifDb,
  getProposalSiapDistribusiDb,
  insertDistribusiReviewerDb,
  insertDistribusiJuriDb,
  checkDistribusiReviewerExistsDb,
  checkDistribusiJuriExistsDb,
  updateStatusProposalDistribusiDb,
};
