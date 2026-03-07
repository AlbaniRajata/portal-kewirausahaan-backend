const {
  getPesertaAktifDb,
  getProposalLolosDb,
  listDosenDb,
  getDosenByIdDb,
  getPengajuanTimDb,
  upsertPengajuanDb,
  updateStatusProposalDb,
} = require("../db/pembimbing.db");

const PROPOSAL_STATUS = {
  LOLOS_WAWANCARA: 7,
  MENUNGGU_PEMBIMBING: 8,
  PEMBIMBING_DITERIMA: 9,
};

const listDosenPembimbing = async () => {
  const dosen = await listDosenDb();
  return {
    error: false,
    message: "Daftar dosen pembimbing berhasil diambil",
    data: dosen,
  };
};

const getStatusPembimbing = async (id_user) => {
  const peserta = await getPesertaAktifDb(id_user);
  if (!peserta) {
    return { error: true, message: "Anda belum terdaftar sebagai peserta program yang lolos", data: null };
  }

  const proposal = await getProposalLolosDb(peserta.id_tim);
  if (!proposal) {
    return { error: true, message: "Proposal belum lolos tahap wawancara", data: null };
  }

  const pengajuan = await getPengajuanTimDb(peserta.id_tim);
  const bisa_ajukan = peserta.peran === 1 && (!pengajuan || pengajuan.status === 2);

  return {
    error: false,
    message: "Status pengajuan pembimbing berhasil diambil",
    data: {
      proposal: {
        id_proposal: proposal.id_proposal,
        judul: proposal.judul,
        status: proposal.status,
      },
      pengajuan: pengajuan || null,
      bisa_ajukan,
      is_ketua: peserta.peran === 1,
    },
  };
};

const ajukanPembimbing = async (id_user, payload) => {
  const id_dosen = parseInt(payload.id_dosen);
  if (!id_dosen || isNaN(id_dosen) || id_dosen <= 0) {
    return { error: true, message: "ID dosen tidak valid", data: null };
  }

  const peserta = await getPesertaAktifDb(id_user);
  if (!peserta) {
    return { error: true, message: "Anda belum terdaftar sebagai peserta program yang lolos", data: null };
  }

  if (peserta.peran !== 1) {
    return { error: true, message: "Hanya ketua tim yang dapat mengajukan dosen pembimbing", data: null };
  }

  const proposal = await getProposalLolosDb(peserta.id_tim);
  if (!proposal || proposal.status !== PROPOSAL_STATUS.LOLOS_WAWANCARA) {
    return { error: true, message: "Pengajuan hanya bisa dilakukan saat proposal berstatus lolos wawancara", data: null };
  }

  const pengajuan = await getPengajuanTimDb(peserta.id_tim);
  if (pengajuan && pengajuan.status !== 2) {
    return { error: true, message: "Pengajuan pembimbing sudah ada dan masih dalam proses", data: null };
  }

  const dosen = await getDosenByIdDb(id_dosen);
  if (!dosen) {
    return { error: true, message: "Dosen tidak ditemukan atau belum terverifikasi", data: null };
  }

  const result = await upsertPengajuanDb(peserta.id_tim, peserta.id_program, id_dosen, id_user);
  await updateStatusProposalDb(proposal.id_proposal, PROPOSAL_STATUS.MENUNGGU_PEMBIMBING);

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