import { Ionicons } from "@expo/vector-icons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { useSQLiteContext } from "expo-sqlite";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
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
  calculateWorkerMonthlyEarnings,
  createOrUpdatePayment,
  getWorkerMonthlyAdvance,
} from "@/src/repositories/paymentRepository";

import { getWorkerById } from "@/src/repositories/workerRepository";

import { WorkerWithSite } from "@/src/types/worker";

function getCurrentMonth() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

export default function CreatePaymentScreen() {
  const db = useSQLiteContext();

  const { workerId } = useLocalSearchParams<{
    workerId: string;
  }>();

  const month = getCurrentMonth();

  const [worker, setWorker] =
    useState<WorkerWithSite | null>(null);

  const [workingAmount, setWorkingAmount] =
    useState(0);

  const [advanceAmount, setAdvanceAmount] =
    useState(0);

  const [bonus, setBonus] = useState("");

  const [deduction, setDeduction] =
    useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [workerId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        workerData,
        earnings,
        advance,
      ] = await Promise.all([
        getWorkerById(db, workerId),

        calculateWorkerMonthlyEarnings(
          db,
          workerId,
          month
        ),

        getWorkerMonthlyAdvance(
          db,
          workerId,
          month
        ),
      ]);

      setWorker(workerData);

      setWorkingAmount(earnings);

      setAdvanceAmount(advance);
    } catch (error) {
      console.error(
        "LOAD PAYMENT DATA ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const finalAmount = useMemo(() => {
    return Math.max(
      workingAmount -
        advanceAmount +
        Number(bonus || 0) -
        Number(deduction || 0),
      0
    );
  }, [
    workingAmount,
    advanceAmount,
    bonus,
    deduction,
  ]);

  const handleCreate = async () => {
    if (!worker) {
      return;
    }

    if (workingAmount <= 0) {
      Alert.alert(
        "No Earnings",
        "Worker has no earnings for this month"
      );

      return;
    }

    try {
      setSaving(true);

      const paymentId =
        await createOrUpdatePayment(db, {
          workerId: worker.id,
          month,
          workingAmount,
          advanceAmount,
          bonus: Number(bonus || 0),
          deduction: Number(deduction || 0),
          finalAmount,
        });

      router.replace(`/payment/${paymentId}`);
    } catch (error) {
      console.error(
        "CREATE PAYMENT ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to create payment"
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

        <Text style={styles.title}>
          Calculate Payment
        </Text>

        <View style={styles.space} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.workerCard}>
          <Text style={styles.workerName}>
            {worker?.name}
          </Text>

          <Text style={styles.workerInfo}>
            {worker?.worker_type}
            {" • "}
            {worker?.site_name || "No Site"}
          </Text>

          <Text style={styles.month}>
            Payment Month: {month}
          </Text>
        </View>

        <View style={styles.calculationCard}>
          <CalculationRow
            label="Working Amount"
            value={workingAmount}
          />

          <CalculationRow
            label="Advance"
            value={advanceAmount}
            negative
          />

          <CalculationRow
            label="Bonus"
            value={Number(bonus || 0)}
          />

          <CalculationRow
            label="Deduction"
            value={Number(deduction || 0)}
            negative
          />

          <View style={styles.divider} />

          <CalculationRow
            label="Final Payable"
            value={finalAmount}
            final
          />
        </View>

        <AppInput
          label="Bonus"
          icon="gift-outline"
          value={bonus}
          onChangeText={setBonus}
          keyboardType="numeric"
          placeholder="0"
        />

        <AppInput
          label="Other Deduction"
          icon="remove-circle-outline"
          value={deduction}
          onChangeText={setDeduction}
          keyboardType="numeric"
          placeholder="0"
        />

        <AppButton
          title="Create Payment"
          icon="wallet-outline"
          loading={saving}
          onPress={handleCreate}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function CalculationRow({
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
    <View style={styles.row}>
      <Text
        style={[
          styles.rowLabel,
          final && styles.finalLabel,
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.rowAmount,
          negative && styles.negative,
          final && styles.finalAmount,
        ]}
      >
        {negative ? "-" : ""}
        ₹{value.toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    height: 65,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  space: {
    width: 44,
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  workerCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  workerName: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  workerInfo: {
    marginTop: 5,
    color: Colors.textSecondary,
  },

  month: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },

  calculationCard: {
    marginVertical: 18,
    padding: 18,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  row: {
    paddingVertical: 9,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  rowLabel: {
    color: Colors.textSecondary,
  },

  rowAmount: {
    fontWeight: "800",
    color: Colors.success,
  },

  negative: {
    color: Colors.danger,
  },

  divider: {
    marginVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  finalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  finalAmount: {
    fontSize: 20,
    color: Colors.primary,
  },
});