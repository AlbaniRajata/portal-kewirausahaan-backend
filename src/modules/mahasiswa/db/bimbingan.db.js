const pool = require("../../../config/db");

const getPesertaAktifDb = async (id_user) => {
  const q = `
    SELECT
      a.id_user,
      t.id_program,
      a.id_tim,
      a.peran
    FROM t_anggota_tim a
    JOIN t_tim t ON t.id_tim = a.id_tim
    WHERE a.id_user = $1
      AND a.status = 1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_user]);
  return rows[0] || null;
};

const getProposalTimDb = async (id_tim) => {
  const q = `
    SELECT id_proposal, judul, status
    FROM t_proposal
    WHERE id_tim = $1
    ORDER BY id_proposal DESC
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_tim]);
  return rows[0] || null;
};

const getPembimbingTimDb = async (id_tim) => {
  const q = `
    SELECT
      pp.id_pengajuan,
      pp.id_dosen,
      pp.status,
      u.nama_lengkap AS nama_dosen,
      d.nip,
      d.bidang_keahlian
    FROM t_pengajuan_pembimbing pp
    JOIN m_dosen d ON d.id_user = pp.id_dosen
    JOIN m_user u ON u.id_user = d.id_user
    WHERE pp.id_tim = $1
      AND pp.status = 1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_tim]);
  return rows[0] || null;
};

const getBimbinganPendingDb = async (id_tim) => {
  const q = `
    SELECT id_bimbingan FROM t_bimbingan
    WHERE id_tim = $1 AND status = 0
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_tim]);
  return rows[0] || null;
};

const listBimbinganTimDb = async (id_tim) => {
  const q = `
    SELECT
      b.id_bimbingan,
      b.tanggal_bimbingan,
      b.metode,
      b.topik,
      b.deskripsi,
      b.status,
      b.catatan_dosen,
      b.created_at,
      b.responded_at,
      u.nama_lengkap AS nama_dosen,
      mhs.nama_lengkap AS nama_pengaju
    FROM t_bimbingan b
    JOIN m_user u ON u.id_user = b.id_dosen
    JOIN m_user mhs ON mhs.id_user = b.diajukan_oleh
    WHERE b.id_tim = $1
    ORDER BY b.created_at DESC
  `;
  const { rows } = await pool.query(q, [id_tim]);
  return rows;
};

const getDetailBimbinganDb = async (id_bimbingan, id_tim) => {
  const q = `
    SELECT
      b.*,
      u.nama_lengkap AS nama_dosen,
      d.nip,
      d.bidang_keahlian,
      mhs.nama_lengkap AS nama_pengaju,
      p.judul AS judul_proposal
    FROM t_bimbingan b
    JOIN m_user u ON u.id_user = b.id_dosen
    JOIN m_dosen d ON d.id_user = b.id_dosen
    JOIN m_user mhs ON mhs.id_user = b.diajukan_oleh
    LEFT JOIN t_proposal p ON p.id_proposal = b.id_proposal
    WHERE b.id_bimbingan = $1
      AND b.id_tim = $2
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_bimbingan, id_tim]);
  return rows[0] || null;
};

const createBimbinganDb = async (payload) => {
  const {
    id_tim,
    id_proposal,
    id_dosen,
    diajukan_oleh,
    tanggal_bimbingan,
    metode,
    topik,
    deskripsi,
  } = payload;

  const q = `
    INSERT INTO t_bimbingan
      (id_tim, id_proposal, id_dosen, diajukan_oleh, tanggal_bimbingan, metode, topik, deskripsi, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)
    RETURNING *
  `;
  const { rows } = await pool.query(q, [
    id_tim,
    id_proposal,
    id_dosen,
    diajukan_oleh,
    tanggal_bimbingan,
    Number(metode),
    topik,
    deskripsi,
  ]);
  return rows[0];
};

module.exports = {
  getPesertaAktifDb,
  getProposalTimDb,
  getPembimbingTimDb,
  getBimbinganPendingDb,
  listBimbinganTimDb,
  getDetailBimbinganDb,
  createBimbinganDb,
};