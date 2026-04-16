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

const sendResetPasswordEmail = async (email, resetLink) => {
  await transporter.sendMail({
    from: `"Portal Kewirausahaan" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Reset Password - Portal Kewirausahaan",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e0e0e0;">
        <h2 style="color: #0D59F2; margin-bottom: 8px;">Permintaan Reset Password</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Kami menerima permintaan untuk mengubah password akun Anda.
          Klik tombol di bawah ini untuk membuat password baru.
          Link hanya berlaku selama <strong>15 menit</strong>.
        </p>
        <a
          href="${resetLink}"
          style="display: inline-block; padding: 12px 18px; border-radius: 8px; background: #0D59F2; color: #ffffff; text-decoration: none; font-weight: 600;"
        >
          Reset Password
        </a>
        <p style="color: #777; font-size: 12px; line-height: 1.6; margin-top: 20px;">
          Jika tombol tidak bisa diklik, salin link berikut ke browser Anda:<br />
          <span style="word-break: break-all; color: #444;">${resetLink}</span>
        </p>
        <p style="color: #888; font-size: 12px; margin-top: 16px;">
          Jika Anda tidak merasa meminta reset password, abaikan email ini.
        </p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };