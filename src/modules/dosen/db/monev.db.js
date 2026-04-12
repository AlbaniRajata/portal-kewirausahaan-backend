const pool = require("../../../config/db");

const getMonevTimBimbinganDb = async (id_dosen) => {
  const q = `
    SELECT
      t.id_tim,
      t.nama_tim,
      t.id_program,
      prog.nama_program,
      prog.keterangan,
      pg.id_pengajuan,
      pg.responded_at AS pembimbing_disetujui_at,
      json_build_object(
        'id_user', ketua_u.id_user,
        'nama_lengkap', ketua_u.nama_lengkap,
        'nim', ketua_m.nim,
        'email', ketua_u.email
      ) AS ketua,
      prop.id_proposal,
      prop.judul AS judul_proposal,
      prop.status AS status_proposal,
      prop.tanggal_submit,
      COUNT(ml.id_luaran) AS total_luaran,
      COUNT(lt.id_luaran_tim) FILTER (WHERE lt.status = 2) AS total_disetujui,
      COUNT(lt.id_luaran_tim) FILTER (WHERE lt.status = 1) AS total_submitted,
      COUNT(lt.id_luaran_tim) FILTER (WHERE lt.status = 3) AS total_ditolak
    FROM t_pengajuan_pembimbing pg
    JOIN t_tim t ON t.id_tim = pg.id_tim
    JOIN m_program prog ON prog.id_program = t.id_program
    JOIN t_anggota_tim ketua ON ketua.id_tim = t.id_tim AND ketua.peran = 1
    JOIN m_user ketua_u ON ketua_u.id_user = ketua.id_user
    LEFT JOIN m_mahasiswa ketua_m ON ketua_m.id_user = ketua_u.id_user
    LEFT JOIN LATERAL (
      SELECT p.id_proposal, p.judul, p.status, p.tanggal_submit
      FROM t_proposal p
      WHERE p.id_tim = t.id_tim
      ORDER BY p.id_proposal DESC
      LIMIT 1
    ) prop ON true
    LEFT JOIN m_luaran ml ON ml.id_program = t.id_program
    LEFT JOIN t_luaran_tim lt ON lt.id_tim = t.id_tim AND lt.id_luaran = ml.id_luaran
    WHERE pg.id_dosen = $1
      AND pg.status = 1
    GROUP BY
      t.id_tim,
      t.nama_tim,
      t.id_program,
      prog.nama_program,
      prog.keterangan,
      pg.id_pengajuan,
      pg.responded_at,
      ketua_u.id_user,
      ketua_u.nama_lengkap,
      ketua_m.nim,
      ketua_u.email,
      prop.id_proposal,
      prop.judul,
      prop.status,
      prop.tanggal_submit
    ORDER BY t.nama_tim ASC
  `;
  const { rows } = await pool.query(q, [id_dosen]);
  return rows;
};

const getTimBimbinganByIdDb = async (id_dosen, id_tim) => {
  const q = `
    SELECT
      t.id_tim,
      t.nama_tim,
      t.id_program,
      prog.nama_program,
      prog.keterangan,
      pg.id_pengajuan,
      pg.responded_at AS pembimbing_disetujui_at,
      json_build_object(
        'id_user', ketua_u.id_user,
        'nama_lengkap', ketua_u.nama_lengkap,
        'nim', ketua_m.nim,
        'email', ketua_u.email
      ) AS ketua,
      prop.id_proposal,
      prop.judul AS judul_proposal,
      prop.status AS status_proposal,
      prop.tanggal_submit
    FROM t_pengajuan_pembimbing pg
    JOIN t_tim t ON t.id_tim = pg.id_tim
    JOIN m_program prog ON prog.id_program = t.id_program
    JOIN t_anggota_tim ketua ON ketua.id_tim = t.id_tim AND ketua.peran = 1
    JOIN m_user ketua_u ON ketua_u.id_user = ketua.id_user
    LEFT JOIN m_mahasiswa ketua_m ON ketua_m.id_user = ketua_u.id_user
    LEFT JOIN LATERAL (
      SELECT p.id_proposal, p.judul, p.status, p.tanggal_submit
      FROM t_proposal p
      WHERE p.id_tim = t.id_tim
      ORDER BY p.id_proposal DESC
      LIMIT 1
    ) prop ON true
    WHERE pg.id_dosen = $1
      AND pg.id_tim = $2
      AND pg.status = 1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_dosen, id_tim]);
  return rows[0] || null;
};

const getDetailLuaranTimDb = async (id_tim, id_program) => {
  const q = `
    SELECT
      ml.id_luaran,
      ml.nama_luaran,
      ml.keterangan,
      ml.tipe,
      ml.deadline,
      ml.urutan,
      lt.id_luaran_tim,
      lt.file_luaran,
      lt.link_luaran,
      lt.status,
      lt.catatan_admin,
      lt.submitted_at,
      lt.reviewed_at,
      reviewer.nama_lengkap AS reviewed_by_nama
    FROM m_luaran ml
    LEFT JOIN t_luaran_tim lt ON lt.id_luaran = ml.id_luaran AND lt.id_tim = $1
    LEFT JOIN m_user reviewer ON reviewer.id_user = lt.reviewed_by
    WHERE ml.id_program = $2
    ORDER BY ml.urutan ASC
  `;
  const { rows } = await pool.query(q, [id_tim, id_program]);
  return rows;
};

module.exports = {
  getMonevTimBimbinganDb,
  getTimBimbinganByIdDb,
  getDetailLuaranTimDb,
};
