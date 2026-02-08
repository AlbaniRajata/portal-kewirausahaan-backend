const db = require('../../../config/db');

const getMahasiswaByUserId = async (id_user) => {
    const q = `
    select *
    from m_mahasiswa
    where id_user = $1
  `;
    const r = await db.query(q, [id_user]);
    return r.rows[0];
};

const cekUserPunyaTim = async (id_user) => {
    const q = `
    select 1
    from t_anggota_tim
    where id_user = $1
      and status = 1
  `;
    const r = await db.query(q, [id_user]);
    return r.rowCount > 0;
};

const createTim = async (client, id_program, nama_tim) => {
    const q = `
    insert into t_tim (id_program, nama_tim)
    values ($1, $2)
    returning id_tim
  `;
    const r = await client.query(q, [id_program, nama_tim]);
    return r.rows[0];
};

const insertAnggotaTim = async (client, id_tim, id_user, peran, status) => {
    const q = `
    insert into t_anggota_tim (id_tim, id_user, peran, status)
    values ($1, $2, $3, $4)
  `;
    await client.query(q, [id_tim, id_user, peran, status]);
};

const getMahasiswaByNim = async (nim) => {
    const q = `
    select *
    from m_mahasiswa
    where nim = $1
  `;
    const r = await db.query(q, [nim]);
    return r.rows[0];
};

const countAnggotaTim = async (id_tim) => {
    const q = `
    select count(*)::int as total
    from t_anggota_tim
    where id_tim = $1
      and status = 1
  `;
    const r = await db.query(q, [id_tim]);
    return r.rows[0].total;
};

const getPeranUserDiTim = async (id_tim, id_user) => {
    const q = `
    select *
    from t_anggota_tim
    where id_tim = $1
      and id_user = $2
      and status = 1
  `;
    const r = await db.query(q, [id_tim, id_user]);
    return r.rows[0];
};

const getTimDetail = async (id_tim) => {
  const q = `
    select
      t.id_tim,
      t.nama_tim,
      t.id_program,
      (
        select json_build_object(
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
        from t_anggota_tim a
        join m_mahasiswa m on m.id_user = a.id_user
        join m_user u on u.id_user = m.id_user
        join m_prodi p on p.id_prodi = m.id_prodi
        join m_jurusan j on j.id_jurusan = p.id_jurusan
        join m_kampus k on k.id_kampus = p.id_kampus
        where a.id_tim = t.id_tim
          and a.peran = 1
        limit 1
      ) as ketua_tim,
      json_agg(
        json_build_object(
          'id_user', u2.id_user,
          'nim', m2.nim,
          'nama_lengkap', u2.nama_lengkap,
          'username', u2.username,
          'peran', a2.peran,
          'status', a2.status
        )
      ) as anggota
    from t_tim t
    join t_anggota_tim a2 on a2.id_tim = t.id_tim
    join m_mahasiswa m2 on m2.id_user = a2.id_user
    join m_user u2 on u2.id_user = m2.id_user
    where t.id_tim = $1
    group by t.id_tim
  `;
  const r = await db.query(q, [id_tim]);
  return r.rows[0];
};

const searchMahasiswaByNim = async (nim) => {
  const q = `
    select
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
      k.nama_kampus
    from m_mahasiswa m
    join m_user u on u.id_user = m.id_user
    join m_prodi p on p.id_prodi = m.id_prodi
    join m_jurusan j on j.id_jurusan = p.id_jurusan
    join m_kampus k on k.id_kampus = p.id_kampus
    where m.nim ilike $1
      and m.status_verifikasi = 1
      and m.status_mahasiswa = 1
    limit 10
  `;
  const r = await db.query(q, [`%${nim}%`]);
  return r.rows;
};

const getPendingInvite = async (id_tim, id_user) => {
  const q = `
    select *
    from t_anggota_tim
    where id_tim = $1
      and id_user = $2
      and status = 0
  `;
  const r = await db.query(q, [id_tim, id_user]);
  return r.rows[0];
};

const acceptAnggotaTim = async (id_tim, id_user) => {
  const q = `
    update t_anggota_tim
    set status = 1
    where id_tim = $1
      and id_user = $2
  `;
  await db.query(q, [id_tim, id_user]);
};

const rejectAnggotaTim = async (id_tim, id_user, catatan) => {
  const q = `
    update t_anggota_tim
    set status = 2,
        catatan = $3
    where id_tim = $1
      and id_user = $2
      and status = 0
  `;
  const r = await db.query(q, [id_tim, id_user, catatan]);
  return r.rowCount;
};

const getTimByUserId = async (id_user) => {
  const q = `
    select
      t.id_tim,
      t.nama_tim,
      t.id_program,
      t.status,
      t.created_at,
      a.peran,
      a.status as status_anggota
    from t_anggota_tim a
    join t_tim t on t.id_tim = a.id_tim
    where a.id_user = $1
  `;
  const r = await db.query(q, [id_user]);
  return r.rows[0];
};

const getTimDetailByUserId = async (id_user) => {
  const q = `
    select
      t.id_tim,
      t.nama_tim,
      t.id_program,
      prog.nama_program,
      prog.keterangan,
      t.status as status_tim,
      t.created_at,
      (
        select json_build_object(
          'id_user', u.id_user,
          'nim', m.nim,
          'nama_lengkap', u.nama_lengkap,
          'username', u.username
        )
        from t_anggota_tim a
        join m_mahasiswa m on m.id_user = a.id_user
        join m_user u on u.id_user = m.id_user
        where a.id_tim = t.id_tim
          and a.peran = 1
        limit 1
      ) as ketua_tim,
      (
        select json_agg(
          json_build_object(
            'id_user', u2.id_user,
            'nim', m2.nim,
            'nama_lengkap', u2.nama_lengkap,
            'username', u2.username,
            'peran', a2.peran,
            'status', a2.status
          )
        )
        from t_anggota_tim a2
        join m_mahasiswa m2 on m2.id_user = a2.id_user
        join m_user u2 on u2.id_user = m2.id_user
        where a2.id_tim = t.id_tim
      ) as anggota
    from t_anggota_tim ta
    join t_tim t on t.id_tim = ta.id_tim
    join m_program prog on prog.id_program = t.id_program
    where ta.id_user = $1
  `;
  const r = await db.query(q, [id_user]);
  return r.rows[0];
};

const insertPesertaProgram = async (client, id_user, id_program, id_tim, tahun) => {
  const q = `
    insert into t_peserta_program (id_user, id_program, id_tim, tahun, status_lolos)
    values ($1, $2, $3, $4, 0)
    on conflict (id_user, id_program) do nothing
  `;
  await client.query(q, [id_user, id_program, id_tim, tahun]);
};

const cekLolosPMW = async (id_user) => {
  const q = `
    select status_lolos
    from t_peserta_program
    where id_user = $1
      and id_program = 1
  `;
  const r = await db.query(q, [id_user]);
  return r.rows[0];
};

const cekSemuaAnggotaDisetujui = async (id_tim) => {
  const q = `
    select 
      count(*) filter (where status = 1) as disetujui,
      count(*) as total
    from t_anggota_tim
    where id_tim = $1
  `;
  const r = await db.query(q, [id_tim]);
  const { disetujui, total } = r.rows[0];
  return parseInt(disetujui) === parseInt(total);
};

const getIdProgramByIdTim = async (id_tim) => {
  const q = `
    select id_program
    from t_tim
    where id_tim = $1
  `;
  const r = await db.query(q, [id_tim]);
  return r.rows[0]?.id_program;
};

const getAllAnggotaTim = async (id_tim) => {
  const q = `
    select id_user
    from t_anggota_tim
    where id_tim = $1
      and status = 1
  `;
  const r = await db.query(q, [id_tim]);
  return r.rows.map(row => row.id_user);
};

module.exports = {
    getMahasiswaByUserId,
    cekUserPunyaTim,
    createTim,
    insertAnggotaTim,
    getMahasiswaByNim,
    countAnggotaTim,
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
    getIdProgramByIdTim,
    getAllAnggotaTim,
};