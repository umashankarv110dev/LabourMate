import { SQLiteDatabase } from "expo-sqlite";

export async function initDatabase(
  db: SQLiteDatabase
) {
  try {
    console.log("DATABASE CONFIG STARTED");

    await db.execAsync(`
      PRAGMA foreign_keys = ON;
    `);

    console.log("DATABASE CONFIG COMPLETED");
  } catch (error) {
    console.error(
      "DATABASE CONFIG ERROR:",
      error
    );

    throw error;
  }
}