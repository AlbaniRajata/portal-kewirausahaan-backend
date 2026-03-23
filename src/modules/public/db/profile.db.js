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
      r.keterangan,
      CASE
        WHEN LOWER(r.nama_role) = 'admin' THEN (
          SELECT p.keterangan
          FROM t_admin_program ap
          JOIN m_program p ON p.id_program = ap.id_program
          WHERE ap.id_user = u.id_user
            AND ap.is_active = true
          ORDER BY ap.id_program DESC
          LIMIT 1
        )
        WHEN LOWER(r.nama_role) = 'mahasiswa' THEN (
          SELECT p.keterangan
          FROM t_anggota_tim a
          JOIN t_tim t ON t.id_tim = a.id_tim
          JOIN m_program p ON p.id_program = t.id_program
          WHERE a.id_user = u.id_user
            AND a.status = 1
          ORDER BY t.created_at DESC, t.id_tim DESC
          LIMIT 1
        )
        WHEN LOWER(r.nama_role) = 'dosen' THEN (
          SELECT p.keterangan
          FROM t_pengajuan_pembimbing pg
          JOIN m_program p ON p.id_program = pg.id_program
          WHERE pg.id_dosen = u.id_user
            AND pg.status = 1
          ORDER BY pg.responded_at DESC NULLS LAST, pg.created_at DESC, pg.id_pengajuan DESC
          LIMIT 1
        )
        WHEN LOWER(r.nama_role) = 'reviewer' THEN (
          SELECT p.keterangan
          FROM t_distribusi_reviewer dr
          JOIN t_proposal tp ON tp.id_proposal = dr.id_proposal
          JOIN m_program p ON p.id_program = tp.id_program
          WHERE dr.id_reviewer = u.id_user
            AND dr.status != 5
          ORDER BY dr.assigned_at DESC NULLS LAST, dr.id_distribusi DESC
          LIMIT 1
        )
        WHEN LOWER(r.nama_role) = 'juri' THEN (
          SELECT p.keterangan
          FROM t_distribusi_juri dj
          JOIN t_proposal tp ON tp.id_proposal = dj.id_proposal
          JOIN m_program p ON p.id_program = tp.id_program
          WHERE dj.id_juri = u.id_user
            AND dj.status != 5
          ORDER BY dj.assigned_at DESC NULLS LAST, dj.id_distribusi DESC
          LIMIT 1
        )
        ELSE NULL
      END AS current_program
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