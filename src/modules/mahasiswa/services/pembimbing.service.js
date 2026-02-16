const {
  getPesertaAktifDb,
  getProposalLolosDb,
  listDosenDb,
  getPengajuanTimDb,
  upsertPengajuanDb,
  updateStatusProposalDb,
} = require("../db/pembimbing.db");

const listDosenPembimbing = async () => {
  const dosen = await listDosenDb();
  return {
    error: false,
    message: "Daftar dosen pembimbing tersedia",
    data: dosen,
  };
};

const getStatusPembimbing = async (id_user) => {
  const peserta = await getPesertaAktifDb(id_user);

  if (!peserta) {
    return {
      error: true,
      message: "Anda belum terdaftar sebagai peserta program",
      data: null,
    };
  }

  const proposal = await getProposalLolosDb(peserta.id_tim);

  if (!proposal) {
    return {
      error: true,
      message: "Proposal belum lolos wawancara",
      data: null,
    };
  }

  const pengajuan = await getPengajuanTimDb(peserta.id_tim);

  const bisa_ajukan = !pengajuan || pengajuan.status === 2;

  return {
    error: false,
    message: "Status pengajuan pembimbing",
    data: {
      proposal: {
        id_proposal: proposal.id_proposal,
        judul: proposal.judul,
        status: proposal.status,
      },
      pengajuan,
      bisa_ajukan,
    },
  };
};

const ajukanPembimbing = async (id_user, payload) => {
  const { id_dosen } = payload;

  if (!id_dosen) {
    return {
      error: true,
      message: "id_dosen wajib diisi",
      data: null,
    };
  }

  const peserta = await getPesertaAktifDb(id_user);

  if (!peserta) {
    return {
      error: true,
      message: "Anda belum terdaftar sebagai peserta program",
      data: null,
    };
  }

  const proposal = await getProposalLolosDb(peserta.id_tim);

  if (!proposal || proposal.status !== 7) {
    return {
      error: true,
      message: "Pengajuan hanya bisa dilakukan saat proposal lolos wawancara",
      data: null,
    };
  }

  const pengajuan = await upsertPengajuanDb(
    peserta.id_tim,
    peserta.id_program,
    id_dosen,
    id_user
  );

  await updateStatusProposalDb(proposal.id_proposal, 8);

  return {
    error: false,
    message: "Pengajuan pembimbing berhasil dikirim",
    data: pengajuan,
  };
};

module.exports = {
  listDosenPembimbing,
  ajukanPembimbing,
  getStatusPembimbing,
};