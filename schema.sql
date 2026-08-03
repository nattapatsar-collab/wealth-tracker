-- schema.sql
-- Table structure for transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,         -- ISO format: YYYY-MM-DD
  type TEXT NOT NULL,         -- 'Income' or 'Expense'
  platform TEXT NOT NULL,     -- e.g., 'Make', 'TTB', 'Cr. So Fast'
  total REAL NOT NULL,        -- Amount in Baht
  category TEXT NOT NULL,     -- e.g., 'ค่าอาหาร'
  location TEXT DEFAULT '',   -- e.g., 'Grab' (optional)
  remark TEXT DEFAULT '',     -- e.g., 'Fixed Cost' (optional)
  updated_at INTEGER NOT NULL -- Unix timestamp (milliseconds) for tracking sync order
);

-- Indexes for performance optimizations on query filters
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
