import { Ionicons } from "@expo/vector-icons";

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import { useSQLiteContext } from "expo-sqlite";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

import {
  getPaymentReportSummary,
  getPaymentReportTransactions,
  getPaymentWorkerReport,
} from "@/src/repositories/reportRepository";

import {
  PaymentReportSummary,
  PaymentReportTransaction,
  PaymentWorkerReport,
} from "@/src/types/report";

const initialSummary: PaymentReportSummary = {
  total_payable: 0,
  total_paid: 0,
  total_pending: 0,
  paid_workers: 0,
  pending_workers: 0,
  cash_amount: 0,
  upi_amount: 0,
  bank_amount: 0,
  transaction_count: 0,
};

export default function PaymentReportScreen() {
  const db = useSQLiteContext();

  const params = useLocalSearchParams<{
    month?: string;
  }>();

  const month =
    params.month ?? getCurrentMonth();

  const [summary, setSummary] =
    useState(initialSummary);

  const [workers, setWorkers] = useState<
    PaymentWorkerReport[]
  >([]);

  const [transactions, setTransactions] =
    useState<PaymentReportTransaction[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);

      const [
        summaryData,
        workerData,
        transactionData,
      ] = await Promise.all([
        getPaymentReportSummary(db, month),
        getPaymentWorkerReport(db, month),
        getPaymentReportTransactions(db, month),
      ]);

      setSummary(summaryData);
      setWorkers(workerData);
      setTransactions(transactionData);
    } catch (error) {
      console.error(
        "LOAD PAYMENT REPORT ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReport();
    }, [month])
  );

  const filteredWorkers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return workers;
    }

    return workers.filter((worker) => {
      return (
        worker.worker_name
          .toLowerCase()
          .includes(value) ||
        worker.worker_type
          .toLowerCase()
          .includes(value) ||
        worker.site_name
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [workers, search]);

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
            Payment Report
          </Text>

          <Text style={styles.subtitle}>
            {formatMonth(month)}
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="wallet-outline"
            size={22}
            color="#0891B2"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>
            TOTAL PAYABLE
          </Text>

          <Text style={styles.heroAmount}>
            ₹{formatAmount(summary.total_payable)}
          </Text>

          <Text style={styles.heroMonth}>
            {formatMonth(month)}
          </Text>

          <View style={styles.heroDivider} />

          <View style={styles.heroStats}>
            <HeroAmount
              label="Paid"
              amount={summary.total_paid}
            />

            <View style={styles.verticalLine} />

            <HeroAmount
              label="Pending"
              amount={summary.total_pending}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Payment Status
        </Text>

        <View style={styles.statusGrid}>
          <StatusCard
            icon="checkmark-circle-outline"
            label="Paid Workers"
            value={summary.paid_workers}
            color="#16A34A"
            background="#F0FDF4"
          />

          <StatusCard
            icon="time-outline"
            label="Pending Workers"
            value={summary.pending_workers}
            color="#DC2626"
            background="#FEF2F2"
          />
        </View>

        <Text style={styles.sectionTitle}>
          Payment Mode
        </Text>

        <View style={styles.modeGrid}>
          <ModeCard
            icon="cash-outline"
            label="Cash"
            amount={summary.cash_amount}
          />

          <ModeCard
            icon="phone-portrait-outline"
            label="UPI"
            amount={summary.upi_amount}
          />

          <ModeCard
            icon="business-outline"
            label="Bank"
            amount={summary.bank_amount}
          />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={Colors.textSecondary}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search worker, type or site"
            placeholderTextColor={Colors.textLight}
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        <SectionHeader
          title="Worker Payments"
          count={filteredWorkers.length}
        />

        {filteredWorkers.map((worker) => (
          <WorkerPaymentCard
            key={worker.payment_id}
            worker={worker}
            month={month}
          />
        ))}

        {filteredWorkers.length === 0 && (
          <EmptyState text="No worker payments found" />
        )}

        <SectionHeader
          title="Recent Payments"
          count={transactions.length}
        />

        <View style={styles.transactionCard}>
          {transactions.map((transaction, index) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              isLast={
                index === transactions.length - 1
              }
            />
          ))}

          {transactions.length === 0 && (
            <EmptyState text="No payment transactions found" />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function WorkerPaymentCard({
  worker,
  month,
}: {
  worker: PaymentWorkerReport;
  month: string;
}) {
  const isPaid =
    Number(worker.pending_amount) <= 0;

  return (
    <TouchableOpacity
      style={styles.workerCard}
      activeOpacity={0.75}
      onPress={() =>
        router.push({
          pathname: "/report/worker-detail",
          params: {
            workerId: worker.worker_id,
            workerName: worker.worker_name,
            month,
          },
        })
      }
    >
      <View style={styles.workerHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(worker.worker_name)}
          </Text>
        </View>

        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>
            {worker.worker_name}
          </Text>

          <Text style={styles.workerMeta}>
            {worker.worker_type}

            {worker.site_name
              ? ` • ${worker.site_name}`
              : ""}
          </Text>
        </View>

        <View
          style={[
            styles.workerStatus,
            {
              backgroundColor: isPaid
                ? "#F0FDF4"
                : "#FEF2F2",
            },
          ]}
        >
          <Text
            style={[
              styles.workerStatusText,
              {
                color: isPaid
                  ? "#16A34A"
                  : "#DC2626",
              },
            ]}
          >
            {isPaid ? "PAID" : "PENDING"}
          </Text>
        </View>
      </View>

      <View style={styles.workerDivider} />

      <View style={styles.workerAmounts}>
        <AmountItem
          label="Payable"
          amount={worker.final_amount}
          color={Colors.textPrimary}
        />

        <AmountItem
          label="Paid"
          amount={worker.paid_amount}
          color="#16A34A"
        />

        <AmountItem
          label="Pending"
          amount={worker.pending_amount}
          color="#DC2626"
        />
      </View>
    </TouchableOpacity>
  );
}

function TransactionItem({
  transaction,
  isLast,
}: {
  transaction: PaymentReportTransaction;
  isLast: boolean;
}) {
  return (
    <View
      style={[
        styles.transactionItem,
        !isLast && styles.transactionBorder,
      ]}
    >
      <View style={styles.transactionIcon}>
        <Ionicons
          name="arrow-down-outline"
          size={19}
          color="#16A34A"
        />
      </View>

      <View style={styles.transactionContent}>
        <Text style={styles.transactionName}>
          {transaction.worker_name}
        </Text>

        <Text style={styles.transactionMeta}>
          {formatDate(transaction.payment_date)}

          {transaction.payment_mode
            ? ` • ${formatMode(
                transaction.payment_mode
              )}`
            : ""}
        </Text>

        {transaction.note && (
          <Text style={styles.transactionNote}>
            {transaction.note}
          </Text>
        )}
      </View>

      <Text style={styles.transactionAmount}>
        +₹{formatAmount(transaction.amount)}
      </Text>
    </View>
  );
}

function HeroAmount({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatAmount}>
        ₹{formatCompactAmount(amount)}
      </Text>

      <Text style={styles.heroStatLabel}>
        {label}
      </Text>
    </View>
  );
}

function StatusCard({
  icon,
  label,
  value,
  color,
  background,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.statusCard}>
      <View
        style={[
          styles.statusIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={color}
        />
      </View>

      <View style={styles.statusContent}>
        <Text style={styles.statusValue}>
          {value}
        </Text>

        <Text style={styles.statusLabel}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function ModeCard({
  icon,
  label,
  amount,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  amount: number;
}) {
  return (
    <View style={styles.modeCard}>
      <View style={styles.modeIcon}>
        <Ionicons
          name={icon}
          size={19}
          color="#0891B2"
        />
      </View>

      <Text style={styles.modeLabel}>
        {label}
      </Text>

      <Text style={styles.modeAmount}>
        ₹{formatCompactAmount(amount)}
      </Text>
    </View>
  );
}

function AmountItem({
  label,
  amount,
  color,
}: {
  label: string;
  amount: number;
  color: string;
}) {
  return (
    <View style={styles.amountItem}>
      <Text style={styles.amountLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.amountValue,
          { color },
        ]}
      >
        ₹{formatAmount(amount)}
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

      <Text style={styles.sectionCount}>
        {count} records
      </Text>
    </View>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <View style={styles.empty}>
      <Ionicons
        name="wallet-outline"
        size={27}
        color={Colors.textLight}
      />

      <Text style={styles.emptyText}>
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

function formatCompactAmount(amount: number) {
  const value = Number(amount ?? 0);

  if (value >= 100000) {
    return `${(value / 100000).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return formatAmount(value);
}

function formatMonth(month: string) {
  return new Date(
    `${month}-01T00:00:00`
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
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

function formatMode(mode: string) {
  return mode
    .replace(/_/g, " ")
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
    backgroundColor: "#ECFEFF",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 50,
  },

  heroCard: {
    marginTop: 5,
    padding: 21,
    borderRadius: 23,
    backgroundColor: Colors.primary,
  },

  heroLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#BFDBFE",
  },

  heroAmount: {
    marginTop: 7,
    fontSize: 31,
    fontWeight: "800",
    color: Colors.white,
  },

  heroMonth: {
    marginTop: 4,
    fontSize: 9,
    color: "#DBEAFE",
  },

  heroDivider: {
    marginVertical: 18,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  heroStats: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroStat: {
    flex: 1,
    alignItems: "center",
  },

  heroStatAmount: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.white,
  },

  heroStatLabel: {
    marginTop: 4,
    fontSize: 8,
    color: "#BFDBFE",
  },

  verticalLine: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  sectionTitle: {
    marginTop: 25,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  statusGrid: {
    flexDirection: "row",
    gap: 10,
  },

  statusCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  statusContent: {
    marginLeft: 10,
  },

  statusValue: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  statusLabel: {
    marginTop: 3,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  modeGrid: {
    flexDirection: "row",
    gap: 9,
  },

  modeCard: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: "center",
  },

  modeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#ECFEFF",
    alignItems: "center",
    justifyContent: "center",
  },

  modeLabel: {
    marginTop: 8,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  modeAmount: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  searchContainer: {
    marginTop: 20,
    height: 52,
    paddingHorizontal: 15,
    borderRadius: 17,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
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

  sectionCount: {
    fontSize: 9,
    color: Colors.textSecondary,
  },

  workerCard: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  workerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#ECFEFF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0891B2",
  },

  workerInfo: {
    flex: 1,
    marginLeft: 11,
  },

  workerName: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  workerMeta: {
    marginTop: 4,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  workerStatus: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
  },

  workerStatusText: {
    fontSize: 7,
    fontWeight: "800",
  },

  workerDivider: {
    marginVertical: 13,
    height: 1,
    backgroundColor: Colors.border,
  },

  workerAmounts: {
    flexDirection: "row",
  },

  amountItem: {
    flex: 1,
  },

  amountLabel: {
    fontSize: 8,
    color: Colors.textSecondary,
  },

  amountValue: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "800",
  },

  transactionCard: {
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  transactionItem: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
  },

  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },

  transactionContent: {
    flex: 1,
    marginLeft: 11,
  },

  transactionName: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  transactionMeta: {
    marginTop: 4,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  transactionNote: {
    marginTop: 4,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  transactionAmount: {
    fontSize: 12,
    fontWeight: "800",
    color: "#16A34A",
  },

  empty: {
    paddingVertical: 30,
    alignItems: "center",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 9,
    color: Colors.textSecondary,
  },
});