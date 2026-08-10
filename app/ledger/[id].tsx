import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

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
  getWorkerLedgerSummary,
  getWorkerLedgerTransactions,
} from "@/src/repositories/ledgerRepository";

import {
  getWorkerById,
} from "@/src/repositories/workerRepository";

import {
  LedgerTransaction,
  WorkerLedgerSummary,
} from "@/src/types/ledger";

import { WorkerWithSite } from "@/src/types/worker";

const initialSummary: WorkerLedgerSummary = {
  totalEarnings: 0,
  totalAdvance: 0,
  balance: 0,
};

export default function WorkerLedgerScreen() {
  const db = useSQLiteContext();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [worker, setWorker] =
    useState<WorkerWithSite | null>(null);

  const [summary, setSummary] =
    useState(initialSummary);

  const [transactions, setTransactions] = useState<
    LedgerTransaction[]
  >([]);

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        workerData,
        summaryData,
        transactionData,
      ] = await Promise.all([
        getWorkerById(db, id),

        getWorkerLedgerSummary(db, id),

        getWorkerLedgerTransactions(db, id),
      ]);

      setWorker(workerData);
      setSummary(summaryData);
      setTransactions(transactionData);
    } catch (error) {
      console.error(
        "LOAD LEDGER ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.back}
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
            Worker Ledger
          </Text>

          <Text style={styles.subtitle}>
            {worker?.name || "Worker"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: "/advance/create",
              params: {
                workerId: id,
              },
            })
          }
        >
          <Ionicons
            name="add"
            size={23}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>
            Current Balance
          </Text>

          <Text
            style={[
              styles.balance,
              summary.balance < 0 &&
                styles.negativeBalance,
            ]}
          >
            ₹{summary.balance.toLocaleString()}
          </Text>

          <Text style={styles.balanceNote}>
            Earnings minus advances
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard
            icon="trending-up-outline"
            label="Earnings"
            value={summary.totalEarnings}
            type="earning"
          />

          <SummaryCard
            icon="trending-down-outline"
            label="Advance"
            value={summary.totalAdvance}
            type="advance"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Transactions
          </Text>

          <Text style={styles.transactionCount}>
            {transactions.length} records
          </Text>
        </View>

        {transactions.map((item) => (
          <TransactionCard
            key={`${item.type}-${item.id}`}
            transaction={item}
          />
        ))}

        {transactions.length === 0 && (
          <View style={styles.empty}>
            <Ionicons
              name="book-outline"
              size={55}
              color={Colors.textLight}
            />

            <Text style={styles.emptyTitle}>
              No Transactions
            </Text>

            <Text style={styles.emptySubtitle}>
              Attendance earnings and advances
              will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  type,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  type: "earning" | "advance";
}) {
  const isEarning = type === "earning";

  return (
    <View style={styles.summaryCard}>
      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor: isEarning
              ? "#DCFCE7"
              : "#FEE2E2",
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={
            isEarning
              ? Colors.success
              : Colors.danger
          }
        />
      </View>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.summaryAmount,
          {
            color: isEarning
              ? Colors.success
              : Colors.danger,
          },
        ]}
      >
        ₹{value.toLocaleString()}
      </Text>
    </View>
  );
}

function TransactionCard({
  transaction,
}: {
  transaction: LedgerTransaction;
}) {
  const isEarning =
    transaction.type === "earning";

  return (
    <View style={styles.transaction}>
      <View
        style={[
          styles.transactionIcon,
          {
            backgroundColor: isEarning
              ? "#DCFCE7"
              : "#FEE2E2",
          },
        ]}
      >
        <Ionicons
          name={
            isEarning
              ? "arrow-down-outline"
              : "arrow-up-outline"
          }
          size={20}
          color={
            isEarning
              ? Colors.success
              : Colors.danger
          }
        />
      </View>

      <View style={styles.transactionContent}>
        <Text style={styles.transactionTitle}>
          {transaction.title}
        </Text>

        <Text style={styles.description}>
          {transaction.description}
        </Text>

        <Text style={styles.date}>
          {formatDate(transaction.date)}
        </Text>
      </View>

      <Text
        style={[
          styles.transactionAmount,
          {
            color: isEarning
              ? Colors.success
              : Colors.danger,
          },
        ]}
      >
        {isEarning ? "+" : "-"}₹
        {transaction.amount.toLocaleString()}
      </Text>
    </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  back: {
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
    fontSize: 12,
    color: Colors.textSecondary,
  },

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  balanceCard: {
    padding: 23,
    borderRadius: 23,
    backgroundColor: Colors.primary,
  },

  balanceLabel: {
    fontSize: 12,
    color: "#DBEAFE",
  },

  balance: {
    marginTop: 7,
    fontSize: 32,
    fontWeight: "800",
    color: Colors.white,
  },

  negativeBalance: {
    color: "#FECACA",
  },

  balanceNote: {
    marginTop: 7,
    fontSize: 10,
    color: "#DBEAFE",
  },

  summaryRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },

  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 19,
    backgroundColor: Colors.white,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryLabel: {
    marginTop: 12,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  summaryAmount: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: "800",
  },

  sectionHeader: {
    marginTop: 28,
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  transactionCount: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  transaction: {
    marginBottom: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  transactionIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  transactionContent: {
    flex: 1,
    marginLeft: 12,
  },

  transactionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  description: {
    marginTop: 3,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  date: {
    marginTop: 4,
    fontSize: 9,
    color: Colors.textLight,
  },

  transactionAmount: {
    fontSize: 13,
    fontWeight: "800",
  },

  empty: {
    paddingVertical: 60,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 13,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  emptySubtitle: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 12,
    color: Colors.textSecondary,
  },
});