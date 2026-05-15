const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const BRANCH_ID = 'BR-01';

// Data Arrays
const categoryNames = [
  'Electronics', 'Groceries', 'Stationery', 'Beverages', 'Dairy',
  'Meat & Poultry', 'Snacks', 'Personal Care', 'Household', 'Frozen Foods'
];

const firstNames = ['Ali', 'Ahmed', 'Zeeshan', 'Umer', 'Hamza', 'Usman', 'Faisal', 'Bilal', 'Sajid', 'Kamran'];
const lastNames = ['Khan', 'Mehmood', 'Ahmad', 'Ali', 'Hassan', 'Raza', 'Shah', 'Malik', 'Javed', 'Iqbal'];
const cities = ['Haroonabad', 'Faqirwali', 'Bahawalnagar', 'Lahore', 'Faisalabad', 'Multan', 'Karachi', 'Islamabad'];

const productAdjectives = ['Super', 'Premium', 'Organic', 'Fresh', 'Instant', 'Classic', 'Natural', 'Pure', 'Golden', 'Elite'];
const productNouns = ['Milk', 'Bread', 'Water', 'Phone', 'Pen', 'Chocolate', 'Juice', 'Soap', 'Oil', 'Rice'];

let sql = '-- Large Dataset Seed\n\n';

// 1. Categories (10)
const catIds = [];
sql += '-- Categories\n';
for (let i = 0; i < 10; i++) {
  const id = `cat_id_${i + 1}`;
  const name = categoryNames[i];
  sql += `INSERT OR IGNORE INTO categories (id, name, description, branch_id) VALUES ('${id}', '${name}', '${name} department', '${BRANCH_ID}');\n`;
  catIds.push(id);
}

// 2. Customers (50)
sql += '\n-- Customers\n';
for (let i = 0; i < 50; i++) {
  const id = `cust_id_${i + 1}`;
  const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  const phone = `03${Math.floor(100000000 + Math.random() * 900000000)}`;
  const city = cities[Math.floor(Math.random() * cities.length)];
  const ntn = `NTN-${100000 + i}`;
  sql += `INSERT OR REPLACE INTO customers (id, name, phone, address, branch_id, ntn) VALUES ('${id}', '${name}', '${phone}', '${city}', '${BRANCH_ID}', '${ntn}');\n`;
}

// 3. Products (50)
sql += '\n-- Products\n';
for (let i = 0; i < 50; i++) {
  const id = `prod_id_${i + 1}`;
  const adj = productAdjectives[Math.floor(Math.random() * productAdjectives.length)];
  const noun = productNouns[Math.floor(Math.random() * productNouns.length)];
  const name = `${adj} ${noun} ${i + 1}`;
  const sku = `SKU-${1000 + i}`;
  const barcode = `${8900000000000 + i}`;
  const catId = catIds[Math.floor(Math.random() * catIds.length)];
  const pPrice = Math.floor(Math.random() * 500) + 10;
  const sPrice = Math.floor(pPrice * 1.2) + 5;
  const reorder = Math.floor(Math.random() * 20) + 5;

  sql += `INSERT OR REPLACE INTO products (id, sku, barcode, name, category_id, purchase_price, selling_price, reorder_level, branch_id, active) VALUES ('${id}', '${sku}', '${barcode}', '${name}', '${catId}', ${pPrice}, ${sPrice}, ${reorder}, '${BRANCH_ID}', 1);\n`;
}

fs.writeFileSync(path.join(__dirname, 'dummy-data.sql'), sql);
console.log('✅ Generated dummy-data.sql with 10 categories, 50 customers, and 50 products.');
