const cron = require("node-cron");
const pool = require("../config/db");

cron.schedule("* * * * *", async () => {
  try {
    await pool.query(`
      UPDATE t_proposal p
      SET status = 1
      FROM m_program mp
      WHERE p.id_program = mp.id_program
      AND p.status = 0
      AND mp.pendaftaran_selesai IS NOT NULL
      AND now() > mp.pendaftaran_selesai
    `);
  } catch (err) {
    console.error("CRON proposal status error:", err.message);
  }
});
