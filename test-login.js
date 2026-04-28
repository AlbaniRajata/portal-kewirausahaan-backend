require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

const testLogin = async () => {
  try {
    // Cek user
    const userResult = await pool.query(
      `SELECT id_user, email, password_hash, is_active, email_verified_at FROM m_user WHERE email = $1`,
      ['adminpmw@mail.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ User tidak ditemukan');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('User ditemukan:', {
      id_user: user.id_user,
      email: user.email,
      is_active: user.is_active,
      email_verified_at: user.email_verified_at
    });
    
    // Test password
    const match = await bcrypt.compare('password123', user.password_hash);
    console.log('Password match:', match);
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
};

testLogin();
