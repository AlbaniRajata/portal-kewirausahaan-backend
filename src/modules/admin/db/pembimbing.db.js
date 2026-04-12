const pool = require("../../../config/db");

const createDbError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const getProposalWithTimDb = async (id_program) => {
  const values = [];
  let idx = 1;
  let where = "WHERE 1=1";

  if (id_program !== undefined && id_program !== null) {
    where += ` AND p.id_program = $${idx++}`;
    values.push(id_program);
  }

  const q = `
    SELECT
      p.id_proposal,
      p.judul,
      p.status,
      p.modal_diajukan,
      p.tanggal_submit,
      p.id_program,
      pr.nama_program,
      t.id_tim,
      t.nama_tim,
      k.id_kategori,
      k.nama_kategori,
      (
        SELECT json_agg(
          json_build_object(
            'id_user', um.id_user,
            'nama_lengkap', um.nama_lengkap,
            'nim', mhs.nim,
            'peran', at.peran,
            'status', at.status
          ) ORDER BY at.peran ASC
        )
        FROM t_anggota_tim at
        JOIN m_user um ON um.id_user = at.id_user
        JOIN m_mahasiswa mhs ON mhs.id_user = um.id_user
        WHERE at.id_tim = t.id_tim
      ) AS anggota_tim,
      (
        SELECT json_build_object(
          'id_pengajuan', pg.id_pengajuan,
          'id_dosen', pg.id_dosen,
          'status', pg.status,
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
    FROM t_proposal p
    JOIN m_program pr ON pr.id_program = p.id_program
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    ${where}
    ORDER BY p.tanggal_submit DESC
  `;

  const { rows } = await pool.query(q, values);
  return rows;
};

const updatePembimbingDb = async (id_tim, id_dosen_baru) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const tim = await client.query(
      `SELECT id_program FROM t_tim WHERE id_tim = $1 LIMIT 1`,
      [id_tim]
    );
    if (!tim.rows.length) {
      throw createDbError("Tim tidak ditemukan", 404);
    }

    const existing = await client.query(
      `SELECT id_pengajuan FROM t_pengajuan_pembimbing WHERE id_tim = $1`,
      [id_tim]
    );

    let updatedRow;

    if (existing.rows.length > 0) {
      const updated = await client.query(
        `UPDATE t_pengajuan_pembimbing 
         SET id_dosen = $2, status = 1, responded_at = now(), catatan_dosen = '[REASSIGN_ADMIN]'
         WHERE id_tim = $1
         RETURNING id_pengajuan, id_tim, id_program, id_dosen, status, responded_at, catatan_dosen`,
        [id_tim, id_dosen_baru]
      );
      updatedRow = updated.rows[0] || null;
    } else {
      const inserted = await client.query(
        `INSERT INTO t_pengajuan_pembimbing (id_tim, id_program, id_dosen, status, catatan_dosen)
         VALUES ($1, $2, $3, 1, '[REASSIGN_ADMIN]')
         RETURNING id_pengajuan, id_tim, id_program, id_dosen, status, responded_at, catatan_dosen`,
        [id_tim, tim.rows[0].id_program, id_dosen_baru]
      );
      updatedRow = inserted.rows[0] || null;
    }

    if (!updatedRow) {
      throw createDbError("Gagal memperbarui data pembimbing", 500);
    }

    await client.query("COMMIT");
    return updatedRow;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getDosenDb = async () => {
  const q = `
    SELECT
      d.id_user AS id_dosen,
      u.nama_lengkap,
      d.nip,
      d.bidang_keahlian
    FROM m_dosen d
    JOIN m_user u ON u.id_user = d.id_user
    WHERE d.status_verifikasi = 1
    ORDER BY u.nama_lengkap ASC
  `;
  const { rows } = await pool.query(q);
  return rows;
};

const getDosenByIdDb = async (id_dosen) => {
  const q = `
    SELECT
      d.id_user AS id_dosen,
      u.nama_lengkap,
      d.nip,
      d.bidang_keahlian,
      d.status_verifikasi
    FROM m_dosen d
    JOIN m_user u ON u.id_user = d.id_user
    WHERE d.id_user = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_dosen]);
  return rows[0] || null;
};

const getTimByIdDb = async (id_tim) => {
  const q = `
    SELECT
      id_tim,
      id_program,
      nama_tim
    FROM t_tim
    WHERE id_tim = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [id_tim]);
  return rows[0] || null;
};

const getDosenBebanDb = async (id_program) => {
  const q = `
    SELECT
      d.id_user AS id_dosen,
      u.nama_lengkap,
      COUNT(pg.id_tim) AS jumlah_bimbingan
    FROM m_dosen d
    JOIN m_user u ON u.id_user = d.id_user
    LEFT JOIN t_pengajuan_pembimbing pg ON pg.id_dosen = d.id_user 
      AND pg.status = 1
      ${id_program ? 'AND pg.id_program = $1' : ''}
    WHERE d.status_verifikasi = 1
    GROUP BY d.id_user, u.nama_lengkap
    ORDER BY jumlah_bimbingan ASC, u.nama_lengkap ASC
  `;
  const values = id_program ? [id_program] : [];
  const { rows } = await pool.query(q, values);
  return rows;
};

module.exports = {
  getProposalWithTimDb,
  updatePembimbingDb,
  getDosenDb,
  getDosenByIdDb,
  getTimByIdDb,
  getDosenBebanDb,
};