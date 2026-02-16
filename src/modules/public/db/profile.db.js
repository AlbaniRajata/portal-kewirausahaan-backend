const pool = require("../../../config/db");

const getProfileByIdDb = async (id_user) => {
  const q = `
    SELECT
      u.id_user,
      u.nama_lengkap,
      u.email,
      u.foto,
      u.id_role,
      r.nama_role,
      r.keterangan
    FROM m_user u
    JOIN m_role r ON r.id_role = u.id_role
    WHERE u.id_user = $1
  `;

  const { rows } = await pool.query(q, [id_user]);
  return rows[0] || null;
};

module.exports = {
  getProfileByIdDb,
};