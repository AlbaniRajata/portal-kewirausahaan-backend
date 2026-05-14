const {
  getMahasiswaListDb, getMahasiswaCountDb,
  getPendingMahasiswaDb, getPendingMahasiswaCountDb,
  getDetailMahasiswaDb,
  approveMahasiswaDb,
  rejectMahasiswaDb,
} = require("../db/verification.db");
const { parsePaginationParams } = require("../../../utils/pagination");

const listPendingMahasiswa = async (filters) => {
  const { page, limit } = parsePaginationParams(filters);
  const [data, total] = await Promise.all([
    getMahasiswaListDb({ ...filters, page, limit }),
    getMahasiswaCountDb(filters)
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    error: false,
    message: "Daftar mahasiswa berhasil diambil",
    data: data,
    pagination: { page, limit, total, total_pages: totalPages, has_next: page < totalPages, has_prev: page > 1 }
  };
};

const detailMahasiswa = async (id_user) => {
  const data = await getDetailMahasiswaDb(id_user);
  if (!data) return { error: true, message: "Mahasiswa tidak ditemukan", data: null };
  return { error: false, message: "Detail mahasiswa berhasil diambil", data };
};

const approveMahasiswa = async (id_user) => {
  const result = await approveMahasiswaDb(id_user);
  console.log(`[APPROVE] ID ${id_user} - DB Result:`, result);

  if (!result) return { error: true, message: "Mahasiswa tidak ditemukan", data: null };

  if (result.error === "EMAIL_NOT_VERIFIED") {
    return { error: true, message: "Email mahasiswa belum diverifikasi. Verifikasi hanya dapat dilakukan setelah email diverifikasi.", data: { field: "email_verified_at" } };
  }

  if (result.error === "ALREADY_VERIFIED") {
    return { error: true, message: "Mahasiswa sudah diverifikasi sebelumnya", data: { field: "status_verifikasi", status_verifikasi: result.status_verifikasi } };
  }

  console.log(`[APPROVE] ID ${id_user} - Success, returning:`, { id_user, username: result.username });
  return { error: false, message: "Mahasiswa berhasil diverifikasi", data: result };
};

const bulkApproveMahasiswa = async (id_user_list = []) => {
  if (!Array.isArray(id_user_list)) {
    return { error: true, message: "Daftar mahasiswa tidak valid", data: null };
  }

  const uniqueIds = [...new Set(id_user_list.map((id) => parseInt(id)).filter((id) => Number.isInteger(id) && id > 0))];
  if (uniqueIds.length === 0) {
    return { error: true, message: "Pilih minimal satu mahasiswa untuk diverifikasi", data: null };
  }

  console.log(`[BULK APPROVE] Processing ${uniqueIds.length} mahasiswa:`, uniqueIds);

  const success = [];
  const failed = [];

  for (const id_user of uniqueIds) {
    try {
      const result = await approveMahasiswa(id_user);
      console.log(`[BULK APPROVE] ID ${id_user}:`, { hasError: !!result.error, message: result.message });
      
      if (result.error) {
        console.log(`[BULK APPROVE] Adding to failed:`, { id_user, error: result.error });
        failed.push({ id_user, message: result.message, data: result.data });
      } else {
        console.log(`[BULK APPROVE] Adding to success:`, { id_user, username: result.data?.username });
        success.push({ ...result.data, id_user });
      }
    } catch (err) {
      console.error(`[BULK APPROVE] Exception for ID ${id_user}:`, err.message);
      failed.push({ id_user, message: err.message || "Gagal memverifikasi mahasiswa", data: null });
    }
  }

  console.log(`[BULK APPROVE] Result: success=${success.length}, failed=${failed.length}`);

  return {
    error: false,
    message: `Bulk verifikasi selesai. Berhasil: ${success.length}, Gagal: ${failed.length}`,
    data: {
      success_count: success.length,
      failed_count: failed.length,
      success_ids: success.map((item) => item.id_user),
      errors: failed,
    },
  };
};

const rejectMahasiswa = async (id_user, catatan) => {
  if (!catatan || typeof catatan !== "string" || catatan.trim().length < 5) {
    return { error: true, message: "Catatan penolakan wajib diisi minimal 5 karakter", data: { field: "catatan" } };
  }

  const result = await rejectMahasiswaDb(id_user, catatan.trim());

  if (!result) return { error: true, message: "Mahasiswa tidak ditemukan", data: null };

  if (result.error === "ALREADY_PROCESSED") {
    return { error: true, message: "Status mahasiswa sudah diproses sebelumnya", data: { field: "status_verifikasi", status_verifikasi: result.status_verifikasi } };
  }

  return { error: false, message: "Mahasiswa berhasil ditolak", data: result };
};

module.exports = {
  listPendingMahasiswa,
  detailMahasiswa,
  approveMahasiswa,
  bulkApproveMahasiswa,
  rejectMahasiswa,
};