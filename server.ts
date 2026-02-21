import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeNetwork } from "./src/services/geminiService.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("finlink.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_number TEXT UNIQUE,
    customer_name TEXT,
    registered_phone TEXT,
    pan TEXT,
    address TEXT,
    kyc_status TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id TEXT UNIQUE,
    date TEXT,
    amount REAL,
    sender_account TEXT,
    receiver_account TEXT,
    linked_phone TEXT
  );

  CREATE TABLE IF NOT EXISTS calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caller_number TEXT,
    receiver_number TEXT,
    duration INTEGER,
    timestamp TEXT
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/stats", (req, res) => {
    const accountCount = db.prepare("SELECT COUNT(*) as count FROM accounts").get().count;
    const transactionCount = db.prepare("SELECT COUNT(*) as count FROM transactions").get().count;
    const callCount = db.prepare("SELECT COUNT(*) as count FROM calls").get().count;
    res.json({ accountCount, transactionCount, callCount });
  });

  app.get("/api/graph", (req, res) => {
    const accounts = db.prepare("SELECT account_number, customer_name, registered_phone FROM accounts").all();
    const transactions = db.prepare("SELECT sender_account, receiver_account, amount FROM transactions").all();
    const calls = db.prepare("SELECT caller_number, receiver_number, duration FROM calls").all();

    const nodes = [];
    const links = [];
    const nodeSet = new Set();

    accounts.forEach(acc => {
      if (!nodeSet.has(acc.account_number)) {
        nodes.push({ id: acc.account_number, type: 'account', label: acc.customer_name });
        nodeSet.add(acc.account_number);
      }
      if (acc.registered_phone && !nodeSet.has(acc.registered_phone)) {
        nodes.push({ id: acc.registered_phone, type: 'phone', label: acc.registered_phone });
        nodeSet.add(acc.registered_phone);
      }
      if (acc.registered_phone) {
        links.push({ source: acc.account_number, target: acc.registered_phone, type: 'registered' });
      }
    });

    transactions.forEach(tx => {
      if (nodeSet.has(tx.sender_account) && nodeSet.has(tx.receiver_account)) {
        links.push({ source: tx.sender_account, target: tx.receiver_account, type: 'transaction', value: tx.amount });
      }
    });

    calls.forEach(call => {
      if (nodeSet.has(call.caller_number) && nodeSet.has(call.receiver_number)) {
        links.push({ source: call.caller_number, target: call.receiver_number, type: 'call', value: call.duration });
      }
    });

    res.json({ nodes, links });
  });

  app.get("/api/analyze", async (req, res) => {
    const accounts = db.prepare("SELECT account_number, customer_name, registered_phone FROM accounts").all();
    const transactions = db.prepare("SELECT sender_account, receiver_account, amount FROM transactions").all();
    const calls = db.prepare("SELECT caller_number, receiver_number, duration FROM calls").all();

    // Simplify for AI context window
    const analysis = await analyzeNetwork(accounts, transactions);
    res.json(analysis);
  });

  app.post("/api/seed", (req, res) => {
    const insertAccount = db.prepare("INSERT OR IGNORE INTO accounts (account_number, customer_name, registered_phone, kyc_status) VALUES (?, ?, ?, ?)");
    const insertTransaction = db.prepare("INSERT OR IGNORE INTO transactions (transaction_id, date, amount, sender_account, receiver_account, linked_phone) VALUES (?, ?, ?, ?, ?, ?)");
    const insertCall = db.prepare("INSERT INTO calls (caller_number, receiver_number, duration, timestamp) VALUES (?, ?, ?, ?)");

    const transaction = db.transaction(() => {
      // Seed some suspicious patterns
      insertAccount.run("ACC001", "John Doe", "9876543210", "Verified");
      insertAccount.run("ACC002", "Jane Smith", "9876543210", "Verified"); // Shared phone!
      insertAccount.run("ACC003", "Mule Account", "1112223333", "Pending");
      
      insertTransaction.run("TXN001", "2024-02-20", 5000, "ACC001", "ACC003", "9876543210");
      insertTransaction.run("TXN002", "2024-02-20", 4500, "ACC002", "ACC003", "9876543210");

      insertCall.run("9876543210", "1112223333", 120, "2024-02-20 10:00:00");
    });

    transaction();
    res.json({ status: "success" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
