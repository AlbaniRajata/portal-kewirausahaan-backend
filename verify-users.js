require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const pool = require('./src/config/db');

const verifyUsers = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id_user, u.username, u.email, u.is_active, u.email_verified_at,
        r.nama_role,
        CASE WHEN u.email_verified_at IS NOT NULL THEN 'VERIFIED' ELSE 'NOT VERIFIED' END as verify_status
      FROM m_user u
      JOIN m_role r ON u.id_role = r.id_role
      ORDER BY u.id_user
    `);
    
    console.log('=== USER STATUS ===');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id_user} | ${row.nama_role} | ${row.email} | Active: ${row.is_active} | Verify: ${row.verify_status}`);
    });
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
};

verifyUsers();
