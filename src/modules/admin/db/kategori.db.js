const pool = require("../../../config/db");

const getAllKategoriDb = async () => {
  const q = `SELECT * FROM m_kategori ORDER BY nama_kategori ASC`;
  const { rows } = await pool.query(q);
  return rows;
};

const getKategoriByIdDb = async (id_kategori) => {
  const q = `SELECT * FROM m_kategori WHERE id_kategori = $1`;
  const { rows } = await pool.query(q, [id_kategori]);
  return rows[0] || null;
};

const getKategoriByNamaDb = async (nama_kategori, exclude_id = null) => {
  let q = `SELECT id_kategori FROM m_kategori WHERE nama_kategori = $1`;
  const values = [nama_kategori];
  if (exclude_id) {
    q += ` AND id_kategori != $2`;
    values.push(exclude_id);
  }
  const { rows } = await pool.query(q, values);
  return rows.length > 0;
};

const insertKategoriDb = async (data) => {
  const q = `
    INSERT INTO m_kategori (nama_kategori, keterangan)
    VALUES ($1, $2)
    RETURNING *
  `;
  const { rows } = await pool.query(q, [data.nama_kategori, data.keterangan || null]);
  return rows[0];
};

const updateKategoriDb = async (id_kategori, data) => {
  const q = `
    UPDATE m_kategori
    SET nama_kategori = $2,
        keterangan = $3
    WHERE id_kategori = $1
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_kategori, data.nama_kategori, data.keterangan || null]);
  return rows[0] || null;
};

const deleteKategoriDb = async (id_kategori) => {
  const q = `DELETE FROM m_kategori WHERE id_kategori = $1 RETURNING *`;
  const { rows } = await pool.query(q, [id_kategori]);
  return rows[0] || null;
};

module.exports = {
  getAllKategoriDb,
  getKategoriByIdDb,
  getKategoriByNamaDb,
  insertKategoriDb,
  updateKategoriDb,
  deleteKategoriDb,
};