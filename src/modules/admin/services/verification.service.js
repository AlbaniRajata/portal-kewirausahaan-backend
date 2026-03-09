const {
  getPendingMahasiswaDb,
  getDetailMahasiswaDb,
  approveMahasiswaDb,
  rejectMahasiswaDb,
  getPendingDosenDb,
  getDetailDosenDb,
  approveDosenDb,
  rejectDosenDb,
} = require("../db/verification.db");

const listPendingMahasiswa = async (filters) => {
  const data = await getPendingMahasiswaDb(filters);
  return {
    error: false,
    message: "Daftar mahasiswa berhasil diambil",
    data: { total: data.length, mahasiswa: data },
  };
};

const detailMahasiswa = async (id_user) => {
  const data = await getDetailMahasiswaDb(id_user);
  if (!data) return { error: true, message: "Mahasiswa tidak ditemukan", data: null };
  return { error: false, message: "Detail mahasiswa berhasil diambil", data };
};

const approveMahasiswa = async (id_user) => {
  const result = await approveMahasiswaDb(id_user);

  if (!result) return { error: true, message: "Mahasiswa tidak ditemukan", data: null };

  if (result.error === "EMAIL_NOT_VERIFIED") {
    return { error: true, message: "Email mahasiswa belum diverifikasi. Verifikasi hanya dapat dilakukan setelah email diverifikasi.", data: { field: "email_verified_at" } };
  }

  if (result.error === "ALREADY_VERIFIED") {
    return { error: true, message: "Mahasiswa sudah diverifikasi sebelumnya", data: { field: "status_verifikasi", status_verifikasi: result.status_verifikasi } };
  }

  return { error: false, message: "Mahasiswa berhasil diverifikasi", data: result };
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

const listPendingDosen = async (filters) => {
  const data = await getPendingDosenDb(filters);
  return {
    error: false,
    message: "Daftar dosen berhasil diambil",
    data: { total: data.length, dosen: data },
  };
};

const detailDosen = async (id_user) => {
  const data = await getDetailDosenDb(id_user);
  if (!data) return { error: true, message: "Dosen tidak ditemukan", data: null };
  return { error: false, message: "Detail dosen berhasil diambil", data };
};

const approveDosen = async (id_user) => {
  const result = await approveDosenDb(id_user);

  if (!result) return { error: true, message: "Dosen tidak ditemukan", data: null };

  if (result.error === "EMAIL_NOT_VERIFIED") {
    return { error: true, message: "Email dosen belum diverifikasi. Verifikasi hanya dapat dilakukan setelah email diverifikasi.", data: { field: "email_verified_at" } };
  }

  if (result.error === "ALREADY_VERIFIED") {
    return { error: true, message: "Dosen sudah diverifikasi sebelumnya", data: { field: "status_verifikasi", status_verifikasi: result.status_verifikasi } };
  }

  return { error: false, message: "Dosen berhasil diverifikasi", data: result };
};

const rejectDosen = async (id_user, catatan) => {
  if (!catatan || typeof catatan !== "string" || catatan.trim().length < 5) {
    return { error: true, message: "Catatan penolakan wajib diisi minimal 5 karakter", data: { field: "catatan" } };
  }

  const result = await rejectDosenDb(id_user, catatan.trim());

  if (!result) return { error: true, message: "Dosen tidak ditemukan", data: null };

  if (result.error === "ALREADY_PROCESSED") {
    return { error: true, message: "Status dosen sudah diproses sebelumnya", data: { field: "status_verifikasi", status_verifikasi: result.status_verifikasi } };
  }

  return { error: false, message: "Dosen berhasil ditolak", data: result };
};

module.exports = {
  listPendingMahasiswa,
  detailMahasiswa,
  approveMahasiswa,
  rejectMahasiswa,
  listPendingDosen,
  detailDosen,
  approveDosen,
  rejectDosen,
};