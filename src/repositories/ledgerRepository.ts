import { SQLiteDatabase } from "expo-sqlite";

import {
  LedgerTransaction,
  WorkerLedgerSummary,
} from "@/src/types/ledger";

export async function getWorkerLedgerSummary(
  db: SQLiteDatabase,
  workerId: string
): Promise<WorkerLedgerSummary> {
  const earnings =
    await db.getFirstAsync<{
      total: number;
    }>(
      `
      SELECT
        COALESCE(SUM(amount), 0) AS total

      FROM attendance

      WHERE worker_id = ?
      `,
      workerId
    );

  const advances =
    await db.getFirstAsync<{
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

  const totalEarnings = earnings?.total ?? 0;

  const totalAdvance = advances?.total ?? 0;

  return {
    totalEarnings,
    totalAdvance,
    balance: totalEarnings - totalAdvance,
  };
}

export async function getWorkerLedgerTransactions(
  db: SQLiteDatabase,
  workerId: string
): Promise<LedgerTransaction[]> {
  return db.getAllAsync<LedgerTransaction>(
    `
    SELECT
      attendance.id AS id,
      attendance.attendance_date AS date,
      'earning' AS type,
      CASE
        WHEN attendance.status = 'present'
          THEN 'Full Day Work'

        WHEN attendance.status = 'half_day'
          THEN 'Half Day Work'

        WHEN attendance.status = 'absent'
          THEN 'Absent'

        ELSE 'Leave'
      END AS title,

      COALESCE(sites.name, 'No Site')
        AS description,

      attendance.amount AS amount

    FROM attendance

    LEFT JOIN sites
      ON sites.id = attendance.site_id

    WHERE attendance.worker_id = ?
      AND attendance.amount > 0

    UNION ALL

    SELECT
      advances.id AS id,
      advances.advance_date AS date,
      'advance' AS type,
      'Advance Given' AS title,

      COALESCE(
        advances.note,
        'Worker advance'
      ) AS description,

      advances.amount AS amount

    FROM advances

    WHERE advances.worker_id = ?

    ORDER BY date DESC
    `,
    workerId,
    workerId
  );
}