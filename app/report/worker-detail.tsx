import { Ionicons } from "@expo/vector-icons";

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import { useSQLiteContext } from "expo-sqlite";

import {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

import {
  getWorkerAdvanceReportHistory,
  getWorkerPaymentReportHistory,
  getWorkerWageDetail,
} from "@/src/repositories/reportRepository";

import {
  WorkerAdvanceReportItem,
  WorkerPaymentReportItem,
  WorkerWageDetail,
} from "@/src/types/report";

export default function WorkerWageDetailScreen() {
  const db = useSQLiteContext();

  const params = useLocalSearchParams<{
    workerId?: string;
    workerName?: string;
    month?: string;
  }>();

  const workerId = params.workerId ?? "";

  const workerName =
    params.workerName ?? "Worker";

  const month =
    params.month ?? getCurrentMonth();

  const [detail, setDetail] =
    useState<WorkerWageDetail | null>(null);

  const [advances, setAdvances] = useState<
    WorkerAdvanceReportItem[]
  >([]);

  const [payments, setPayments] = useState<
    WorkerPaymentReportItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const loadDetail = async () => {
    try {
      setLoading(true);

      if (!workerId) {
        return;
      }

      const [
        detailData,
        advanceData,
        paymentData,
      ] = await Promise.all([
        getWorkerWageDetail(
          db,
          workerId,
          month
        ),

        getWorkerAdvanceReportHistory(
          db,
          workerId,
          month
        ),

        getWorkerPaymentReportHistory(
          db,
          workerId,
          month
        ),
      ]);

      setDetail(detailData);
      setAdvances(advanceData);
      setPayments(paymentData);
    } catch (error) {
      console.error(
        "LOAD WORKER WAGE DETAIL ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [workerId, month])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color={Colors.primary}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Ionicons
            name="person-outline"
            size={45}
            color={Colors.textSecondary}
          />

          <Text style={styles.emptyTitle}>
            Worker Not Found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalAttendance =
    detail.present_count +
    detail.absent_count +
    detail.half_day_count +
    detail.leave_count;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.title}>
            Wage Details
          </Text>

          <Text style={styles.subtitle}>
            {formatMonth(month)}
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="wallet-outline"
            size={22}
            color={Colors.primary}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroCard}>
          <View style={styles.workerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(workerName)}
              </Text>
            </View>

            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>
                {detail.worker_name}
              </Text>

              <Text style={styles.workerMeta}>
                {detail.worker_type}

                {detail.site_name
                  ? ` • ${detail.site_name}`
                  : ""}
              </Text>
            </View>

            <PaymentStatus
              pending={detail.pending_amount}
            />
          </View>

          <View style={styles.heroDivider} />

          <Text style={styles.heroLabel}>
            FINAL PAYABLE
          </Text>

          <Text style={styles.heroAmount}>
            ₹{formatAmount(detail.final_amount)}
          </Text>

          <View style={styles.heroBottom}>
            <HeroValue
              label="Paid"
              amount={detail.paid_amount}
            />

            <View style={styles.heroVerticalLine} />

            <HeroValue
              label="Pending"
              amount={detail.pending_amount}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Wage Breakdown
        </Text>

        <View style={styles.breakdownCard}>
          <BreakdownRow
            icon="calendar-outline"
            label="Working Earning"
            amount={detail.working_amount}
            color="#2563EB"
            background="#EFF6FF"
          />

          <BreakdownRow
            icon="cash-outline"
            label="Advance"
            amount={detail.advance_amount}
            color="#D97706"
            background="#FFFBEB"
            negative
          />

          <BreakdownRow
            icon="gift-outline"
            label="Bonus"
            amount={detail.bonus}
            color="#16A34A"
            background="#F0FDF4"
          />

          <BreakdownRow
            icon="remove-circle-outline"
            label="Deduction"
            amount={detail.deduction}
            color="#DC2626"
            background="#FEF2F2"
            negative
          />

          <View style={styles.breakdownDivider} />

          <View style={styles.finalRow}>
            <Text style={styles.finalLabel}>
              Final Payable
            </Text>

            <Text style={styles.finalAmount}>
              ₹{formatAmount(detail.final_amount)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Attendance Summary
        </Text>

        <View style={styles.attendanceCard}>
          <View style={styles.attendanceHeader}>
            <View>
              <Text style={styles.attendanceTitle}>
                {totalAttendance} days marked
              </Text>

              <Text style={styles.attendanceSubtitle}>
                {formatMonth(month)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname:
                    "/report/attendance-detail",
                  params: {
                    workerId,
                    workerName:
                      detail.worker_name,
                    month,
                  },
                })
              }
            >
              <Text style={styles.viewDetails}>
                View details
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.attendanceStats}>
            <AttendanceStat
              label="P"
              value={detail.present_count}
              color="#16A34A"
              background="#F0FDF4"
            />

            <AttendanceStat
              label="A"
              value={detail.absent_count}
              color="#DC2626"
              background="#FEF2F2"
            />

            <AttendanceStat
              label="HD"
              value={detail.half_day_count}
              color="#D97706"
              background="#FFFBEB"
            />

            <AttendanceStat
              label="L"
              value={detail.leave_count}
              color="#7C3AED"
              background="#FAF5FF"
            />
          </View>
        </View>

        <SectionHeader
          title="Advance History"
          count={advances.length}
        />

        <View style={styles.historyCard}>
          {advances.map((advance, index) => (
            <AdvanceItem
              key={advance.id}
              advance={advance}
              isLast={
                index === advances.length - 1
              }
            />
          ))}

          {advances.length === 0 && (
            <EmptyHistory
              icon="cash-outline"
              text="No advance given this month"
            />
          )}
        </View>

        <SectionHeader
          title="Payment History"
          count={payments.length}
        />

        <View style={styles.historyCard}>
          {payments.map((payment, index) => (
            <PaymentItem
              key={payment.id}
              payment={payment}
              isLast={
                index === payments.length - 1
              }
            />
          ))}

          {payments.length === 0 && (
            <EmptyHistory
              icon="wallet-outline"
              text="No payment recorded this month"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PaymentStatus({
  pending,
}: {
  pending: number;
}) {
  const isPaid = Number(pending) <= 0;

  return (
    <View
      style={[
        styles.paymentStatus,
        {
          backgroundColor: isPaid
            ? "rgba(34,197,94,0.20)"
            : "rgba(255,255,255,0.15)",
        },
      ]}
    >
      <Text style={styles.paymentStatusText}>
        {isPaid ? "PAID" : "PENDING"}
      </Text>
    </View>
  );
}

function HeroValue({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  return (
    <View style={styles.heroValue}>
      <Text style={styles.heroValueAmount}>
        ₹{formatAmount(amount)}
      </Text>

      <Text style={styles.heroValueLabel}>
        {label}
      </Text>
    </View>
  );
}

function BreakdownRow({
  icon,
  label,
  amount,
  color,
  background,
  negative,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  amount: number;
  color: string;
  background: string;
  negative?: boolean;
}) {
  return (
    <View style={styles.breakdownRow}>
      <View
        style={[
          styles.breakdownIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={color}
        />
      </View>

      <Text style={styles.breakdownLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.breakdownAmount,
          { color },
        ]}
      >
        {negative && amount > 0 ? "-" : "+"}₹
        {formatAmount(amount)}
      </Text>
    </View>
  );
}

function AttendanceStat({
  label,
  value,
  color,
  background,
}: {
  label: string;
  value: number;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.attendanceStat}>
      <View
        style={[
          styles.attendanceBadge,
          { backgroundColor: background },
        ]}
      >
        <Text
          style={[
            styles.attendanceBadgeText,
            { color },
          ]}
        >
          {label}
        </Text>
      </View>

      <Text style={styles.attendanceValue}>
        {value}
      </Text>
    </View>
  );
}

function SectionHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitleNoMargin}>
        {title}
      </Text>

      <Text style={styles.historyCount}>
        {count} records
      </Text>
    </View>
  );
}

function AdvanceItem({
  advance,
  isLast,
}: {
  advance: WorkerAdvanceReportItem;
  isLast: boolean;
}) {
  return (
    <View
      style={[
        styles.historyItem,
        !isLast && styles.historyBorder,
      ]}
    >
      <View style={styles.advanceIcon}>
        <Ionicons
          name="cash-outline"
          size={19}
          color="#D97706"
        />
      </View>

      <View style={styles.historyContent}>
        <Text style={styles.historyTitle}>
          Advance Given
        </Text>

        <Text style={styles.historyMeta}>
          {formatDate(advance.advance_date)}

          {advance.payment_mode
            ? ` • ${formatMode(
                advance.payment_mode
              )}`
            : ""}
        </Text>

        {advance.note && (
          <Text style={styles.historyNote}>
            {advance.note}
          </Text>
        )}
      </View>

      <Text style={styles.advanceAmount}>
        -₹{formatAmount(advance.amount)}
      </Text>
    </View>
  );
}

function PaymentItem({
  payment,
  isLast,
}: {
  payment: WorkerPaymentReportItem;
  isLast: boolean;
}) {
  return (
    <View
      style={[
        styles.historyItem,
        !isLast && styles.historyBorder,
      ]}
    >
      <View style={styles.paidIcon}>
        <Ionicons
          name="wallet-outline"
          size={19}
          color="#16A34A"
        />
      </View>

      <View style={styles.historyContent}>
        <Text style={styles.historyTitle}>
          Payment Received
        </Text>

        <Text style={styles.historyMeta}>
          {formatDate(payment.payment_date)}

          {payment.payment_mode
            ? ` • ${formatMode(
                payment.payment_mode
              )}`
            : ""}
        </Text>

        {payment.note && (
          <Text style={styles.historyNote}>
            {payment.note}
          </Text>
        )}
      </View>

      <Text style={styles.paidAmount}>
        +₹{formatAmount(payment.amount)}
      </Text>
    </View>
  );
}

function EmptyHistory({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.emptyHistory}>
      <Ionicons
        name={icon}
        size={25}
        color={Colors.textLight}
      />

      <Text style={styles.emptyHistoryText}>
        {text}
      </Text>
    </View>
  );
}

function getCurrentMonth() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((item) => item.charAt(0))
    .join("")
    .toUpperCase();
}

function formatAmount(amount: number) {
  return Number(amount ?? 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );
}

function formatDate(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMonth(month: string) {
  return new Date(
    `${month}-01T00:00:00`
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function formatMode(mode: string) {
  return mode
    .replace("_", " ")
    .replace(/\b\w/g, (value) =>
      value.toUpperCase()
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  headerContent: {
    flex: 1,
    marginLeft: 13,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 50,
  },

  heroCard: {
    marginTop: 5,
    padding: 20,
    borderRadius: 23,
    backgroundColor: Colors.primary,
  },

  workerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.white,
  },

  workerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  workerName: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.white,
  },

  workerMeta: {
    marginTop: 4,
    fontSize: 9,
    color: "#BFDBFE",
  },

  paymentStatus: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },

  paymentStatusText: {
    fontSize: 8,
    fontWeight: "800",
    color: Colors.white,
  },

  heroDivider: {
    marginVertical: 18,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  heroLabel: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#BFDBFE",
  },

  heroAmount: {
    marginTop: 6,
    fontSize: 29,
    fontWeight: "800",
    color: Colors.white,
  },

  heroBottom: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  heroValue: {
    flex: 1,
  },

  heroValueAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
  },

  heroValueLabel: {
    marginTop: 4,
    fontSize: 8,
    color: "#BFDBFE",
  },

  heroVerticalLine: {
    width: 1,
    height: 30,
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  sectionTitle: {
    marginTop: 25,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  breakdownCard: {
    padding: 17,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  breakdownRow: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
  },

  breakdownIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  breakdownLabel: {
    flex: 1,
    marginLeft: 11,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  breakdownAmount: {
    fontSize: 12,
    fontWeight: "800",
  },

  breakdownDivider: {
    marginVertical: 8,
    height: 1,
    backgroundColor: Colors.border,
  },

  finalRow: {
    paddingTop: 9,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  finalLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  finalAmount: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.primary,
  },

  attendanceCard: {
    padding: 17,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  attendanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  attendanceTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  attendanceSubtitle: {
    marginTop: 3,
    fontSize: 9,
    color: Colors.textSecondary,
  },

  viewDetails: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
  },

  attendanceStats: {
    marginTop: 17,
    flexDirection: "row",
  },

  attendanceStat: {
    flex: 1,
    alignItems: "center",
  },

  attendanceBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  attendanceBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },

  attendanceValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  sectionHeader: {
    marginTop: 25,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitleNoMargin: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  historyCount: {
    fontSize: 9,
    color: Colors.textSecondary,
  },

  historyCard: {
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  historyItem: {
    minHeight: 75,
    flexDirection: "row",
    alignItems: "center",
  },

  historyBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  advanceIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
  },

  paidIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },

  historyContent: {
    flex: 1,
    marginLeft: 11,
  },

  historyTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  historyMeta: {
    marginTop: 4,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  historyNote: {
    marginTop: 4,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  advanceAmount: {
    fontSize: 12,
    fontWeight: "800",
    color: "#DC2626",
  },

  paidAmount: {
    fontSize: 12,
    fontWeight: "800",
    color: "#16A34A",
  },

  emptyHistory: {
    paddingVertical: 30,
    alignItems: "center",
  },

  emptyHistoryText: {
    marginTop: 8,
    fontSize: 9,
    color: Colors.textSecondary,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
});