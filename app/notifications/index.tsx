import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

const notifications = [
  {
    id: "1",
    title: "Attendance Pending",
    message: "Mark today's attendance for Andheri Tower.",
    icon: "calendar-outline",
    time: "10 min ago",
  },
  {
    id: "2",
    title: "Payment Pending",
    message: "₹13,400 payment pending for Ramesh Yadav.",
    icon: "wallet-outline",
    time: "1 hour ago",
  },
  {
    id: "3",
    title: "Advance Added",
    message: "₹2,000 advance recorded for Suresh Kumar.",
    icon: "cash-outline",
    time: "Yesterday",
  },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>

        <Text style={styles.title}>Notifications</Text>

        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {notifications.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.icon}>
              <Ionicons
                name={item.icon as any}
                size={22}
                color={Colors.primary}
              />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                {item.title}
              </Text>

              <Text style={styles.message}>
                {item.message}
              </Text>

              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
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
  content: {
    padding: 20,
  },
  card: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 18,
    backgroundColor: Colors.white,
    flexDirection: "row",
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  message: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  time: {
    marginTop: 7,
    fontSize: 10,
    color: Colors.textLight,
  },
});