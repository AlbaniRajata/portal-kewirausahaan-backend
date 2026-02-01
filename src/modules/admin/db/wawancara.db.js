const pool = require("../../../config/db");

const getProposalByIdDb = async (id_proposal) => {
  const q = `
    SELECT *
    FROM t_proposal
    WHERE id_proposal = $1
  `;

  const { rows } = await pool.query(q, [id_proposal]);
  return rows[0] || null;
};

const scheduleWawancaraDb = async (id_proposal, wawancara_at) => {
  const q = `
    UPDATE t_proposal
    SET status = 5,
        wawancara_at = $2
    WHERE id_proposal = $1
      AND status = 4
    RETURNING *
  `;

  const { rows } = await pool.query(q, [id_proposal, wawancara_at]);

  return rows[0] || null;
};

const scheduleWawancaraBulkDb = async (items) => {
  const results = [];

  for (const item of items) {
    const q = `
      UPDATE t_proposal
      SET status = 5,
          wawancara_at = $2
      WHERE id_proposal = $1
        AND status = 4
      RETURNING *
    `;

    const { rows } = await pool.query(q, [item.id_proposal, item.wawancara_at]);

    results.push({
      id_proposal: item.id_proposal,
      success: rows.length > 0,
      data: rows[0] || null,
    });
  }

  return results;
};

module.exports = {
  getProposalByIdDb,
  scheduleWawancaraDb,
  scheduleWawancaraBulkDb,
};
