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
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

import { getWorkerReportSummary } from "@/src/repositories/reportRepository";

import { WorkerReportSummary } from "@/src/types/report";

export default function WorkerWageReportScreen() {
  const db = useSQLiteContext();

  const params = useLocalSearchParams<{
    month?: string;
  }>();

  const month =
    params.month ?? getCurrentMonth();

  const [workers, setWorkers] = useState<
    WorkerReportSummary[]
  >([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);

      const data = await getWorkerReportSummary(
        db,
        month
      );

      setWorkers(data);
    } catch (error) {
      console.error(
        "LOAD WORKER WAGE REPORT ERROR:",
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

  const summary = useMemo(() => {
    return workers.reduce(
      (result, worker) => {
        result.working += Number(
          worker.working_amount ?? 0
        );

        result.advance += Number(
          worker.advance_amount ?? 0
        );

        result.payable += Number(
          worker.payable_amount ?? 0
        );

        result.paid += Number(
          worker.paid_amount ?? 0
        );

        result.pending += Number(
          worker.pending_amount ?? 0
        );

        return result;
      },
      {
        working: 0,
        advance: 0,
        payable: 0,
        paid: 0,
        pending: 0,
      }
    );
  }, [workers]);

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
            Worker Wage Report
          </Text>

          <Text style={styles.subtitle}>
            {formatMonth(month)}
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="people-outline"
            size={22}
            color={Colors.primary}
          />
        </View>
      </View>

      <FlatList
        data={filteredWorkers}
        keyExtractor={(item) => item.worker_id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>
                TOTAL WORKING AMOUNT
              </Text>

              <Text style={styles.heroAmount}>
                ₹{formatAmount(summary.working)}
              </Text>

              <Text style={styles.heroMonth}>
                {formatMonth(month)}
              </Text>

              <View style={styles.heroDivider} />

              <View style={styles.heroStats}>
                <HeroStat
                  label="Advance"
                  amount={summary.advance}
                />

                <View style={styles.verticalLine} />

                <HeroStat
                  label="Paid"
                  amount={summary.paid}
                />

                <View style={styles.verticalLine} />

                <HeroStat
                  label="Pending"
                  amount={summary.pending}
                />
              </View>
            </View>

            <View style={styles.financeCard}>
              <FinanceRow
                label="Working Amount"
                amount={summary.working}
                color={Colors.textPrimary}
              />

              <FinanceRow
                label="Advance Given"
                amount={summary.advance}
                color="#D97706"
              />

              <View style={styles.divider} />

              <FinanceRow
                label="Total Payable"
                amount={summary.payable}
                color={Colors.primary}
                large
              />

              <FinanceRow
                label="Amount Paid"
                amount={summary.paid}
                color="#16A34A"
              />

              <FinanceRow
                label="Pending"
                amount={summary.pending}
                color="#DC2626"
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

            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>
                Worker Summary
              </Text>

              <Text style={styles.workerCount}>
                {filteredWorkers.length} workers
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <WorkerWageCard
            worker={item}
            month={month}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="people-outline"
                size={30}
                color={Colors.textSecondary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No Worker Report Found
            </Text>

            <Text style={styles.emptySubtitle}>
              No worker wage data found for this
              month
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function WorkerWageCard({
  worker,
  month,
}: {
  worker: WorkerReportSummary;
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

        <Ionicons
          name="chevron-forward"
          size={18}
          color={Colors.textLight}
        />
      </View>

      <View style={styles.workerDivider} />

      <View style={styles.amountGrid}>
        <AmountItem
          label="Working"
          amount={worker.working_amount}
          color={Colors.textPrimary}
        />

        <AmountItem
          label="Advance"
          amount={worker.advance_amount}
          color="#D97706"
        />

        <AmountItem
          label="Payable"
          amount={worker.payable_amount}
          color={Colors.primary}
        />
      </View>

      <View style={styles.amountGridSecond}>
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

        <View style={styles.statusContent}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  worker.pending_amount > 0
                    ? "#FEF2F2"
                    : "#F0FDF4",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    worker.pending_amount > 0
                      ? "#DC2626"
                      : "#16A34A",
                },
              ]}
            >
              {worker.pending_amount > 0
                ? "Pending"
                : "Paid"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function HeroStat({
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

function FinanceRow({
  label,
  amount,
  color,
  large,
}: {
  label: string;
  amount: number;
  color: string;
  large?: boolean;
}) {
  return (
    <View style={styles.financeRow}>
      <Text
        style={[
          styles.financeLabel,
          large && styles.financeLabelLarge,
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.financeAmount,
          { color },
          large && styles.financeAmountLarge,
        ]}
      >
        ₹{formatAmount(amount)}
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
    .map((value) => value.charAt(0))
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
    fontSize: 15,
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

  financeCard: {
    marginTop: 15,
    padding: 18,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  financeRow: {
    paddingVertical: 7,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  financeLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  financeAmount: {
    fontSize: 13,
    fontWeight: "800",
  },

  financeLabelLarge: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  financeAmountLarge: {
    fontSize: 17,
  },

  divider: {
    marginVertical: 8,
    height: 1,
    backgroundColor: Colors.border,
  },

  searchContainer: {
    marginTop: 18,
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

  listHeader: {
    marginTop: 25,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  workerCount: {
    fontSize: 10,
    color: Colors.textSecondary,
  },

  workerCard: {
    marginBottom: 11,
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
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.primary,
  },

  workerInfo: {
    flex: 1,
    marginLeft: 11,
  },

  workerName: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  workerMeta: {
    marginTop: 4,
    fontSize: 9,
    color: Colors.textSecondary,
  },

  workerDivider: {
    marginVertical: 13,
    height: 1,
    backgroundColor: Colors.border,
  },

  amountGrid: {
    flexDirection: "row",
  },

  amountGridSecond: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
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

  statusContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
  },

  statusText: {
    fontSize: 8,
    fontWeight: "800",
  },

  empty: {
    paddingTop: 60,
    alignItems: "center",
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  emptySubtitle: {
    marginTop: 6,
    maxWidth: 250,
    textAlign: "center",
    fontSize: 10,
    color: Colors.textSecondary,
  },
});