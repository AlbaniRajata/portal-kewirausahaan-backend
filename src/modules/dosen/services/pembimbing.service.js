const {
  getPengajuanMasukDb,
  getDetailPengajuanDb,
  getProposalByTimDb,
  getTimLengkapDb,
  updateProposalStatusDb,
  approvePengajuanDb,
  rejectPengajuanDb,
} = require("../db/pembimbing.db");

const getPengajuanMasuk = async (id_dosen) => {
  const rows = await getPengajuanMasukDb(id_dosen);

  return {
    error: false,
    message: "Daftar pengajuan pembimbing masuk",
    data: rows,
  };
};

const getDetailPengajuan = async (id_dosen, id_pengajuan) => {
  const detail = await getDetailPengajuanDb(id_pengajuan, id_dosen);

  if (!detail) {
    return {
      error: true,
      message: "Pengajuan tidak ditemukan",
      data: null,
    };
  }

  const proposal = await getProposalByTimDb(detail.id_tim);
  const tim = await getTimLengkapDb(detail.id_tim);

  return {
    error: false,
    message: "Detail pengajuan pembimbing lengkap",
    data: {
      pengajuan: detail,
      proposal,
      tim,
    },
  };
};

const approvePengajuan = async (id_dosen, id_pengajuan) => {
  const detail = await getDetailPengajuanDb(id_pengajuan, id_dosen);

  if (!detail) {
    return {
      error: true,
      message: "Pengajuan tidak ditemukan",
      data: null,
    };
  }

  if (detail.status !== 0) {
    return {
      error: true,
      message: "Pengajuan sudah direspon",
      data: detail,
    };
  }

  const proposal = await getProposalByTimDb(detail.id_tim);

  if (!proposal || proposal.status !== 8) {
    return {
      error: true,
      message: "Proposal belum dalam status pengajuan pembimbing",
      data: proposal,
    };
  }

  const approved = await approvePengajuanDb(id_pengajuan);

  await updateProposalStatusDb(proposal.id_proposal, 9);

  const tim = await getTimLengkapDb(detail.id_tim);

  return {
    error: false,
    message: "Pengajuan pembimbing disetujui",
    data: {
      pengajuan: approved,
      proposal: {
        ...proposal,
        status: 9,
      },
      tim,
    },
  };
};

const rejectPengajuan = async (id_dosen, id_pengajuan, catatan) => {
  const detail = await getDetailPengajuanDb(id_pengajuan, id_dosen);

  if (!detail) {
    return {
      error: true,
      message: "Pengajuan tidak ditemukan",
      data: null,
    };
  }

  if (detail.status !== 0) {
    return {
      error: true,
      message: "Pengajuan sudah direspon",
      data: detail,
    };
  }

  if (!catatan || catatan.trim() === "") {
    return {
      error: true,
      message: "Catatan wajib diisi saat menolak",
      data: null,
    };
  }

  const proposal = await getProposalByTimDb(detail.id_tim);

  if (!proposal || proposal.status !== 8) {
    return {
      error: true,
      message: "Proposal tidak dalam status pengajuan pembimbing",
      data: proposal,
    };
  }

  const rejected = await rejectPengajuanDb(id_pengajuan, catatan);

  await updateProposalStatusDb(proposal.id_proposal, 7);

  const tim = await getTimLengkapDb(detail.id_tim);

  return {
    error: false,
    message: "Pengajuan pembimbing ditolak",
    data: {
      pengajuan: rejected,
      proposal: {
        ...proposal,
        status: 7,
      },
      tim,
    },
  };
};

module.exports = {
  getPengajuanMasuk,
  getDetailPengajuan,
  approvePengajuan,
  rejectPengajuan,
};