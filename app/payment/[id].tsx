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
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import AppButton from "@/src/components/AppButton";
import AppInput from "@/src/components/AppInput";

import { Colors } from "@/src/constants/colors";

import {
  addPaymentEntry,
  getPaymentById,
  getPaymentEntries,
} from "@/src/repositories/paymentRepository";

import {
  PaymentEntry,
  PaymentMode,
  PaymentWithWorker,
} from "@/src/types/payment";

function getTodayDate() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function PaymentDetailsScreen() {
  const db = useSQLiteContext();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [payment, setPayment] =
    useState<PaymentWithWorker | null>(null);

  const [entries, setEntries] = useState<
    PaymentEntry[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [amount, setAmount] = useState("");

  const [date, setDate] = useState(
    getTodayDate()
  );

  const [mode, setMode] =
    useState<PaymentMode>("cash");

  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [paymentData, entryData] =
        await Promise.all([
          getPaymentById(db, id),

          getPaymentEntries(db, id),
        ]);

      setPayment(paymentData);

      setEntries(entryData);
    } catch (error) {
      console.error(
        "LOAD PAYMENT DETAILS ERROR:",
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

  const openPaymentModal = () => {
    if (!payment) {
      return;
    }

    setAmount(
      String(payment.remaining_amount)
    );

    setDate(getTodayDate());

    setMode("cash");

    setNote("");

    setModalVisible(true);
  };

  const handlePayment = async () => {
    if (!payment) {
      return;
    }

    const paymentAmount = Number(amount);

    if (
      !paymentAmount ||
      paymentAmount <= 0
    ) {
      Alert.alert(
        "Invalid Amount",
        "Please enter valid payment amount"
      );

      return;
    }

    if (
      paymentAmount >
      payment.remaining_amount
    ) {
      Alert.alert(
        "Invalid Amount",
        `Maximum payable amount is ₹${payment.remaining_amount.toLocaleString(
          "en-IN"
        )}`
      );

      return;
    }

    try {
      setSaving(true);

      await addPaymentEntry(db, {
        paymentId: payment.id,
        workerId: payment.worker_id,
        amount: paymentAmount,
        date,
        mode,
        note,
      });

      setModalVisible(false);

      await loadData();

      Alert.alert(
        "Payment Successful",
        `₹${paymentAmount.toLocaleString(
          "en-IN"
        )} payment recorded`
      );
    } catch (error) {
      console.error(
        "ADD PAYMENT ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to record payment"
      );
    } finally {
      setSaving(false);
    }
  };

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

  if (!payment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <Text style={styles.notFound}>
            Payment not found
          </Text>
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
            Payment Details
          </Text>

          <Text style={styles.subtitle}>
            {formatMonth(
              payment.payment_month
            )}
          </Text>
        </View>

        <StatusBadge
          status={payment.status}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.workerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(
                payment.worker_name
              )}
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
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>
            Remaining Payment
          </Text>

          <Text style={styles.balanceAmount}>
            ₹
            {payment.remaining_amount.toLocaleString(
              "en-IN",
              {
                maximumFractionDigits: 2,
              }
            )}
          </Text>

          <View style={styles.balanceInfo}>
            <View>
              <Text style={styles.infoLabel}>
                Payable
              </Text>

              <Text style={styles.infoAmount}>
                ₹
                {payment.final_amount.toLocaleString(
                  "en-IN"
                )}
              </Text>
            </View>

            <View style={styles.infoRight}>
              <Text style={styles.infoLabel}>
                Paid
              </Text>

              <Text style={styles.paidAmount}>
                ₹
                {payment.paid_amount.toLocaleString(
                  "en-IN"
                )}
              </Text>
            </View>
          </View>
        </View>

        {payment.remaining_amount > 0 && (
          <TouchableOpacity
            style={styles.payButton}
            onPress={openPaymentModal}
          >
            <Ionicons
              name="wallet-outline"
              size={21}
              color={Colors.white}
            />

            <Text style={styles.payButtonText}>
              Pay Now
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>
          Salary Breakdown
        </Text>

        <View style={styles.breakdownCard}>
          <BreakdownRow
            label="Working Amount"
            value={payment.working_amount}
          />

          <BreakdownRow
            label="Advance"
            value={payment.advance_amount}
            negative
          />

          <BreakdownRow
            label="Bonus"
            value={payment.bonus}
          />

          <BreakdownRow
            label="Other Deduction"
            value={payment.deduction}
            negative
          />

          <View style={styles.divider} />

          <BreakdownRow
            label="Final Payable"
            value={payment.final_amount}
            final
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Payment History
          </Text>

          <Text style={styles.recordCount}>
            {entries.length} records
          </Text>
        </View>

        {entries.map((entry) => (
          <View
            key={entry.id}
            style={styles.entryCard}
          >
            <View style={styles.entryIcon}>
              <Ionicons
                name={getModeIcon(
                  entry.payment_mode
                )}
                size={21}
                color={Colors.success}
              />
            </View>

            <View style={styles.entryContent}>
              <Text style={styles.entryTitle}>
                {getModeLabel(
                  entry.payment_mode
                )}
              </Text>

              <Text style={styles.entryDate}>
                {formatDate(
                  entry.payment_date
                )}
              </Text>

              {entry.note && (
                <Text style={styles.entryNote}>
                  {entry.note}
                </Text>
              )}
            </View>

            <Text style={styles.entryAmount}>
              ₹
              {entry.amount.toLocaleString(
                "en-IN"
              )}
            </Text>
          </View>
        ))}

        {entries.length === 0 && (
          <View style={styles.empty}>
            <Ionicons
              name="receipt-outline"
              size={50}
              color={Colors.textLight}
            />

            <Text style={styles.emptyTitle}>
              No Payments Yet
            </Text>

            <Text style={styles.emptySubtitle}>
              Payment history will appear here
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Record Payment
                </Text>

                <Text style={styles.modalSubtitle}>
                  Remaining ₹
                  {payment.remaining_amount.toLocaleString(
                    "en-IN"
                  )}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setModalVisible(false)
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <AppInput
              label="Payment Amount *"
              icon="cash-outline"
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <AppInput
              label="Payment Date"
              icon="calendar-outline"
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
            />

            <Text style={styles.modeLabel}>
              Payment Mode
            </Text>

            <View style={styles.modeRow}>
              <ModeButton
                title="Cash"
                icon="cash-outline"
                selected={mode === "cash"}
                onPress={() => setMode("cash")}
              />

              <ModeButton
                title="UPI"
                icon="phone-portrait-outline"
                selected={mode === "upi"}
                onPress={() => setMode("upi")}
              />

              <ModeButton
                title="Bank"
                icon="business-outline"
                selected={mode === "bank"}
                onPress={() => setMode("bank")}
              />
            </View>

            <AppInput
              label="Note"
              icon="document-text-outline"
              placeholder="Optional note"
              value={note}
              onChangeText={setNote}
            />

            <AppButton
              title="Confirm Payment"
              icon="checkmark-circle-outline"
              loading={saving}
              onPress={handlePayment}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatusBadge({
  status,
}: {
  status: PaymentWithWorker["status"];
}) {
  const config = {
    pending: {
      label: "Pending",
      color: Colors.danger,
      background: "#4dff00",
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
          {
            color: item.color,
          },
        ]}
      >
        {item.label}
      </Text>
    </View>
  );
}

function BreakdownRow({
  label,
  value,
  negative,
  final,
}: {
  label: string;
  value: number;
  negative?: boolean;
  final?: boolean;
}) {
  return (
    <View style={styles.breakdownRow}>
      <Text
        style={[
          styles.breakdownLabel,
          final && styles.finalLabel,
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.breakdownAmount,
          negative && styles.negative,
          final && styles.finalAmount,
        ]}
      >
        {negative ? "-" : ""}
        ₹
        {value.toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })}
      </Text>
    </View>
  );
}

function ModeButton({
  title,
  icon,
  selected,
  onPress,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.modeButton,
        selected && styles.selectedMode,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={20}
        color={
          selected
            ? Colors.white
            : Colors.textSecondary
        }
      />

      <Text
        style={[
          styles.modeText,
          selected && styles.selectedModeText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
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

function getModeIcon(
  mode: PaymentMode
): keyof typeof Ionicons.glyphMap {
  if (mode === "upi") {
    return "phone-portrait-outline";
  }

  if (mode === "bank") {
    return "business-outline";
  }

  return "cash-outline";
}

function getModeLabel(mode: PaymentMode) {
  if (mode === "upi") {
    return "UPI Payment";
  }

  if (mode === "bank") {
    return "Bank Transfer";
  }

  return "Cash Payment";
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
    fontSize: 11,
    color: Colors.textSecondary,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
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

  notFound: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  workerCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.primary,
  },

  workerContent: {
    flex: 1,
    marginLeft: 13,
  },

  workerName: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  workerInfo: {
    marginTop: 5,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  balanceCard: {
    marginTop: 15,
    padding: 22,
    borderRadius: 23,
    backgroundColor: Colors.primary,
  },

  balanceLabel: {
    fontSize: 11,
    color: "#DBEAFE",
  },

  balanceAmount: {
    marginTop: 6,
    fontSize: 31,
    fontWeight: "800",
    color: Colors.white,
  },

  balanceInfo: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoRight: {
    alignItems: "flex-end",
  },

  infoLabel: {
    fontSize: 10,
    color: "#DBEAFE",
  },

  infoAmount: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
  },

  paidAmount: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "800",
    color: "#86EFAC",
  },

  payButton: {
    marginTop: 14,
    height: 54,
    borderRadius: 17,
    backgroundColor: Colors.success,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  payButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
  },

  sectionTitle: {
    marginTop: 27,
    marginBottom: 13,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  breakdownCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  breakdownRow: {
    paddingVertical: 9,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  breakdownLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  breakdownAmount: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.success,
  },

  negative: {
    color: Colors.danger,
  },

  divider: {
    marginVertical: 7,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  finalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  finalAmount: {
    fontSize: 18,
    color: Colors.primary,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  recordCount: {
    marginTop: 14,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  entryCard: {
    marginBottom: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  entryIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  entryContent: {
    flex: 1,
    marginLeft: 12,
  },

  entryTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  entryDate: {
    marginTop: 3,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  entryNote: {
    marginTop: 4,
    fontSize: 9,
    color: Colors.textLight,
  },

  entryAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.success,
  },

  empty: {
    paddingVertical: 45,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  emptySubtitle: {
    marginTop: 5,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    padding: 20,
    paddingBottom: 35,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Colors.background,
  },

  modalHeader: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  modeLabel: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  modeRow: {
    marginBottom: 15,
    flexDirection: "row",
    gap: 9,
  },

  modeButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 15,
    backgroundColor: Colors.white,
    alignItems: "center",
    gap: 5,
  },

  selectedMode: {
    backgroundColor: Colors.primary,
  },

  modeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textSecondary,
  },

  selectedModeText: {
    color: Colors.white,
  },
});