import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Colors } from "@/src/constants/colors";

export default function DashboardScreen() {
  const menu = [
    {
      title: "Create Quotation / Bill",
      subtitle: "Create a new quotation or invoice",
      icon: "document-text-outline",
      color: "#2E7DFF",
      route: "/quotation/create",
    },
    {
      title: "Quotation History",
      subtitle: "View all quotations & bills",
      icon: "folder-open-outline",
      color: "#FF9800",
      route: "/quotation/history",
    },
    {
      title: "Company Settings",
      subtitle: "Manage your company profile",
      icon: "business-outline",
      color: "#00A86B",
      route: "/settings/company",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}

        <LinearGradient
          colors={["#2563EB", "#3B82F6", "#60A5FA"]}
          style={styles.header}
        >
          <Text style={styles.greeting}>👋 Welcome Back</Text>

          <Text style={styles.title}>QuotePro</Text>

          <Text style={styles.subtitle}>
            Professional Quotation & Billing
          </Text>

          <View style={styles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color="#fff"
            />

            <Text style={styles.date}>
              04 August 2026
            </Text>
          </View>
        </LinearGradient>

        {/* STATS */}

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "#E8F0FE" },
              ]}
            >
              <Ionicons
                name="document-text"
                size={24}
                color="#2563EB"
              />
            </View>

            <Text style={styles.statNumber}>0</Text>

            <Text style={styles.statLabel}>
              Quotations
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "#FFF4E5" },
              ]}
            >
              <Ionicons
                name="receipt"
                size={24}
                color="#FB8C00"
              />
            </View>

            <Text style={styles.statNumber}>0</Text>

            <Text style={styles.statLabel}>
              Bills
            </Text>
          </View>
        </View>

        {/* QUICK ACTION */}

        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        {menu.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.85}
            style={styles.actionCard}
            onPress={() =>
              router.push(item.route as any)
            }
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    item.color + "20",
                },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={28}
                color={item.color}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>
                {item.title}
              </Text>

              <Text
                style={styles.actionSubtitle}
              >
                {item.subtitle}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color="#999"
            />
          </TouchableOpacity>
        ))}

        {/* RECENT */}

        <Text style={styles.sectionTitle}>
          Recent Activity
        </Text>

        <View style={styles.activityCard}>
          <Ionicons
            name="time-outline"
            size={30}
            color="#999"
          />

          <Text style={styles.activityTitle}>
            No recent activity
          </Text>

          <Text style={styles.activitySubtitle}>
            Your latest quotations and bills
            will appear here.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },

  header: {
    paddingTop: 50,
    paddingHorizontal: 22,
    paddingBottom: 80,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },

  greeting: {
    color: "#DDEBFF",
    fontSize: 16,
  },

  title: {
    fontSize: 34,
    color: "#fff",
    fontWeight: "800",
    marginTop: 1,
  },

  subtitle: {
    color: "#EAF4FF",
    marginTop: 8,
    fontSize: 15,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  date: {
    color: "#fff",
    marginLeft: 8,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: -60,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 10,
    alignItems: "center",
    elevation: 8,
  },

  statIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",
  },

  statLabel: {
    color: "#777",
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 15,
    color: "#222",
  },

  actionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 22,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
  },

  actionTitle: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "left",
  },

  actionSubtitle: {
    marginTop: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "left",
    lineHeight: 18,
  },

  activityCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 22,
    padding: 30,
    alignItems: "center",
    elevation: 4,
  },

  activityTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 12,
    color: "#333",
  },

  activitySubtitle: {
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});