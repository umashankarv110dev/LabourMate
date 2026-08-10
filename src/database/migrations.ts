import { SQLiteDatabase } from "expo-sqlite";

const DATABASE_VERSION = 3;

export async function migrateDatabase(
  db: SQLiteDatabase
) {
  try {
    console.log("DATABASE MIGRATION STARTED");

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);

    const result = await db.getFirstAsync<{
      user_version: number;
    }>("PRAGMA user_version");

    const currentVersion =
      result?.user_version ?? 0;

    console.log(
      "CURRENT DATABASE VERSION:",
      currentVersion
    );

    if (currentVersion < 1) {
      console.log("RUNNING MIGRATION V1");

      await createInitialTables(db);

      await db.execAsync(`
        PRAGMA user_version = 1;
      `);
    }

    if (currentVersion < 2) {
      console.log("RUNNING MIGRATION V2");

      await migrateToVersion2(db);

      await db.execAsync(`
        PRAGMA user_version = 2;
      `);
    }

    if (currentVersion < 3) {
      console.log("RUNNING MIGRATION V3");

      await migrateToVersion3(db);

      await db.execAsync(`
        PRAGMA user_version = 3;
      `);
    } 

    console.log(
      "DATABASE MIGRATION COMPLETED"
    );
  } catch (error) {
    console.error(
      "DATABASE MIGRATION ERROR:",
      error
    );

    throw error;
  }
}

async function createInitialTables(
  db: SQLiteDatabase
) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      owner_name TEXT,
      phone TEXT,
      address TEXT,
      logo TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      client_name TEXT,
      address TEXT,
      start_date TEXT,
      expected_end_date TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workers (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      photo TEXT,
      worker_type TEXT NOT NULL,
      payment_type TEXT NOT NULL DEFAULT 'daily',
      wage REAL NOT NULL DEFAULT 0,
      site_id TEXT,
      joining_date TEXT,
      address TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      FOREIGN KEY (site_id)
      REFERENCES sites(id)
      ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY NOT NULL,
      worker_id TEXT NOT NULL,
      site_id TEXT,
      attendance_date TEXT NOT NULL,
      status TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      FOREIGN KEY (worker_id)
      REFERENCES workers(id)
      ON DELETE CASCADE,

      FOREIGN KEY (site_id)
      REFERENCES sites(id)
      ON DELETE SET NULL,

      UNIQUE(worker_id, attendance_date)
    );

    CREATE TABLE IF NOT EXISTS advances (
      id TEXT PRIMARY KEY NOT NULL,
      worker_id TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      advance_date TEXT NOT NULL,
      payment_mode TEXT DEFAULT 'cash',
      note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT,

      FOREIGN KEY (worker_id)
      REFERENCES workers(id)
      ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY NOT NULL,
      worker_id TEXT NOT NULL,
      payment_month TEXT NOT NULL,
      working_amount REAL NOT NULL DEFAULT 0,
      advance_amount REAL NOT NULL DEFAULT 0,
      bonus REAL NOT NULL DEFAULT 0,
      deduction REAL NOT NULL DEFAULT 0,
      final_amount REAL NOT NULL DEFAULT 0,
      payment_date TEXT,
      payment_mode TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      FOREIGN KEY (worker_id)
      REFERENCES workers(id)
      ON DELETE CASCADE,

      UNIQUE(worker_id, payment_month)
    );

    CREATE TABLE IF NOT EXISTS worker_transactions (
      id TEXT PRIMARY KEY NOT NULL,
      worker_id TEXT NOT NULL,
      type TEXT NOT NULL,
      reference_id TEXT,
      amount REAL NOT NULL,
      transaction_date TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,

      FOREIGN KEY (worker_id)
      REFERENCES workers(id)
      ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );
  `);
}

async function migrateToVersion2(
  db: SQLiteDatabase
) {
  await addColumnIfNotExists(
    db,
    "advances",
    "updated_at",
    "TEXT"
  );

  await addColumnIfNotExists(
    db,
    "advances",
    "payment_mode",
    "TEXT DEFAULT 'cash'"
  );

  await db.execAsync(`
    UPDATE advances
    SET updated_at = created_at
    WHERE updated_at IS NULL;
  `);

  await createIndexes(db);
}

async function migrateToVersion3(
  db: SQLiteDatabase
) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS payment_entries (
      id TEXT PRIMARY KEY NOT NULL,
      payment_id TEXT NOT NULL,
      worker_id TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      payment_date TEXT NOT NULL,
      payment_mode TEXT NOT NULL DEFAULT 'cash',
      note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      FOREIGN KEY (payment_id)
      REFERENCES payments(id)
      ON DELETE CASCADE,

      FOREIGN KEY (worker_id)
      REFERENCES workers(id)
      ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_payment_entries_payment
    ON payment_entries(payment_id);

    CREATE INDEX IF NOT EXISTS idx_payment_entries_worker
    ON payment_entries(worker_id);

    CREATE INDEX IF NOT EXISTS idx_payment_entries_date
    ON payment_entries(payment_date);
  `);
}

async function createIndexes(
  db: SQLiteDatabase
) {
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_workers_site
    ON workers(site_id);

    CREATE INDEX IF NOT EXISTS idx_workers_status
    ON workers(status);

    CREATE INDEX IF NOT EXISTS idx_attendance_worker
    ON attendance(worker_id);

    CREATE INDEX IF NOT EXISTS idx_attendance_site
    ON attendance(site_id);

    CREATE INDEX IF NOT EXISTS idx_attendance_date
    ON attendance(attendance_date);

    CREATE INDEX IF NOT EXISTS idx_attendance_worker_date
    ON attendance(
      worker_id,
      attendance_date
    );

    CREATE INDEX IF NOT EXISTS idx_advances_worker
    ON advances(worker_id);

    CREATE INDEX IF NOT EXISTS idx_advances_date
    ON advances(advance_date);

    CREATE INDEX IF NOT EXISTS idx_payments_worker
    ON payments(worker_id);

    CREATE INDEX IF NOT EXISTS idx_payments_month
    ON payments(payment_month);

    CREATE INDEX IF NOT EXISTS idx_transactions_worker
    ON worker_transactions(worker_id);

    CREATE INDEX IF NOT EXISTS idx_transactions_date
    ON worker_transactions(transaction_date);
  `);
}

async function addColumnIfNotExists(
  db: SQLiteDatabase,
  tableName: string,
  columnName: string,
  columnDefinition: string
) {
  const columns = await db.getAllAsync<{
    name: string;
  }>(`PRAGMA table_info(${tableName})`);

  const exists = columns.some(
    (column) => column.name === columnName
  );

  if (exists) {
    console.log(
      `COLUMN EXISTS: ${tableName}.${columnName}`
    );

    return;
  }

  console.log(
    `ADDING COLUMN: ${tableName}.${columnName}`
  );

  await db.execAsync(`
    ALTER TABLE ${tableName}
    ADD COLUMN ${columnName} ${columnDefinition};
  `);

  console.log(
    `COLUMN ADDED: ${tableName}.${columnName}`
  );
}