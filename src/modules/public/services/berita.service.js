const fs = require("fs");
const path = require("path");
const {
  generateSlug, makeUniqueSlugDb,
  getBeritaListAdminDb, getBeritaDetailAdminDb,
  createBeritaDb, updateBeritaDb, updateFileGambarDb, deleteBeritaDb,
  getBeritaListPublikDb, countBeritaPublikDb, getBeritaBySlugDb,
} = require("../db/berita.db");
const cache = require("../../../utils/cache");

const VALID_STATUS = [0, 1];
const BERITA_CACHE_TTL = 10 * 60 * 1000;

const isRemoteFile = (filePath) => typeof filePath === "string" && /^(https?:)?\/\//i.test(filePath);

const deleteFile = (filePath) => {
  if (!filePath || isRemoteFile(filePath)) return;
  const abs = path.join(__dirname, "../../../../", filePath);
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
};

const deleteFiles = (...files) => {
  files.flat().filter(Boolean).forEach(deleteFile);
};


const getBeritaListAdmin = async (filters) => {
  const status = filters.status !== undefined && filters.status !== "" ? parseInt(filters.status) : null;
  const data = await getBeritaListAdminDb({ status, search: filters.search || null });
  return { error: false, message: "Daftar berita berhasil diambil", data };
};

const getBeritaDetailAdmin = async (id_berita) => {
  const data = await getBeritaDetailAdminDb(id_berita);
  if (!data) return { error: true, message: "Berita tidak ditemukan", data: null };
  return { error: false, message: "Detail berita berhasil diambil", data };
};

const createBerita = async (id_author, payload, file_gambar = null, file_pdf = null) => {
  const { judul, isi, status, gambar_url } = payload;

  if (!judul || !judul.trim()) return { error: true, message: "Judul berita wajib diisi", data: null };

  const statusNum = status !== undefined ? parseInt(status) : 0;
  if (!VALID_STATUS.includes(statusNum)) return { error: true, message: "Status tidak valid, gunakan 0 (draft) atau 1 (published)", data: null };

  const fileGambarFinal = file_gambar || gambar_url || null;
  if (fileGambarFinal && file_pdf) {
    return { error: true, message: "Sementara hanya boleh upload 1 file (gambar atau PDF)", data: null };
  }
  const slug = await makeUniqueSlugDb(generateSlug(judul));
  const berita = await createBeritaDb(id_author, judul.trim(), slug, isi || null, fileGambarFinal, file_pdf, statusNum);

  cache.invalidatePrefix("berita:");

  return { error: false, message: "Berita berhasil dibuat", data: berita };
};

const updateBerita = async (id_berita, payload, file_gambar_baru = null, file_pdf_baru = null) => {
  const { judul, isi, status, gambar_url } = payload;

  const existing = await getBeritaDetailAdminDb(id_berita);
  if (!existing) return { error: true, message: "Berita tidak ditemukan", data: null };

  const hasJudul = judul !== undefined;
  const hasStatus = status !== undefined;

  if (hasJudul && (!judul || !String(judul).trim())) {
    return { error: true, message: "Judul berita wajib diisi", data: null };
  }

  let statusNum = existing.status;
  if (hasStatus) {
    statusNum = parseInt(status);
    if (!VALID_STATUS.includes(statusNum)) {
      return { error: true, message: "Status tidak valid, gunakan 0 (draft) atau 1 (published)", data: null };
    }
  }

  const hasNewImage = Boolean(file_gambar_baru || gambar_url);
  const hasNewPdf = Boolean(file_pdf_baru);
  if (hasNewImage && hasNewPdf) {
    return { error: true, message: "Sementara hanya boleh upload 1 file (gambar atau PDF)", data: null };
  }

  const judulFinal = hasJudul ? String(judul).trim() : existing.judul;
  const slug = hasJudul
    ? await makeUniqueSlugDb(generateSlug(judulFinal), id_berita)
    : existing.slug;
  let file_gambar_final = existing.file_gambar;
  let file_pdf_final = existing.file_pdf;

  if (hasNewImage) {
    file_gambar_final = file_gambar_baru || gambar_url;
    file_pdf_final = null;
    if (existing.file_gambar) deleteFile(existing.file_gambar);
    if (existing.file_pdf) deleteFile(existing.file_pdf);
  } else if (hasNewPdf) {
    file_gambar_final = null;
    file_pdf_final = file_pdf_baru;
    if (existing.file_gambar) deleteFile(existing.file_gambar);
    if (existing.file_pdf) deleteFile(existing.file_pdf);
  }

  const berita = await updateBeritaDb(
    id_berita,
    judulFinal,
    slug,
    isi !== undefined ? (isi || null) : (existing.isi || null),
    file_gambar_final,
    file_pdf_final,
    statusNum
  );

  cache.del(`berita:slug:${existing.slug}`);
  cache.del(`berita:list:`);
  cache.invalidatePrefix("berita:");

  return { error: false, message: "Berita berhasil diperbarui", data: berita };
};

const updateGambar = async (id_berita, file_gambar, file_pdf = null) => {
  const existing = await getBeritaDetailAdminDb(id_berita);
  if (!existing) return { error: true, message: "Berita tidak ditemukan", data: null };
  if (file_gambar && file_pdf) {
    return { error: true, message: "Sementara hanya boleh upload 1 file (gambar atau PDF)", data: null };
  }

  let file_gambar_final = existing.file_gambar;
  let file_pdf_final = existing.file_pdf;

  if (file_gambar) {
    file_gambar_final = file_gambar;
    file_pdf_final = null;
    if (existing.file_gambar) deleteFile(existing.file_gambar);
    if (existing.file_pdf) deleteFile(existing.file_pdf);
  } else if (file_pdf) {
    file_gambar_final = null;
    file_pdf_final = file_pdf;
    if (existing.file_gambar) deleteFile(existing.file_gambar);
    if (existing.file_pdf) deleteFile(existing.file_pdf);
  }

  const updated = await updateFileGambarDb(id_berita, file_gambar_final, file_pdf_final);

  cache.del(`berita:slug:${existing.slug}`);
  cache.invalidatePrefix("berita:");

  return { error: false, message: "File berita berhasil diperbarui", data: updated };
};

const deleteBerita = async (id_berita) => {
  const existing = await getBeritaDetailAdminDb(id_berita);
  if (!existing) return { error: true, message: "Berita tidak ditemukan", data: null };
  const deleted = await deleteBeritaDb(id_berita);
  if (deleted) deleteFiles(deleted.file_gambar, deleted.file_pdf);

  cache.del(`berita:slug:${existing.slug}`);
  cache.invalidatePrefix("berita:");

  return { error: false, message: "Berita berhasil dihapus", data: null };
};

const getBeritaListPublik = async (filters) => {
  const cacheKey = `berita:list:${filters.search || "all"}:${filters.page || 1}:${filters.limit || 10}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    return {
      error: false,
      message: "Daftar berita berhasil diambil",
      data: cached,
    };
  }

  const limit = filters.limit ? parseInt(filters.limit) : 10;
  const page = filters.page ? parseInt(filters.page) : 1;
  const offset = (page - 1) * limit;
  const search = filters.search || null;

  const [data, total] = await Promise.all([
    getBeritaListPublikDb({ search, limit, offset }),
    countBeritaPublikDb(search),
  ]);

  const result = {
    berita: data,
    pagination: { total, page, limit, total_page: Math.ceil(total / limit) },
  };

  cache.set(cacheKey, result, BERITA_CACHE_TTL);

  return {
    error: false,
    message: "Daftar berita berhasil diambil",
    data: result,
  };
};

const getBeritaBySlug = async (slug) => {
  const cacheKey = `berita:slug:${slug}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    return {
      error: false,
      message: "Detail berita berhasil diambil",
      data: cached,
    };
  }

  const data = await getBeritaBySlugDb(slug);
  if (!data) return { error: true, message: "Berita tidak ditemukan", data: null };

  cache.set(cacheKey, data, BERITA_CACHE_TTL);

  return { error: false, message: "Detail berita berhasil diambil", data };
};

module.exports = {
  getBeritaListAdmin, getBeritaDetailAdmin,
  createBerita, updateBerita, updateGambar, deleteBerita,
  getBeritaListPublik, getBeritaBySlug,
};