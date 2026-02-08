const pool = require("../../../config/db");

const getAllKategoriDb = async () => {
    const q = `
        SELECT
            id_kategori,
            nama_kategori,
            keterangan
        FROM m_kategori
        ORDER BY nama_kategori ASC
    `;

    const { rows } = await pool.query(q);
    return rows;
};

module.exports = {
    getAllKategoriDb,
};