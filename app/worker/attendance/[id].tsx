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
  getWorkerAttendance,
  getWorkerMonthlyAttendanceSummary,
  WorkerMonthlyAttendanceSummary,
} from "@/src/repositories/attendanceRepository";

import {
  getWorkerById,
} from "@/src/repositories/workerRepository";

import {
  AttendanceWithWorker,
} from "@/src/types/attendance";

import {
  WorkerWithSite,
} from "@/src/types/worker";

function getCurrentMonth() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

export default function WorkerAttendanceScreen() {
  const db = useSQLiteContext();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [worker, setWorker] =
    useState<WorkerWithSite | null>(null);

  const [attendance, setAttendance] = useState<
    AttendanceWithWorker[]
  >([]);

  const [summary, setSummary] =
    useState<WorkerMonthlyAttendanceSummary>({
      present_count: 0,
      absent_count: 0,
      half_day_count: 0,
      leave_count: 0,
      total_amount: 0,
    });

  const [loading, setLoading] = useState(true);

  const month = getCurrentMonth();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        workerData,
        attendanceData,
        summaryData,
      ] = await Promise.all([
        getWorkerById(db, id),

        getWorkerAttendance(db, id),

        getWorkerMonthlyAttendanceSummary(
          db,
          id,
          month
        ),
      ]);

      setWorker(workerData);
      setAttendance(attendanceData);
      setSummary(summaryData);
    } catch (error) {
      console.error(
        "LOAD WORKER ATTENDANCE ERROR:",
        error
      );
    } finally {
      setLoading(false);
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

        <View style={styles.headerContent}>
          <Text style={styles.title}>
            Attendance
          </Text>

          <Text style={styles.subtitle}>
            {worker?.name || "Worker"}
          </Text>
        </View>

        <View style={styles.space} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.monthCard}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color={Colors.primary}
          />

          <View style={styles.monthContent}>
            <Text style={styles.monthLabel}>
              Current Month
            </Text>

            <Text style={styles.month}>
              {formatMonth(month)}
            </Text>
          </View>
        </View>

        <View style={styles.summary}>
          <SummaryCard
            value={summary.present_count}
            label="Present"
            color={Colors.success}
          />

          <SummaryCard
            value={summary.absent_count}
            label="Absent"
            color={Colors.danger}
          />

          <SummaryCard
            value={summary.half_day_count}
            label="Half Day"
            color={Colors.warning}
          />

          <SummaryCard
            value={summary.leave_count}
            label="Leave"
            color="#9333EA"
          />
        </View>

        {worker?.payment_type === "daily" && (
          <View style={styles.earningCard}>
            <View>
              <Text style={styles.earningLabel}>
                Attendance Earnings
              </Text>

              <Text style={styles.earningNote}>
                {formatMonth(month)}
              </Text>
            </View>

            <Text style={styles.earningAmount}>
              ₹
              {summary.total_amount.toLocaleString()}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          Attendance History
        </Text>

        {attendance.map((item) => (
          <View key={item.id} style={styles.record}>
            <View style={styles.recordDate}>
              <Text style={styles.day}>
                {getDay(item.attendance_date)}
              </Text>

              <Text style={styles.monthShort}>
                {getMonthShort(
                  item.attendance_date
                )}
              </Text>
            </View>

            <View style={styles.recordContent}>
              <Text style={styles.recordTitle}>
                {getStatusLabel(item.status)}
              </Text>

              <Text style={styles.site}>
                {item.site_name || "No Site"}
              </Text>
            </View>

            {item.amount > 0 && (
              <Text style={styles.amount}>
                ₹{item.amount.toLocaleString()}
              </Text>
            )}

            <StatusDot status={item.status} />
          </View>
        ))}

        {attendance.length === 0 && (
          <View style={styles.empty}>
            <Ionicons
              name="calendar-outline"
              size={50}
              color={Colors.textLight}
            />

            <Text style={styles.emptyTitle}>
              No Attendance
            </Text>

            <Text style={styles.emptySubtitle}>
              Attendance records will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text
        style={[
          styles.summaryValue,
          { color },
        ]}
      >
        {value}
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>
    </View>
  );
}

function StatusDot({
  status,
}: {
  status: AttendanceWithWorker["status"];
}) {
  const colors = {
    present: Colors.success,
    absent: Colors.danger,
    half_day: Colors.warning,
    leave: "#9333EA",
  };

  return (
    <View
      style={[
        styles.statusDot,
        {
          backgroundColor: colors[status],
        },
      ]}
    />
  );
}

function getStatusLabel(
  status: AttendanceWithWorker["status"]
) {
  const labels = {
    present: "Present",
    absent: "Absent",
    half_day: "Half Day",
    leave: "Leave",
  };

  return labels[status];
}

function getDay(date: string) {
  return date.split("-")[2];
}

function getMonthShort(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-IN", {
    month: "short",
  });
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
    fontSize: 12,
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
    paddingBottom: 50,
  },

  monthCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  monthContent: {
    marginLeft: 12,
  },

  monthLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },

  month: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  summary: {
    marginTop: 14,
    flexDirection: "row",
    gap: 7,
  },

  summaryCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: Colors.white,
    alignItems: "center",
  },

  summaryValue: {
    fontSize: 19,
    fontWeight: "800",
  },

  summaryLabel: {
    marginTop: 3,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  earningCard: {
    marginTop: 14,
    padding: 18,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  earningLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.white,
  },

  earningNote: {
    marginTop: 4,
    fontSize: 10,
    color: "#DBEAFE",
  },

  earningAmount: {
    fontSize: 22,
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

  record: {
    marginBottom: 10,
    padding: 14,
    borderRadius: 17,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  recordDate: {
    width: 48,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  day: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.primary,
  },

  monthShort: {
    marginTop: 1,
    fontSize: 9,
    color: Colors.primary,
  },

  recordContent: {
    flex: 1,
    marginLeft: 12,
  },

  recordTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  site: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  amount: {
    marginRight: 12,
    fontSize: 12,
    fontWeight: "800",
    color: Colors.success,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  empty: {
    paddingVertical: 60,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 13,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  emptySubtitle: {
    marginTop: 5,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});