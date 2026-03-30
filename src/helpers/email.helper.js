const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendVerificationEmail = async (email, kode) => {
  await transporter.sendMail({
    from: `"Portal Kewirausahaan" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Kode Verifikasi Email - Portal Kewirausahaan",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e0e0e0;">
        <h2 style="color: #0D59F2; margin-bottom: 8px;">Verifikasi Email Anda</h2>
        <p style="color: #555; font-size: 14px; margin-bottom: 24px;">
          Gunakan kode berikut untuk memverifikasi email Anda. Kode berlaku selama <strong>15 menit</strong>.
        </p>
        <div style="background: #f0f4ff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #0D59F2;">${kode}</span>
        </div>
        <p style="color: #888; font-size: 12px;">
          Jika Anda tidak merasa melakukan registrasi, abaikan email ini.
        </p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail };