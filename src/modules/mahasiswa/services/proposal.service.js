const {
  getTimKetuaDb,
  getAnggotaTimDetailDb,
  checkProposalExistsDb,
  createProposalDb,
  updateProposalDb,
  getProposalDetailDb,
  getProgramTimelineDb,
} = require("../db/proposal.db");

const createProposal = async (id_user, data) => {
  const tim = await getTimKetuaDb(id_user, data.id_program);

  if (!tim) {
    return {
      error: true,
      message: "Anda bukan ketua tim pada program ini",
      data: null,
    };
  }

  const anggota = await getAnggotaTimDetailDb(tim.id_tim);

  if (anggota.total < 3 || anggota.total > 5) {
    return {
      error: true,
      message: "Jumlah anggota tim harus 3 sampai 5 orang",
      data: {
        tim,
        total_anggota: anggota.total,
      },
    };
  }

  if (!anggota.all_accepted) {
    return {
      error: true,
      message: "Masih ada anggota tim yang belum memberikan keputusan",
      data: {
        tim,
        anggota_pending: anggota.pending_members,
        total_anggota: anggota.total,
        total_disetujui: anggota.accepted,
      },
    };
  }

  const timeline = await getProgramTimelineDb(data.id_program);

  if (
    timeline &&
    timeline.pendaftaran_mulai &&
    timeline.pendaftaran_selesai
  ) {
    const now = new Date();
    const mulai = new Date(timeline.pendaftaran_mulai);
    const selesai = new Date(timeline.pendaftaran_selesai);

    if (now < mulai || now > selesai) {
      return {
        error: true,
        message: "Pendaftaran proposal untuk program ini sudah ditutup",
        data: {
          tim,
          timeline,
          now,
        },
      };
    }
  }

  const exists = await checkProposalExistsDb(tim.id_tim);
  if (exists) {
    return {
      error: true,
      message: "Tim ini sudah pernah mengajukan proposal",
      data: {
        tim,
      },
    };
  }

  const proposal = await createProposalDb(tim.id_tim, data);
  const detail = await getProposalDetailDb(proposal.id_proposal);

  return {
    error: false,
    data: detail,
  };
};

const updateProposal = async (id_user, id_proposal, data) => {
  const proposal = await getProposalDetailDb(id_proposal);

  if (!proposal) {
    return {
      error: true,
      message: "Proposal tidak ditemukan",
      data: null,
    };
  }

  if (proposal.ketua.id_user !== id_user) {
    return {
      error: true,
      message: "Anda tidak berhak mengubah proposal ini",
      data: {
        proposal,
      },
    };
  }

  if (proposal.status !== 0) {
    return {
      error: true,
      message: "Proposal sudah tidak dapat diubah karena pendaftaran telah ditutup",
      data: {
        proposal,
      },
    };
  }

  await updateProposalDb(id_proposal, data);
  const updated = await getProposalDetailDb(id_proposal);

  return {
    error: false,
    data: updated,
  };
};

module.exports = {
  createProposal,
  updateProposal,
};
