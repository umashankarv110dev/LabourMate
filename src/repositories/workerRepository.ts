import { SQLiteDatabase } from "expo-sqlite";

import {
  CreateWorkerInput,
  WorkerWithSite,
} from "@/src/types/worker";

import { generateId } from "@/src/utils/generateId";

export async function createWorker(
  db: SQLiteDatabase,
  input: CreateWorkerInput
) {
  const id = generateId("worker");
  const now = new Date().toISOString();

  await db.runAsync(
    `
    INSERT INTO workers (
      id,
      name,
      phone,
      photo,
      worker_type,
      payment_type,
      wage,
      site_id,
      joining_date,
      address,
      status,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    id,
    input.name.trim(),
    input.phone?.trim() || null,
    input.photo || null,
    input.workerType,
    input.paymentType,
    input.wage,
    input.siteId || null,
    input.joiningDate || null,
    input.address?.trim() || null,
    "active",
    now,
    now
  );

  return id;
}

export async function getWorkerById(
  db: SQLiteDatabase,
  id: string
) {
  return db.getFirstAsync<WorkerWithSite>(
    `
    SELECT
      workers.*,
      sites.name AS site_name
    FROM workers
    LEFT JOIN sites
      ON sites.id = workers.site_id
    WHERE workers.id = ?
    `,
    id
  );
}


export async function getWorkers(
  db: SQLiteDatabase
) {
  return db.getAllAsync<WorkerWithSite>(
    `
    SELECT
      workers.*,
      sites.name AS site_name
    FROM workers
    LEFT JOIN sites
      ON sites.id = workers.site_id
    ORDER BY workers.created_at DESC
    `
  );
}


export async function updateWorker(
  db: SQLiteDatabase,
  id: string,
  input: CreateWorkerInput
) {
  const now = new Date().toISOString();

  await db.runAsync(
    `
    UPDATE workers
    SET
      name = ?,
      phone = ?,
      photo = ?,
      worker_type = ?,
      payment_type = ?,
      wage = ?,
      site_id = ?,
      joining_date = ?,
      address = ?,
      updated_at = ?
    WHERE id = ?
    `,
    input.name.trim(),
    input.phone?.trim() || null,
    input.photo || null,
    input.workerType,
    input.paymentType,
    input.wage,
    input.siteId || null,
    input.joiningDate || null,
    input.address?.trim() || null,
    now,
    id
  );
}

export async function updateWorkerStatus(
  db: SQLiteDatabase,
  id: string,
  status: "active" | "inactive"
) {
  const now = new Date().toISOString();

  await db.runAsync(
    `
    UPDATE workers
    SET
      status = ?,
      updated_at = ?
    WHERE id = ?
    `,
    status,
    now,
    id
  );
}

export async function deleteWorker(
  db: SQLiteDatabase,
  id: string
) {
  await db.runAsync(
    `
    DELETE FROM workers
    WHERE id = ?
    `,
    id
  );
}

export async function getWorkersBySiteId(
  db: SQLiteDatabase,
  siteId: string
) {
  return db.getAllAsync<WorkerWithSite>(
    `
    SELECT
      workers.*,
      sites.name AS site_name
    FROM workers
    LEFT JOIN sites
      ON sites.id = workers.site_id
    WHERE workers.site_id = ?
    ORDER BY workers.name ASC
    `,
    siteId
  );
}