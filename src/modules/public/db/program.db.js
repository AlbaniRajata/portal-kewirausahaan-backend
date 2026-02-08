const pool = require("../../../config/db");

const getAllProgramDb = async () => {
    const q = `
        SELECT
            id_program,
            nama_program,
            keterangan,
            pendaftaran_mulai,
            pendaftaran_selesai
        FROM m_program
        ORDER BY id_program ASC
    `;

    const { rows } = await pool.query(q);
    return rows;
};

module.exports = {
    getAllProgramDb,
};