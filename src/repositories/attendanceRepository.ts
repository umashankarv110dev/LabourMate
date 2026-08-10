import { SQLiteDatabase } from "expo-sqlite";

import {
  AttendanceStatus,
  AttendanceWithWorker,
  AttendanceWorker,
} from "@/src/types/attendance";

import { generateId } from "@/src/utils/generateId";

export async function getAttendanceWorkers(
  db: SQLiteDatabase,
  date: string,
  siteId?: string
) {
  if (siteId) {
    return db.getAllAsync<AttendanceWorker>(
      `
      SELECT
        workers.id,
        workers.name,
        workers.worker_type,
        workers.payment_type,
        workers.wage,
        workers.site_id,
        sites.name AS site_name,
        attendance.status AS attendance_status,
        attendance.amount AS attendance_amount

      FROM workers

      LEFT JOIN sites
        ON sites.id = workers.site_id

      LEFT JOIN attendance
        ON attendance.worker_id = workers.id
        AND attendance.attendance_date = ?

      WHERE workers.status = 'active'
        AND workers.site_id = ?

      ORDER BY workers.name ASC
      `,
      date,
      siteId
    );
  }

  return db.getAllAsync<AttendanceWorker>(
    `
    SELECT
      workers.id,
      workers.name,
      workers.worker_type,
      workers.payment_type,
      workers.wage,
      workers.site_id,
      sites.name AS site_name,
      attendance.status AS attendance_status,
      attendance.amount AS attendance_amount

    FROM workers

    LEFT JOIN sites
      ON sites.id = workers.site_id

    LEFT JOIN attendance
      ON attendance.worker_id = workers.id
      AND attendance.attendance_date = ?

    WHERE workers.status = 'active'

    ORDER BY workers.name ASC
    `,
    date
  );
}

export function calculateAttendanceAmount(
  paymentType: "daily" | "monthly",
  wage: number,
  status: AttendanceStatus
) {
  if (paymentType === "monthly") {
    return 0;
  }

  switch (status) {
    case "present":
      return wage;

    case "half_day":
      return wage / 2;

    case "absent":
    case "leave":
      return 0;

    default:
      return 0;
  }
}

export async function saveAttendance(
  db: SQLiteDatabase,
  input: {
    workerId: string;
    siteId?: string | null;
    date: string;
    status: AttendanceStatus;
    amount: number;
    note?: string;
  }
) {
  const existing =
    await db.getFirstAsync<{ id: string }>(
      `
      SELECT id
      FROM attendance
      WHERE worker_id = ?
        AND attendance_date = ?
      `,
      input.workerId,
      input.date
    );

  const now = new Date().toISOString();

  if (existing) {
    await db.runAsync(
      `
      UPDATE attendance
      SET
        site_id = ?,
        status = ?,
        amount = ?,
        note = ?,
        updated_at = ?
      WHERE id = ?
      `,
      input.siteId || null,
      input.status,
      input.amount,
      input.note || null,
      now,
      existing.id
    );

    return existing.id;
  }

  const id = generateId("attendance");

  await db.runAsync(
    `
    INSERT INTO attendance (
      id,
      worker_id,
      site_id,
      attendance_date,
      status,
      amount,
      note,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    id,
    input.workerId,
    input.siteId || null,
    input.date,
    input.status,
    input.amount,
    input.note || null,
    now,
    now
  );

  return id;
}

export async function getAttendanceByDate(
  db: SQLiteDatabase,
  date: string
) {
  return db.getAllAsync<AttendanceWithWorker>(
    `
    SELECT
      attendance.*,
      workers.name AS worker_name,
      workers.worker_type,
      workers.payment_type,
      workers.wage,
      sites.name AS site_name

    FROM attendance

    INNER JOIN workers
      ON workers.id = attendance.worker_id

    LEFT JOIN sites
      ON sites.id = attendance.site_id

    WHERE attendance.attendance_date = ?

    ORDER BY workers.name ASC
    `,
    date
  );
}

export type AttendanceDailySummary = {
  attendance_date: string;
  total_workers: number;
  present_count: number;
  absent_count: number;
  half_day_count: number;
  leave_count: number;
  total_amount: number;
};

export type WorkerMonthlyAttendanceSummary = {
  present_count: number;
  absent_count: number;
  half_day_count: number;
  leave_count: number;
  total_amount: number;
};

export async function getAttendanceDailySummary(
  db: SQLiteDatabase,
  siteId?: string
) {
  if (siteId) {
    return db.getAllAsync<AttendanceDailySummary>(
      `
      SELECT
        attendance_date,

        COUNT(*) AS total_workers,

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
        ) AS leave_count,

        COALESCE(SUM(amount), 0) AS total_amount

      FROM attendance

      WHERE site_id = ?

      GROUP BY attendance_date

      ORDER BY attendance_date DESC
      `,
      siteId
    );
  }

  return db.getAllAsync<AttendanceDailySummary>(
    `
    SELECT
      attendance_date,

      COUNT(*) AS total_workers,

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
      ) AS leave_count,

      COALESCE(SUM(amount), 0) AS total_amount

    FROM attendance

    GROUP BY attendance_date

    ORDER BY attendance_date DESC
    `
  );
}

export async function getWorkerMonthlyAttendanceSummary(
  db: SQLiteDatabase,
  workerId: string,
  month: string
) {
  const result =
    await db.getFirstAsync<WorkerMonthlyAttendanceSummary>(
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
        ) AS leave_count,

        COALESCE(SUM(amount), 0) AS total_amount

      FROM attendance

      WHERE worker_id = ?
        AND substr(attendance_date, 1, 7) = ?
      `,
      workerId,
      month
    );

  return {
    present_count: result?.present_count ?? 0,
    absent_count: result?.absent_count ?? 0,
    half_day_count: result?.half_day_count ?? 0,
    leave_count: result?.leave_count ?? 0,
    total_amount: result?.total_amount ?? 0,
  };
}

export async function getWorkerAttendance(
  db: SQLiteDatabase,
  workerId: string
) {
  return db.getAllAsync<AttendanceWithWorker>(
    `
    SELECT
      attendance.*,
      workers.name AS worker_name,
      workers.worker_type,
      workers.payment_type,
      workers.wage,
      sites.name AS site_name
    FROM attendance
    INNER JOIN workers
      ON workers.id = attendance.worker_id
    LEFT JOIN sites
      ON sites.id = attendance.site_id
    WHERE attendance.worker_id = ?
    ORDER BY attendance.attendance_date DESC
    `,
    workerId
  );
}