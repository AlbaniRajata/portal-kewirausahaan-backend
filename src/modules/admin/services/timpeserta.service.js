const {
  getTimListDb,
  getTimDetailDb,
  getPesertaListDb,
  getPesertaDetailDb,
} = require("../db/timpeserta.db");

const getTimList = async (filters) => {
  const data = await getTimListDb(filters);
  return { error: false, message: "Daftar tim", data };
};

const getTimDetail = async (id_tim) => {
  const data = await getTimDetailDb(id_tim);
  if (!data) return { error: true, message: "Tim tidak ditemukan", data: null };
  return { error: false, message: "Detail tim", data };
};

const getPesertaList = async (filters) => {
  const data = await getPesertaListDb(filters);
  return { error: false, message: "Daftar peserta program", data };
};

const getPesertaDetail = async (id_user, id_program) => {
  const data = await getPesertaDetailDb(id_user, id_program);
  if (!data) return { error: true, message: "Peserta tidak ditemukan", data: null };
  return { error: false, message: "Detail peserta", data };
};

module.exports = {
  getTimList,
  getTimDetail,
  getPesertaList,
  getPesertaDetail,
};