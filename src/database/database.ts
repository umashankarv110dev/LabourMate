import { SQLiteDatabase } from "expo-sqlite";

import { migrateDatabase } from "./migrations";

export const DATABASE_NAME = "labourmate.db";

async function ensureCompanyColumns(db: SQLiteDatabase) {
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(companies)`
  );

  const existingColumns = new Set(
    columns.map((column) => column.name)
  );

  if (!existingColumns.has("email")) {
    await db.execAsync(`
      ALTER TABLE companies
      ADD COLUMN email TEXT;
    `);

    console.log("ADDED: companies.email");
  }

  if (!existingColumns.has("gst_number")) {
    await db.execAsync(`
      ALTER TABLE companies
      ADD COLUMN gst_number TEXT;
    `);

    console.log("ADDED: companies.gst_number");
  }

  if (!existingColumns.has("signature")) {
    await db.execAsync(`
      ALTER TABLE companies
      ADD COLUMN signature TEXT;
    `);

    console.log("ADDED: companies.signature");
  }

  if (!existingColumns.has("stamp")) {
    await db.execAsync(`
      ALTER TABLE companies
      ADD COLUMN stamp TEXT;
    `);

    console.log("ADDED: companies.stamp");
  }

  console.log("COMPANY COLUMNS VERIFIED");
}

export async function initializeDatabase(
  db: SQLiteDatabase
) {
  try {
    await migrateDatabase(db);

    // IMPORTANT:
    // Always verify the company schema.
    await ensureCompanyColumns(db);

    console.log(
      "LabourMate database initialized"
    );
  } catch (error) {
    console.error(
      "Database initialization failed:",
      error
    );

    throw error;
  }
}