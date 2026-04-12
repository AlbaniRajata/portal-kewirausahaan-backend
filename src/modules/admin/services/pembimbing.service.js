const {
  getProposalWithTimDb,
  updatePembimbingDb,
  getDosenDb,
  getDosenByIdDb,
  getTimByIdDb,
  getDosenBebanDb,
} = require("../db/pembimbing.db");

const toPositiveInt = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
};

const getProposalWithTim = async (id_program) => {
  let idProgramValue;
  if (id_program !== undefined && id_program !== null && id_program !== "") {
    idProgramValue = toPositiveInt(id_program);
    if (!idProgramValue) {
      return { error: true, message: "ID program tidak valid", data: null };
    }
  }

  const data = await getProposalWithTimDb(idProgramValue);
  return { error: false, message: "Daftar proposal dengan tim berhasil diambil", data };
};

const updatePembimbing = async (id_tim, id_dosen_baru) => {
  const parsedTim = toPositiveInt(id_tim);
  const parsedDosen = toPositiveInt(id_dosen_baru);

  if (!parsedTim || !parsedDosen) {
    return {
      error: true,
      message: "ID tim dan ID dosen wajib berupa angka positif",
      data: { id_tim, id_dosen: id_dosen_baru },
    };
  }

  const [tim, dosen] = await Promise.all([
    getTimByIdDb(parsedTim),
    getDosenByIdDb(parsedDosen),
  ]);

  if (!tim) {
    return {
      error: true,
      message: "Tim tidak ditemukan",
      data: { id_tim: parsedTim },
    };
  }

  if (!dosen) {
    return {
      error: true,
      message: "Dosen tidak ditemukan",
      data: { id_dosen: parsedDosen },
    };
  }

  if (dosen.status_verifikasi !== 1) {
    return {
      error: true,
      message: "Dosen belum terverifikasi",
      data: { id_dosen: parsedDosen },
    };
  }

  const updated = await updatePembimbingDb(parsedTim, parsedDosen);
  return {
    error: false,
    message: "Dosen pembimbing berhasil diperbarui",
    data: updated,
  };
};

const updateMultiplePembimbing = async (updates) => {
  if (!Array.isArray(updates) || updates.length === 0) {
    return {
      error: true,
      message: "Data updates tidak valid",
      data: null,
    };
  }

  const results = [];
  for (const { id_tim, id_dosen } of updates) {
    try {
      const result = await updatePembimbing(id_tim, id_dosen);
      if (result.error) {
        results.push({ id_tim, id_dosen, success: false, error: result.message, data: result.data || null });
        continue;
      }

      results.push({
        id_tim: result.data?.id_tim || toPositiveInt(id_tim),
        id_dosen: result.data?.id_dosen || toPositiveInt(id_dosen),
        success: true,
        data: result.data,
      });
    } catch (error) {
      results.push({ id_tim, id_dosen, success: false, error: error.message });
    }
  }

  const totalSuccess = results.filter((item) => item.success).length;
  const totalFailed = results.length - totalSuccess;

  return {
    error: false,
    message: `Pembaruan pembimbing selesai: ${totalSuccess} berhasil, ${totalFailed} gagal`,
    data: {
      total: results.length,
      total_success: totalSuccess,
      total_failed: totalFailed,
      results,
    },
  };
};

const getDosen = async () => {
  const data = await getDosenDb();
  return { error: false, message: "Daftar dosen berhasil diambil", data };
};

const getDosenBeban = async (id_program) => {
  let idProgramValue;
  if (id_program !== undefined && id_program !== null && id_program !== "") {
    idProgramValue = toPositiveInt(id_program);
    if (!idProgramValue) {
      return { error: true, message: "ID program tidak valid", data: null };
    }
  }

  const data = await getDosenBebanDb(idProgramValue);
  return { error: false, message: "Beban dosen berhasil diambil", data };
};

module.exports = {
  getProposalWithTim,
  updatePembimbing,
  updateMultiplePembimbing,
  getDosen,
  getDosenBeban,
};