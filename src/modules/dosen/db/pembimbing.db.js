const pool = require("../../../config/db");

const getTimLengkapDb = async (id_tim) => {
  const q = `
    SELECT
      t.id_tim,
      t.nama_tim,
      t.id_program,

      ketua.id_user AS id_ketua,
      ketua.nama_lengkap AS nama_ketua,

      COALESCE(
        json_agg(
          json_build_object(
            'id_user', a.id_user,
            'nama', u.nama_lengkap,
            'peran', a.peran,
            'status', a.status
          )
          ORDER BY a.peran ASC
        ) FILTER (WHERE a.id_user IS NOT NULL),
        '[]'
      ) AS anggota
    FROM t_tim t

    LEFT JOIN t_anggota_tim a
      ON a.id_tim = t.id_tim

    LEFT JOIN m_user u
      ON u.id_user = a.id_user

    LEFT JOIN t_anggota_tim ak
      ON ak.id_tim = t.id_tim AND ak.peran = 1

    LEFT JOIN m_user ketua
      ON ketua.id_user = ak.id_user

    WHERE t.id_tim = $1
    GROUP BY t.id_tim, ketua.id_user, ketua.nama_lengkap
  `;

  const { rows } = await pool.query(q, [id_tim]);
  return rows[0] || null;
};

const getProposalByTimDb = async (id_tim) => {
  const q = `
    SELECT
      p.id_proposal,
      p.judul,
      p.file_proposal,
      p.status,
      p.modal_diajukan,
      p.tanggal_submit,
      p.wawancara_at
    FROM t_proposal p
    WHERE p.id_tim = $1
    ORDER BY p.id_proposal DESC
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_tim]);
  return rows[0] || null;
};

const getPengajuanMasukDb = async (id_dosen) => {
  const q = `
    SELECT
      pg.id_pengajuan,
      pg.status,
      pg.created_at,

      t.id_tim,
      t.nama_tim,

      pr.id_program,
      pr.nama_program,

      u.nama_lengkap AS mahasiswa_pengaju
    FROM t_pengajuan_pembimbing pg
    JOIN t_tim t ON t.id_tim = pg.id_tim
    JOIN m_program pr ON pr.id_program = pg.id_program
    JOIN m_user u ON u.id_user = pg.diajukan_oleh
    WHERE pg.id_dosen = $1
    ORDER BY pg.created_at DESC
  `;
  const { rows } = await pool.query(q, [id_dosen]);
  return rows;
};

const getDetailPengajuanDb = async (id_pengajuan, id_dosen) => {
  const q = `
    SELECT
      pg.*,
      t.nama_tim,
      u.nama_lengkap AS mahasiswa_pengaju
    FROM t_pengajuan_pembimbing pg
    JOIN t_tim t ON t.id_tim = pg.id_tim
    JOIN m_user u ON u.id_user = pg.diajukan_oleh
    WHERE pg.id_pengajuan = $1
      AND pg.id_dosen = $2
  `;
  const { rows } = await pool.query(q, [id_pengajuan, id_dosen]);
  return rows[0] || null;
};

const updateProposalStatusDb = async (id_proposal, status) => {
  const q = `
    UPDATE t_proposal
    SET status = $2
    WHERE id_proposal = $1
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_proposal, status]);
  return rows[0];
};

const approvePengajuanDb = async (id_pengajuan) => {
  const q = `
    UPDATE t_pengajuan_pembimbing
    SET status = 1,
        responded_at = now()
    WHERE id_pengajuan = $1
      AND status = 0
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_pengajuan]);
  return rows[0] || null;
};

const rejectPengajuanDb = async (id_pengajuan, catatan) => {
  const q = `
    UPDATE t_pengajuan_pembimbing
    SET status = 2,
        catatan_dosen = $2,
        responded_at = now()
    WHERE id_pengajuan = $1
      AND status = 0
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_pengajuan, catatan]);
  return rows[0] || null;
};

module.exports = {
  getPengajuanMasukDb,
  getDetailPengajuanDb,
  getProposalByTimDb,
  getTimLengkapDb,
  updateProposalStatusDb,
  approvePengajuanDb,
  rejectPengajuanDb,
};
