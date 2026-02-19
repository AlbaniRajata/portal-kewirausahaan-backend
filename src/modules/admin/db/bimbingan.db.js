const pool = require("../../../config/db");

const getMyProgramDb = async (id_admin) => {
  const q = `
    SELECT id_program
    FROM t_admin_program
    WHERE id_user = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_admin]);
  return rows[0] || null;
};

const getStatistikPengajuanPembimbingDb = async (id_program) => {
  const q = `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 0)::int AS pending,
      COUNT(*) FILTER (WHERE status = 1)::int AS approved,
      COUNT(*) FILTER (WHERE status = 2)::int AS rejected
    FROM t_pengajuan_pembimbing
    WHERE id_program = $1
  `;
  const { rows } = await pool.query(q, [id_program]);
  return rows[0];
};

const getListPengajuanPembimbingDb = async (id_program, status_filter = null) => {
  const values = [id_program];
  let statusClause = "";

  if (status_filter !== null && status_filter !== "") {
    statusClause = "AND pp.status = $2";
    values.push(status_filter);
  }

  const q = `
    SELECT
      pp.id_pengajuan,
      pp.status,
      pp.created_at,
      pp.responded_at,
      pp.catatan_dosen,

      t.id_tim,
      t.nama_tim,

      pr.id_program,
      pr.nama_program,

      d.id_user AS id_dosen,
      dosen.nama_lengkap AS nama_dosen,
      d.nip AS nip_dosen,
      d.bidang_keahlian,

      mhs.id_user AS id_pengaju,
      mhs.nama_lengkap AS nama_pengaju,

      p.id_proposal,
      p.judul AS judul_proposal

    FROM t_pengajuan_pembimbing pp
    JOIN t_tim t ON t.id_tim = pp.id_tim
    JOIN m_program pr ON pr.id_program = pp.id_program
    JOIN m_dosen d ON d.id_user = pp.id_dosen
    JOIN m_user dosen ON dosen.id_user = d.id_user
    JOIN m_user mhs ON mhs.id_user = pp.diajukan_oleh
    LEFT JOIN t_proposal p ON p.id_tim = pp.id_tim

    WHERE pp.id_program = $1
      ${statusClause}

    ORDER BY pp.created_at DESC
  `;

  const { rows } = await pool.query(q, values);
  return rows;
};

const getStatistikBimbinganDb = async (id_program) => {
  const q = `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE b.status = 0)::int AS pending,
      COUNT(*) FILTER (WHERE b.status = 1)::int AS approved,
      COUNT(*) FILTER (WHERE b.status = 2)::int AS rejected
    FROM t_bimbingan b
    JOIN t_tim t ON t.id_tim = b.id_tim
    WHERE t.id_program = $1
  `;
  const { rows } = await pool.query(q, [id_program]);
  return rows[0];
};

const getListBimbinganDb = async (id_program, status_filter = null) => {
  const values = [id_program];
  let statusClause = "";

  if (status_filter !== null && status_filter !== "") {
    statusClause = "AND b.status = $2";
    values.push(status_filter);
  }

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

      t.id_tim,
      t.nama_tim,

      d.id_user AS id_dosen,
      dosen.nama_lengkap AS nama_dosen,
      d.nip AS nip_dosen,
      d.bidang_keahlian,

      mhs.id_user AS id_pengaju,
      mhs.nama_lengkap AS nama_pengaju,

      p.id_proposal,
      p.judul AS judul_proposal

    FROM t_bimbingan b
    JOIN t_tim t ON t.id_tim = b.id_tim
    JOIN m_dosen d ON d.id_user = b.id_dosen
    JOIN m_user dosen ON dosen.id_user = d.id_user
    JOIN m_user mhs ON mhs.id_user = b.diajukan_oleh
    JOIN t_proposal p ON p.id_proposal = b.id_proposal

    WHERE t.id_program = $1
      ${statusClause}

    ORDER BY b.tanggal_bimbingan DESC, b.created_at DESC
  `;

  const { rows } = await pool.query(q, values);
  return rows;
};

module.exports = {
  getMyProgramDb,
  getStatistikPengajuanPembimbingDb,
  getListPengajuanPembimbingDb,
  getStatistikBimbinganDb,
  getListBimbinganDb,
};