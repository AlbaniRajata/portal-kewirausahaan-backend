const fs = require("fs");
const {
  getTimMahasiswaDb,
  getLuaranByIdDb,
  getLuaranMahasiswaDb,
  getLuaranTimByTimAndLuaranDb,
  upsertLuaranTimDb,
} = require("../db/monev.db");

const getLuaranMahasiswa = async (id_user) => {
  const tim = await getTimMahasiswaDb(id_user);
  if (!tim) return { error: true, message: "Anda belum terdaftar dalam tim", data: null };
  if (tim.status_anggota !== 1) return { error: true, message: "Status keanggotaan tim Anda belum aktif", data: null };

  const luaran = await getLuaranMahasiswaDb(tim.id_tim, tim.id_program);

  const total = luaran.length;
  const disetujui = luaran.filter((l) => l.status === 2).length;
  const submitted = luaran.filter((l) => l.status === 1).length;
  const ditolak = luaran.filter((l) => l.status === 3).length;
  const belum = luaran.filter((l) => !l.id_luaran_tim).length;

  return {
    error: false,
    message: "Daftar luaran berhasil diambil",
    data: {
      tim,
      progress: { total, disetujui, submitted, ditolak, belum },
      luaran,
    },
  };
};

const submitLuaran = async (id_user, id_luaran, payload, file) => {
  const tim = await getTimMahasiswaDb(id_user);
  if (!tim) return { error: true, message: "Anda belum terdaftar dalam tim", data: null, file };
  if (tim.status_anggota !== 1) return { error: true, message: "Status keanggotaan tim Anda belum aktif", data: null, file };
  if (tim.peran !== 1) return { error: true, message: "Hanya ketua tim yang dapat mengumpulkan luaran", data: null, file };

  const luaran = await getLuaranByIdDb(id_luaran);
  if (!luaran) return { error: true, message: "Luaran tidak ditemukan", data: null, file };
  if (luaran.id_program !== tim.id_program) return { error: true, message: "Luaran ini tidak sesuai dengan program tim Anda", data: null, file };

  const now = new Date();
  if (now > new Date(luaran.deadline)) return { error: true, message: "Deadline pengumpulan luaran ini sudah lewat", data: null, file };

  const existing = await getLuaranTimByTimAndLuaranDb(tim.id_tim, id_luaran);

  if (existing) {
    if (existing.status === 2) return { error: true, message: "Luaran ini sudah disetujui dan tidak dapat diubah", data: null, file };
    if (existing.status === 1) return { error: true, message: "Luaran ini sedang menunggu review admin. Tidak dapat diubah sebelum direview", data: null, file };
  }

  let links = [];
  if (payload.links) {
    try {
      links = typeof payload.links === "string" ? JSON.parse(payload.links) : payload.links;
    } catch {
      return { error: true, message: "Format link tidak valid", data: null, file };
    }
  }

  if (luaran.tipe === 1) {
    if (!file && !existing?.file_luaran) return { error: true, message: "File wajib diunggah untuk luaran bertipe file", data: null, file };
  }

  if (luaran.tipe === 2) {
    if (file) return { error: true, message: "Luaran ini hanya memerlukan link, bukan file", data: null, file };
    if (!links.length) return { error: true, message: "Minimal satu link wajib diisi untuk luaran bertipe link", data: null, file };
    for (const l of links) {
      if (!l || !l.trim()) return { error: true, message: "Link tidak boleh kosong", data: null, file };
      try { new URL(l.trim()); } catch { return { error: true, message: `Format link tidak valid: ${l}`, data: null, file }; }
    }
  }

  if (luaran.tipe === 3) {
    if (!file && !existing?.file_luaran) return { error: true, message: "File wajib diunggah untuk luaran bertipe file dan link", data: null, file };
    if (!links.length) return { error: true, message: "Minimal satu link wajib diisi untuk luaran bertipe file dan link", data: null, file };
    for (const l of links) {
      if (!l || !l.trim()) return { error: true, message: "Link tidak boleh kosong", data: null, file };
      try { new URL(l.trim()); } catch { return { error: true, message: `Format link tidak valid: ${l}`, data: null, file }; }
    }
  }

  if (existing?.file_luaran && file) {
    const oldPath = `uploads/luaran/${existing.file_luaran}`;
    if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
  }

  const fileToSave = file ? file.filename : existing?.file_luaran || null;
  const linkToSave = luaran.tipe === 1 ? null : links.map((l) => l.trim());

  const result = await upsertLuaranTimDb(tim.id_tim, id_luaran, {
    file_luaran: fileToSave,
    link_luaran: linkToSave,
  });

  return { error: false, message: "Luaran berhasil dikumpulkan", data: result, file: null };
};

module.exports = {
  getLuaranMahasiswa,
  submitLuaran,
};