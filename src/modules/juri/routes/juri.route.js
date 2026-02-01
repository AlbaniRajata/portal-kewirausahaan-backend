const express = require("express");
const router = express.Router();

const roleMiddleware = require("../../../middlewares/role.middleware");

const {
  getPenugasanController,
  getDetailPenugasanController,
  acceptPenugasanController,
  rejectPenugasanController,
} = require("../controllers/penugasan.controller");

const {
  getFormPenilaianController,
  simpanNilaiController,
  submitPenilaianController,
} = require("../controllers/penilaian.controller");

router.use(roleMiddleware([5]));

----juri-----
//penugasan db
const pool = require("../../../config/db");

const getTahapAktifDb = async (tahap) => {
  const q = `
    SELECT id_tahap, status
    FROM m_tahap_penilaian
    WHERE id_tahap = $1
      AND status = 1
  `;
  const { rows } = await pool.query(q, [tahap]);
  return rows[0] || null;
};

const getPenugasanDb = async (id_juri, tahap) => {
  const q = `
    SELECT
      d.id_distribusi,
      d.status,
      d.tahap,
      d.assigned_at,
      d.responded_at,

      p.id_proposal,
      p.judul,
      p.file_proposal,
      p.modal_diajukan,
      p.status AS status_proposal,

      k.nama_kategori,
      pr.nama_program

    FROM t_distribusi_juri d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN m_program pr ON pr.id_program = p.id_program

    WHERE d.id_juri = $1
      AND d.tahap = $2

    ORDER BY d.assigned_at DESC
  `;
  const { rows } = await pool.query(q, [id_juri, tahap]);
  return rows;
};

const getDetailPenugasanDb = async (id_distribusi, id_juri) => {
  const q = `
    SELECT
      d.id_distribusi,
      d.id_proposal,
      d.id_juri,
      d.status,
      d.tahap,
      d.assigned_at,
      d.responded_at,
      d.catatan_juri,

      p.judul,
      p.file_proposal,
      p.modal_diajukan,
      p.status AS status_proposal,

      k.nama_kategori,
      pr.nama_program,
      t.nama_tim

    FROM t_distribusi_juri d
    JOIN t_proposal p ON p.id_proposal = d.id_proposal
    JOIN t_tim t ON t.id_tim = p.id_tim
    JOIN m_kategori k ON k.id_kategori = p.id_kategori
    JOIN m_program pr ON pr.id_program = p.id_program

    WHERE d.id_distribusi = $1
      AND d.id_juri = $2
  `;
  const { rows } = await pool.query(q, [id_distribusi, id_juri]);
  return rows[0] || null;
};

const acceptDistribusiDb = async (id_distribusi, id_juri) => {
  const q = `
    UPDATE t_distribusi_juri
    SET status = 1,
        responded_at = now()
    WHERE id_distribusi = $1
      AND id_juri = $2
      AND status = 0
    RETURNING *
  `;
  const { rows } = await pool.query(q, [id_distribusi, id_juri]);
  return rows[0] || null;
};

const rejectDistribusiDb = async (id_distribusi, id_juri, catatan) => {
  const q = `
    UPDATE t_distribusi_juri
    SET status = 2,
        catatan_juri = $3,
        responded_at = now()
    WHERE id_distribusi = $1
      AND id_juri = $2
      AND status = 0
    RETURNING *
  `;
  const { rows } = await pool.query(q, [
    id_distribusi,
    id_juri,
    catatan,
  ]);
  return rows[0] || null;
};

module.exports = {
  getTahapAktifDb,
  getPenugasanDb,
  getDetailPenugasanDb,
  acceptDistribusiDb,
  rejectDistribusiDb,
};


//penugasan service
const {
  getTahapAktifDb,
  getPenugasanDb,
  getDetailPenugasanDb,
  acceptDistribusiDb,
  rejectDistribusiDb,
} = require("../db/penugasan.db");

const getPenugasan = async (id_user, tahap) => {
  const tahapAktif = await getTahapAktifDb(tahap);

  if (!tahapAktif) {
    return {
      error: true,
      message: "Tahap penilaian tidak aktif",
      data: { tahap },
    };
  }

  const data = await getPenugasanDb(id_user, tahap);

  return {
    error: false,
    message: "Daftar penugasan juri",
    data: {
      tahap,
      total: data.length,
      penugasan: data,
    },
  };
};

const getDetailPenugasan = async (id_user, id_distribusi) => {
  const data = await getDetailPenugasanDb(id_distribusi, id_user);

  if (!data) {
    return {
      error: true,
      message: "Penugasan tidak ditemukan",
      data: null,
    };
  }

  return {
    error: false,
    message: "Detail penugasan juri",
    data,
  };
};

const acceptPenugasan = async (id_user, id_distribusi) => {
  const detail = await getDetailPenugasanDb(id_distribusi, id_user);

  if (!detail) {
    return {
      error: true,
      message: "Penugasan tidak ditemukan",
      data: null,
    };
  }

  if (detail.status !== 0) {
    return {
      error: true,
      message: "Penugasan sudah direspon",
      data: detail,
    };
  }

  const tahapAktif = await getTahapAktifDb(detail.tahap);

  if (!tahapAktif) {
    return {
      error: true,
      message: "Tahap sudah ditutup",
      data: { tahap: detail.tahap },
    };
  }

  const updated = await acceptDistribusiDb(id_distribusi, id_user);

  return {
    error: false,
    message: "Penugasan berhasil diterima",
    data: updated,
  };
};

const rejectPenugasan = async (id_user, id_distribusi, catatan) => {
  const detail = await getDetailPenugasanDb(id_distribusi, id_user);

  if (!detail) {
    return {
      error: true,
      message: "Penugasan tidak ditemukan",
      data: null,
    };
  }

  if (detail.status !== 0) {
    return {
      error: true,
      message: "Penugasan sudah direspon",
      data: detail,
    };
  }

  const tahapAktif = await getTahapAktifDb(detail.tahap);

  if (!tahapAktif) {
    return {
      error: true,
      message: "Tahap sudah ditutup",
      data: { tahap: detail.tahap },
    };
  }

  const updated = await rejectDistribusiDb(
    id_distribusi,
    id_user,
    catatan
  );

  return {
    error: false,
    message: "Penugasan berhasil ditolak",
    data: updated,
  };
};

module.exports = {
  getPenugasan,
  getDetailPenugasan,
  acceptPenugasan,
  rejectPenugasan,
};


//oenugasan controller
const {
  getPenugasan,
  getDetailPenugasan,
  acceptPenugasan,
  rejectPenugasan,
} = require("../services/penugasan.services");

const getPenugasanController = async (req, res) => {
  const { id_user } = req.user;
  const tahap = Number(req.query.tahap);

  if (![2].includes(tahap)) {
    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      data: {
        field: "tahap",
        reason: "Tahap wajib diisi (2)",
      },
    });
  }

  const result = await getPenugasan(id_user, tahap);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const getDetailPenugasanController = async (req, res) => {
  const { id_user } = req.user;
  const id_distribusi = Number(req.params.id_distribusi);

  if (!id_distribusi) {
    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      data: {
        field: "id_distribusi",
        reason: "id_distribusi wajib diisi",
      },
    });
  }

  const result = await getDetailPenugasan(id_user, id_distribusi);

  return res.status(result.error ? 404 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const acceptPenugasanController = async (req, res) => {
  const { id_user } = req.user;
  const id_distribusi = Number(req.params.id_distribusi);

  const result = await acceptPenugasan(id_user, id_distribusi);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

const rejectPenugasanController = async (req, res) => {
  const { id_user } = req.user;
  const id_distribusi = Number(req.params.id_distribusi);
  const { catatan } = req.body || {};

  if (!catatan || catatan.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      data: {
        field: "catatan",
        reason: "Catatan wajib diisi saat menolak penugasan",
      },
    });
  }

  const result = await rejectPenugasan(id_user, id_distribusi, catatan);

  return res.status(result.error ? 400 : 200).json({
    success: !result.error,
    message: result.message,
    data: result.data,
    meta: {},
  });
};

module.exports = {
  getPenugasanController,
  getDetailPenugasanController,
  acceptPenugasanController,
  rejectPenugasanController,
};


//route
router.get("/penugasan", getPenugasanController);
router.get("/penugasan/:id_distribusi", getDetailPenugasanController);
router.patch("/penugasan/:id_distribusi/accept", acceptPenugasanController);
router.patch("/penugasan/:id_distribusi/reject", rejectPenugasanController);

router.get("/penilaian/:id_distribusi", getFormPenilaianController);
router.post("/penilaian/:id_distribusi", simpanNilaiController);
router.post("/penilaian/:id_distribusi/submit", submitPenilaianController);

module.exports = router;
