const pool = require("../../../config/db");

const getAllKampusDb = async () => {
  const q = `SELECT * FROM m_kampus ORDER BY nama_kampus ASC`;
  const { rows } = await pool.query(q);
  return rows;
};

const getKampusByIdDb = async (id_kampus) => {
  const q = `SELECT * FROM m_kampus WHERE id_kampus = $1`;
  const { rows } = await pool.query(q, [id_kampus]);
  return rows[0] || null;
};

const getKampusByNamaDb = async (nama_kampus, exclude_id = null) => {
  let q = `SELECT id_kampus FROM m_kampus WHERE nama_kampus = $1`;
  const values = [nama_kampus];
  if (exclude_id) {
    q += ` AND id_kampus != $2`;
    values.push(exclude_id);
  }
  const { rows } = await pool.query(q, values);
  return rows.length > 0;
};

const insertKampusDb = async (data) => {
  const q = `INSERT INTO m_kampus (nama_kampus) VALUES ($1) RETURNING *`;
  const { rows } = await pool.query(q, [data.nama_kampus]);
  return rows[0];
};

const updateKampusDb = async (id_kampus, data) => {
  const q = `UPDATE m_kampus SET nama_kampus = $2 WHERE id_kampus = $1 RETURNING *`;
  const { rows } = await pool.query(q, [id_kampus, data.nama_kampus]);
  return rows[0] || null;
};

const deleteKampusDb = async (id_kampus) => {
  const q = `DELETE FROM m_kampus WHERE id_kampus = $1 RETURNING *`;
  const { rows } = await pool.query(q, [id_kampus]);
  return rows[0] || null;
};

const getAllJurusanDb = async () => {
  const q = `SELECT * FROM m_jurusan ORDER BY nama_jurusan ASC`;
  const { rows } = await pool.query(q);
  return rows;
};

const getJurusanByIdDb = async (id_jurusan) => {
  const q = `SELECT * FROM m_jurusan WHERE id_jurusan = $1`;
  const { rows } = await pool.query(q, [id_jurusan]);
  return rows[0] || null;
};

const getJurusanByNamaDb = async (nama_jurusan, exclude_id = null) => {
  let q = `SELECT id_jurusan FROM m_jurusan WHERE nama_jurusan = $1`;
  const values = [nama_jurusan];
  if (exclude_id) {
    q += ` AND id_jurusan != $2`;
    values.push(exclude_id);
  }
  const { rows } = await pool.query(q, values);
  return rows.length > 0;
};

const insertJurusanDb = async (data) => {
  const q = `INSERT INTO m_jurusan (nama_jurusan) VALUES ($1) RETURNING *`;
  const { rows } = await pool.query(q, [data.nama_jurusan]);
  return rows[0];
};

const updateJurusanDb = async (id_jurusan, data) => {
  const q = `UPDATE m_jurusan SET nama_jurusan = $2 WHERE id_jurusan = $1 RETURNING *`;
  const { rows } = await pool.query(q, [id_jurusan, data.nama_jurusan]);
  return rows[0] || null;
};

const deleteJurusanDb = async (id_jurusan) => {
  const q = `DELETE FROM m_jurusan WHERE id_jurusan = $1 RETURNING *`;
  const { rows } = await pool.query(q, [id_jurusan]);
  return rows[0] || null;
};

const getAllProdiDb = async () => {
  const q = `
    SELECT
      p.id_prodi,
      p.nama_prodi,
      p.jenjang,
      j.id_jurusan,
      j.nama_jurusan,
      k.id_kampus,
      k.nama_kampus
    FROM m_prodi p
    JOIN m_jurusan j ON j.id_jurusan = p.id_jurusan
    JOIN m_kampus k ON k.id_kampus = p.id_kampus
    ORDER BY p.nama_prodi ASC
  `;
  const { rows } = await pool.query(q);
  return rows;
};

const getProdiByIdDb = async (id_prodi) => {
  const q = `
    SELECT
      p.id_prodi,
      p.nama_prodi,
      p.jenjang,
      j.id_jurusan,
      j.nama_jurusan,
      k.id_kampus,
      k.nama_kampus
    FROM m_prodi p
    JOIN m_jurusan j ON j.id_jurusan = p.id_jurusan
    JOIN m_kampus k ON k.id_kampus = p.id_kampus
    WHERE p.id_prodi = $1
  `;
  const { rows } = await pool.query(q, [id_prodi]);
  return rows[0] || null;
};

const checkProdiDuplicateDb = async (id_kampus, nama_prodi, jenjang, exclude_id = null) => {
  let q = `
    SELECT id_prodi FROM m_prodi
    WHERE id_kampus = $1 AND nama_prodi = $2 AND jenjang = $3
  `;
  const values = [id_kampus, nama_prodi, jenjang];
  if (exclude_id) {
    q += ` AND id_prodi != $4`;
    values.push(exclude_id);
  }
  const { rows } = await pool.query(q, values);
  return rows.length > 0;
};

const insertProdiDb = async (data) => {
  const q = `
    INSERT INTO m_prodi (id_jurusan, id_kampus, nama_prodi, jenjang)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const { rows } = await pool.query(q, [
    data.id_jurusan,
    data.id_kampus,
    data.nama_prodi,
    data.jenjang,
  ]);
  return rows[0];
};

const updateProdiDb = async (id_prodi, data) => {
  const q = `
    UPDATE m_prodi
    SET id_jurusan = $2,
        id_kampus = $3,
        nama_prodi = $4,
        jenjang = $5
    WHERE id_prodi = $1
    RETURNING *
  `;
  const { rows } = await pool.query(q, [
    id_prodi,
    data.id_jurusan,
    data.id_kampus,
    data.nama_prodi,
    data.jenjang,
  ]);
  return rows[0] || null;
};

const deleteProdiDb = async (id_prodi) => {
  const q = `DELETE FROM m_prodi WHERE id_prodi = $1 RETURNING *`;
  const { rows } = await pool.query(q, [id_prodi]);
  return rows[0] || null;
};

module.exports = {
  getAllKampusDb,
  getKampusByIdDb,
  getKampusByNamaDb,
  insertKampusDb,
  updateKampusDb,
  deleteKampusDb,
  getAllJurusanDb,
  getJurusanByIdDb,
  getJurusanByNamaDb,
  insertJurusanDb,
  updateJurusanDb,
  deleteJurusanDb,
  getAllProdiDb,
  getProdiByIdDb,
  checkProdiDuplicateDb,
  insertProdiDb,
  updateProdiDb,
  deleteProdiDb,
};