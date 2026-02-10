const {
  getRoleByNameDb,
  checkDuplicateUserDb,
  createUserDb,
} = require("../db/user.db");

const { 
  createReviewerDb, 
  getReviewersDb, 
  getReviewerDetailDb 
} = require("../db/reviewer.db");

const createReviewer = async (data) => {
  const required = [
    "nama_lengkap",
    "username",
    "email",
    "password",
    "no_hp",
    "institusi",
    "bidang_keahlian",
  ];

  const missing = required.filter((f) => !data[f]);
  if (missing.length > 0) {
    return {
      error: true,
      message: "Field wajib belum diisi",
      data: { missing_fields: missing },
    };
  }

  const duplicate = await checkDuplicateUserDb(data);

  if (duplicate.username_count > 0) {
    return {
      error: true,
      message: "Username sudah terdaftar",
      data: { field: "username", value: data.username },
    };
  }

  if (duplicate.email_count > 0) {
    return {
      error: true,
      message: "Email sudah terdaftar",
      data: { field: "email", value: data.email },
    };
  }

  if (duplicate.no_hp_count > 0) {
    return {
      error: true,
      message: "No HP sudah terdaftar",
      data: { field: "no_hp", value: data.no_hp },
    };
  }

  const role = await getRoleByNameDb("reviewer");
  if (!role) {
    return {
      error: true,
      message: "Role reviewer internal tidak ditemukan",
      data: null,
    };
  }

  const user = await createUserDb({
    ...data,
    id_role: role.id_role,
  });

  const reviewer = await createReviewerDb(user.id_user, data);

  return {
    error: false,
    data: {
      user,
      reviewer,
    },
  };
};

const getReviewers = async () => {
  const data = await getReviewersDb();
  return { error: false, data };
};

const getReviewerDetail = async (id_user) => {
  const data = await getReviewerDetailDb(id_user);

  if (!data) {
    return {
      error: true,
      message: "Reviewer tidak ditemukan",
      data: { id_user },
    };
  }

  return { error: false, data };
};

module.exports = {
  createReviewer,
  getReviewers,
  getReviewerDetail,
};