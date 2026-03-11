const {
  getDashboardStatsDb,
  getProposalPerStatusDb,
  getProposalPerKategoriDb,
  getRecentProposalDb,
  getPendingDistribusiDb,
  getDistribusiDitolakDb,
  getPendingVerifikasiDb,
  getPendingPembimbingDb,
  getMenungguFinalisasiDb,
} = require("../db/dashboard.db");

const getDashboardAdmin = async (id_program) => {
  const [
    stats,
    perStatus,
    perKategori,
    recentProposal,
    pendingDistribusi,
    distribusiDitolak,
    pendingVerifikasi,
    pendingPembimbing,
    menungguFinalisasi,
  ] = await Promise.all([
    getDashboardStatsDb(id_program),
    getProposalPerStatusDb(id_program),
    getProposalPerKategoriDb(id_program),
    getRecentProposalDb(id_program),
    getPendingDistribusiDb(id_program),
    getDistribusiDitolakDb(id_program),
    getPendingVerifikasiDb(),
    getPendingPembimbingDb(id_program),
    getMenungguFinalisasiDb(id_program),
  ]);

  return {
    error: false,
    message: "Dashboard data berhasil diambil",
    data: {
      stats: {
        total_proposal:        Number(stats.total_proposal || 0),
        lolos_desk:            Number(stats.lolos_desk || 0),
        tidak_lolos_desk:      Number(stats.tidak_lolos_desk || 0),
        lolos_wawancara:       Number(stats.lolos_wawancara || 0),
        tidak_lolos_wawancara: Number(stats.tidak_lolos_wawancara || 0),
        total_bimbingan:       Number(stats.total_bimbingan || 0),
      },
      perlu_tindakan: {
        menunggu_distribusi:  Number(pendingDistribusi || 0),
        distribusi_ditolak:   Number(distribusiDitolak || 0),
        menunggu_finalisasi:  Number(menungguFinalisasi || 0),
        pending_verifikasi:   Number(pendingVerifikasi || 0),
        pending_pembimbing:   Number(pendingPembimbing || 0),
      },
      chart: {
        per_status:   perStatus,
        per_kategori: perKategori,
      },
      recent_proposal: recentProposal,
    },
  };
};

module.exports = { getDashboardAdmin };