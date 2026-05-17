const { app } = require('electron');
const path = require('path');
const os = require('os');
const Database = require('/home/zeeshan/Documents/electron/electron-react-boilerplate/release/app/node_modules/better-sqlite3');

app.whenReady().then(() => {
  const dbPath = path.join(os.homedir(), '.config', 'A POS', 'pos-v1.db');
  console.log('--- DIAGNOSTIC START ---');
  console.log('Opening DB at:', dbPath);

  try {
    const db = new Database(dbPath);
    console.log('Opened DB successfully!');

    // Show users columns
    const columns = db.prepare("PRAGMA table_info(users)").all();
    console.log('Users columns:', columns);

    // Show existing users
    const allUsers = db.prepare("SELECT * FROM users").all();
    console.log('Current Users in DB:', allUsers);

    // Try an insert to see what fails
    console.log('Attempting insert...');
    const uuid = require('crypto').randomUUID();
    const insert = db.prepare("INSERT INTO users (id, username, password_hash, role, active) VALUES (?, ?, ?, ?, ?)");
    const res = insert.run(uuid, 'test_diag_user', 'pass_hash', 'cashier', 1);
    console.log('Insert success! Result:', res);

    // Clean up
    db.prepare("DELETE FROM users WHERE username = 'test_diag_user'").run();
    console.log('Cleaned up test_diag_user.');

  } catch (err) {
    console.error('DIAGNOSTIC ERROR:', err);
  }

  console.log('--- DIAGNOSTIC END ---');
  app.quit();
});
