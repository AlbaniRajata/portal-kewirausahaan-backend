const {
  getProposalByIdDb,
  scheduleWawancaraDb,
  scheduleWawancaraBulkDb,
} = require("../db/wawancara.db");

const scheduleWawancara = async (id_proposal, wawancara_at) => {
  if (!wawancara_at) {
    return {
      error: true,
      message: "Tanggal wawancara wajib diisi",
      data: null,
    };
  }

  const proposal = await getProposalByIdDb(id_proposal);

  if (!proposal) {
    return {
      error: true,
      message: "Proposal tidak ditemukan",
      data: { id_proposal },
    };
  }

  if (proposal.status !== 4) {
    return {
      error: true,
      message:
        "Proposal belum lolos desk evaluasi, tidak bisa dijadwalkan wawancara",
      data: {
        status_proposal: proposal.status,
      },
    };
  }

  const updated = await scheduleWawancaraDb(id_proposal, wawancara_at);

  if (!updated) {
    return {
      error: true,
      message: "Gagal menjadwalkan wawancara",
      data: null,
    };
  }

  return {
    error: false,
    message: "Wawancara berhasil dijadwalkan",
    data: updated,
  };
};

const scheduleWawancaraBulk = async (jadwal) => {
  if (!Array.isArray(jadwal) || jadwal.length === 0) {
    return {
      error: true,
      message: "Payload jadwal wajib berupa array",
      data: null,
    };
  }

  for (const item of jadwal) {
    if (!item.id_proposal || !item.wawancara_at) {
      return {
        error: true,
        message: "Setiap item wajib punya id_proposal dan wawancara_at",
        data: item,
      };
    }
  }

  const results = await scheduleWawancaraBulkDb(jadwal);

  const sukses = results.filter((r) => r.success);
  const gagal = results.filter((r) => !r.success);

  return {
    error: false,
    message: "Jadwal wawancara berhasil diproses",
    data: {
      total: results.length,
      sukses: sukses.length,
      gagal: gagal.length,
      detail: results,
    },
  };
};

module.exports = {
  scheduleWawancara,
  scheduleWawancaraBulk,
};
