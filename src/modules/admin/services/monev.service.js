const {
  getLuaranByProgramDb,
  getLuaranByIdDb,
  checkUrutanLuaranExistsDb,
  insertLuaranDb,
  updateLuaranDb,
  cekLuaranDipakaTimDb,
  deleteLuaranDb,
  getProgressLuaranTimDb,
  getDetailLuaranTimDb,
  getLuaranTimByIdDb,
  reviewLuaranTimDb,
} = require("../db/monev.db");

const { getProgramByIdAndAdminDb } = require("../db/program.db");

const isValidDate = (val) => !isNaN(new Date(val).getTime());

const getLuaranProgram = async (id_user, id_program) => {
  const program = await getProgramByIdAndAdminDb(id_program, id_user);
  if (!program) return { error: true, message: "Program tidak ditemukan atau akses ditolak", data: null };

  const data = await getLuaranByProgramDb(id_program);
  return { error: false, message: "Daftar luaran berhasil diambil", data };
};

const createLuaran = async (id_user, id_program, payload) => {
  const program = await getProgramByIdAndAdminDb(id_program, id_user);
  if (!program) return { error: true, message: "Program tidak ditemukan atau akses ditolak", data: null };

  const { nama_luaran, keterangan, tipe, deadline, urutan } = payload;

  const missing = [];
  if (!nama_luaran) missing.push("nama_luaran");
  if (tipe === undefined || tipe === null || tipe === "") missing.push("tipe");
  if (!deadline) missing.push("deadline");
  if (urutan === undefined || urutan === null || urutan === "") missing.push("urutan");
  if (missing.length > 0) return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };

  const tipeNum = parseInt(tipe);
  const urutanNum = parseInt(urutan);

  if (![1, 2, 3].includes(tipeNum)) return { error: true, message: "Tipe harus bernilai 1 (file), 2 (link), atau 3 (keduanya)", data: null };
  if (isNaN(urutanNum) || urutanNum < 1) return { error: true, message: "Urutan harus berupa angka minimal 1", data: null };
  if (!isValidDate(deadline)) return { error: true, message: "Format deadline tidak valid", data: null };

  const urutanExists = await checkUrutanLuaranExistsDb(id_program, urutanNum);
  if (urutanExists) return { error: true, message: `Urutan ${urutanNum} sudah digunakan`, data: null };

  const inserted = await insertLuaranDb(id_program, {
    nama_luaran: nama_luaran.trim(),
    keterangan: keterangan?.trim() || null,
    tipe: tipeNum,
    deadline: new Date(deadline),
    urutan: urutanNum,
  });
  return { error: false, message: "Luaran berhasil dibuat", data: inserted };
};

const updateLuaran = async (id_user, id_luaran, payload) => {
  const luaran = await getLuaranByIdDb(id_luaran);
  if (!luaran) return { error: true, message: "Luaran tidak ditemukan", data: null };

  const program = await getProgramByIdAndAdminDb(luaran.id_program, id_user);
  if (!program) return { error: true, message: "Akses ditolak", data: null };

  const { nama_luaran, keterangan, tipe, deadline, urutan } = payload;

  const missing = [];
  if (!nama_luaran) missing.push("nama_luaran");
  if (tipe === undefined || tipe === null || tipe === "") missing.push("tipe");
  if (!deadline) missing.push("deadline");
  if (urutan === undefined || urutan === null || urutan === "") missing.push("urutan");
  if (missing.length > 0) return { error: true, message: "Field wajib belum diisi", data: { missing_fields: missing } };

  const tipeNum = parseInt(tipe);
  const urutanNum = parseInt(urutan);

  if (![1, 2, 3].includes(tipeNum)) return { error: true, message: "Tipe harus bernilai 1 (file), 2 (link), atau 3 (keduanya)", data: null };
  if (isNaN(urutanNum) || urutanNum < 1) return { error: true, message: "Urutan harus berupa angka minimal 1", data: null };
  if (!isValidDate(deadline)) return { error: true, message: "Format deadline tidak valid", data: null };

  const urutanExists = await checkUrutanLuaranExistsDb(luaran.id_program, urutanNum, id_luaran);
  if (urutanExists) return { error: true, message: `Urutan ${urutanNum} sudah digunakan`, data: null };

  const updated = await updateLuaranDb(id_luaran, {
    nama_luaran: nama_luaran.trim(),
    keterangan: keterangan?.trim() || null,
    tipe: tipeNum,
    deadline: new Date(deadline),
    urutan: urutanNum,
  });
  return { error: false, message: "Luaran berhasil diperbarui", data: updated };
};

const deleteLuaran = async (id_user, id_luaran) => {
  const luaran = await getLuaranByIdDb(id_luaran);
  if (!luaran) return { error: true, message: "Luaran tidak ditemukan", data: null };

  const program = await getProgramByIdAndAdminDb(luaran.id_program, id_user);
  if (!program) return { error: true, message: "Akses ditolak", data: null };

  const dipakai = await cekLuaranDipakaTimDb(id_luaran);
  if (dipakai) return { error: true, message: "Luaran tidak dapat dihapus karena sudah ada tim yang mengumpulkan luaran ini", data: null };

  const deleted = await deleteLuaranDb(id_luaran);
  return { error: false, message: "Luaran berhasil dihapus", data: deleted };
};

const getProgressLuaranTim = async (id_user, id_program) => {
  const program = await getProgramByIdAndAdminDb(id_program, id_user);
  if (!program) return { error: true, message: "Program tidak ditemukan atau akses ditolak", data: null };

  const data = await getProgressLuaranTimDb(id_program);
  return { error: false, message: "Progress luaran tim berhasil diambil", data };
};

const getDetailLuaranTim = async (id_user, id_tim, id_program) => {
  const program = await getProgramByIdAndAdminDb(id_program, id_user);
  if (!program) return { error: true, message: "Program tidak ditemukan atau akses ditolak", data: null };

  const data = await getDetailLuaranTimDb(id_tim, id_program);
  return { error: false, message: "Detail luaran tim berhasil diambil", data };
};

const reviewLuaranTim = async (id_user, id_luaran_tim, payload) => {
  const luaranTim = await getLuaranTimByIdDb(id_luaran_tim);
  if (!luaranTim) return { error: true, message: "Data luaran tim tidak ditemukan", data: null };

  const program = await getProgramByIdAndAdminDb(luaranTim.id_program, id_user);
  if (!program) return { error: true, message: "Akses ditolak", data: null };

  if (luaranTim.status !== 1) return { error: true, message: "Luaran ini belum disubmit oleh tim atau sudah direview", data: null };

  const { status, catatan_admin } = payload;
  const statusNum = parseInt(status);

  if (![2, 3].includes(statusNum)) return { error: true, message: "Status review harus bernilai 2 (disetujui) atau 3 (ditolak)", data: null };
  if (statusNum === 3 && (!catatan_admin || catatan_admin.trim().length < 5)) {
    return { error: true, message: "Catatan wajib diisi minimal 5 karakter jika luaran ditolak", data: null };
  }

  const updated = await reviewLuaranTimDb(
    id_luaran_tim,
    statusNum,
    catatan_admin?.trim() || null,
    id_user
  );
  return { error: false, message: statusNum === 2 ? "Luaran berhasil disetujui" : "Luaran berhasil ditolak", data: updated };
};

module.exports = {
  getLuaranProgram,
  createLuaran,
  updateLuaran,
  deleteLuaran,
  getProgressLuaranTim,
  getDetailLuaranTim,
  reviewLuaranTim,
};