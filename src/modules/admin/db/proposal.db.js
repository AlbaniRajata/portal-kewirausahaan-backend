const pool = require("../../../config/db");

const getProposalListDb = async ({ id_program, status }) => {
  const values = [];
  let i = 1;
  let where = "WHERE 1=1";

  if (id_program) {
    where += ` AND p.id_program = $${i++}`;
    values.push(id_program);
  }

  if (status !== undefined) {
    where += ` AND p.status = $${i++}`;
    values.push(status);
  }

  const q = `
    SELECT
      p.id_proposal,
      p.judul,
      p.status,
      p.tanggal_submit,
      pr.id_program,
      pr.nama_program,
      t.id_tim,
      t.nama_tim,
      json_build_object(
        'id_user', u.id_user,
        'nama_lengkap', u.nama_lengkap,
        'username', u.username
      ) AS ketua
    FROM t_proposal p
    JOIN m_program pr ON pr.id_program = p.id_program
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN t_anggota_tim a ON a.id_tim = t.id_tim AND a.peran = 1
    JOIN m_user u ON u.id_user = a.id_user
    ${where}
    ORDER BY p.tanggal_submit DESC
  `;

  const { rows } = await pool.query(q, values);
  return rows;
};

const getProposalDetailAdminDb = async (id_proposal) => {
  const q = `
    SELECT
      p.id_proposal,
      p.judul,
      p.modal_diajukan,
      p.file_proposal,
      p.status,
      p.tanggal_submit,
      pr.id_program,
      pr.nama_program,
      k.id_kategori,
      k.nama_kategori,
      t.id_tim,
      t.nama_tim,
      json_build_object(
        'id_user', u.id_user,
        'nama_lengkap', u.nama_lengkap,
        'username', u.username
      ) AS ketua,
      (
        SELECT json_agg(
          json_build_object(
            'id_user', um.id_user,
            'nama_lengkap', um.nama_lengkap,
            'username', um.username,
            'peran', at.peran,
            'status', at.status
          ) ORDER BY at.peran DESC, um.nama_lengkap
        )
        FROM t_anggota_tim at
        JOIN m_user um ON um.id_user = at.id_user
        WHERE at.id_tim = t.id_tim
      ) AS anggota_tim
    FROM t_proposal p
    JOIN m_program pr ON pr.id_program = p.id_program
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN t_anggota_tim a ON a.id_tim = t.id_tim AND a.peran = 1
    JOIN m_user u ON u.id_user = a.id_user
    WHERE p.id_proposal = $1
  `;

  const { rows } = await pool.query(q, [id_proposal]);
  return rows[0];
};

const getMonitoringDistribusiDb = async ({ id_program, tahap, status }) => {
  const values = [];
  let i = 1;
  let where = "WHERE 1=1";

  if (id_program) {
    where += ` AND p.id_program = $${i++}`;
    values.push(id_program);
  }

  if (tahap !== undefined) {
    where += ` AND d.tahap = $${i++}`;
    values.push(tahap);
  }

  if (status !== undefined) {
    where += ` AND d.status = $${i++}`;
    values.push(status);
  }

  const q = `
    SELECT
      d.id_distribusi,
      d.status AS status_penugasan,
      d.tahap,
      d.assigned_at,
      d.responded_at,
      d.catatan_reviewer,

      p.id_proposal,
      p.judul,
      p.modal_diajukan,

      t.nama_tim,
      pr.nama_program,

      u.id_user AS id_reviewer,
      u.nama_lengkap AS nama_reviewer
    FROM t_distribusi_reviewer d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_program pr ON pr.id_program = p.id_program
    JOIN m_user u ON u.id_user = d.id_reviewer
    ${where}
    ORDER BY d.assigned_at DESC
  `;

  const { rows } = await pool.query(q, values);
  return rows;
};

module.exports = {
  getProposalListDb,
  getProposalDetailAdminDb,
  getMonitoringDistribusiDb,
};
