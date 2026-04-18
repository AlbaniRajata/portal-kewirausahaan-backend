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

const deleteFile = (filePath) => {
  if (!filePath) return;
  const abs = path.join(__dirname, "../../../../", filePath);
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
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

const createBerita = async (id_author, payload, file_gambar = null) => {
  const { judul, isi, status } = payload;

  if (!judul || !judul.trim()) return { error: true, message: "Judul berita wajib diisi", data: null };

  const statusNum = status !== undefined ? parseInt(status) : 0;
  if (!VALID_STATUS.includes(statusNum)) return { error: true, message: "Status tidak valid, gunakan 0 (draft) atau 1 (published)", data: null };

  const slug = await makeUniqueSlugDb(generateSlug(judul));
  const berita = await createBeritaDb(id_author, judul.trim(), slug, isi || null, file_gambar, statusNum);

  cache.invalidatePrefix("berita:");

  return { error: false, message: "Berita berhasil dibuat", data: berita };
};

const updateBerita = async (id_berita, payload, file_gambar_baru = null) => {
  const { judul, isi, status } = payload;

  if (!judul || !judul.trim()) return { error: true, message: "Judul berita wajib diisi", data: null };

  const statusNum = status !== undefined ? parseInt(status) : 0;
  if (!VALID_STATUS.includes(statusNum)) return { error: true, message: "Status tidak valid, gunakan 0 (draft) atau 1 (published)", data: null };

  const existing = await getBeritaDetailAdminDb(id_berita);
  if (!existing) return { error: true, message: "Berita tidak ditemukan", data: null };

  const slug = await makeUniqueSlugDb(generateSlug(judul), id_berita);
  const file_gambar_final = file_gambar_baru || existing.file_gambar;

  if (file_gambar_baru && existing.file_gambar) deleteFile(existing.file_gambar);

  const berita = await updateBeritaDb(id_berita, judul.trim(), slug, isi || null, file_gambar_final, statusNum);

  cache.del(`berita:slug:${existing.slug}`);
  cache.del(`berita:list:`);
  cache.invalidatePrefix("berita:");

  return { error: false, message: "Berita berhasil diperbarui", data: berita };
};

const updateGambar = async (id_berita, file_gambar) => {
  const existing = await getBeritaDetailAdminDb(id_berita);
  if (!existing) return { error: true, message: "Berita tidak ditemukan", data: null };
  if (existing.file_gambar) deleteFile(existing.file_gambar);
  const updated = await updateFileGambarDb(id_berita, file_gambar);

  cache.del(`berita:slug:${existing.slug}`);
  cache.invalidatePrefix("berita:");

  return { error: false, message: "Gambar berita berhasil diperbarui", data: updated };
};

const deleteBerita = async (id_berita) => {
  const existing = await getBeritaDetailAdminDb(id_berita);
  if (!existing) return { error: true, message: "Berita tidak ditemukan", data: null };
  const deleted = await deleteBeritaDb(id_berita);
  if (deleted && deleted.file_gambar) deleteFile(deleted.file_gambar);

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