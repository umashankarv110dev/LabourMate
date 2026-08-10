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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppButton from "@/src/components/AppButton";
import AppCard from "@/src/components/AppCard";
import { Colors } from "@/src/constants/colors";
import {
  deleteWorker,
  getWorkerById,
  updateWorkerStatus,
} from "@/src/repositories/workerRepository";
import { WorkerWithSite } from "@/src/types/worker";

export default function WorkerDetailsScreen() {
  const db = useSQLiteContext();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [worker, setWorker] =
    useState<WorkerWithSite | null>(null);

  const [loading, setLoading] = useState(true);

  const loadWorker = async () => {
    try {
      setLoading(true);

      const data = await getWorkerById(db, id);

      setWorker(data);
    } catch (error) {
      console.error(
        "LOAD WORKER DETAILS ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWorker();
    }, [id])
  );

  const handleStatusChange = () => {
    if (!worker) {
      return;
    }

    const newStatus =
      worker.status === "active"
        ? "inactive"
        : "active";

    Alert.alert(
      newStatus === "active"
        ? "Activate Worker"
        : "Deactivate Worker",
      `Are you sure you want to ${
        newStatus === "active"
          ? "activate"
          : "deactivate"
      } ${worker.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text:
            newStatus === "active"
              ? "Activate"
              : "Deactivate",
          onPress: async () => {
            try {
            console.log("STATUS FUNCTION:", updateWorkerStatus);
            console.log("WORKER ID:", worker.id);
            console.log("NEW STATUS:", newStatus);
              await updateWorkerStatus(
                db,
                worker.id,
                newStatus
              );

              await loadWorker();
            } catch (error) {
              console.error(
                "UPDATE STATUS ERROR:",
                error
              );

              Alert.alert(
                "Error",
                "Unable to update worker status"
              );
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    if (!worker) {
      return;
    }

    Alert.alert(
      "Delete Worker",
      `Permanently delete ${worker.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWorker(db, worker.id);

              router.back();
            } catch (error) {
              console.error(
                "DELETE WORKER ERROR:",
                error
              );

              Alert.alert(
                "Error",
                "Unable to delete worker"
              );
            }
          },
        },
      ]
    );
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
          <Ionicons
            name="person-outline"
            size={55}
            color={Colors.textLight}
          />

          <Text style={styles.notFound}>
            Worker not found
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
          >
            <Text style={styles.goBack}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initials = worker.name
    .split(" ")
    .map((item) => item[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isActive = worker.status === "active";
  console.log(
    "updateWorkerStatus:",
    updateWorkerStatus
  );
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

        <Text style={styles.headerTitle}>
          Worker Details
        </Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() =>
            router.push(`/worker/edit/${worker.id}`)
          }
        >
          <Ionicons
            name="create-outline"
            size={22}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initials}
            </Text>
          </View>

          <Text style={styles.name}>
            {worker.name}
          </Text>

          <Text style={styles.role}>
            {worker.worker_type}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isActive
                  ? "#DCFCE7"
                  : "#FEE2E2",
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isActive
                    ? Colors.success
                    : Colors.danger,
                },
              ]}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: isActive
                    ? Colors.success
                    : Colors.danger,
                },
              ]}
            >
              {isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <QuickAction
            icon="calendar-outline"
            title="Attendance"
            onPress={() =>
              router.push(
                `/worker/attendance/${worker.id}`
              )
            }
          />

          <QuickAction
            icon="cash-outline"
            title="Advance"
            onPress={() =>
              router.push({
                pathname: "/advance/create",
                params: {
                  workerId: worker.id,
                },
              })
            }
          />

          <QuickAction
            icon="wallet-outline"
            title="Payment"
            onPress={() =>
              router.push({
                pathname: "/payment/create",
                params: {
                  workerId: worker.id,
                },
              })
            }
          />

          <QuickAction
            icon="book-outline"
            title="Ledger"
            onPress={() =>
              router.push(`/ledger/${worker.id}`)
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Work Information
        </Text>

        <AppCard>
          <InfoRow
            icon="construct-outline"
            label="Worker Type"
            value={worker.worker_type}
          />

          <InfoRow
            icon="business-outline"
            label="Site"
            value={worker.site_name || "No Site"}
          />

          <InfoRow
            icon="cash-outline"
            label={
              worker.payment_type === "daily"
                ? "Daily Wage"
                : "Monthly Salary"
            }
            value={`₹${worker.wage.toLocaleString()}`}
          />

          <InfoRow
            icon="wallet-outline"
            label="Payment Type"
            value={
              worker.payment_type === "daily"
                ? "Daily"
                : "Monthly"
            }
          />

          <InfoRow
            icon="calendar-outline"
            label="Joining Date"
            value={
              worker.joining_date || "Not Available"
            }
          />
        </AppCard>

        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        <AppCard>
          <InfoRow
            icon="call-outline"
            label="Mobile Number"
            value={worker.phone || "Not Available"}
          />

          <InfoRow
            icon="location-outline"
            label="Address"
            value={worker.address || "Not Available"}
          />
        </AppCard>

        <AppButton
          title={
            isActive
              ? "Deactivate Worker"
              : "Activate Worker"
          }
          icon={
            isActive
              ? "pause-circle-outline"
              : "checkmark-circle-outline"
          }
          onPress={handleStatusChange}
          style={styles.statusButton}
        />

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={Colors.danger}
          />

          <Text style={styles.deleteText}>
            Delete Worker
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.quickAction}
      onPress={onPress}
    >
      <View style={styles.quickIcon}>
        <Ionicons
          name={icon}
          size={22}
          color={Colors.primary}
        />
      </View>

      <Text style={styles.quickTitle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={20}
          color={Colors.primary}
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
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

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
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
    marginTop: 15,
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  goBack: {
    marginTop: 15,
    fontWeight: "700",
    color: Colors.primary,
  },

  profile: {
    alignItems: "center",
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.primary,
  },

  name: {
    marginTop: 14,
    fontSize: 23,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  role: {
    marginTop: 5,
    color: Colors.textSecondary,
  },

  statusBadge: {
    marginTop: 11,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },

  quickActions: {
    marginTop: 28,
    flexDirection: "row",
    gap: 10,
  },

  quickAction: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 17,
    backgroundColor: Colors.white,
    alignItems: "center",
  },

  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  quickTitle: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  sectionTitle: {
    marginTop: 28,
    marginBottom: 13,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  infoRow: {
    marginVertical: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 12,
  },

  infoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  infoValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  statusButton: {
    marginTop: 28,
  },

  deleteButton: {
    marginTop: 14,
    height: 55,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  deleteText: {
    fontWeight: "800",
    color: Colors.danger,
  },
});