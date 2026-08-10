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
  getAdvanceReportSummary,
  getAdvanceReportTransactions,
  getAdvanceWorkerReport,
} from "@/src/repositories/reportRepository";

import {
  AdvanceReportSummary,
  AdvanceReportTransaction,
  AdvanceWorkerReport,
} from "@/src/types/report";

const initialSummary: AdvanceReportSummary = {
  total_amount: 0,
  total_transactions: 0,
  worker_count: 0,
  cash_amount: 0,
  upi_amount: 0,
  bank_amount: 0,
};

export default function AdvanceReportScreen() {
  const db = useSQLiteContext();

  const params = useLocalSearchParams<{
    month?: string;
  }>();

  const month =
    params.month ?? getCurrentMonth();

  const [summary, setSummary] =
    useState(initialSummary);

  const [workers, setWorkers] = useState<
    AdvanceWorkerReport[]
  >([]);

  const [transactions, setTransactions] =
    useState<AdvanceReportTransaction[]>([]);

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
        getAdvanceReportSummary(db, month),
        getAdvanceWorkerReport(db, month),
        getAdvanceReportTransactions(db, month),
      ]);

      setSummary(summaryData);
      setWorkers(workerData);
      setTransactions(transactionData);
    } catch (error) {
      console.error(
        "LOAD ADVANCE REPORT ERROR:",
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
            Advance Report
          </Text>

          <Text style={styles.subtitle}>
            {formatMonth(month)}
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="cash-outline"
            size={22}
            color="#D97706"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>
            TOTAL ADVANCE GIVEN
          </Text>

          <Text style={styles.heroAmount}>
            ₹{formatAmount(summary.total_amount)}
          </Text>

          <Text style={styles.heroMonth}>
            {formatMonth(month)}
          </Text>

          <View style={styles.heroDivider} />

          <View style={styles.heroStats}>
            <HeroStat
              value={summary.worker_count}
              label="Workers"
            />

            <View style={styles.verticalLine} />

            <HeroStat
              value={summary.total_transactions}
              label="Transactions"
            />

            <View style={styles.verticalLine} />

            <HeroStat
              value={workers.length}
              label="Accounts"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Payment Mode
        </Text>

        <View style={styles.modeGrid}>
          <ModeCard
            icon="cash-outline"
            label="Cash"
            amount={summary.cash_amount}
            color="#16A34A"
            background="#F0FDF4"
          />

          <ModeCard
            icon="phone-portrait-outline"
            label="UPI"
            amount={summary.upi_amount}
            color="#2563EB"
            background="#EFF6FF"
          />

          <ModeCard
            icon="business-outline"
            label="Bank"
            amount={summary.bank_amount}
            color="#7C3AED"
            background="#FAF5FF"
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleNoMargin}>
            Worker Advances
          </Text>

          <Text style={styles.sectionCount}>
            {filteredWorkers.length} workers
          </Text>
        </View>

        {filteredWorkers.map((worker) => (
          <WorkerAdvanceCard
            key={worker.worker_id}
            worker={worker}
            month={month}
          />
        ))}

        {filteredWorkers.length === 0 && (
          <EmptyState
            icon="cash-outline"
            title="No Advances Found"
            subtitle="No worker advance data found"
          />
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleNoMargin}>
            Recent Transactions
          </Text>

          <Text style={styles.sectionCount}>
            {transactions.length} records
          </Text>
        </View>

        <View style={styles.transactionCard}>
          {transactions.map((item, index) => (
            <TransactionItem
              key={item.id}
              transaction={item}
              isLast={
                index === transactions.length - 1
              }
            />
          ))}

          {transactions.length === 0 && (
            <EmptyTransaction />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function WorkerAdvanceCard({
  worker,
  month,
}: {
  worker: AdvanceWorkerReport;
  month: string;
}) {
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

        <Text style={styles.workerTransaction}>
          {worker.transaction_count} transactions
          {worker.last_advance_date
            ? ` • Last ${formatShortDate(
                worker.last_advance_date
              )}`
            : ""}
        </Text>
      </View>

      <View style={styles.workerAmountContent}>
        <Text style={styles.workerAmount}>
          ₹{formatAmount(worker.total_advance)}
        </Text>

        <Ionicons
          name="chevron-forward"
          size={17}
          color={Colors.textLight}
        />
      </View>
    </TouchableOpacity>
  );
}

function TransactionItem({
  transaction,
  isLast,
}: {
  transaction: AdvanceReportTransaction;
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
          name="arrow-up-outline"
          size={19}
          color="#D97706"
        />
      </View>

      <View style={styles.transactionContent}>
        <Text style={styles.transactionName}>
          {transaction.worker_name}
        </Text>

        <Text style={styles.transactionMeta}>
          {formatDate(transaction.advance_date)}

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
        -₹{formatAmount(transaction.amount)}
      </Text>
    </View>
  );
}

function HeroStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue}>
        {value}
      </Text>

      <Text style={styles.heroStatLabel}>
        {label}
      </Text>
    </View>
  );
}

function ModeCard({
  icon,
  label,
  amount,
  color,
  background,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  amount: number;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.modeCard}>
      <View
        style={[
          styles.modeIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={color}
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

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.empty}>
      <Ionicons
        name={icon}
        size={30}
        color={Colors.textLight}
      />

      <Text style={styles.emptyTitle}>
        {title}
      </Text>

      <Text style={styles.emptySubtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

function EmptyTransaction() {
  return (
    <View style={styles.emptyTransaction}>
      <Ionicons
        name="receipt-outline"
        size={25}
        color={Colors.textLight}
      />

      <Text style={styles.emptyTransactionText}>
        No advance transactions this month
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

function formatShortDate(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
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
    backgroundColor: "#FFFBEB",
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

  heroStatValue: {
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
    height: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  sectionTitle: {
    marginTop: 25,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
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
    padding: 14,
    borderRadius: 19,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#D97706",
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
    marginTop: 3,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  workerTransaction: {
    marginTop: 5,
    fontSize: 8,
    color: Colors.textLight,
  },

  workerAmountContent: {
    alignItems: "flex-end",
  },

  workerAmount: {
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "800",
    color: "#D97706",
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
    backgroundColor: "#FFFBEB",
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
    color: "#DC2626",
  },

  empty: {
    paddingVertical: 40,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  emptySubtitle: {
    marginTop: 5,
    fontSize: 9,
    color: Colors.textSecondary,
  },

  emptyTransaction: {
    paddingVertical: 30,
    alignItems: "center",
  },

  emptyTransactionText: {
    marginTop: 8,
    fontSize: 9,
    color: Colors.textSecondary,
  },
});