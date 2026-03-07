const {
  getTimKetuaDb,
  getAnggotaTimDetailDb,
  checkProposalExistsDb,
  createProposalDb,
  updateProposalDb,
  submitProposalDb,
  getProposalDetailDb,
  getProgramTimelineDb,
  getProposalByTimDb,
  getTimByUserDb,
  getProposalByUserDb,
} = require("../db/proposal.db");
const PROGRAM = require("../../../constants/program");

const isTimelineOpen = (timeline) => {
  if (!timeline?.pendaftaran_mulai || !timeline?.pendaftaran_selesai) return true;
  const now = new Date();
  return now >= new Date(timeline.pendaftaran_mulai) && now <= new Date(timeline.pendaftaran_selesai);
};

const getProposalStatus = async (id_user) => {
  const tim = await getTimByUserDb(id_user);

  if (!tim) {
    return {
      hasTim: false,
      isKetua: false,
      isAnggota: false,
      canSubmit: false,
      timelineOpen: false,
      message: "Anda belum terdaftar dalam tim",
      data: null,
    };
  }

  const isKetua = tim.peran === 1;
  const anggota = await getAnggotaTimDetailDb(tim.id_tim);
  const timeline = await getProgramTimelineDb(tim.id_program);
  const timelineOpen = isTimelineOpen(timeline);
  const proposal = isKetua
    ? await getProposalByTimDb(tim.id_tim)
    : await getProposalByUserDb(id_user);

  return {
    hasTim: true,
    isKetua,
    isAnggota: !isKetua,
    canSubmit: isKetua && anggota.all_accepted && timelineOpen,
    timelineOpen,
    message: "Status proposal berhasil diambil",
    data: { tim, anggota, timeline, proposal: proposal || null },
  };
};

const createProposal = async (id_user, data) => {
  if (!data.id_program || !data.id_kategori || !data.judul || !data.modal_diajukan) {
    return { error: true, message: "Data proposal tidak lengkap", data: null };
  }

  const id_program = parseInt(data.id_program);
  if (![PROGRAM.PMW, PROGRAM.INBIS].includes(id_program)) {
    return { error: true, message: "Program tidak valid", data: null };
  }

  const modal = parseFloat(data.modal_diajukan);
  if (isNaN(modal) || modal <= 0) {
    return { error: true, message: "Modal diajukan tidak valid", data: null };
  }

  const tim = await getTimKetuaDb(id_user, id_program);
  if (!tim) {
    return { error: true, message: "Anda bukan ketua tim pada program ini", data: null };
  }

  const anggota = await getAnggotaTimDetailDb(tim.id_tim);
  if (anggota.total < 3 || anggota.total > 5) {
    return { error: true, message: "Jumlah anggota tim harus 3 sampai 5 orang", data: { total_anggota: anggota.total } };
  }

  if (!anggota.all_accepted) {
    return { error: true, message: "Masih ada anggota tim yang belum memberikan keputusan", data: { anggota_pending: anggota.pending_members } };
  }

  const timeline = await getProgramTimelineDb(id_program);
  if (!isTimelineOpen(timeline)) {
    return { error: true, message: "Pendaftaran proposal untuk program ini sudah ditutup", data: { timeline } };
  }

  const exists = await checkProposalExistsDb(tim.id_tim);
  if (exists) {
    return { error: true, message: "Tim ini sudah pernah membuat proposal", data: null };
  }

  const proposal = await createProposalDb(tim.id_tim, { ...data, id_program, modal_diajukan: modal });
  const detail = await getProposalDetailDb(proposal.id_proposal);

  return { error: false, message: "Draft proposal berhasil dibuat", data: detail };
};

const updateProposal = async (id_user, id_proposal, data) => {
  const id = parseInt(id_proposal);
  if (isNaN(id) || id <= 0) {
    return { error: true, message: "ID proposal tidak valid", data: null };
  }

  const proposal = await getProposalDetailDb(id);
  if (!proposal) {
    return { error: true, message: "Proposal tidak ditemukan", data: null };
  }

  if (proposal.ketua.id_user !== id_user) {
    return { error: true, message: "Anda tidak berhak mengubah proposal ini", data: null };
  }

  if (proposal.status !== 0) {
    return { error: true, message: "Proposal sudah diajukan dan tidak bisa diedit", data: null };
  }

  const timeline = await getProgramTimelineDb(proposal.id_program);
  if (!isTimelineOpen(timeline)) {
    return { error: true, message: "Pendaftaran proposal untuk program ini sudah ditutup", data: { timeline } };
  }

  if (data.modal_diajukan !== undefined) {
    const modal = parseFloat(data.modal_diajukan);
    if (isNaN(modal) || modal <= 0) {
      return { error: true, message: "Modal diajukan tidak valid", data: null };
    }
    data.modal_diajukan = modal;
  }

  const updated = await updateProposalDb(id, data);
  return { error: false, message: "Draft proposal berhasil diperbarui", data: updated };
};

const submitProposal = async (id_user, id_proposal) => {
  const id = parseInt(id_proposal);
  if (isNaN(id) || id <= 0) {
    return { error: true, message: "ID proposal tidak valid", data: null };
  }

  const proposal = await getProposalDetailDb(id);
  if (!proposal) {
    return { error: true, message: "Proposal tidak ditemukan", data: null };
  }

  if (proposal.ketua.id_user !== id_user) {
    return { error: true, message: "Anda tidak berhak submit proposal ini", data: null };
  }

  if (proposal.status !== 0) {
    return { error: true, message: "Proposal sudah diajukan sebelumnya", data: null };
  }

  if (!proposal.file_proposal) {
    return { error: true, message: "File proposal belum diunggah", data: null };
  }

  const timeline = await getProgramTimelineDb(proposal.id_program);
  if (!isTimelineOpen(timeline)) {
    return { error: true, message: "Pendaftaran proposal untuk program ini sudah ditutup", data: { timeline } };
  }

  const submitted = await submitProposalDb(id);
  return { error: false, message: "Proposal berhasil diajukan", data: submitted };
};

const getProposalDetail = async (id_user, id_proposal) => {
  const id = parseInt(id_proposal);
  if (isNaN(id) || id <= 0) {
    return { error: true, message: "ID proposal tidak valid", data: null };
  }

  const proposal = await getProposalDetailDb(id);
  if (!proposal) {
    return { error: true, message: "Proposal tidak ditemukan", data: null };
  }

  const isKetua = proposal.ketua.id_user === id_user;
  const isAnggota = proposal.anggota_tim?.some((a) => a.id_user === id_user);

  if (!isKetua && !isAnggota) {
    return { error: true, message: "Anda tidak berhak melihat proposal ini", data: null };
  }

  return { error: false, message: "Detail proposal berhasil diambil", data: proposal };
};

module.exports = {
  getProposalStatus,
  createProposal,
  updateProposal,
  submitProposal,
  getProposalDetail,
};