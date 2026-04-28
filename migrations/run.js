require('./env-loader');
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

const runMigrations = async () => {
  try {
    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files`);

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await pool.query(sql);
        console.log(`${file} completed`);
      } catch (err) {
        console.error(`✗ Error in ${file}:`, err.message);
      }
    }

    console.log('Migrations completed');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

runMigrations();
