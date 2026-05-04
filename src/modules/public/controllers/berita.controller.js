const { getBeritaListPublik, getBeritaBySlug, downloadBeritaAttachment } = require("../services/berita.service");

const getBeritaListPublikController = async (req, res, next) => {
  try {
    const result = await getBeritaListPublik({
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const getBeritaBySlugController = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug || !slug.trim()) return res.status(400).json({ success: false, message: "Slug tidak valid", data: null });
    const result = await getBeritaBySlug(slug.trim());
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });
    return res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err) { next(err); }
};

const downloadBeritaAttachmentController = async (req, res, next) => {
  try {
    const { filename } = req.params;
    if (!filename || !filename.trim()) {
      return res.status(400).json({ success: false, message: "Filename tidak valid", data: null });
    }

    const result = await downloadBeritaAttachment(filename.trim());
    if (result.error) return res.status(404).json({ success: false, message: result.message, data: null });

    return res.download(result.data.filePath, result.data.downloadName);
  } catch (err) { next(err); }
};

module.exports = { getBeritaListPublikController, getBeritaBySlugController, downloadBeritaAttachmentController };