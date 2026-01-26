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

const getProposalSiapDistribusiDb = async (tahap) => {
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
    WHERE p.status = 1
    AND NOT EXISTS (
      SELECT 1 FROM t_distribusi_reviewer d
      WHERE d.id_proposal = p.id_proposal
      AND d.tahap = $1
    )
    ORDER BY p.id_proposal
  `;
  const { rows } = await pool.query(q, [tahap]);
  return rows;
};

const insertDistribusiDb = async (client, data) => {
  const q = `
    INSERT INTO t_distribusi_reviewer
    (id_proposal, id_reviewer, tahap, assigned_by)
    VALUES ($1,$2,$3,$4)
  `;
  await client.query(q, data);
};

const checkDistribusiExistsDb = async (id_proposal, id_reviewer, tahap) => {
  const q = `
    SELECT 1
    FROM t_distribusi_reviewer
    WHERE id_proposal=$1 AND id_reviewer=$2 AND tahap=$3
  `;
  const { rows } = await pool.query(q, [id_proposal, id_reviewer, tahap]);
  return rows.length > 0;
};

module.exports = {
  getReviewerAktifDb,
  getProposalSiapDistribusiDb,
  insertDistribusiDb,
  checkDistribusiExistsDb,
};
