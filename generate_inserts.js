const fs = require('fs');

// Read app.js
const appCode = fs.readFileSync('C:\\Users\\User\\OneDrive\\Ai\\app.js', 'utf8');

// Extract SEED_TRANSACTIONS
const startToken = 'const SEED_TRANSACTIONS = [';
const endToken = '];';
const startIdx = appCode.indexOf(startToken);
if (startIdx === -1) {
  console.error("Could not find SEED_TRANSACTIONS in app.js");
  process.exit(1);
}

const slice = appCode.substring(startIdx + startToken.length - 1);
const endIdx = slice.indexOf(endToken);
if (endIdx === -1) {
  console.error("Could not find end of SEED_TRANSACTIONS");
  process.exit(1);
}

const arrayStr = slice.substring(0, endIdx + 1);
const seedTransactions = eval(arrayStr);

function parseCustomDate(dateStr) {
  if (!dateStr) return "";
  dateStr = dateStr.trim();
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  const parts = dateStr.split(/[-/]/);
  if (parts.length !== 3) return dateStr;
  
  let p1 = parseInt(parts[0], 10);
  let p2 = parseInt(parts[1], 10);
  let yr = parseInt(parts[2], 10);
  if (yr < 100) yr += 2000;
  
  let day, month;
  if (p1 > 12) {
    day = p1;
    month = p2;
  } else if (p2 > 12) {
    day = p2;
    month = p1;
  } else {
    if (p2 === 5) {
      month = 5;
      day = p1;
    } else if (p1 === 5) {
      month = 5;
      day = p2;
    } else if (p1 === 6) {
      month = 6;
      day = p2;
    } else if (p2 === 6) {
      month = 6;
      day = p1;
    } else {
      day = p1;
      month = p2;
    }
  }
  
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${yr}-${mm}-${dd}`;
}

let sql = '';
seedTransactions.forEach(t => {
  const isoDate = parseCustomDate(t.date);
  const totalVal = parseFloat(t.total);
  const loc = t.location || '';
  const rem = t.remark || '';
  const updatedAt = Date.now(); // or a constant to keep it stable
  
  // Format SQL string literals
  const idStr = t.id.replace(/'/g, "''");
  const platformStr = t.platform.replace(/'/g, "''");
  const catStr = t.category.replace(/'/g, "''");
  const locStr = loc.replace(/'/g, "''");
  const remStr = rem.replace(/'/g, "''");
  
  sql += `INSERT OR IGNORE INTO transactions (id, date, type, platform, total, category, location, remark, updated_at) VALUES ('${idStr}', '${isoDate}', '${t.type}', '${platformStr}', ${totalVal}, '${catStr}', '${locStr}', '${remStr}', ${updatedAt});\n`;
});

fs.writeFileSync('C:\\Users\\User\\OneDrive\\Ai\\seed_data.sql', sql, 'utf8');
console.log(`Generated seed_data.sql with ${seedTransactions.length} records.`);
