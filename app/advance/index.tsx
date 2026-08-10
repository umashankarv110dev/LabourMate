import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";
import { demoAdvances } from "@/src/data/demoData";

export default function AdvanceScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Advances</Text>
          <Text style={styles.subtitle}>
            Worker advance history
          </Text>
        </View>

        <TouchableOpacity
          style={styles.add}
          onPress={() => router.push("/advance/create")}
        >
          <Ionicons
            name="add"
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>
          Total Advance This Month
        </Text>

        <Text style={styles.summaryValue}>₹7,000</Text>
      </View>

      <FlatList
        data={demoAdvances}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.icon}>
              <Ionicons
                name="cash-outline"
                size={22}
                color="#9333EA"
              />
            </View>

            <View style={styles.content}>
              <Text style={styles.name}>
                {item.workerName}
              </Text>

              <Text style={styles.details}>
                {item.date} • {item.mode}
              </Text>
            </View>

            <Text style={styles.amount}>
              ₹{item.amount.toLocaleString()}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
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
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  add: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#9333EA",
  },
  summaryLabel: {
    color: "#F3E8FF",
  },
  summaryValue: {
    marginTop: 7,
    fontSize: 27,
    fontWeight: "800",
    color: Colors.white,
  },
  list: {
    padding: 20,
  },
  card: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 18,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  details: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  amount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#9333EA",
  },
});