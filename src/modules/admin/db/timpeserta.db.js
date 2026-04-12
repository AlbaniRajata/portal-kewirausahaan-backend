const pool = require("../../../config/db");

const getTimListDb = async (filters = {}) => {
  const { id_program, status, search } = filters;
  const values = [];
  let idx = 1;

  let q = `
    SELECT
      t.id_tim,
      t.nama_tim,
      t.status,
      t.created_at,
      p.id_program,
      p.nama_program,
      pr.id_proposal,
      pr.judul AS judul_proposal,
      pr.status AS status_proposal,
      pr.modal_diajukan,
      pr.tanggal_submit,
      (
        SELECT json_build_object(
          'id_pengajuan', pg.id_pengajuan,
          'id_dosen', pg.id_dosen,
          'status', pg.status,
          'catatan_dosen', pg.catatan_dosen,
          'created_at', pg.created_at,
          'responded_at', pg.responded_at,
          'nama_dosen', du.nama_lengkap,
          'nip', d.nip,
          'bidang_keahlian', d.bidang_keahlian
        )
        FROM t_pengajuan_pembimbing pg
        JOIN m_dosen d ON d.id_user = pg.id_dosen
        JOIN m_user du ON du.id_user = d.id_user
        WHERE pg.id_tim = t.id_tim
        LIMIT 1
      ) AS pembimbing,
      COUNT(at.id_user) AS jumlah_anggota,
      MAX(CASE WHEN at.peran = 1 THEN u.nama_lengkap END) AS nama_ketua
    FROM t_tim t
    JOIN m_program p ON p.id_program = t.id_program
    LEFT JOIN t_proposal pr ON pr.id_tim = t.id_tim AND pr.id_program = t.id_program
    LEFT JOIN t_anggota_tim at ON at.id_tim = t.id_tim
    LEFT JOIN m_user u ON u.id_user = at.id_user
    WHERE 1=1
  `;

  if (id_program !== undefined && id_program !== null) { q += ` AND t.id_program = $${idx++}`; values.push(id_program); }
  if (status !== undefined && status !== null) { q += ` AND t.status = $${idx++}`; values.push(status); }
  if (search) {
    q += ` AND (t.nama_tim ILIKE $${idx} OR pr.judul ILIKE $${idx})`;
    values.push(`%${search}%`); idx++;
  }

  q += ` GROUP BY t.id_tim, p.id_program, p.nama_program, pr.id_proposal, pr.judul, pr.status, pr.modal_diajukan, pr.tanggal_submit ORDER BY t.created_at DESC`;

  const { rows } = await pool.query(q, values);
  return rows;
};

const getTimDetailDb = async (id_tim) => {
  const { rows: tim } = await pool.query(
    `SELECT
      t.id_tim, t.nama_tim, t.status, t.created_at,
      p.id_program, p.nama_program, p.pendaftaran_mulai, p.pendaftaran_selesai
      ,(
        SELECT json_build_object(
          'id_pengajuan', pg.id_pengajuan,
          'id_dosen', pg.id_dosen,
          'status', pg.status,
          'catatan_dosen', pg.catatan_dosen,
          'created_at', pg.created_at,
          'responded_at', pg.responded_at,
          'nama_dosen', du.nama_lengkap,
          'nip', d.nip,
          'bidang_keahlian', d.bidang_keahlian
        )
        FROM t_pengajuan_pembimbing pg
        JOIN m_dosen d ON d.id_user = pg.id_dosen
        JOIN m_user du ON du.id_user = d.id_user
        WHERE pg.id_tim = t.id_tim
        LIMIT 1
      ) AS pembimbing
    FROM t_tim t
    JOIN m_program p ON p.id_program = t.id_program
    WHERE t.id_tim = $1`,
    [id_tim]
  );
  if (!tim[0]) return null;

  const [{ rows: anggota }, { rows: proposal }] = await Promise.all([
    pool.query(
      `SELECT
        at.id_user, at.peran, at.status, at.catatan,
        u.nama_lengkap, u.username, u.email, u.no_hp,
        m.nim, m.tahun_masuk,
        pr.nama_prodi, pr.jenjang,
        j.nama_jurusan, k.nama_kampus
      FROM t_anggota_tim at
      JOIN m_user u ON u.id_user = at.id_user
      JOIN m_mahasiswa m ON m.id_user = at.id_user
      JOIN m_prodi pr ON pr.id_prodi = m.id_prodi
      JOIN m_jurusan j ON j.id_jurusan = pr.id_jurusan
      JOIN m_kampus k ON k.id_kampus = pr.id_kampus
      WHERE at.id_tim = $1
      ORDER BY at.peran ASC`,
      [id_tim]
    ),
    pool.query(
      `SELECT
        pr.id_proposal, pr.judul, pr.file_proposal, pr.status,
        pr.modal_diajukan, pr.tanggal_submit, pr.wawancara_at,
        k.id_kategori, k.nama_kategori
      FROM t_proposal pr
      JOIN m_kategori k ON k.id_kategori = pr.id_kategori
      WHERE pr.id_tim = $1 AND pr.id_program = $2`,
      [id_tim, tim[0].id_program]
    ),
  ]);

  return { ...tim[0], anggota, proposal: proposal[0] || null };
};

const getPesertaListDb = async (filters = {}) => {
  const { id_program, status_lolos, status_peserta, search } = filters;
  const values = [];
  let idx = 1;

  let q = `
    SELECT
      pp.id_user,
      pp.id_program,
      pp.tahun,
      pp.status_lolos,
      pp.status_peserta,
      pp.created_at,
      pp.id_tim,
      u.nama_lengkap, u.username, u.email, u.no_hp,
      m.nim, m.tahun_masuk,
      pr.nama_prodi, pr.jenjang,
      j.nama_jurusan, k.nama_kampus,
      p.nama_program,
      t.nama_tim,
      (
        SELECT json_build_object(
          'id_pengajuan', pg.id_pengajuan,
          'id_dosen', pg.id_dosen,
          'status', pg.status,
          'catatan_dosen', pg.catatan_dosen,
          'created_at', pg.created_at,
          'responded_at', pg.responded_at,
          'nama_dosen', du.nama_lengkap,
          'nip', d.nip,
          'bidang_keahlian', d.bidang_keahlian
        )
        FROM t_pengajuan_pembimbing pg
        JOIN m_dosen d ON d.id_user = pg.id_dosen
        JOIN m_user du ON du.id_user = d.id_user
        WHERE pg.id_tim = pp.id_tim
        LIMIT 1
      ) AS pembimbing,
      at.peran
    FROM t_peserta_program pp
    JOIN m_user u ON u.id_user = pp.id_user
    JOIN m_mahasiswa m ON m.id_user = pp.id_user
    JOIN m_prodi pr ON pr.id_prodi = m.id_prodi
    JOIN m_jurusan j ON j.id_jurusan = pr.id_jurusan
    JOIN m_kampus k ON k.id_kampus = pr.id_kampus
    JOIN m_program p ON p.id_program = pp.id_program
    JOIN t_tim t ON t.id_tim = pp.id_tim
    LEFT JOIN t_anggota_tim at ON at.id_tim = pp.id_tim AND at.id_user = pp.id_user
    WHERE 1=1
  `;

  if (id_program !== undefined && id_program !== null) { q += ` AND pp.id_program = $${idx++}`; values.push(id_program); }
  if (status_lolos !== undefined && status_lolos !== null) { q += ` AND pp.status_lolos = $${idx++}`; values.push(status_lolos); }
  if (status_peserta !== undefined && status_peserta !== null) { q += ` AND pp.status_peserta = $${idx++}`; values.push(status_peserta); }
  if (search) {
    q += ` AND (u.nama_lengkap ILIKE $${idx} OR u.email ILIKE $${idx} OR m.nim ILIKE $${idx} OR t.nama_tim ILIKE $${idx})`;
    values.push(`%${search}%`); idx++;
  }

  q += ` ORDER BY pp.created_at DESC`;
  const { rows } = await pool.query(q, values);
  return rows;
};

const getPesertaDetailDb = async (id_user, id_program) => {
  const { rows } = await pool.query(
    `SELECT
      pp.id_user, pp.id_program, pp.tahun, pp.status_lolos, pp.status_peserta, pp.created_at, pp.id_tim,
      u.nama_lengkap, u.username, u.email, u.no_hp, u.alamat, u.foto,
      m.nim, m.tahun_masuk, m.foto_ktm,
      pr.nama_prodi, pr.jenjang,
      j.nama_jurusan, k.nama_kampus,
      p.nama_program,
      t.nama_tim, t.status AS status_tim,
      (
        SELECT json_build_object(
          'id_pengajuan', pg.id_pengajuan,
          'id_dosen', pg.id_dosen,
          'status', pg.status,
          'catatan_dosen', pg.catatan_dosen,
          'created_at', pg.created_at,
          'responded_at', pg.responded_at,
          'nama_dosen', du.nama_lengkap,
          'nip', d.nip,
          'bidang_keahlian', d.bidang_keahlian
        )
        FROM t_pengajuan_pembimbing pg
        JOIN m_dosen d ON d.id_user = pg.id_dosen
        JOIN m_user du ON du.id_user = d.id_user
        WHERE pg.id_tim = pp.id_tim
        LIMIT 1
      ) AS pembimbing,
      at.peran, at.status AS status_anggota, at.catatan AS catatan_anggota
    FROM t_peserta_program pp
    JOIN m_user u ON u.id_user = pp.id_user
    JOIN m_mahasiswa m ON m.id_user = pp.id_user
    JOIN m_prodi pr ON pr.id_prodi = m.id_prodi
    JOIN m_jurusan j ON j.id_jurusan = pr.id_jurusan
    JOIN m_kampus k ON k.id_kampus = pr.id_kampus
    JOIN m_program p ON p.id_program = pp.id_program
    JOIN t_tim t ON t.id_tim = pp.id_tim
    LEFT JOIN t_anggota_tim at ON at.id_tim = pp.id_tim AND at.id_user = pp.id_user
    WHERE pp.id_user = $1 AND pp.id_program = $2`,
    [id_user, id_program]
  );
  return rows[0] || null;
};

module.exports = { getTimListDb, getTimDetailDb, getPesertaListDb, getPesertaDetailDb };