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
} = require("../db/proposal.db");

const getProposalStatus = async (id_user) => {
  const tim = await getTimByUserDb(id_user);

  if (!tim) {
    return {
      error: false,
      hasTim: false,
      isKetua: false,
      message: "Anda belum terdaftar dalam tim",
      data: null,
    };
  }

  const isKetua = tim.peran === 1;

  if (!isKetua) {
    return {
      error: false,
      hasTim: true,
      isKetua: false,
      message: "Anda bukan ketua tim",
      data: { tim },
    };
  }

  const anggota = await getAnggotaTimDetailDb(tim.id_tim);

  if (!anggota.all_accepted) {
    return {
      error: false,
      hasTim: true,
      isKetua: true,
      canSubmit: false,
      message: "Belum semua anggota menyetujui undangan",
      data: {
        tim,
        anggota,
      },
    };
  }

  const timeline = await getProgramTimelineDb(tim.id_program);
  let timelineOpen = true;

  if (timeline?.pendaftaran_mulai && timeline?.pendaftaran_selesai) {
    const now = new Date();
    const mulai = new Date(timeline.pendaftaran_mulai);
    const selesai = new Date(timeline.pendaftaran_selesai);
    timelineOpen = now >= mulai && now <= selesai;
  }

  const proposal = await getProposalByTimDb(tim.id_tim);

  return {
    error: false,
    hasTim: true,
    isKetua: true,
    canSubmit: anggota.all_accepted && timelineOpen,
    timelineOpen,
    message: "Status proposal berhasil diambil",
    data: {
      tim,
      anggota,
      timeline,
      proposal: proposal || null,
    },
  };
};

const createProposal = async (id_user, data) => {
  const tim = await getTimKetuaDb(id_user, data.id_program);

  if (!tim) {
    return {
      error: true,
      message: "Anda bukan ketua tim pada program ini",
      data: { id_user, id_program: data.id_program },
    };
  }

  const anggota = await getAnggotaTimDetailDb(tim.id_tim);

  if (anggota.total < 3 || anggota.total > 5) {
    return {
      error: true,
      message: "Jumlah anggota tim harus 3 sampai 5 orang",
      data: { tim, total_anggota: anggota.total },
    };
  }

  if (!anggota.all_accepted) {
    return {
      error: true,
      message: "Masih ada anggota tim yang belum memberikan keputusan",
      data: {
        tim,
        anggota_pending: anggota.pending_members,
      },
    };
  }

  const timeline = await getProgramTimelineDb(data.id_program);

  if (timeline?.pendaftaran_mulai && timeline?.pendaftaran_selesai) {
    const now = new Date();
    const mulai = new Date(timeline.pendaftaran_mulai);
    const selesai = new Date(timeline.pendaftaran_selesai);

    if (now < mulai || now > selesai) {
      return {
        error: true,
        message: "Pendaftaran proposal untuk program ini sudah ditutup",
        data: { timeline, now },
      };
    }
  }

  const exists = await checkProposalExistsDb(tim.id_tim);
  if (exists) {
    return {
      error: true,
      message: "Tim ini sudah pernah membuat proposal",
      data: { tim },
    };
  }

  const proposal = await createProposalDb(tim.id_tim, data);
  const detail = await getProposalDetailDb(proposal.id_proposal);

  return {
    error: false,
    message: "Draft proposal berhasil dibuat",
    data: detail,
  };
};

const updateProposal = async (id_user, id_proposal, data) => {
  const proposal = await getProposalDetailDb(id_proposal);

  if (!proposal) {
    return {
      error: true,
      message: "Proposal tidak ditemukan",
      data: { id_proposal },
    };
  }

  if (proposal.ketua.id_user !== id_user) {
    return {
      error: true,
      message: "Anda tidak berhak mengubah proposal ini",
      data: { proposal },
    };
  }

  if (proposal.status !== 0) {
    return {
      error: true,
      message: "Proposal sudah diajukan dan tidak bisa diedit",
      data: { proposal },
    };
  }

  const timeline = await getProgramTimelineDb(proposal.id_program);

  if (timeline?.pendaftaran_mulai && timeline?.pendaftaran_selesai) {
    const now = new Date();
    const mulai = new Date(timeline.pendaftaran_mulai);
    const selesai = new Date(timeline.pendaftaran_selesai);

    if (now < mulai || now > selesai) {
      return {
        error: true,
        message: "Pendaftaran proposal untuk program ini sudah ditutup",
        data: { timeline },
      };
    }
  }

  const updated = await updateProposalDb(id_proposal, data);

  return {
    error: false,
    message: "Draft proposal berhasil diperbarui",
    data: updated,
  };
};

const submitProposal = async (id_user, id_proposal) => {
  const proposal = await getProposalDetailDb(id_proposal);

  if (!proposal) {
    return {
      error: true,
      message: "Proposal tidak ditemukan",
      data: { id_proposal },
    };
  }

  if (proposal.ketua.id_user !== id_user) {
    return {
      error: true,
      message: "Anda tidak berhak submit proposal ini",
      data: { proposal },
    };
  }

  if (proposal.status !== 0) {
    return {
      error: true,
      message: "Proposal sudah diajukan sebelumnya",
      data: { proposal },
    };
  }

  const timeline = await getProgramTimelineDb(proposal.id_program);

  if (timeline?.pendaftaran_mulai && timeline?.pendaftaran_selesai) {
    const now = new Date();
    const mulai = new Date(timeline.pendaftaran_mulai);
    const selesai = new Date(timeline.pendaftaran_selesai);

    if (now < mulai || now > selesai) {
      return {
        error: true,
        message: "Pendaftaran proposal untuk program ini sudah ditutup",
        data: { timeline },
      };
    }
  }

  const submitted = await submitProposalDb(id_proposal);

  return {
    error: false,
    message: "Proposal berhasil diajukan",
    data: submitted,
  };
};

const getProposalDetail = async (id_user, id_proposal) => {
  const proposal = await getProposalDetailDb(id_proposal);

  if (!proposal) {
    return {
      error: true,
      message: "Proposal tidak ditemukan",
      data: { id_proposal },
    };
  }

  const isKetua = proposal.ketua.id_user === id_user;
  const isAnggota = proposal.anggota_tim.some((a) => a.id_user === id_user);

  if (!isKetua && !isAnggota) {
    return {
      error: true,
      message: "Anda tidak berhak melihat proposal ini",
      data: { proposal },
    };
  }

  return {
    error: false,
    message: "Detail proposal berhasil diambil",
    data: proposal,
  };
};

module.exports = {
  getProposalStatus,
  createProposal,
  updateProposal,
  submitProposal,
  getProposalDetail,
};