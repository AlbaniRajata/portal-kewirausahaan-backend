const pool = require("../../../config/db");

const generateSlug = (judul) => {
  return judul
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const makeUniqueSlugDb = async (baseSlug, exclude_id = null) => {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    let q = `SELECT id_berita FROM t_berita WHERE slug = $1`;
    const values = [slug];
    if (exclude_id) { q += ` AND id_berita != $2`; values.push(exclude_id); }
    const { rows } = await pool.query(q, values);
    if (!rows.length) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

const getBeritaListAdminDb = async (filters = {}) => {
  const { status, search } = filters;
  const values = [];
  let idx = 1;

  let q = `
    SELECT
      b.id_berita, b.judul, b.slug, b.file_gambar,
      b.status, b.created_at, b.updated_at,
      u.id_user AS id_author, u.nama_lengkap AS nama_author
    FROM t_berita b
    LEFT JOIN m_user u ON u.id_user = b.id_author
    WHERE 1=1
  `;

  if (status !== null && status !== undefined) { q += ` AND b.status = $${idx++}`; values.push(status); }
  if (search) {
    q += ` AND b.judul ILIKE $${idx}`;
    values.push(`%${search}%`); idx++;
  }
  q += ` ORDER BY b.created_at DESC`;
  const { rows } = await pool.query(q, values);
  return rows;
};

const getBeritaDetailAdminDb = async (id_berita) => {
  const { rows } = await pool.query(
    `SELECT
      b.id_berita, b.judul, b.slug, b.isi, b.file_gambar,
      b.status, b.created_at, b.updated_at,
      u.id_user AS id_author, u.nama_lengkap AS nama_author
     FROM t_berita b
     LEFT JOIN m_user u ON u.id_user = b.id_author
     WHERE b.id_berita = $1`,
    [id_berita]
  );
  return rows[0] || null;
};

const createBeritaDb = async (id_author, judul, slug, isi, file_gambar, status) => {
  const { rows } = await pool.query(
    `INSERT INTO t_berita (id_author, judul, slug, isi, file_gambar, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING id_berita, judul, slug, status, created_at`,
    [id_author, judul, slug, isi || null, file_gambar || null, status]
  );
  return rows[0];
};

const updateBeritaDb = async (id_berita, judul, slug, isi, file_gambar, status) => {
  const { rows } = await pool.query(
    `UPDATE t_berita
     SET judul = $2, slug = $3, isi = $4, file_gambar = $5, status = $6, updated_at = NOW()
     WHERE id_berita = $1
     RETURNING id_berita, judul, slug, status, updated_at`,
    [id_berita, judul, slug, isi || null, file_gambar || null, status]
  );
  return rows[0] || null;
};

const updateFileGambarDb = async (id_berita, file_gambar) => {
  const { rows } = await pool.query(
    `UPDATE t_berita SET file_gambar = $2, updated_at = NOW() WHERE id_berita = $1
     RETURNING id_berita, file_gambar`,
    [id_berita, file_gambar]
  );
  return rows[0] || null;
};

const deleteBeritaDb = async (id_berita) => {
  const { rows } = await pool.query(
    `DELETE FROM t_berita WHERE id_berita = $1 RETURNING id_berita, file_gambar`,
    [id_berita]
  );
  return rows[0] || null;
};

const getBeritaListPublikDb = async (filters = {}) => {
  const { search, limit, offset } = filters;
  const values = [];
  let idx = 1;

  let q = `
    SELECT
      b.id_berita, b.judul, b.slug, b.file_gambar,
      b.created_at, b.updated_at,
      u.nama_lengkap AS nama_author
    FROM t_berita b
    LEFT JOIN m_user u ON u.id_user = b.id_author
    WHERE b.status = 1
  `;

  if (search) { q += ` AND b.judul ILIKE $${idx}`; values.push(`%${search}%`); idx++; }
  q += ` ORDER BY b.created_at DESC`;
  if (limit) { q += ` LIMIT $${idx++}`; values.push(limit); }
  if (offset) { q += ` OFFSET $${idx++}`; values.push(offset); }

  const { rows } = await pool.query(q, values);
  return rows;
};

const countBeritaPublikDb = async (search = null) => {
  const values = [];
  let q = `SELECT COUNT(*)::int AS total FROM t_berita WHERE status = 1`;
  if (search) { q += ` AND judul ILIKE $1`; values.push(`%${search}%`); }
  const { rows } = await pool.query(q, values);
  return rows[0].total;
};

const getBeritaBySlugDb = async (slug) => {
  const { rows } = await pool.query(
    `SELECT
      b.id_berita, b.judul, b.slug, b.isi, b.file_gambar,
      b.created_at, b.updated_at,
      u.nama_lengkap AS nama_author
     FROM t_berita b
     LEFT JOIN m_user u ON u.id_user = b.id_author
     WHERE b.slug = $1 AND b.status = 1`,
    [slug]
  );
  return rows[0] || null;
};

module.exports = {
  generateSlug, makeUniqueSlugDb,
  getBeritaListAdminDb, getBeritaDetailAdminDb,
  createBeritaDb, updateBeritaDb, updateFileGambarDb, deleteBeritaDb,
  getBeritaListPublikDb, countBeritaPublikDb, getBeritaBySlugDb,
};