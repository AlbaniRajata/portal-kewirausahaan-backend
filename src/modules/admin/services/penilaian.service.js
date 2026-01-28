const { getRekapDb } = require("../db/penilaian.db");

const getRekapPenilaian = async (id_proposal, id_tahap) => {
  if (!id_proposal) {
    return {
      error: true,
      message: "Validasi gagal",
      data: { field: "id_proposal", reason: "id_proposal wajib diisi" },
    };
  }

  if (!id_tahap) {
    return {
      error: true,
      message: "Validasi gagal",
      data: { field: "id_tahap", reason: "id_tahap wajib diisi" },
    };
  }

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

  const penilai = Object.values(penilaiMap);

  const rata_rata =
    penilai.reduce((acc, x) => acc + x.total_nilai, 0) / penilai.length;

  return {
    error: false,
    data: {
      proposal,
      penilai,
      ringkasan: {
        tahap: id_tahap,
        jumlah_penilai: penilai.length,
        nilai_rata_rata: Number(rata_rata.toFixed(2)),
      },
    },
  };
};

module.exports = {
  getRekapPenilaian,
};
