const pool = require("../../../config/db");

const getTimKetuaDb = async (id_user, id_program) => {
  const q = `
    SELECT t.id_tim, t.nama_tim
    FROM t_tim t
    JOIN t_anggota_tim a ON a.id_tim = t.id_tim
    WHERE a.id_user = $1
    AND a.peran = 1
    AND a.status = 1
    AND t.id_program = $2
  `;
  const { rows } = await pool.query(q, [id_user, id_program]);
  return rows[0];
};

const getAnggotaTimDetailDb = async (id_tim) => {
  const q = `
    SELECT
      u.id_user,
      u.nama_lengkap,
      u.username,
      a.status,
      a.catatan
    FROM t_anggota_tim a
    JOIN m_user u ON u.id_user = a.id_user
    WHERE a.id_tim = $1
  `;
  const { rows } = await pool.query(q, [id_tim]);

  const pending = rows.filter(r => r.status === 0);
  const accepted = rows.filter(r => r.status === 1);

  return {
    total: rows.length,
    accepted: accepted.length,
    pending: pending.length,
    all_accepted: pending.length === 0,
    pending_members: pending,
  };
};

const checkAnggotaTimDb = async (id_tim) => {
  const q = `
    SELECT
      COUNT(*)::int AS total,
      BOOL_AND(status = 1) AS all_accepted
    FROM t_anggota_tim
    WHERE id_tim = $1
  `;
  const { rows } = await pool.query(q, [id_tim]);
  return rows[0];
};

const checkProposalExistsDb = async (id_tim) => {
  const { rows } = await pool.query(
    `SELECT 1 FROM t_proposal WHERE id_tim = $1`,
    [id_tim]
  );
  return rows.length > 0;
};

const createProposalDb = async (id_tim, data) => {
  const q = `
    INSERT INTO t_proposal
    (id_tim, id_program, id_kategori, judul, modal_diajukan, file_proposal, status, tanggal_submit)
    VALUES ($1,$2,$3,$4,$5,$6,0,now())
    RETURNING *
  `;
  const { rows } = await pool.query(q, [
    id_tim,
    data.id_program,
    data.id_kategori,
    data.judul,
    data.modal_diajukan,
    data.file_proposal,
  ]);
  return rows[0];
};

const updateProposalDb = async (id_proposal, data) => {
  const fields = [];
  const values = [];
  let i = 1;

  Object.keys(data).forEach((key) => {
    fields.push(`${key} = $${i++}`);
    values.push(data[key]);
  });

  values.push(id_proposal);

  const q = `
    UPDATE t_proposal
    SET ${fields.join(", ")}
    WHERE id_proposal = $${i}
  `;
  await pool.query(q, values);
};

const getProposalDetailDb = async (id_proposal) => {
  const q = `
    SELECT
      p.id_proposal,
      p.judul,
      p.modal_diajukan,
      p.file_proposal,
      p.status,
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
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN t_anggota_tim a ON a.id_tim = t.id_tim AND a.peran = 1
    JOIN m_user u ON u.id_user = a.id_user
    WHERE p.id_proposal = $1
  `;
  const { rows } = await pool.query(q, [id_proposal]);
  return rows[0];
};

const getProgramTimelineDb = async (id_program) => {
  const q = `
    SELECT pendaftaran_mulai, pendaftaran_selesai
    FROM m_program
    WHERE id_program = $1
  `;
  const { rows } = await pool.query(q, [id_program]);
  return rows[0];
};

module.exports = {
  getTimKetuaDb,
  getAnggotaTimDetailDb,
  checkAnggotaTimDb,
  checkProposalExistsDb,
  createProposalDb,
  updateProposalDb,
  getProposalDetailDb,
  getProgramTimelineDb,
};
