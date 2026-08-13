import { SQLiteDatabase } from "expo-sqlite";

import {
  Company,
  SaveCompanyInput,
} from "@/src/types/company";

const COMPANY_ID = "main-company";

export async function getCompany(
  db: SQLiteDatabase
): Promise<Company | null> {
  return db.getFirstAsync<Company>(
    `
      SELECT *
      FROM companies
      WHERE id = ?
      LIMIT 1
    `,
    COMPANY_ID
  );
}

export async function saveCompany(
  db: SQLiteDatabase,
  input: SaveCompanyInput
): Promise<Company> {
  const existingCompany = await getCompany(db);

  const now = new Date().toISOString();

  if (existingCompany) {
    await db.runAsync(
      `
        UPDATE companies
        SET
          name = ?,
          owner_name = ?,
          phone = ?,
          email = ?,
          address = ?,
          gst_number = ?,
          logo = ?,
          signature = ?,
          stamp = ?,
          updated_at = ?
        WHERE id = ?
      `,
      input.name.trim(),
      input.owner_name?.trim() || null,
      input.phone?.trim() || null,
      input.email?.trim() || null,
      input.address?.trim() || null,
      input.gst_number?.trim().toUpperCase() || null,
      input.logo ?? null,
      input.signature ?? null,
      input.stamp ?? null,
      now,
      COMPANY_ID
    );
  } else {
    await db.runAsync(
      `
        INSERT INTO companies (
          id,
          name,
          owner_name,
          phone,
          email,
          address,
          gst_number,
          logo,
          signature,
          stamp,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      COMPANY_ID,
      input.name.trim(),
      input.owner_name?.trim() || null,
      input.phone?.trim() || null,
      input.email?.trim() || null,
      input.address?.trim() || null,
      input.gst_number?.trim().toUpperCase() || null,
      input.logo ?? null,
      input.signature ?? null,
      input.stamp ?? null,
      now,
      now
    );
  }

  const company = await getCompany(db);

  if (!company) {
    throw new Error(
      "Company could not be saved"
    );
  }

  return company;
}