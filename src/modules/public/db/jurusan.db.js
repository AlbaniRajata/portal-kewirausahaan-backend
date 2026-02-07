const pool = require("../../../config/db");

const getAllJurusanDb = async () => {
    const q = `
        SELECT
            id_jurusan,
            nama_jurusan
        FROM m_jurusan
        ORDER BY nama_jurusan ASC
    `;

    const { rows } = await pool.query(q);
    return rows;
};

module.exports = {
    getAllJurusanDb,
};