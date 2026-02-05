const pool = require("../../../config/db");

const getAllProdiDb = async (search = null) => {
    let q = `
        SELECT
            id_prodi,
            nama_prodi,
            jenjang
        FROM m_prodi
    `;

    const params = [];

    if (search) {
        q += ` WHERE LOWER(nama_prodi) LIKE $1 `;
        params.push(`%${search.toLowerCase()}%`);
    }

    q += ` ORDER BY nama_prodi ASC `;

    const { rows } = await pool.query(q, params);
    return rows;
};

module.exports = {
    getAllProdiDb,
};
