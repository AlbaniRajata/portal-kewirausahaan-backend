const pool = require("../../../config/db");

const getAllProdiDb = async (search = null) => {
    let q = `
        SELECT
            p.id_prodi,
            p.nama_prodi,
            p.jenjang,
            p.id_jurusan,
            p.id_kampus,
            j.nama_jurusan,
            k.nama_kampus
        FROM m_prodi p
        JOIN m_jurusan j ON p.id_jurusan = j.id_jurusan
        JOIN m_kampus k ON p.id_kampus = k.id_kampus
    `;

    const params = [];

    if (search) {
        q += ` WHERE 
            LOWER(p.nama_prodi) LIKE $1 OR
            LOWER(j.nama_jurusan) LIKE $1 OR
            LOWER(k.nama_kampus) LIKE $1 OR
            LOWER(p.jenjang) LIKE $1
        `;
        params.push(`%${search.toLowerCase()}%`);
    }

    q += ` ORDER BY k.nama_kampus ASC, j.nama_jurusan ASC, p.nama_prodi ASC `;

    const { rows } = await pool.query(q, params);
    return rows;
};

module.exports = {
    getAllProdiDb,
};