const db = require('../../../config/db');

const getMahasiswaByUserId = async (id_user) => {
  const q = `
    SELECT id_user, nim, id_prodi, tahun_masuk, status_verifikasi, status_mahasiswa
    FROM m_mahasiswa
    WHERE id_user = $1
  `;
  const r = await db.query(q, [id_user]);
  return r.rows[0] || null;
};

const cekUserPunyaTim = async (id_user) => {
  const q = `
    SELECT 1 FROM t_anggota_tim
    WHERE id_user = $1 AND status = 1
  `;
  const r = await db.query(q, [id_user]);
  return r.rowCount > 0;
};

const createTim = async (client, id_program, nama_tim) => {
  const q = `
    INSERT INTO t_tim (id_program, nama_tim)
    VALUES ($1, $2)
    RETURNING id_tim
  `;
  const r = await client.query(q, [id_program, nama_tim]);
  return r.rows[0];
};

const insertAnggotaTim = async (client, id_tim, id_user, peran, status) => {
  const q = `
    INSERT INTO t_anggota_tim (id_tim, id_user, peran, status)
    VALUES ($1, $2, $3, $4)
  `;
  await client.query(q, [id_tim, id_user, peran, status]);
};

const getMahasiswaByNim = async (nim) => {
  const q = `
    SELECT id_user, nim, status_verifikasi, status_mahasiswa
    FROM m_mahasiswa
    WHERE nim = $1
  `;
  const r = await db.query(q, [nim]);
  return r.rows[0] || null;
};

const countAnggotaTim = async (id_tim) => {
  const q = `
    SELECT COUNT(*)::int AS total
    FROM t_anggota_tim
    WHERE id_tim = $1 AND status = 1
  `;
  const r = await db.query(q, [id_tim]);
  return r.rows[0].total;
};

const getPeranUserDiTim = async (id_tim, id_user) => {
  const q = `
    SELECT * FROM t_anggota_tim
    WHERE id_tim = $1 AND id_user = $2 AND status = 1
  `;
  const r = await db.query(q, [id_tim, id_user]);
  return r.rows[0] || null;
};

const getTimDetail = async (id_tim) => {
  const q = `
    SELECT
      t.id_tim,
      t.nama_tim,
      t.id_program,
      (
        SELECT json_build_object(
          'id_user', u.id_user,
          'nim', m.nim,
          'nama_lengkap', u.nama_lengkap,
          'username', u.username,
          'id_prodi', p.id_prodi,
          'nama_prodi', p.nama_prodi,
          'jenjang', p.jenjang,
          'id_jurusan', j.id_jurusan,
          'nama_jurusan', j.nama_jurusan,
          'id_kampus', k.id_kampus,
          'nama_kampus', k.nama_kampus
        )
        FROM t_anggota_tim a
        JOIN m_mahasiswa m ON m.id_user = a.id_user
        JOIN m_user u ON u.id_user = m.id_user
        JOIN m_prodi p ON p.id_prodi = m.id_prodi
        JOIN m_jurusan j ON j.id_jurusan = p.id_jurusan
        JOIN m_kampus k ON k.id_kampus = p.id_kampus
        WHERE a.id_tim = t.id_tim AND a.peran = 1
        LIMIT 1
      ) AS ketua_tim,
      json_agg(
        json_build_object(
          'id_user', u2.id_user,
          'nim', m2.nim,
          'nama_lengkap', u2.nama_lengkap,
          'username', u2.username,
          'peran', a2.peran,
          'status', a2.status
        )
      ) AS anggota
    FROM t_tim t
    JOIN t_anggota_tim a2 ON a2.id_tim = t.id_tim
    JOIN m_mahasiswa m2 ON m2.id_user = a2.id_user
    JOIN m_user u2 ON u2.id_user = m2.id_user
    WHERE t.id_tim = $1
    GROUP BY t.id_tim
  `;
  const r = await db.query(q, [id_tim]);
  return r.rows[0] || null;
};

const searchMahasiswaByNim = async (query, excludeUserId) => {
  const q = `
    SELECT
      m.id_user,
      m.nim,
      u.nama_lengkap,
      u.username,
      p.id_prodi,
      p.nama_prodi,
      p.jenjang,
      j.id_jurusan,
      j.nama_jurusan,
      k.id_kampus,
      k.nama_kampus,
      EXISTS (
        SELECT 1 FROM t_anggota_tim a
        WHERE a.id_user = m.id_user AND a.status = 1
      ) AS sudah_punya_tim
    FROM m_mahasiswa m
    JOIN m_user u ON u.id_user = m.id_user
    JOIN m_prodi p ON p.id_prodi = m.id_prodi
    JOIN m_jurusan j ON j.id_jurusan = p.id_jurusan
    JOIN m_kampus k ON k.id_kampus = p.id_kampus
    WHERE (m.nim ILIKE $1 OR u.nama_lengkap ILIKE $1)
      AND m.status_verifikasi = 1
      AND m.status_mahasiswa = 1
      AND m.id_user != $2
    LIMIT 10
  `;
  const r = await db.query(q, [`%${query}%`, excludeUserId]);
  return r.rows;
};

const getPendingInvite = async (id_tim, id_user) => {
  const q = `
    SELECT * FROM t_anggota_tim
    WHERE id_tim = $1 AND id_user = $2 AND status = 0
  `;
  const r = await db.query(q, [id_tim, id_user]);
  return r.rows[0] || null;
};

const acceptAnggotaTim = async (client, id_tim, id_user) => {
  const q = `
    UPDATE t_anggota_tim SET status = 1
    WHERE id_tim = $1 AND id_user = $2
  `;
  await client.query(q, [id_tim, id_user]);
};

const rejectAnggotaTim = async (id_tim, id_user, catatan) => {
  const q = `
    UPDATE t_anggota_tim
    SET status = 2, catatan = $3
    WHERE id_tim = $1 AND id_user = $2 AND status = 0
  `;
  const r = await db.query(q, [id_tim, id_user, catatan]);
  return r.rowCount;
};

const getTimByUserId = async (id_user) => {
  const q = `
    SELECT
      t.id_tim,
      t.nama_tim,
      t.id_program,
      t.status,
      t.created_at,
      a.peran,
      a.status AS status_anggota
    FROM t_anggota_tim a
    JOIN t_tim t ON t.id_tim = a.id_tim
    WHERE a.id_user = $1
  `;
  const r = await db.query(q, [id_user]);
  return r.rows[0] || null;
};

const getTimDetailByUserId = async (id_user) => {
  const q = `
    SELECT
      t.id_tim,
      t.nama_tim,
      t.id_program,
      prog.nama_program,
      prog.keterangan,
      t.status AS status_tim,
      t.created_at,
      (
        SELECT json_build_object(
          'id_user', u.id_user,
          'nim', m.nim,
          'nama_lengkap', u.nama_lengkap,
          'username', u.username,
          'id_prodi', p.id_prodi,
          'nama_prodi', p.nama_prodi,
          'jenjang', p.jenjang,
          'id_jurusan', j.id_jurusan,
          'nama_jurusan', j.nama_jurusan,
          'id_kampus', k.id_kampus,
          'nama_kampus', k.nama_kampus
        )
        FROM t_anggota_tim a
        JOIN m_mahasiswa m ON m.id_user = a.id_user
        JOIN m_user u ON u.id_user = m.id_user
        JOIN m_prodi p ON p.id_prodi = m.id_prodi
        JOIN m_jurusan j ON j.id_jurusan = p.id_jurusan
        JOIN m_kampus k ON k.id_kampus = p.id_kampus
        WHERE a.id_tim = t.id_tim AND a.peran = 1
        LIMIT 1
      ) AS ketua_tim,
      (
        SELECT json_agg(
          json_build_object(
            'id_user', u2.id_user,
            'nim', m2.nim,
            'nama_lengkap', u2.nama_lengkap,
            'username', u2.username,
            'peran', a2.peran,
            'status', a2.status,
            'id_prodi', p2.id_prodi,
            'nama_prodi', p2.nama_prodi,
            'jenjang', p2.jenjang,
            'id_jurusan', j2.id_jurusan,
            'nama_jurusan', j2.nama_jurusan,
            'id_kampus', k2.id_kampus,
            'nama_kampus', k2.nama_kampus
          )
        )
        FROM t_anggota_tim a2
        JOIN m_mahasiswa m2 ON m2.id_user = a2.id_user
        JOIN m_user u2 ON u2.id_user = m2.id_user
        JOIN m_prodi p2 ON p2.id_prodi = m2.id_prodi
        JOIN m_jurusan j2 ON j2.id_jurusan = p2.id_jurusan
        JOIN m_kampus k2 ON k2.id_kampus = p2.id_kampus
        WHERE a2.id_tim = t.id_tim
      ) AS anggota
    FROM t_anggota_tim ta
    JOIN t_tim t ON t.id_tim = ta.id_tim
    JOIN m_program prog ON prog.id_program = t.id_program
    WHERE ta.id_user = $1
  `;
  const r = await db.query(q, [id_user]);
  return r.rows[0] || null;
};

const insertPesertaProgram = async (client, id_user, id_program, id_tim, tahun) => {
  const q = `
    INSERT INTO t_peserta_program (id_user, id_program, id_tim, tahun, status_lolos)
    VALUES ($1, $2, $3, $4, 0)
    ON CONFLICT (id_user, id_program) DO NOTHING
  `;
  await client.query(q, [id_user, id_program, id_tim, tahun]);
};

const cekLolosPMW = async (id_user) => {
  const q = `
    SELECT status_lolos FROM t_peserta_program
    WHERE id_user = $1 AND id_program = 1
  `;
  const r = await db.query(q, [id_user]);
  return r.rows[0] || null;
};

const countActiveAnggota = async (id_tim) => {
  const q = `
    SELECT COUNT(*)::int AS total
    FROM t_anggota_tim
    WHERE id_tim = $1 AND status IN (0, 1)
  `;
  const r = await db.query(q, [id_tim]);
  return r.rows[0].total;
};

const insertAnggotaTimDirect = async (id_tim, id_user, peran, status) => {
  const q = `
    INSERT INTO t_anggota_tim (id_tim, id_user, peran, status)
    VALUES ($1, $2, $3, $4)
  `;
  await db.query(q, [id_tim, id_user, peran, status]);
};

const cekAktifDiTim = async (id_tim, id_user) => {
  const q = `
    SELECT 1 FROM t_anggota_tim
    WHERE id_tim = $1 AND id_user = $2 AND status IN (0, 1)
  `;
  const r = await db.query(q, [id_tim, id_user]);
  return r.rowCount > 0;
};

const cekAdaAnggotaDitolak = async (id_tim) => {
  const q = `
    SELECT 1 FROM t_anggota_tim
    WHERE id_tim = $1 AND peran = 2 AND status = 2
    LIMIT 1
  `;
  const r = await db.query(q, [id_tim]);
  return r.rowCount > 0;
};

const cekTimPunyaProposal = async (id_tim) => {
  const q = `SELECT 1 FROM t_proposal WHERE id_tim = $1 LIMIT 1`;
  const r = await db.query(q, [id_tim]);
  return r.rowCount > 0;
};

const deleteTimFull = async (client, id_tim) => {
  await client.query(`DELETE FROM t_peserta_program WHERE id_tim = $1`, [id_tim]);
  await client.query(`DELETE FROM t_anggota_tim WHERE id_tim = $1`, [id_tim]);
  await client.query(`DELETE FROM t_tim WHERE id_tim = $1`, [id_tim]);
};

const cekSemuaAnggotaDisetujui = async (id_tim) => {
  const q = `
    SELECT
      COUNT(*) FILTER (WHERE status = 1) AS disetujui,
      COUNT(*) AS total
    FROM t_anggota_tim
    WHERE id_tim = $1
  `;
  const r = await db.query(q, [id_tim]);
  const { disetujui, total } = r.rows[0];
  return parseInt(disetujui) === parseInt(total);
};

const getIdProgramByIdTim = async (id_tim) => {
  const q = `SELECT id_program FROM t_tim WHERE id_tim = $1`;
  const r = await db.query(q, [id_tim]);
  return r.rows[0]?.id_program || null;
};

const getAllAnggotaTim = async (id_tim) => {
  const q = `
    SELECT id_user FROM t_anggota_tim
    WHERE id_tim = $1 AND status = 1
  `;
  const r = await db.query(q, [id_tim]);
  return r.rows.map((row) => row.id_user);
};

module.exports = {
  getMahasiswaByUserId,
  cekUserPunyaTim,
  createTim,
  insertAnggotaTim,
  insertAnggotaTimDirect,
  getMahasiswaByNim,
  countAnggotaTim,
  countActiveAnggota,
  cekAktifDiTim,
  cekAdaAnggotaDitolak,
  getPeranUserDiTim,
  getTimDetail,
  searchMahasiswaByNim,
  getPendingInvite,
  acceptAnggotaTim,
  rejectAnggotaTim,
  getTimByUserId,
  getTimDetailByUserId,
  insertPesertaProgram,
  cekLolosPMW,
  cekSemuaAnggotaDisetujui,
  cekTimPunyaProposal,
  deleteTimFull,
  getIdProgramByIdTim,
  getAllAnggotaTim,
};