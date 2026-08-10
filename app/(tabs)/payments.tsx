import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

import {
  getPayments,
} from "@/src/repositories/paymentRepository";

import {
  PaymentStatus,
  PaymentWithWorker,
} from "@/src/types/payment";

function getCurrentMonth() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

type FilterType =
  | "all"
  | PaymentStatus;

export default function PaymentsScreen() {
  const db = useSQLiteContext();

  const [payments, setPayments] = useState<
    PaymentWithWorker[]
  >([]);

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [loading, setLoading] = useState(true);

  const month = getCurrentMonth();

  const loadPayments = async () => {
    try {
      setLoading(true);

      const data = await getPayments(
        db,
        month
      );

      setPayments(data);
    } catch (error) {
      console.error(
        "LOAD PAYMENTS ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [])
  );

  const filteredPayments = useMemo(() => {
    if (filter === "all") {
      return payments;
    }

    return payments.filter(
      (item) => item.status === filter
    );
  }, [payments, filter]);

  const totalPayable = payments.reduce(
    (total, item) =>
      total + item.final_amount,
    0
  );

  const totalPaid = payments.reduce(
    (total, item) =>
      total + item.paid_amount,
    0
  );

  const totalRemaining = payments.reduce(
    (total, item) =>
      total + item.remaining_amount,
    0
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Payments
          </Text>

          <Text style={styles.subtitle}>
            {formatMonth(month)}
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="wallet-outline"
            size={23}
            color={Colors.primary}
          />
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.mainSummary}>
          <Text style={styles.mainLabel}>
            Remaining Payments
          </Text>

          <Text style={styles.mainAmount}>
            ₹
            {totalRemaining.toLocaleString(
              "en-IN"
            )}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard
            label="Payable"
            amount={totalPayable}
            color={Colors.primary}
          />

          <SummaryCard
            label="Paid"
            amount={totalPaid}
            color={Colors.success}
          />
        </View>
      </View>

      
      <View style={styles.filterBtn}>
        <FilterButton
          title="All"
          selected={filter === "all"}
          onPress={() => setFilter("all")}
        />

        <FilterButton
          title="Pending"
          selected={filter === "pending"}
          onPress={() =>
            setFilter("pending")
          }
        />

        <FilterButton
          title="Partial"
          selected={filter === "partial"}
          onPress={() =>
            setFilter("partial")
          }
        />

        <FilterButton
          title="Paid"
          selected={filter === "paid"}
          onPress={() => setFilter("paid")}
        />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color={Colors.primary}
          />
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PaymentCard payment={item} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="wallet-outline"
                size={55}
                color={Colors.textLight}
              />

              <Text style={styles.emptyTitle}>
                No Payments
              </Text>

              <Text style={styles.emptySubtitle}>
                Create payment from worker details
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function PaymentCard({
  payment,
}: {
  payment: PaymentWithWorker;
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push(`/payment/${payment.id}`)
      }
    >
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(payment.worker_name)}
          </Text>
        </View>

        <View style={styles.workerContent}>
          <Text style={styles.workerName}>
            {payment.worker_name}
          </Text>

          <Text style={styles.workerInfo}>
            {payment.worker_type}
            {" • "}
            {payment.site_name || "No Site"}
          </Text>
        </View>

        <StatusBadge
          status={payment.status}
        />
      </View>

      <View style={styles.amountRow}>
        <AmountItem
          label="Payable"
          amount={payment.final_amount}
        />

        <AmountItem
          label="Paid"
          amount={payment.paid_amount}
          color={Colors.success}
        />

        <AmountItem
          label="Remaining"
          amount={payment.remaining_amount}
          color={Colors.danger}
          right
        />
      </View>
    </TouchableOpacity>
  );
}

function SummaryCard({
  label,
  amount,
  color,
}: {
  label: string;
  amount: number;
  color: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.summaryAmount,
          { color },
        ]}
      >
        ₹{amount.toLocaleString("en-IN")}
      </Text>
    </View>
  );
}

function FilterButton({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selected && styles.selectedFilter,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterText,
          selected &&
            styles.selectedFilterText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function StatusBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  const config = {
    pending: {
      label: "Pending",
      color: Colors.danger,
      background: "#FEE2E2",
    },

    partial: {
      label: "Partial",
      color: Colors.warning,
      background: "#FEF3C7",
    },

    paid: {
      label: "Paid",
      color: Colors.success,
      background: "#DCFCE7",
    },
  };

  const item = config[status];

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: item.background,
        },
      ]}
    >
      <Text
        style={[
          styles.statusText,
          { color: item.color },
        ]}
      >
        {item.label}
      </Text>
    </View>
  );
}

function AmountItem({
  label,
  amount,
  color = Colors.textPrimary,
  right,
}: {
  label: string;
  amount: number;
  color?: string;
  right?: boolean;
}) {
  return (
    <View
      style={[
        styles.amountItem,
        right && styles.amountRight,
      ]}
    >
      <Text style={styles.amountLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.amountValue,
          { color },
        ]}
      >
        ₹{amount.toLocaleString("en-IN")}
      </Text>
    </View>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((item) => item[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
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
    backgroundColor: Colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryContainer: {
    paddingHorizontal: 20,
  },

  mainSummary: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: Colors.primary,
  },

  mainLabel: {
    fontSize: 11,
    color: "#DBEAFE",
  },

  mainAmount: {
    marginTop: 6,
    fontSize: 30,
    fontWeight: "800",
    color: Colors.white,
  },

  summaryRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
  },

  filterBtn: {
    flexDirection: "row",
    gap: 2,
    marginTop:10,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation:10,
  },

  summaryCard: {
    flex: 1,
    padding: 15,
    borderRadius: 17,
    backgroundColor: Colors.white,
  },

  summaryLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },

  summaryAmount: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "800",
  },

  filters: {
    paddingHorizontal: 20,
    paddingVertical: 17,
  },

  filterButton: {
    marginRight: 8,
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  selectedFilter: {
    backgroundColor: Colors.primary,
  },

  filterText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
  },

  selectedFilterText: {
    color: Colors.white,
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },

  card: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.primary,
  },

  workerContent: {
    flex: 1,
    marginLeft: 12,
  },

  workerName: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  workerInfo: {
    marginTop: 4,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  amountRow: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: "row",
  },

  amountItem: {
    flex: 1,
  },

  amountRight: {
    alignItems: "flex-end",
  },

  amountLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
  },

  amountValue: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "800",
  },

  empty: {
    paddingTop: 70,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  emptySubtitle: {
    marginTop: 5,
    fontSize: 11,
    color: Colors.textSecondary,
  },
});