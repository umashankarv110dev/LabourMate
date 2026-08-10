import { SQLiteDatabase } from "expo-sqlite";

import {
  CreateSiteInput,
  Site,
} from "@/src/types/site";

import { generateId } from "@/src/utils/generateId";

export async function createSite(
  db: SQLiteDatabase,
  input: CreateSiteInput
) {
  const id = generateId("site");
  const now = new Date().toISOString();

  await db.runAsync(
    `
    INSERT INTO sites (
      id,
      name,
      client_name,
      address,
      start_date,
      expected_end_date,
      status,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    id,
    input.name.trim(),
    input.clientName?.trim() || null,
    input.address?.trim() || null,
    input.startDate || null,
    input.expectedEndDate || null,
    "active",
    now,
    now
  );

  return id;
}

export async function getSites(
  db: SQLiteDatabase
) {
  return db.getAllAsync<Site>(
    `
    SELECT *
    FROM sites
    ORDER BY created_at DESC
    `
  );
}

export async function getActiveSites(
  db: SQLiteDatabase
) {
  return db.getAllAsync<Site>(
    `
    SELECT *
    FROM sites
    WHERE status = 'active'
    ORDER BY name ASC
    `
  );
}

export async function getSiteById(
  db: SQLiteDatabase,
  id: string
) {
  return db.getFirstAsync<Site>(
    `
    SELECT *
    FROM sites
    WHERE id = ?
    `,
    id
  );
}