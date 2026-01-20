const crypto = require("crypto");
const {
  createEmailTokenDb,
  getValidTokenDb,
  markTokenUsedDb,
  verifyEmailUserDb,
} = require("../db/emailVerification.db");

const createVerificationToken = async (id_user) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expired_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

  await createEmailTokenDb({ id_user, token, expired_at });

  return token;
};

const verifyEmail = async (token) => {
  const record = await getValidTokenDb(token);

  if (!record) {
    return { error: "TOKEN_TIDAK_VALID" };
  }

  await verifyEmailUserDb(record.id_user);
  await markTokenUsedDb(record.id);

  return { success: true };
};

module.exports = {
  createVerificationToken,
  verifyEmail,
};
