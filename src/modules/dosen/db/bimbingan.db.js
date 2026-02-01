const pool = require("../../../config/db");

const getBimbinganMasukDb = async (id_dosen) => {
  const q = `
    SELECT
      b.id_bimbingan,
      b.id_tim,
      b.tanggal_bimbingan,
      b.metode,
      b.topik,
      b.deskripsi,
      b.status,
      b.created_at,
      
      t.nama_tim,
      u.nama_lengkap AS mahasiswa_pengaju,
      p.judul AS judul_proposal
    FROM t_bimbingan b
    JOIN t_tim t ON t.id_tim = b.id_tim
    JOIN m_user u ON u.id_user = b.diajukan_oleh
    JOIN t_proposal p ON p.id_proposal = b.id_proposal
    WHERE b.id_dosen = $1
    ORDER BY b.created_at DESC
  `;
  const { rows } = await pool.query(q, [id_dosen]);
  return rows;
};

const getDetailBimbinganDb = async (id_bimbingan, id_dosen) => {
  const q = `
    SELECT
      b.*,
      t.nama_tim,
      u.nama_lengkap AS mahasiswa_pengaju,
      p.judul AS judul_proposal
    FROM t_bimbingan b
    JOIN t_tim t ON t.id_tim = b.id_tim
    JOIN m_user u ON u.id_user = b.diajukan_oleh
    JOIN t_proposal p ON p.id_proposal = b.id_proposal
    WHERE b.id_bimbingan = $1
      AND b.id_dosen = $2
  `;
  const { rows } = await pool.query(q, [id_bimbingan, id_dosen]);
  return rows[0] || null;
};

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

const approveBimbinganDb = async (id_bimbingan) => {
  const q = `
    UPDATE t_bimbingan
    SET status = 1,
        responded_at = now()
    WHERE id_bimbingan = $1
      AND status = 0
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_bimbingan]);
  return rows[0] || null;
};

const rejectBimbinganDb = async (id_bimbingan, catatan) => {
  const q = `
    UPDATE t_bimbingan
    SET status = 2,
        catatan_dosen = $2,
        responded_at = now()
    WHERE id_bimbingan = $1
      AND status = 0
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_bimbingan, catatan]);
  return rows[0] || null;
};

module.exports = {
  getBimbinganMasukDb,
  getDetailBimbinganDb,
  getTimLengkapDb,
  getProposalByTimDb,
  approveBimbinganDb,
  rejectBimbinganDb,
};