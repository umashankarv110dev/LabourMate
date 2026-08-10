import { SQLiteDatabase } from "expo-sqlite";

import {
  PaymentEntry,
  PaymentMode,
  PaymentWithWorker,
} from "@/src/types/payment";

import { generateId } from "@/src/utils/generateId";

export async function calculateWorkerMonthlyEarnings(
  db: SQLiteDatabase,
  workerId: string,
  month: string
) {
  const worker = await db.getFirstAsync<{
    payment_type: "daily" | "monthly";
    wage: number;
  }>(
    `
    SELECT payment_type, wage
    FROM workers
    WHERE id = ?
    `,
    workerId
  );

  if (!worker) {
    return 0;
  }

  if (worker.payment_type === "daily") {
    const result = await db.getFirstAsync<{
      total: number;
    }>(
      `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM attendance
      WHERE worker_id = ?
      AND substr(attendance_date, 1, 7) = ?
      `,
      workerId,
      month
    );

    return result?.total ?? 0;
  }

  const attendance =
    await db.getFirstAsync<{
      total_days: number;
      payable_days: number;
    }>(
      `
      SELECT
        COUNT(*) AS total_days,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'present' THEN 1
              WHEN status = 'half_day' THEN 0.5
              ELSE 0
            END
          ),
          0
        ) AS payable_days

      FROM attendance

      WHERE worker_id = ?
      AND substr(attendance_date, 1, 7) = ?
      `,
      workerId,
      month
    );

  const totalDays = attendance?.total_days ?? 0;

  const payableDays =
    attendance?.payable_days ?? 0;

  if (totalDays === 0) {
    return 0;
  }

  const perDaySalary =
    worker.wage / totalDays;

  return perDaySalary * payableDays;
}

export async function getWorkerMonthlyAdvance(
  db: SQLiteDatabase,
  workerId: string,
  month: string
) {
  const result = await db.getFirstAsync<{
    total: number;
  }>(
    `
    SELECT COALESCE(SUM(amount), 0) AS total

    FROM advances

    WHERE worker_id = ?
    AND substr(advance_date, 1, 7) = ?
    `,
    workerId,
    month
  );

  return result?.total ?? 0;
}

export async function createOrUpdatePayment(
  db: SQLiteDatabase,
  input: {
    workerId: string;
    month: string;
    workingAmount: number;
    advanceAmount: number;
    bonus: number;
    deduction: number;
    finalAmount: number;
  }
) {
  const existing = await db.getFirstAsync<{
    id: string;
  }>(
    `
    SELECT id
    FROM payments
    WHERE worker_id = ?
    AND payment_month = ?
    `,
    input.workerId,
    input.month
  );

  const now = new Date().toISOString();

  if (existing) {
    await db.runAsync(
      `
      UPDATE payments

      SET
        working_amount = ?,
        advance_amount = ?,
        bonus = ?,
        deduction = ?,
        final_amount = ?,
        updated_at = ?

      WHERE id = ?
      `,
      input.workingAmount,
      input.advanceAmount,
      input.bonus,
      input.deduction,
      input.finalAmount,
      now,
      existing.id
    );

    return existing.id;
  }

  const id = generateId("payment");

  await db.runAsync(
    `
    INSERT INTO payments (
      id,
      worker_id,
      payment_month,
      working_amount,
      advance_amount,
      bonus,
      deduction,
      final_amount,
      status,
      created_at,
      updated_at
    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    id,
    input.workerId,
    input.month,
    input.workingAmount,
    input.advanceAmount,
    input.bonus,
    input.deduction,
    input.finalAmount,
    "pending",
    now,
    now
  );

  return id;
}

export async function addPaymentEntry(
  db: SQLiteDatabase,
  input: {
    paymentId: string;
    workerId: string;
    amount: number;
    date: string;
    mode: PaymentMode;
    note?: string;
  }
) {
  const id = generateId("payment_entry");

  const now = new Date().toISOString();

  await db.runAsync(
    `
    INSERT INTO payment_entries (
      id,
      payment_id,
      worker_id,
      amount,
      payment_date,
      payment_mode,
      note,
      created_at,
      updated_at
    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    id,
    input.paymentId,
    input.workerId,
    input.amount,
    input.date,
    input.mode,
    input.note || null,
    now,
    now
  );

  await updatePaymentStatus(
    db,
    input.paymentId
  );

  return id;
}

export async function updatePaymentStatus(
  db: SQLiteDatabase,
  paymentId: string
) {
  const payment = await db.getFirstAsync<{
    final_amount: number;
  }>(
    `
    SELECT final_amount
    FROM payments
    WHERE id = ?
    `,
    paymentId
  );

  const paid = await db.getFirstAsync<{
    total: number;
  }>(
    `
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM payment_entries
    WHERE payment_id = ?
    `,
    paymentId
  );

  const finalAmount =
    payment?.final_amount ?? 0;

  const paidAmount = paid?.total ?? 0;

  let status: "pending" | "partial" | "paid" =
    "pending";

  if (
    paidAmount > 0 &&
    paidAmount < finalAmount
  ) {
    status = "partial";
  }

  if (
    finalAmount > 0 &&
    paidAmount >= finalAmount
  ) {
    status = "paid";
  }

  await db.runAsync(
    `
    UPDATE payments

    SET
      status = ?,
      updated_at = ?

    WHERE id = ?
    `,
    status,
    new Date().toISOString(),
    paymentId
  );
}

export async function getPayments(
  db: SQLiteDatabase,
  month: string
) {
  return db.getAllAsync<PaymentWithWorker>(
    `
    SELECT
      payments.*,

      workers.name AS worker_name,
      workers.worker_type,
      workers.payment_type,
      workers.wage,

      sites.name AS site_name,

      COALESCE(
        SUM(payment_entries.amount),
        0
      ) AS paid_amount,

      MAX(
        payments.final_amount -
        COALESCE(
          (
            SELECT SUM(pe.amount)
            FROM payment_entries pe
            WHERE pe.payment_id = payments.id
          ),
          0
        ),
        0
      ) AS remaining_amount

    FROM payments

    INNER JOIN workers
    ON workers.id = payments.worker_id

    LEFT JOIN sites
    ON sites.id = workers.site_id

    LEFT JOIN payment_entries
    ON payment_entries.payment_id = payments.id

    WHERE payments.payment_month = ?

    GROUP BY payments.id

    ORDER BY workers.name ASC
    `,
    month
  );
}

export async function getPaymentById(
  db: SQLiteDatabase,
  id: string
) {
  return db.getFirstAsync<PaymentWithWorker>(
    `
    SELECT
      payments.*,

      workers.name AS worker_name,
      workers.worker_type,
      workers.payment_type,
      workers.wage,

      sites.name AS site_name,

      COALESCE(
        (
          SELECT SUM(amount)
          FROM payment_entries
          WHERE payment_id = payments.id
        ),
        0
      ) AS paid_amount,

      MAX(
        payments.final_amount -
        COALESCE(
          (
            SELECT SUM(amount)
            FROM payment_entries
            WHERE payment_id = payments.id
          ),
          0
        ),
        0
      ) AS remaining_amount

    FROM payments

    INNER JOIN workers
    ON workers.id = payments.worker_id

    LEFT JOIN sites
    ON sites.id = workers.site_id

    WHERE payments.id = ?
    `,
    id
  );
}

export async function getPaymentEntries(
  db: SQLiteDatabase,
  paymentId: string
) {
  return db.getAllAsync<PaymentEntry>(
    `
    SELECT *
    FROM payment_entries

    WHERE payment_id = ?

    ORDER BY
      payment_date DESC,
      created_at DESC
    `,
    paymentId
  );
}