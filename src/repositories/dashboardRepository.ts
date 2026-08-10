import { SQLiteDatabase } from "expo-sqlite";

import {
  DashboardActivity,
  DashboardSummary,
} from "@/src/types/dashboard";

export async function getDashboardSummary(
  db: SQLiteDatabase,
  date: string,
  month: string
): Promise<DashboardSummary> {
  const workers = await db.getFirstAsync<{
    total_workers: number;
    active_workers: number;
  }>(`
    SELECT
      COUNT(*) AS total_workers,

      SUM(
        CASE
          WHEN status = 'active' THEN 1
          ELSE 0
        END
      ) AS active_workers

    FROM workers
  `);

  const sites = await db.getFirstAsync<{
    active_sites: number;
  }>(`
    SELECT
      COUNT(*) AS active_sites

    FROM sites

    WHERE status = 'active'
  `);

  const attendance = await db.getFirstAsync<{
    present_count: number;
    absent_count: number;
    half_day_count: number;
    leave_count: number;
  }>(
    `
    SELECT
      SUM(
        CASE
          WHEN status = 'present' THEN 1
          ELSE 0
        END
      ) AS present_count,

      SUM(
        CASE
          WHEN status = 'absent' THEN 1
          ELSE 0
        END
      ) AS absent_count,

      SUM(
        CASE
          WHEN status = 'half_day' THEN 1
          ELSE 0
        END
      ) AS half_day_count,

      SUM(
        CASE
          WHEN status = 'leave' THEN 1
          ELSE 0
        END
      ) AS leave_count

    FROM attendance

    WHERE attendance_date = ?
    `,
    date
  );

  const payment = await db.getFirstAsync<{
    total_payable: number;
    total_paid: number;
  }>(
    `
    SELECT
      COALESCE(
        SUM(payments.final_amount),
        0
      ) AS total_payable,

      COALESCE(
        (
          SELECT SUM(payment_entries.amount)

          FROM payment_entries

          INNER JOIN payments AS p
          ON p.id = payment_entries.payment_id

          WHERE p.payment_month = ?
        ),
        0
      ) AS total_paid

    FROM payments

    WHERE payments.payment_month = ?
    `,
    month,
    month
  );

  const monthlyPayable =
    payment?.total_payable ?? 0;

  const monthlyPaid =
    payment?.total_paid ?? 0;

  return {
    totalWorkers: workers?.total_workers ?? 0,

    activeWorkers:
      workers?.active_workers ?? 0,

    activeSites: sites?.active_sites ?? 0,

    todayPresent:
      attendance?.present_count ?? 0,

    todayAbsent:
      attendance?.absent_count ?? 0,

    todayHalfDay:
      attendance?.half_day_count ?? 0,

    todayLeave:
      attendance?.leave_count ?? 0,

    monthlyPayable,

    monthlyPaid,

    monthlyPending: Math.max(
      monthlyPayable - monthlyPaid,
      0
    ),
  };
}
export async function getDashboardActivities(
  db: SQLiteDatabase,
  limit?: number
): Promise<DashboardActivity[]> {
  const limitQuery = limit
    ? `LIMIT ${Number(limit)}`
    : "";

  return db.getAllAsync<DashboardActivity>(
    `
    SELECT *
    FROM (
      SELECT
        attendance.id AS id,
        'attendance' AS type,
        workers.name AS title,

        CASE
          WHEN attendance.status = 'present'
            THEN 'Marked Present'
          WHEN attendance.status = 'absent'
            THEN 'Marked Absent'
          WHEN attendance.status = 'half_day'
            THEN 'Marked Half Day'
          ELSE 'Marked Leave'
        END AS description,

        attendance.amount AS amount,
        attendance.attendance_date AS date,
        attendance.created_at AS created_at

      FROM attendance

      INNER JOIN workers
      ON workers.id = attendance.worker_id


      UNION ALL


      SELECT
        advances.id AS id,
        'advance' AS type,
        workers.name AS title,
        'Advance Given' AS description,
        advances.amount AS amount,
        advances.advance_date AS date,
        advances.created_at AS created_at

      FROM advances

      INNER JOIN workers
      ON workers.id = advances.worker_id


      UNION ALL


      SELECT
        payment_entries.id AS id,
        'payment' AS type,
        workers.name AS title,
        'Payment Recorded' AS description,
        payment_entries.amount AS amount,
        payment_entries.payment_date AS date,
        payment_entries.created_at AS created_at

      FROM payment_entries

      INNER JOIN workers
      ON workers.id = payment_entries.worker_id
    )

    ORDER BY created_at DESC

    ${limitQuery}
    `
  );
}

export async function getDashboardActivityCount(
  db: SQLiteDatabase
): Promise<number> {
  const result = await db.getFirstAsync<{
    total: number;
  }>(`
    SELECT
      (
        SELECT COUNT(*)
        FROM attendance
      )
      +
      (
        SELECT COUNT(*)
        FROM advances
      )
      +
      (
        SELECT COUNT(*)
        FROM payment_entries
      )
      AS total
  `);

  return result?.total ?? 0;
}