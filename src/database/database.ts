import { SQLiteDatabase } from "expo-sqlite";

import { migrateDatabase } from "./migrations";

export const DATABASE_NAME = "labourmate.db";

export async function initializeDatabase(
  db: SQLiteDatabase
) {
  try {
    await migrateDatabase(db);

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