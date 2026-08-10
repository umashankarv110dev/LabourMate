import { SQLiteDatabase } from "expo-sqlite";

import {
  AdvanceWithWorker,
  CreateAdvanceInput,
} from "@/src/types/advance";

import { generateId } from "@/src/utils/generateId";

export async function createAdvance(
  db: SQLiteDatabase,
  input: CreateAdvanceInput
) {
  const id = generateId("advance");

  const now = new Date().toISOString();

  await db.runAsync(
    `
    INSERT INTO advances (
      id,
      worker_id,
      amount,
      advance_date,
      note,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    id,
    input.workerId,
    input.amount,
    input.date,
    input.note || null,
    now,
    now
  );

  return id;
}

export async function getWorkerAdvances(
  db: SQLiteDatabase,
  workerId: string
) {
  return db.getAllAsync<AdvanceWithWorker>(
    `
    SELECT
      advances.*,
      workers.name AS worker_name,
      workers.worker_type,
      sites.name AS site_name

    FROM advances

    INNER JOIN workers
      ON workers.id = advances.worker_id

    LEFT JOIN sites
      ON sites.id = workers.site_id

    WHERE advances.worker_id = ?

    ORDER BY
      advances.advance_date DESC,
      advances.created_at DESC
    `,
    workerId
  );
}

export async function getAdvanceById(
  db: SQLiteDatabase,
  id: string
) {
  return db.getFirstAsync<AdvanceWithWorker>(
    `
    SELECT
      advances.*,
      workers.name AS worker_name,
      workers.worker_type,
      sites.name AS site_name

    FROM advances

    INNER JOIN workers
      ON workers.id = advances.worker_id

    LEFT JOIN sites
      ON sites.id = workers.site_id

    WHERE advances.id = ?
    `,
    id
  );
}

export async function deleteAdvance(
  db: SQLiteDatabase,
  id: string
) {
  await db.runAsync(
    `
    DELETE FROM advances
    WHERE id = ?
    `,
    id
  );
}

export async function getWorkerAdvanceTotal(
  db: SQLiteDatabase,
  workerId: string
) {
  const result = await db.getFirstAsync<{
    total: number;
  }>(
    `
    SELECT
      COALESCE(SUM(amount), 0) AS total

    FROM advances

    WHERE worker_id = ?
    `,
    workerId
  );

  return result?.total ?? 0;
}