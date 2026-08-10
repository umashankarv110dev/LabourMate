import { SQLiteDatabase } from "expo-sqlite";

import {
  AdvanceReportSummary,
  AdvanceReportTransaction,
  AdvanceWorkerReport,
  AttendanceReportDetail,
  AttendanceReportItem,
  PaymentReportSummary,
  PaymentReportTransaction,
  PaymentWorkerReport,
  ReportSummary,
  SiteCostReport,
  WorkerAdvanceReportItem,
  WorkerPaymentReportItem,
  WorkerReportSummary,
  WorkerWageDetail,
  SiteLabourCostSummary,
  SiteLabourCostItem,
  SiteWorkerCostItem,
} from "@/src/types/report";

function getMonthRange(month: string) {
  return {
    startDate: `${month}-01`,
    endDate: `${month}-31`,
  };
}

export async function getReportSummary(
  db: SQLiteDatabase,
  month: string
): Promise<ReportSummary> {
  const { startDate, endDate } =
    getMonthRange(month);

  const workerResult =
    await db.getFirstAsync<{
      total_workers: number;
    }>(`
      SELECT COUNT(*) AS total_workers
      FROM workers
    `);

  const siteResult =
    await db.getFirstAsync<{
      total_sites: number;
    }>(`
      SELECT COUNT(*) AS total_sites
      FROM sites
    `);

  const attendanceResult =
    await db.getFirstAsync<{
      present_count: number;
      absent_count: number;
      half_day_count: number;
      leave_count: number;
      working_amount: number;
    }>(
      `
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN status = 'present'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS present_count,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'absent'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS absent_count,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'half_day'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS half_day_count,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'leave'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS leave_count,

        COALESCE(
          SUM(amount),
          0
        ) AS working_amount

      FROM attendance

      WHERE attendance_date
      BETWEEN ? AND ?
      `,
      startDate,
      endDate
    );

  const advanceResult =
    await db.getFirstAsync<{
      advance_amount: number;
    }>(
      `
      SELECT
        COALESCE(
          SUM(amount),
          0
        ) AS advance_amount

      FROM advances

      WHERE advance_date
      BETWEEN ? AND ?
      `,
      startDate,
      endDate
    );

  const paymentResult =
    await db.getFirstAsync<{
      payable_amount: number;
    }>(
      `
      SELECT
        COALESCE(
          SUM(final_amount),
          0
        ) AS payable_amount

      FROM payments

      WHERE payment_month = ?
      `,
      month
    );

  const paidResult =
    await db.getFirstAsync<{
      paid_amount: number;
    }>(
      `
      SELECT
        COALESCE(
          SUM(payment_entries.amount),
          0
        ) AS paid_amount

      FROM payment_entries

      INNER JOIN payments
      ON payments.id =
        payment_entries.payment_id

      WHERE payments.payment_month = ?
      `,
      month
    );

  const payableAmount =
    paymentResult?.payable_amount ?? 0;

  const paidAmount =
    paidResult?.paid_amount ?? 0;

  return {
    totalWorkers:
      workerResult?.total_workers ?? 0,

    totalSites:
      siteResult?.total_sites ?? 0,

    presentCount:
      attendanceResult?.present_count ?? 0,

    absentCount:
      attendanceResult?.absent_count ?? 0,

    halfDayCount:
      attendanceResult?.half_day_count ?? 0,

    leaveCount:
      attendanceResult?.leave_count ?? 0,

    workingAmount:
      attendanceResult?.working_amount ?? 0,

    advanceAmount:
      advanceResult?.advance_amount ?? 0,

    payableAmount,

    paidAmount,

    pendingAmount: Math.max(
      payableAmount - paidAmount,
      0
    ),
  };
}

export async function getSiteCostReport(
  db: SQLiteDatabase,
  month: string
): Promise<SiteCostReport[]> {
  const { startDate, endDate } =
    getMonthRange(month);

  return db.getAllAsync<SiteCostReport>(
    `
    SELECT
      sites.id AS site_id,

      sites.name AS site_name,

      COUNT(
        DISTINCT attendance.worker_id
      ) AS worker_count,

      COUNT(attendance.id)
      AS attendance_count,

      COALESCE(
        SUM(attendance.amount),
        0
      ) AS labour_cost

    FROM sites

    LEFT JOIN attendance
    ON attendance.site_id = sites.id
    AND attendance.attendance_date
      BETWEEN ? AND ?

    GROUP BY
      sites.id,
      sites.name

    ORDER BY labour_cost DESC
    `,
    startDate,
    endDate
  );
}

export async function getWorkerReportSummary(
  db: SQLiteDatabase,
  month: string
): Promise<WorkerReportSummary[]> {
  const { startDate, endDate } =
    getMonthRange(month);

  return db.getAllAsync<WorkerReportSummary>(
    `
    SELECT
      workers.id AS worker_id,

      workers.name AS worker_name,

      workers.worker_type AS worker_type,

      sites.name AS site_name,

      COALESCE(
        SUM(
          CASE
            WHEN attendance.status = 'present'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS present_count,

      COALESCE(
        SUM(
          CASE
            WHEN attendance.status = 'absent'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS absent_count,

      COALESCE(
        SUM(
          CASE
            WHEN attendance.status = 'half_day'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS half_day_count,

      COALESCE(
        SUM(
          CASE
            WHEN attendance.status = 'leave'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS leave_count,

      COALESCE(
        SUM(attendance.amount),
        0
      ) AS working_amount,

      COALESCE(
        (
          SELECT SUM(advances.amount)

          FROM advances

          WHERE advances.worker_id =
            workers.id

          AND advances.advance_date
            BETWEEN ? AND ?
        ),
        0
      ) AS advance_amount,

      COALESCE(
        payments.final_amount,
        0
      ) AS payable_amount,

      COALESCE(
        (
          SELECT SUM(payment_entries.amount)

          FROM payment_entries

          WHERE payment_entries.payment_id =
            payments.id
        ),
        0
      ) AS paid_amount,

      MAX(
        COALESCE(payments.final_amount, 0)
        -
        COALESCE(
          (
            SELECT SUM(payment_entries.amount)

            FROM payment_entries

            WHERE payment_entries.payment_id =
              payments.id
          ),
          0
        ),
        0
      ) AS pending_amount

    FROM workers

    LEFT JOIN sites
    ON sites.id = workers.site_id

    LEFT JOIN attendance
    ON attendance.worker_id = workers.id

    AND attendance.attendance_date
      BETWEEN ? AND ?

    LEFT JOIN payments
    ON payments.worker_id = workers.id

    AND payments.payment_month = ?

    GROUP BY
      workers.id,
      workers.name,
      workers.worker_type,
      sites.name,
      payments.id

    ORDER BY workers.name ASC
    `,
    startDate,
    endDate,
    startDate,
    endDate,
    month
  );
}

export async function getAttendanceReport(
  db: SQLiteDatabase,
  month: string
): Promise<AttendanceReportItem[]> {
  const { startDate, endDate } =
    getMonthRange(month);

  return db.getAllAsync<AttendanceReportItem>(
    `
    SELECT
      workers.id AS worker_id,
      workers.name AS worker_name,
      workers.worker_type AS worker_type,
      sites.name AS site_name,

      COALESCE(
        SUM(
          CASE
            WHEN attendance.status = 'present'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS present_count,

      COALESCE(
        SUM(
          CASE
            WHEN attendance.status = 'absent'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS absent_count,

      COALESCE(
        SUM(
          CASE
            WHEN attendance.status = 'half_day'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS half_day_count,

      COALESCE(
        SUM(
          CASE
            WHEN attendance.status = 'leave'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS leave_count,

      COUNT(attendance.id) AS total_days,

      COALESCE(
        SUM(attendance.amount),
        0
      ) AS working_amount

    FROM workers

    LEFT JOIN sites
    ON sites.id = workers.site_id

    LEFT JOIN attendance
    ON attendance.worker_id = workers.id
    AND attendance.attendance_date
      BETWEEN ? AND ?

    GROUP BY
      workers.id,
      workers.name,
      workers.worker_type,
      sites.name

    ORDER BY workers.name ASC
    `,
    startDate,
    endDate
  );
}

export async function getWorkerAttendanceReportDetail(
  db: SQLiteDatabase,
  workerId: string,
  month: string
): Promise<AttendanceReportDetail[]> {
  const { startDate, endDate } =
    getMonthRange(month);

  return db.getAllAsync<AttendanceReportDetail>(
    `
    SELECT
      attendance.id,
      attendance.attendance_date,
      attendance.status,
      attendance.amount,
      attendance.note,
      sites.name AS site_name

    FROM attendance

    LEFT JOIN sites
    ON sites.id = attendance.site_id

    WHERE attendance.worker_id = ?

    AND attendance.attendance_date
      BETWEEN ? AND ?

    ORDER BY attendance.attendance_date DESC
    `,
    workerId,
    startDate,
    endDate
  );
}

export async function getWorkerWageDetail(
  db: SQLiteDatabase,
  workerId: string,
  month: string
): Promise<WorkerWageDetail | null> {
  const { startDate, endDate } =
    getMonthRange(month);

  return db.getFirstAsync<WorkerWageDetail>(
    `
    SELECT
      workers.id AS worker_id,
      workers.name AS worker_name,
      workers.worker_type AS worker_type,
      sites.name AS site_name,

      COALESCE(
        (
          SELECT COUNT(*)
          FROM attendance
          WHERE attendance.worker_id = workers.id
          AND attendance.attendance_date
            BETWEEN ? AND ?
          AND attendance.status = 'present'
        ),
        0
      ) AS present_count,

      COALESCE(
        (
          SELECT COUNT(*)
          FROM attendance
          WHERE attendance.worker_id = workers.id
          AND attendance.attendance_date
            BETWEEN ? AND ?
          AND attendance.status = 'absent'
        ),
        0
      ) AS absent_count,

      COALESCE(
        (
          SELECT COUNT(*)
          FROM attendance
          WHERE attendance.worker_id = workers.id
          AND attendance.attendance_date
            BETWEEN ? AND ?
          AND attendance.status = 'half_day'
        ),
        0
      ) AS half_day_count,

      COALESCE(
        (
          SELECT COUNT(*)
          FROM attendance
          WHERE attendance.worker_id = workers.id
          AND attendance.attendance_date
            BETWEEN ? AND ?
          AND attendance.status = 'leave'
        ),
        0
      ) AS leave_count,

      COALESCE(
        (
          SELECT SUM(attendance.amount)
          FROM attendance
          WHERE attendance.worker_id = workers.id
          AND attendance.attendance_date
            BETWEEN ? AND ?
        ),
        0
      ) AS working_amount,

      COALESCE(
        (
          SELECT SUM(advances.amount)
          FROM advances
          WHERE advances.worker_id = workers.id
          AND advances.advance_date
            BETWEEN ? AND ?
        ),
        0
      ) AS advance_amount,

      COALESCE(payments.bonus, 0)
        AS bonus,

      COALESCE(payments.deduction, 0)
        AS deduction,

      COALESCE(payments.final_amount, 0)
        AS final_amount,

      COALESCE(
        (
          SELECT SUM(payment_entries.amount)
          FROM payment_entries
          WHERE payment_entries.payment_id =
            payments.id
        ),
        0
      ) AS paid_amount,

      MAX(
        COALESCE(payments.final_amount, 0)
        -
        COALESCE(
          (
            SELECT SUM(payment_entries.amount)
            FROM payment_entries
            WHERE payment_entries.payment_id =
              payments.id
          ),
          0
        ),
        0
      ) AS pending_amount,

      payments.status AS payment_status

    FROM workers

    LEFT JOIN sites
    ON sites.id = workers.site_id

    LEFT JOIN payments
    ON payments.worker_id = workers.id
    AND payments.payment_month = ?

    WHERE workers.id = ?
    `,
    startDate,
    endDate,
    startDate,
    endDate,
    startDate,
    endDate,
    startDate,
    endDate,
    startDate,
    endDate,
    startDate,
    endDate,
    month,
    workerId
  );
}

export async function getWorkerAdvanceReportHistory(
  db: SQLiteDatabase,
  workerId: string,
  month: string
): Promise<WorkerAdvanceReportItem[]> {
  const { startDate, endDate } =
    getMonthRange(month);

  return db.getAllAsync<WorkerAdvanceReportItem>(
    `
    SELECT
      id,
      amount,
      advance_date,
      payment_mode,
      note

    FROM advances

    WHERE worker_id = ?

    AND advance_date
      BETWEEN ? AND ?

    ORDER BY advance_date DESC
    `,
    workerId,
    startDate,
    endDate
  );
}

export async function getWorkerPaymentReportHistory(
  db: SQLiteDatabase,
  workerId: string,
  month: string
): Promise<WorkerPaymentReportItem[]> {
  return db.getAllAsync<WorkerPaymentReportItem>(
    `
    SELECT
      payment_entries.id,
      payment_entries.amount,
      payment_entries.payment_date,
      payment_entries.payment_mode,
      payment_entries.note

    FROM payment_entries

    INNER JOIN payments
    ON payments.id =
      payment_entries.payment_id

    WHERE payments.worker_id = ?

    AND payments.payment_month = ?

    ORDER BY
      payment_entries.payment_date DESC,
      payment_entries.created_at DESC
    `,
    workerId,
    month
  );
}

export async function getPaymentReportSummary(
  db: SQLiteDatabase,
  month: string
): Promise<PaymentReportSummary> {
  const paymentSummary =
    await db.getFirstAsync<{
      total_payable: number;
      paid_workers: number;
      pending_workers: number;
    }>(
      `
      SELECT
        COALESCE(
          SUM(final_amount),
          0
        ) AS total_payable,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'paid'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS paid_workers,

        COALESCE(
          SUM(
            CASE
              WHEN status != 'paid'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS pending_workers

      FROM payments

      WHERE payment_month = ?
      `,
      month
    );

  const entrySummary =
    await db.getFirstAsync<{
      total_paid: number;
      cash_amount: number;
      upi_amount: number;
      bank_amount: number;
      transaction_count: number;
    }>(
      `
      SELECT
        COALESCE(
          SUM(payment_entries.amount),
          0
        ) AS total_paid,

        COALESCE(
          SUM(
            CASE
              WHEN LOWER(payment_entries.payment_mode)
                = 'cash'
              THEN payment_entries.amount
              ELSE 0
            END
          ),
          0
        ) AS cash_amount,

        COALESCE(
          SUM(
            CASE
              WHEN LOWER(payment_entries.payment_mode)
                = 'upi'
              THEN payment_entries.amount
              ELSE 0
            END
          ),
          0
        ) AS upi_amount,

        COALESCE(
          SUM(
            CASE
              WHEN LOWER(payment_entries.payment_mode)
                IN ('bank', 'bank_transfer')
              THEN payment_entries.amount
              ELSE 0
            END
          ),
          0
        ) AS bank_amount,

        COUNT(payment_entries.id)
          AS transaction_count

      FROM payment_entries

      INNER JOIN payments
      ON payments.id =
        payment_entries.payment_id

      WHERE payments.payment_month = ?
      `,
      month
    );

  const totalPayable = Number(
    paymentSummary?.total_payable ?? 0
  );

  const totalPaid = Number(
    entrySummary?.total_paid ?? 0
  );

  return {
    total_payable: totalPayable,

    total_paid: totalPaid,

    total_pending: Math.max(
      totalPayable - totalPaid,
      0
    ),

    paid_workers: Number(
      paymentSummary?.paid_workers ?? 0
    ),

    pending_workers: Number(
      paymentSummary?.pending_workers ?? 0
    ),

    cash_amount: Number(
      entrySummary?.cash_amount ?? 0
    ),

    upi_amount: Number(
      entrySummary?.upi_amount ?? 0
    ),

    bank_amount: Number(
      entrySummary?.bank_amount ?? 0
    ),

    transaction_count: Number(
      entrySummary?.transaction_count ?? 0
    ),
  };
}

export async function getPaymentWorkerReport(
  db: SQLiteDatabase,
  month: string
): Promise<PaymentWorkerReport[]> {
  return db.getAllAsync<PaymentWorkerReport>(
    `
    SELECT
      payments.id AS payment_id,

      workers.id AS worker_id,
      workers.name AS worker_name,
      workers.worker_type AS worker_type,

      sites.name AS site_name,

      payments.final_amount,

      COALESCE(
        SUM(payment_entries.amount),
        0
      ) AS paid_amount,

      MAX(
        payments.final_amount
        -
        COALESCE(
          SUM(payment_entries.amount),
          0
        ),
        0
      ) AS pending_amount,

      payments.status AS payment_status

    FROM payments

    INNER JOIN workers
    ON workers.id = payments.worker_id

    LEFT JOIN sites
    ON sites.id = workers.site_id

    LEFT JOIN payment_entries
    ON payment_entries.payment_id =
      payments.id

    WHERE payments.payment_month = ?

    GROUP BY
      payments.id,
      workers.id,
      workers.name,
      workers.worker_type,
      sites.name

    ORDER BY pending_amount DESC
    `,
    month
  );
}

export async function getPaymentReportTransactions(
  db: SQLiteDatabase,
  month: string
): Promise<PaymentReportTransaction[]> {
  return db.getAllAsync<PaymentReportTransaction>(
    `
    SELECT
      payment_entries.id,
      payment_entries.payment_id,

      workers.id AS worker_id,
      workers.name AS worker_name,

      payment_entries.amount,
      payment_entries.payment_date,
      payment_entries.payment_mode,
      payment_entries.note

    FROM payment_entries

    INNER JOIN payments
    ON payments.id =
      payment_entries.payment_id

    INNER JOIN workers
    ON workers.id =
      payments.worker_id

    WHERE payments.payment_month = ?

    ORDER BY
      payment_entries.payment_date DESC,
      payment_entries.created_at DESC
    `,
    month
  );
}

export async function getAdvanceReportSummary(
  db: SQLiteDatabase,
  month: string
): Promise<AdvanceReportSummary> {
  const { startDate, endDate } =
    getMonthRange(month);

  const result =
    await db.getFirstAsync<AdvanceReportSummary>(
      `
      SELECT
        COALESCE(SUM(amount), 0)
          AS total_amount,

        COUNT(id)
          AS total_transactions,

        COUNT(DISTINCT worker_id)
          AS worker_count,

        COALESCE(
          SUM(
            CASE
              WHEN LOWER(payment_mode) = 'cash'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS cash_amount,

        COALESCE(
          SUM(
            CASE
              WHEN LOWER(payment_mode) = 'upi'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS upi_amount,

        COALESCE(
          SUM(
            CASE
              WHEN LOWER(payment_mode)
                IN ('bank', 'bank_transfer')
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS bank_amount

      FROM advances

      WHERE advance_date
        BETWEEN ? AND ?
      `,
      startDate,
      endDate
    );

  return {
    total_amount:
      Number(result?.total_amount ?? 0),

    total_transactions:
      Number(result?.total_transactions ?? 0),

    worker_count:
      Number(result?.worker_count ?? 0),

    cash_amount:
      Number(result?.cash_amount ?? 0),

    upi_amount:
      Number(result?.upi_amount ?? 0),

    bank_amount:
      Number(result?.bank_amount ?? 0),
  };
}

export async function getAdvanceWorkerReport(
  db: SQLiteDatabase,
  month: string
): Promise<AdvanceWorkerReport[]> {
  const { startDate, endDate } =
    getMonthRange(month);

  return db.getAllAsync<AdvanceWorkerReport>(
    `
    SELECT
      workers.id AS worker_id,
      workers.name AS worker_name,
      workers.worker_type AS worker_type,
      sites.name AS site_name,

      COALESCE(SUM(advances.amount), 0)
        AS total_advance,

      COUNT(advances.id)
        AS transaction_count,

      MAX(advances.advance_date)
        AS last_advance_date

    FROM advances

    INNER JOIN workers
    ON workers.id = advances.worker_id

    LEFT JOIN sites
    ON sites.id = workers.site_id

    WHERE advances.advance_date
      BETWEEN ? AND ?

    GROUP BY
      workers.id,
      workers.name,
      workers.worker_type,
      sites.name

    ORDER BY total_advance DESC
    `,
    startDate,
    endDate
  );
}

export async function getAdvanceReportTransactions(
  db: SQLiteDatabase,
  month: string
): Promise<AdvanceReportTransaction[]> {
  const { startDate, endDate } =
    getMonthRange(month);

  return db.getAllAsync<AdvanceReportTransaction>(
    `
    SELECT
      advances.id,
      advances.worker_id,
      workers.name AS worker_name,
      workers.worker_type AS worker_type,
      sites.name AS site_name,
      advances.amount,
      advances.advance_date,
      advances.payment_mode,
      advances.note

    FROM advances

    INNER JOIN workers
    ON workers.id = advances.worker_id

    LEFT JOIN sites
    ON sites.id = workers.site_id

    WHERE advances.advance_date
      BETWEEN ? AND ?

    ORDER BY
      advances.advance_date DESC,
      advances.created_at DESC
    `,
    startDate,
    endDate
  );
}

export async function getSiteLabourCostSummary(
  db: SQLiteDatabase,
  month: string
): Promise<SiteLabourCostSummary> {
  const { startDate, endDate } =
    getMonthRange(month);

  const result = await db.getFirstAsync<{
    total_cost: number;
    total_sites: number;
    total_workers: number;
    attendance_count: number;
  }>(
    `
    SELECT
      COALESCE(SUM(amount), 0) AS total_cost,

      COUNT(DISTINCT site_id) AS total_sites,

      COUNT(DISTINCT worker_id) AS total_workers,

      COUNT(id) AS attendance_count

    FROM attendance

    WHERE attendance_date BETWEEN ? AND ?

    AND site_id IS NOT NULL
    `,
    startDate,
    endDate
  );

  const totalCost = Number(
    result?.total_cost ?? 0
  );

  const totalSites = Number(
    result?.total_sites ?? 0
  );

  return {
    total_cost: totalCost,

    total_sites: totalSites,

    total_workers: Number(
      result?.total_workers ?? 0
    ),

    attendance_count: Number(
      result?.attendance_count ?? 0
    ),

    average_cost_per_site:
      totalSites > 0
        ? totalCost / totalSites
        : 0,
  };
}

export async function getSiteLabourCostReport(
  db: SQLiteDatabase,
  month: string
): Promise<SiteLabourCostItem[]> {
  const { startDate, endDate } =
    getMonthRange(month);

  const totalResult =
    await db.getFirstAsync<{
      total_cost: number;
    }>(
      `
      SELECT
        COALESCE(SUM(amount), 0)
          AS total_cost

      FROM attendance

      WHERE attendance_date
        BETWEEN ? AND ?
      `,
      startDate,
      endDate
    );

  const totalCost = Number(
    totalResult?.total_cost ?? 0
  );

  const sites =
    await db.getAllAsync<
      Omit<
        SiteLabourCostItem,
        "cost_percentage"
      >
    >(
      `
      SELECT
        sites.id AS site_id,
        sites.name AS site_name,
        sites.address AS site_address,

        COUNT(
          DISTINCT attendance.worker_id
        ) AS worker_count,

        COUNT(attendance.id)
          AS attendance_count,

        COALESCE(
          SUM(
            CASE
              WHEN attendance.status = 'present'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS present_count,

        COALESCE(
          SUM(
            CASE
              WHEN attendance.status = 'half_day'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS half_day_count,

        COALESCE(
          SUM(attendance.amount),
          0
        ) AS labour_cost,

        COALESCE(
          (
            SELECT SUM(advances.amount)

            FROM advances

            INNER JOIN workers advance_workers
            ON advance_workers.id =
              advances.worker_id

            WHERE advance_workers.site_id =
              sites.id

            AND advances.advance_date
              BETWEEN ? AND ?
          ),
          0
        ) AS advance_amount,

        COALESCE(
          (
            SELECT SUM(payment_entries.amount)

            FROM payment_entries

            INNER JOIN payments
            ON payments.id =
              payment_entries.payment_id

            INNER JOIN workers payment_workers
            ON payment_workers.id =
              payments.worker_id

            WHERE payment_workers.site_id =
              sites.id

            AND payments.payment_month = ?
          ),
          0
        ) AS paid_amount

      FROM sites

      INNER JOIN attendance
      ON attendance.site_id = sites.id

      AND attendance.attendance_date
        BETWEEN ? AND ?

      GROUP BY
        sites.id,
        sites.name,
        sites.address

      ORDER BY labour_cost DESC
      `,
      startDate,
      endDate,
      month,
      startDate,
      endDate
    );

  return sites.map((site) => {
    const labourCost = Number(
      site.labour_cost ?? 0
    );

    return {
      ...site,

      worker_count: Number(
        site.worker_count ?? 0
      ),

      attendance_count: Number(
        site.attendance_count ?? 0
      ),

      present_count: Number(
        site.present_count ?? 0
      ),

      half_day_count: Number(
        site.half_day_count ?? 0
      ),

      labour_cost: labourCost,

      advance_amount: Number(
        site.advance_amount ?? 0
      ),

      paid_amount: Number(
        site.paid_amount ?? 0
      ),

      cost_percentage:
        totalCost > 0
          ? (labourCost / totalCost) * 100
          : 0,
    };
  });
}

export async function getSiteWorkerCostReport(
  db: SQLiteDatabase,
  siteId: string,
  month: string
): Promise<SiteWorkerCostItem[]> {
  const { startDate, endDate } =
    getMonthRange(month);

  return db.getAllAsync<SiteWorkerCostItem>(
    `
    SELECT
      workers.id AS worker_id,
      workers.name AS worker_name,
      workers.worker_type AS worker_type,

      COALESCE(
        SUM(
          CASE
            WHEN attendance.status = 'present'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS present_count,

      COALESCE(
        SUM(
          CASE
            WHEN attendance.status = 'half_day'
            THEN 1
            ELSE 0
          END
        ),
        0
      ) AS half_day_count,

      COALESCE(
        SUM(attendance.amount),
        0
      ) AS working_amount,

      COALESCE(
        (
          SELECT SUM(advances.amount)

          FROM advances

          WHERE advances.worker_id =
            workers.id

          AND advances.advance_date
            BETWEEN ? AND ?
        ),
        0
      ) AS advance_amount

    FROM workers

    INNER JOIN attendance
    ON attendance.worker_id = workers.id

    WHERE attendance.site_id = ?

    AND attendance.attendance_date
      BETWEEN ? AND ?

    GROUP BY
      workers.id,
      workers.name,
      workers.worker_type

    ORDER BY working_amount DESC
    `,
    startDate,
    endDate,
    siteId,
    startDate,
    endDate
  );
}