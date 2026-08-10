import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

import {
  getAttendanceByDate,
} from "@/src/repositories/attendanceRepository";

import {
  AttendanceWithWorker,
} from "@/src/types/attendance";

export default function AttendanceDateDetailsScreen() {
  const db = useSQLiteContext();

  const { date, siteId } = useLocalSearchParams<{
    date: string;
    siteId?: string;
  }>();

  const [attendance, setAttendance] = useState<
    AttendanceWithWorker[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, [date, siteId]);

  const loadAttendance = async () => {
    try {
      setLoading(true);

      const data = await getAttendanceByDate(
        db,
        date
      );

      const filteredData = siteId
        ? data.filter(
            (item) => item.site_id === siteId
          )
        : data;

      setAttendance(filteredData);
    } catch (error) {
      console.error(
        "LOAD DATE ATTENDANCE ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

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
            Attendance Details
          </Text>

          <Text style={styles.subtitle}>
            {formatDate(date)}
          </Text>
        </View>

        <View style={styles.space} />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color={Colors.primary}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {attendance.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() =>
                router.push(
                  `/worker/${item.worker_id}`
                )
              }
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(item.worker_name)}
                </Text>
              </View>

              <View style={styles.workerContent}>
                <Text style={styles.name}>
                  {item.worker_name}
                </Text>

                <Text style={styles.info}>
                  {item.worker_type}
                  {" • "}
                  {item.site_name || "No Site"}
                </Text>

                {item.amount > 0 && (
                  <Text style={styles.amount}>
                    ₹{item.amount.toLocaleString()}
                  </Text>
                )}
              </View>

              <StatusBadge status={item.status} />
            </TouchableOpacity>
          ))}

          {attendance.length === 0 && (
            <View style={styles.empty}>
              <Ionicons
                name="calendar-outline"
                size={55}
                color={Colors.textLight}
              />

              <Text style={styles.emptyTitle}>
                No Attendance
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function StatusBadge({
  status,
}: {
  status: AttendanceWithWorker["status"];
}) {
  const config = {
    present: {
      text: "P",
      color: Colors.success,
      background: "#DCFCE7",
    },

    absent: {
      text: "A",
      color: Colors.danger,
      background: "#FEE2E2",
    },

    half_day: {
      text: "HD",
      color: Colors.warning,
      background: "#FEF3C7",
    },

    leave: {
      text: "L",
      color: "#9333EA",
      background: "#F3E8FF",
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
        {item.text}
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

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
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
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  space: {
    width: 44,
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  card: {
    marginBottom: 11,
    padding: 15,
    borderRadius: 18,
    backgroundColor: Colors.white,
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

  name: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  info: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  amount: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "800",
    color: Colors.success,
  },

  statusBadge: {
    minWidth: 42,
    height: 42,
    paddingHorizontal: 8,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  statusText: {
    fontSize: 13,
    fontWeight: "800",
  },

  empty: {
    paddingTop: 100,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
});