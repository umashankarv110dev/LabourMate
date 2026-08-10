import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

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
  createAdvance,
  getWorkerAdvanceTotal,
} from "@/src/repositories/advanceRepository";

import {
  getWorkerById,
} from "@/src/repositories/workerRepository";

import { WorkerWithSite } from "@/src/types/worker";

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

export default function CreateAdvanceScreen() {
  const db = useSQLiteContext();

  const { workerId } = useLocalSearchParams<{
    workerId: string;
  }>();

  const [worker, setWorker] =
    useState<WorkerWithSite | null>(null);

  const [previousAdvance, setPreviousAdvance] =
    useState(0);

  const [amount, setAmount] = useState("");

  const [date, setDate] = useState(
    getTodayDate()
  );

  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [workerId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [workerData, advanceTotal] =
        await Promise.all([
          getWorkerById(db, workerId),

          getWorkerAdvanceTotal(
            db,
            workerId
          ),
        ]);

      setWorker(workerData);
      setPreviousAdvance(advanceTotal);
    } catch (error) {
      console.error(
        "LOAD ADVANCE DATA ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const advanceAmount = Number(amount);

    if (!amount || advanceAmount <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter valid advance amount"
      );

      return;
    }

    if (!worker) {
      return;
    }

    try {
      setSaving(true);

      await createAdvance(db, {
        workerId: worker.id,
        amount: advanceAmount,
        date,
        note,
      });

      Alert.alert(
        "Advance Added",
        `₹${advanceAmount.toLocaleString()} advance added for ${worker.name}`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(
        "CREATE ADVANCE ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to add advance"
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

  if (!worker) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <Text style={styles.notFound}>
            Worker not found
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

        <Text style={styles.title}>
          Give Advance
        </Text>

        <View style={styles.space} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.workerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(worker.name)}
            </Text>
          </View>

          <View style={styles.workerContent}>
            <Text style={styles.workerName}>
              {worker.name}
            </Text>

            <Text style={styles.workerInfo}>
              {worker.worker_type}
              {" • "}
              {worker.site_name || "No Site"}
            </Text>
          </View>
        </View>

        <View style={styles.advanceCard}>
          <Text style={styles.advanceLabel}>
            Total Previous Advance
          </Text>

          <Text style={styles.advanceAmount}>
            ₹{previousAdvance.toLocaleString()}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Advance Details
        </Text>

        <AppInput
          label="Advance Amount *"
          icon="cash-outline"
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <AppInput
          label="Advance Date"
          icon="calendar-outline"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />

        <AppInput
          label="Note"
          icon="document-text-outline"
          placeholder="Reason or note"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <AppButton
          title="Add Advance"
          icon="wallet-outline"
          loading={saving}
          onPress={handleSave}
        />
      </ScrollView>
    </SafeAreaView>
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

  advanceCard: {
    marginTop: 15,
    padding: 18,
    borderRadius: 19,
    backgroundColor: "#FEF3C7",
  },

  advanceLabel: {
    fontSize: 11,
    color: "#92400E",
  },

  advanceAmount: {
    marginTop: 5,
    fontSize: 24,
    fontWeight: "800",
    color: "#92400E",
  },

  sectionTitle: {
    marginTop: 28,
    marginBottom: 15,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
});