const pool = require("../../../config/db");

const getProgramByIdDb = async (id_program) => {
  const { rows } = await pool.query(
    `SELECT * FROM m_program WHERE id_program = $1`,
    [id_program]
  );
  return rows[0];
};

const updateProgramTimelineDb = async (id_program, data) => {
  const q = `
    UPDATE m_program
    SET pendaftaran_mulai = $1,
        pendaftaran_selesai = $2
    WHERE id_program = $3
  `;
  await pool.query(q, [
    data.pendaftaran_mulai,
    data.pendaftaran_selesai,
    id_program,
  ]);
};

module.exports = {
  getProgramByIdDb,
  updateProgramTimelineDb,
};
