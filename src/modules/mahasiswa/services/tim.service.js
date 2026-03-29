const db = require("../../../config/db");
const timDb = require("../db/tim.db");
const PROGRAM = require("../../../constants/program");

const isTimelineOpen = (timeline) => {
  if (!timeline?.pendaftaran_mulai || !timeline?.pendaftaran_selesai) return false;
  const now = new Date();
  return now >= new Date(timeline.pendaftaran_mulai) && now <= new Date(timeline.pendaftaran_selesai);
};

const cekEligibleInbis = async (id_user) => {
  const mahasiswa = await timDb.getMahasiswaByUserId(id_user);
  if (!mahasiswa || mahasiswa.status_verifikasi !== 1 || mahasiswa.status_mahasiswa !== 1) {
    return { eligible: false, alasan: "Akun mahasiswa Anda belum memenuhi syarat." };
  }

  const timeline = await timDb.getProgramTimeline(PROGRAM.INBIS);
  if (!isTimelineOpen(timeline)) {
    return { eligible: false, alasan: "Timeline pendaftaran INBIS belum dibuka atau sudah ditutup.", timeline_open: false };
  }

  const pmwStatus = await timDb.cekLolosPMW(id_user, PROGRAM.PMW);
  if (!pmwStatus || pmwStatus.status_lolos !== 1) {
    return { eligible: false, alasan: "Anda belum dinyatakan lolos program PMW.", timeline_open: true, lolos_pmw: false };
  }

  const monev = await timDb.cekMonevTimPMWSelesai(id_user, PROGRAM.PMW);
  const total = parseInt(monev?.total_luaran || 0);
  const disetujui = parseInt(monev?.total_disetujui || 0);
  const monevSelesai = total > 0 && total === disetujui;

  if (!monevSelesai) {
    return {
      eligible: false,
      alasan: `Progress monev PMW tim Anda belum 100% (${disetujui}/${total} luaran disetujui).`,
      timeline_open: true,
      lolos_pmw: true,
      monev_selesai: false,
      monev_progress: { total, disetujui },
    };
  }

  return {
    eligible: true,
    alasan: null,
    timeline_open: true,
    lolos_pmw: true,
    monev_selesai: true,
    monev_progress: { total, disetujui },
  };
};

const createTim = async (user, payload) => {
  const mahasiswa = await timDb.getMahasiswaByUserId(user.id_user);
  if (!mahasiswa || mahasiswa.status_verifikasi !== 1 || mahasiswa.status_mahasiswa !== 1) {
    return { error: "Akun mahasiswa Anda belum memenuhi syarat untuk mengajukan tim.", field: "status_verifikasi" };
  }

  const sudahPunyaTim = await timDb.cekUserPunyaTim(user.id_user);
  if (sudahPunyaTim) {
    return { error: "Anda sudah terdaftar dalam sebuah tim dan tidak dapat membuat tim baru.", field: "tim" };
  }

  const id_program = parseInt(payload.id_program);
  if (![PROGRAM.PMW, PROGRAM.INBIS].includes(id_program)) {
    return { error: "Program tidak valid.", field: "id_program" };
  }

  const timeline = await timDb.getProgramTimeline(id_program);
  if (!isTimelineOpen(timeline)) {
    return { error: "Pendaftaran program ini belum dibuka atau sudah ditutup.", field: "id_program" };
  }

  if (id_program === PROGRAM.INBIS) {
    const pmwStatus = await timDb.cekLolosPMW(user.id_user, PROGRAM.PMW);
    if (!pmwStatus || pmwStatus.status_lolos !== 1) {
      return { error: "Anda tidak eligible untuk mendaftar program ini. Silahkan cek persyaratan pada informasi yang telah diberikan.", field: "id_program" };
    }

    const monev = await timDb.cekMonevTimPMWSelesai(user.id_user, PROGRAM.PMW);
    const total = parseInt(monev?.total_luaran || 0);
    const disetujui = parseInt(monev?.total_disetujui || 0);
    if (total === 0 || total !== disetujui) {
      return { error: "Anda tidak eligible untuk mendaftar program ini. Silahkan cek persyaratan pada informasi yang telah diberikan.", field: "id_program" };
    }
  }

  if (!payload.nama_tim || typeof payload.nama_tim !== "string" || !payload.nama_tim.trim()) {
    return { error: "Nama tim wajib diisi.", field: "nama_tim" };
  }

  if (!Array.isArray(payload.anggota)) {
    return { error: "Data anggota tim tidak valid.", field: "anggota" };
  }

  if (payload.anggota.length < 2 || payload.anggota.length > 4) {
    return { error: "Jumlah anggota tim harus minimal 2 dan maksimal 4 orang (total 3-5 termasuk ketua).", field: "anggota" };
  }

  const nimList = payload.anggota.map((a) => a.nim);
  if (new Set(nimList).size !== nimList.length) {
    return { error: "Terdapat NIM duplikat dalam daftar anggota.", field: "anggota" };
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const tim = await timDb.createTim(client, id_program, payload.nama_tim.trim());
    await timDb.insertAnggotaTim(client, tim.id_tim, user.id_user, 1, 1);

    const currentYear = new Date().getFullYear();
    await timDb.insertPesertaProgram(client, user.id_user, id_program, tim.id_tim, currentYear);

    for (const item of payload.anggota) {
      if (!item.nim) {
        await client.query("ROLLBACK");
        return { error: "NIM anggota tidak boleh kosong.", field: "anggota" };
      }

      const target = await timDb.getMahasiswaByNim(item.nim);
      if (!target || target.status_verifikasi !== 1 || target.status_mahasiswa !== 1) {
        await client.query("ROLLBACK");
        return { error: `Mahasiswa dengan NIM ${item.nim} tidak memenuhi syarat sebagai anggota tim.`, field: "anggota" };
      }

      if (target.id_user === user.id_user) {
        await client.query("ROLLBACK");
        return { error: "Anda tidak dapat menambahkan diri sendiri sebagai anggota.", field: "anggota" };
      }

      const punyaTim = await timDb.cekUserPunyaTim(target.id_user);
      if (punyaTim) {
        await client.query("ROLLBACK");
        return { error: `Mahasiswa dengan NIM ${item.nim} sudah terdaftar dalam tim lain.`, field: "anggota" };
      }

      if (id_program === PROGRAM.INBIS) {
        const pmwStatus = await timDb.cekLolosPMW(target.id_user, PROGRAM.PMW);
        if (!pmwStatus || pmwStatus.status_lolos !== 1) {
          await client.query("ROLLBACK");
          return { error: `Mahasiswa dengan NIM ${item.nim} tidak eligible untuk mendaftar program ini. Silahkan cek persyaratan pada informasi yang telah diberikan.`, field: "anggota" };
        }

        const monev = await timDb.cekMonevTimPMWSelesai(target.id_user, PROGRAM.PMW);
        const total = parseInt(monev?.total_luaran || 0);
        const disetujui = parseInt(monev?.total_disetujui || 0);
        if (total === 0 || total !== disetujui) {
          await client.query("ROLLBACK");
          return { error: `Mahasiswa dengan NIM ${item.nim} tidak eligible untuk mendaftar program ini. Silahkan cek persyaratan pada informasi yang telah diberikan.`, field: "anggota" };
        }
      }

      await timDb.insertAnggotaTim(client, tim.id_tim, target.id_user, 2, 0);
    }

    await client.query("COMMIT");
    const detailTim = await timDb.getTimDetail(tim.id_tim);
    return { data: detailTim };
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505" && err.constraint === "unique_tim_per_program") {
      return { error: "Nama tim sudah digunakan untuk program ini. Silakan gunakan nama tim yang lain.", field: "nama_tim" };
    }
    throw err;
  } finally {
    client.release();
  }
};

const searchMahasiswa = async (user, query) => {
  if (!query || query.trim().length < 3) {
    return { error: "Masukkan minimal 3 karakter NIM atau nama untuk melakukan pencarian.", field: "query" };
  }
  const data = await timDb.searchMahasiswaByNim(query.trim(), user.id_user);
  return { data };
};

const acceptInvite = async (user, id_tim) => {
  if (!Number.isInteger(id_tim) || id_tim <= 0) {
    return { error: "ID tim tidak valid.", field: "id_tim" };
  }

  const invite = await timDb.getPendingInvite(id_tim, user.id_user);
  if (!invite) {
    return { error: "Undangan tim tidak ditemukan atau sudah diproses sebelumnya.", field: "tim" };
  }

  const id_program = await timDb.getIdProgramByIdTim(id_tim);
  if (!id_program) {
    return { error: "Program tim tidak ditemukan.", field: "tim" };
  }

  const timeline = await timDb.getProgramTimeline(id_program);
  if (!isTimelineOpen(timeline)) {
    return { error: "Pendaftaran program ini belum dibuka atau sudah ditutup.", field: "tim" };
  }

  if (id_program === PROGRAM.INBIS) {
    const mahasiswa = await timDb.getMahasiswaByUserId(user.id_user);
    if (!mahasiswa || mahasiswa.status_verifikasi !== 1 || mahasiswa.status_mahasiswa !== 1) {
      return { error: "Akun mahasiswa Anda belum memenuhi syarat.", field: "tim" };
    }

    const pmwStatus = await timDb.cekLolosPMW(user.id_user, PROGRAM.PMW);
    if (!pmwStatus || pmwStatus.status_lolos !== 1) {
      return { error: "Anda tidak eligible untuk mendaftar program ini. Silahkan cek persyaratan pada informasi yang telah diberikan.", field: "tim" };
    }

    const monev = await timDb.cekMonevTimPMWSelesai(user.id_user, PROGRAM.PMW);
    const total = parseInt(monev?.total_luaran || 0);
    const disetujui = parseInt(monev?.total_disetujui || 0);
    if (total === 0 || total !== disetujui) {
      return { error: "Anda tidak eligible untuk mendaftar program ini. Silahkan cek persyaratan pada informasi yang telah diberikan.", field: "tim" };
    }
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await timDb.acceptAnggotaTim(client, id_tim, user.id_user);
    const currentYear = new Date().getFullYear();
    await timDb.insertPesertaProgram(client, user.id_user, id_program, id_tim, currentYear);
    await client.query("COMMIT");

    const data = await timDb.getTimDetail(id_tim);
    return { data };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const rejectInvite = async (user, id_tim, catatan) => {
  if (!Number.isInteger(id_tim) || id_tim <= 0) {
    return { error: "ID tim tidak valid.", field: "id_tim" };
  }

  if (!catatan || typeof catatan !== "string" || catatan.trim().length < 5) {
    return { error: "Catatan penolakan harus diisi minimal 5 karakter.", field: "catatan" };
  }

  const invite = await timDb.getPendingInvite(id_tim, user.id_user);
  if (!invite) {
    return { error: "Undangan tim tidak ditemukan atau sudah diproses sebelumnya.", field: "tim" };
  }

  const affected = await timDb.rejectAnggotaTim(id_tim, user.id_user, catatan.trim());
  if (!affected) {
    return { error: "Undangan tim gagal ditolak.", field: "tim" };
  }

  const data = await timDb.getTimDetail(id_tim);
  return { data };
};

const getTimStatus = async (user) => {
  const tim = await timDb.getTimByUserId(user.id_user);
  if (!tim) {
    return { hasTim: false, isKetua: false, isAnggota: false, statusAnggota: null, data: null };
  }
  return {
    hasTim: true,
    isKetua: tim.peran === 1,
    isAnggota: tim.peran === 2,
    statusAnggota: tim.status_anggota,
    data: tim,
  };
};

const getTimDetail = async (user) => {
  const detail = await timDb.getTimDetailByUserId(user.id_user);
  if (!detail) {
    return { error: "Anda belum terdaftar dalam tim apapun.", field: "tim" };
  }
  return { data: detail };
};

const addAnggotaToTim = async (user, nim) => {
  const tim = await timDb.getTimByUserId(user.id_user);
  if (!tim || tim.peran !== 1) {
    return { error: "Anda bukan ketua tim.", field: "tim" };
  }

  const timeline = await timDb.getProgramTimeline(tim.id_program);
  if (!isTimelineOpen(timeline)) {
    return { error: "Pendaftaran program ini belum dibuka atau sudah ditutup.", field: "tim" };
  }

  const hasRejected = await timDb.cekAdaAnggotaDitolak(tim.id_tim);
  if (!hasRejected) {
    return { error: "Tidak ada anggota yang ditolak. Penambahan anggota baru hanya bisa dilakukan jika ada undangan yang ditolak.", field: "tim" };
  }

  const activeCount = await timDb.countActiveAnggota(tim.id_tim);
  if (activeCount >= 5) {
    return { error: "Tim sudah penuh (maksimal 4 anggota).", field: "anggota" };
  }

  if (!nim || typeof nim !== "string" || !nim.trim()) {
    return { error: "NIM wajib diisi.", field: "nim" };
  }

  const target = await timDb.getMahasiswaByNim(nim.trim());
  if (!target || target.status_verifikasi !== 1 || target.status_mahasiswa !== 1) {
    return { error: `Mahasiswa dengan NIM ${nim} tidak memenuhi syarat sebagai anggota tim.`, field: "nim" };
  }

  if (target.id_user === user.id_user) {
    return { error: "Anda tidak dapat menambahkan diri sendiri sebagai anggota.", field: "nim" };
  }

  const aktifDiTim = await timDb.cekAktifDiTim(tim.id_tim, target.id_user);
  if (aktifDiTim) {
    return { error: "Mahasiswa ini sudah memiliki undangan aktif atau sudah bergabung dalam tim ini.", field: "nim" };
  }

  const punyaTim = await timDb.cekUserPunyaTim(target.id_user);
  if (punyaTim) {
    return { error: `Mahasiswa dengan NIM ${nim} sudah terdaftar dalam tim lain.`, field: "nim" };
  }

  const id_program = await timDb.getIdProgramByIdTim(tim.id_tim);
  if (id_program === PROGRAM.INBIS) {
    const pmwStatus = await timDb.cekLolosPMW(target.id_user, PROGRAM.PMW);
    if (!pmwStatus || pmwStatus.status_lolos !== 1) {
      return { error: `Mahasiswa dengan NIM ${nim} tidak eligible untuk mendaftar program ini. Silahkan cek persyaratan pada informasi yang telah diberikan.`, field: "nim" };
    }

    const monev = await timDb.cekMonevTimPMWSelesai(target.id_user, PROGRAM.PMW);
    const total = parseInt(monev?.total_luaran || 0);
    const disetujui = parseInt(monev?.total_disetujui || 0);
    if (total === 0 || total !== disetujui) {
      return { error: `Mahasiswa dengan NIM ${nim} tidak eligible untuk mendaftar program ini. Silahkan cek persyaratan pada informasi yang telah diberikan.`, field: "nim" };
    }
  }

  await timDb.insertAnggotaTimDirect(tim.id_tim, target.id_user, 2, 0);
  const data = await timDb.getTimDetail(tim.id_tim);
  return { data };
};

const resetTim = async (user) => {
  const tim = await timDb.getTimByUserId(user.id_user);
  if (!tim || tim.peran !== 1) {
    return { error: "Anda bukan ketua tim.", field: "tim" };
  }

  const hasProposal = await timDb.cekTimPunyaProposal(tim.id_tim);
  if (hasProposal) {
    return { error: "Tim sudah memiliki proposal dan tidak dapat direset.", field: "tim" };
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await timDb.deleteTimFull(client, tim.id_tim);
    await client.query("COMMIT");
    return { success: true };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  cekEligibleInbis,
  createTim,
  searchMahasiswa,
  acceptInvite,
  rejectInvite,
  getTimStatus,
  getTimDetail,
  addAnggotaToTim,
  resetTim,
};