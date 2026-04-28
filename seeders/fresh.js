const { execSync } = require('child_process');
const path = require('path');

const backendRoot = __dirname;

try {
  console.log('🔄 Fresh database setup...\n');
  
  // Step 1: Reset (truncate tables)
  console.log('1️⃣ Resetting database...');
  execSync('node reset.js', { 
    cwd: backendRoot, 
    stdio: 'inherit' 
  });
  
  // Step 2: Run migrations
  console.log('\n2️⃣ Running migrations...');
  execSync('node run.js', { 
    cwd: path.join(backendRoot, '../migrations'), 
    stdio: 'inherit' 
  });
  
  // Step 3: Run seeders
  console.log('\n3️⃣ Running seeders...');
  execSync('node run.js', { 
    cwd: backendRoot, 
    stdio: 'inherit' 
  });
  
  console.log('\n✅ Fresh database setup completed!');
} catch (err) {
  console.error('\n❌ Fresh setup failed:', err.message);
  process.exit(1);
}
