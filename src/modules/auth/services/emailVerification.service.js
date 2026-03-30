const {
  createEmailTokenDb,
  getValidTokenDb,
  getLastTokenDb,
  markTokenUsedDb,
  verifyEmailUserDb,
  deleteOldTokensDb,
  getUserByEmailDb,
  getUserByIdDb,
  cancelRegistrasiDb,
} = require("../db/emailVerification.db");
const { sendVerificationEmail } = require("../../../helpers/email.helper");

const KODE_EXPIRY_MINUTES = 15;
const RESEND_COOLDOWN_SECONDS = 60;

const generateKode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createVerificationToken = async (id_user, email) => {
  await deleteOldTokensDb(id_user);

  const kode = generateKode();
  const expired_at = new Date(Date.now() + KODE_EXPIRY_MINUTES * 60 * 1000);

  await createEmailTokenDb({ id_user, token: kode, expired_at });
  await sendVerificationEmail(email, kode);

  return kode;
};

const verifyEmail = async (id_user, kode) => {
  const user = await getUserByIdDb(id_user);
  if (!user) return { error: "Akun tidak ditemukan." };
  if (user.email_verified_at) return { error: "Email sudah terverifikasi sebelumnya." };

  const record = await getValidTokenDb(id_user, kode);
  if (!record) return { error: "Kode verifikasi tidak valid atau sudah kadaluarsa. Silahkan coba lagi atauminta kode baru." };

  await verifyEmailUserDb(id_user);
  await markTokenUsedDb(record.id);

  return { success: true };
};

const resendVerification = async (email) => {
  const user = await getUserByEmailDb(email);
  if (!user) return { error: "Email tidak terdaftar." };
  if (user.email_verified_at) return { error: "Email sudah terverifikasi." };

  const last = await getLastTokenDb(user.id_user);
  if (last) {
    const diff = (Date.now() - new Date(last.created_at).getTime()) / 1000;
    if (diff < RESEND_COOLDOWN_SECONDS) {
      const sisaDetik = Math.ceil(RESEND_COOLDOWN_SECONDS - diff);
      return { error: `Tunggu ${sisaDetik} detik sebelum mengirim ulang kode.` };
    }
  }

  await createVerificationToken(user.id_user, email);
  return { success: true };
};

const cancelRegistrasi = async (id_user) => {
  const user = await getUserByIdDb(id_user);
  if (!user) return { error: "Akun tidak ditemukan." };
  if (user.email_verified_at) return { error: "Akun sudah terverifikasi dan tidak dapat dibatalkan." };

  await cancelRegistrasiDb(id_user);
  return { success: true };
};

module.exports = {
  createVerificationToken,
  verifyEmail,
  resendVerification,
  cancelRegistrasi,
};