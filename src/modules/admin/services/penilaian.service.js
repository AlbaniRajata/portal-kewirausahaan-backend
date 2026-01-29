const {
  getRekapDb,
  countSubmittedReviewerDb,
  countDistribusiReviewerDb,
  updateStatusProposalDb,
} = require("../db/penilaian.db");

const getRekapPenilaian = async (id_proposal, id_tahap) => {
  const rows = await getRekapDb(id_proposal, id_tahap);

  if (rows.length === 0) {
    return {
      error: true,
      message: "Belum ada penilaian yang disubmit",
      data: { id_proposal, id_tahap },
    };
  }

  const proposal = {
    id_proposal: rows[0].id_proposal,
    judul: rows[0].judul,
  };

  const penilaiMap = {};

  for (const r of rows) {
    const key = `${r.tipe_penilai}-${r.id_penilai}`;

    if (!penilaiMap[key]) {
      penilaiMap[key] = {
        tipe: r.tipe_penilai,
        penilai: {
          id_user: r.id_penilai,
          nama: r.nama_penilai,
          email: r.email_penilai,
        },
        submitted_at: r.submitted_at,
        detail: [],
        total_nilai: 0,
      };
    }

    penilaiMap[key].detail.push({
      id_kriteria: r.id_kriteria,
      nama_kriteria: r.nama_kriteria,
      bobot: Number(r.bobot),
      skor: r.skor,
      nilai: Number(r.nilai),
      catatan: r.catatan,
    });

    penilaiMap[key].total_nilai += Number(r.nilai);
  }

  return {
    error: false,
    data: {
      proposal,
      tahap: id_tahap,
      penilai: Object.values(penilaiMap),
    },
  };
};

const finalisasiDeskEvaluasi = async (id_proposal, keputusan) => {
  if (![3, 4].includes(keputusan)) {
    return {
      error: true,
      message: "Keputusan tidak valid",
      data: { keputusan },
    };
  }

  const totalDistribusi = await countDistribusiReviewerDb(id_proposal, 1);
  const totalSubmit = await countSubmittedReviewerDb(id_proposal, 1);

  if (totalDistribusi === 0) {
    return {
      error: true,
      message: "Proposal belum punya reviewer",
      data: { id_proposal },
    };
  }

  if (totalSubmit !== totalDistribusi) {
    return {
      error: true,
      message: "Reviewer belum selesai semua",
      data: {
        total_distribusi: totalDistribusi,
        total_submit: totalSubmit,
      },
    };
  }

  const updated = await updateStatusProposalDb(id_proposal, keputusan);

  return {
    error: false,
    message: "Finalisasi desk evaluasi berhasil",
    data: updated,
  };
};

module.exports = {
  getRekapPenilaian,
  finalisasiDeskEvaluasi,
};
