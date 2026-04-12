const {
  getTimByUserDb,
  getTimKetuaByUserDb,
  listDosenDb,
  getDosenByIdDb,
  getPengajuanTimDb,
  upsertPengajuanDb,
} = require("../db/pembimbing.db");

const listDosenPembimbing = async () => {
  const dosen = await listDosenDb();
  return {
    error: false,
    message: "Daftar dosen pembimbing berhasil diambil",
    data: dosen,
  };
};

const getStatusPembimbing = async (id_user) => {
  const tim = await getTimByUserDb(id_user);
  if (!tim) {
    return { error: true, message: "Anda belum terdaftar dalam tim", data: null };
  }

  const pengajuan = await getPengajuanTimDb(tim.id_tim);
  const bisa_ajukan = tim.peran === 1 && (!pengajuan || pengajuan.status === 2);

  return {
    error: false,
    message: "Status pengajuan pembimbing berhasil diambil",
    data: {
      tim,
      pengajuan: pengajuan || null,
      bisa_ajukan,
      is_ketua: tim.peran === 1,
    },
  };
};

const ajukanPembimbing = async (id_user, payload) => {
  const id_dosen = parseInt(payload.id_dosen);
  if (!id_dosen || isNaN(id_dosen) || id_dosen <= 0) {
    return { error: true, message: "ID dosen tidak valid", data: null };
  }

  const tim = await getTimKetuaByUserDb(id_user);
  if (!tim) {
    return { error: true, message: "Hanya ketua tim yang dapat mengajukan dosen pembimbing", data: null };
  }

  const pengajuan = await getPengajuanTimDb(tim.id_tim);
  if (pengajuan && pengajuan.status === 0) {
    return { error: true, message: "Masih ada pengajuan pembimbing aktif yang belum direspon", data: null };
  }

  if (pengajuan && pengajuan.status === 1) {
    return { error: true, message: "Dosen pembimbing sudah disetujui. Tidak dapat mengajukan ulang", data: null };
  }

  const dosen = await getDosenByIdDb(id_dosen);
  if (!dosen) {
    return { error: true, message: "Dosen tidak ditemukan atau belum terverifikasi", data: null };
  }

  const result = await upsertPengajuanDb(tim.id_tim, tim.id_program, id_dosen, id_user);

  return {
    error: false,
    message: "Pengajuan pembimbing berhasil dikirim",
    data: result,
  };
};

module.exports = {
  listDosenPembimbing,
  getStatusPembimbing,
  ajukanPembimbing,
};