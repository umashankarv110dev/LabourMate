import { Ionicons } from "@expo/vector-icons";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/src/constants/colors";

import { WorkerWithSite } from "@/src/types/worker";

type Props = {
  worker: WorkerWithSite;
  onPress: () => void;
};

export default function WorkerCard({
  worker,
  onPress,
}: Props) {
  const initials = worker.name
    .split(" ")
    .map((item) => item[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {initials}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>
          {worker.name}
        </Text>

        <Text style={styles.role}>
          {worker.worker_type}
          {" • "}
          {worker.site_name || "No Site"}
        </Text>

        <View style={styles.wageRow}>
          <Ionicons
            name="cash-outline"
            size={15}
            color={Colors.success}
          />

          <Text style={styles.wage}>
            ₹{worker.wage.toLocaleString()} /{" "}
            {worker.payment_type === "daily"
              ? "Day"
              : "Month"}
          </Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={Colors.textLight}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.primary,
  },

  content: {
    flex: 1,
    marginLeft: 13,
  },

  name: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  role: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  wageRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  wage: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.success,
  },
});