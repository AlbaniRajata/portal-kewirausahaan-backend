const {
  getPengajuanMasukDb,
  getDetailPengajuanDb,
  getProposalByTimDb,
  getTimLengkapDb,
  approvePengajuanDb,
  rejectPengajuanDb,
  updateProposalStatusDb,
} = require("../db/pembimbing.db");

const PROPOSAL_STATUS = {
  LOLOS_WAWANCARA: 7,
  MENUNGGU_PEMBIMBING: 8,
  PEMBIMBING_DITERIMA: 9,
};

const getPengajuanMasuk = async (id_dosen) => {
  const data = await getPengajuanMasukDb(id_dosen);
  return {
    error: false,
    message: "Daftar pengajuan pembimbing berhasil diambil",
    data,
  };
};

const getDetailPengajuan = async (id_dosen, id_pengajuan) => {
  if (!Number.isInteger(id_pengajuan) || id_pengajuan <= 0) {
    return { error: true, message: "ID pengajuan tidak valid", data: null };
  }

  const detail = await getDetailPengajuanDb(id_pengajuan, id_dosen);
  if (!detail) {
    return { error: true, message: "Pengajuan tidak ditemukan", data: null };
  }

  const [proposal, tim] = await Promise.all([
    getProposalByTimDb(detail.id_tim),
    getTimLengkapDb(detail.id_tim),
  ]);

  return {
    error: false,
    message: "Detail pengajuan berhasil diambil",
    data: { pengajuan: detail, proposal, tim },
  };
};

const approvePengajuan = async (id_dosen, id_pengajuan) => {
  if (!Number.isInteger(id_pengajuan) || id_pengajuan <= 0) {
    return { error: true, message: "ID pengajuan tidak valid", data: null };
  }

  const detail = await getDetailPengajuanDb(id_pengajuan, id_dosen);
  if (!detail) {
    return { error: true, message: "Pengajuan tidak ditemukan", data: null };
  }

  if (detail.status !== 0) {
    return { error: true, message: "Pengajuan sudah direspon sebelumnya", data: null };
  }

  const proposal = await getProposalByTimDb(detail.id_tim);
  if (!proposal || proposal.status !== PROPOSAL_STATUS.MENUNGGU_PEMBIMBING) {
    return { error: true, message: "Proposal tidak dalam status menunggu pembimbing", data: null };
  }

  const approved = await approvePengajuanDb(id_pengajuan);
  await updateProposalStatusDb(proposal.id_proposal, PROPOSAL_STATUS.PEMBIMBING_DITERIMA);

  const tim = await getTimLengkapDb(detail.id_tim);

  return {
    error: false,
    message: "Pengajuan pembimbing disetujui",
    data: {
      pengajuan: approved,
      proposal: { ...proposal, status: PROPOSAL_STATUS.PEMBIMBING_DITERIMA },
      tim,
    },
  };
};

const rejectPengajuan = async (id_dosen, id_pengajuan, catatan) => {
  if (!Number.isInteger(id_pengajuan) || id_pengajuan <= 0) {
    return { error: true, message: "ID pengajuan tidak valid", data: null };
  }

  if (!catatan || typeof catatan !== "string" || catatan.trim().length < 5) {
    return { error: true, message: "Catatan penolakan harus diisi minimal 5 karakter", data: null };
  }

  const detail = await getDetailPengajuanDb(id_pengajuan, id_dosen);
  if (!detail) {
    return { error: true, message: "Pengajuan tidak ditemukan", data: null };
  }

  if (detail.status !== 0) {
    return { error: true, message: "Pengajuan sudah direspon sebelumnya", data: null };
  }

  const proposal = await getProposalByTimDb(detail.id_tim);
  if (!proposal || proposal.status !== PROPOSAL_STATUS.MENUNGGU_PEMBIMBING) {
    return { error: true, message: "Proposal tidak dalam status menunggu pembimbing", data: null };
  }

  const rejected = await rejectPengajuanDb(id_pengajuan, catatan.trim());
  await updateProposalStatusDb(proposal.id_proposal, PROPOSAL_STATUS.LOLOS_WAWANCARA);

  const tim = await getTimLengkapDb(detail.id_tim);

  return {
    error: false,
    message: "Pengajuan pembimbing ditolak",
    data: {
      pengajuan: rejected,
      proposal: { ...proposal, status: PROPOSAL_STATUS.LOLOS_WAWANCARA },
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