import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

import {
  getWorkerAttendanceReportDetail,
} from "@/src/repositories/reportRepository";

import {
  AttendanceReportDetail,
} from "@/src/types/report";

export default function AttendanceDetailScreen() {
  const db = useSQLiteContext();

  const params = useLocalSearchParams<{
    workerId?: string;
    workerName?: string;
    month?: string;
  }>();

  const workerId = params.workerId ?? "";
  const workerName =
    params.workerName ?? "Worker";
  const month =
    params.month ?? getCurrentMonth();

  const [attendance, setAttendance] = useState<
    AttendanceReportDetail[]
  >([]);

  const [loading, setLoading] = useState(true);

  const loadAttendance = async () => {
    try {
      setLoading(true);

      if (!workerId) {
        return;
      }

      const data =
        await getWorkerAttendanceReportDetail(
          db,
          workerId,
          month
        );

      setAttendance(data);
    } catch (error) {
      console.error(
        "LOAD ATTENDANCE DETAIL ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, [workerId, month])
  );

  const summary = useMemo(() => {
    return attendance.reduce(
      (result, item) => {
        if (item.status === "present") {
          result.present += 1;
        }

        if (item.status === "absent") {
          result.absent += 1;
        }

        if (item.status === "half_day") {
          result.halfDay += 1;
        }

        if (item.status === "leave") {
          result.leave += 1;
        }

        result.earning += item.amount ?? 0;

        return result;
      },
      {
        present: 0,
        absent: 0,
        halfDay: 0,
        leave: 0,
        earning: 0,
      }
    );
  }, [attendance]);

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
          style={styles.headerButton}
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
            {formatMonth(month)}
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color={Colors.primary}
          />
        </View>
      </View>

      <FlatList
        data={attendance}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.workerCard}>
              <View style={styles.workerTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(workerName)}
                  </Text>
                </View>

                <View style={styles.workerInfo}>
                  <Text style={styles.workerName}>
                    {workerName}
                  </Text>

                  <Text style={styles.workerMonth}>
                    Monthly attendance report
                  </Text>
                </View>

                <View style={styles.totalDaysBadge}>
                  <Text style={styles.totalDaysValue}>
                    {attendance.length}
                  </Text>

                  <Text style={styles.totalDaysLabel}>
                    Days
                  </Text>
                </View>
              </View>

              <View style={styles.workerDivider} />

              <Text style={styles.earningLabel}>
                TOTAL WORKING EARNING
              </Text>

              <Text style={styles.earningAmount}>
                ₹{formatAmount(summary.earning)}
              </Text>

              <Text style={styles.earningMonth}>
                {formatMonth(month)}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>
              Attendance Summary
            </Text>

            <View style={styles.summaryGrid}>
              <SummaryCard
                icon="checkmark"
                label="Present"
                value={summary.present}
                color="#16A34A"
                background="#F0FDF4"
              />

              <SummaryCard
                icon="close"
                label="Absent"
                value={summary.absent}
                color="#DC2626"
                background="#FEF2F2"
              />

              <SummaryCard
                icon="time-outline"
                label="Half Day"
                value={summary.halfDay}
                color="#D97706"
                background="#FFFBEB"
              />

              <SummaryCard
                icon="calendar-outline"
                label="Leave"
                value={summary.leave}
                color="#7C3AED"
                background="#FAF5FF"
              />
            </View>

            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>
                Attendance History
              </Text>

              <Text style={styles.recordCount}>
                {attendance.length} records
              </Text>
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <AttendanceHistoryItem
            attendance={item}
            isLast={index === attendance.length - 1}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="calendar-outline"
                size={30}
                color={Colors.textSecondary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No Attendance Found
            </Text>

            <Text style={styles.emptySubtitle}>
              No attendance records found for{" "}
              {formatMonth(month)}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
  background,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View
        style={[
          styles.summaryIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={color}
        />
      </View>

      <Text style={styles.summaryValue}>
        {value}
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>
    </View>
  );
}

function AttendanceHistoryItem({
  attendance,
  isLast,
}: {
  attendance: AttendanceReportDetail;
  isLast: boolean;
}) {
  const config = getAttendanceConfig(
    attendance.status
  );

  return (
    <View style={styles.historyItem}>
      <View style={styles.timeline}>
        <View
          style={[
            styles.timelineIcon,
            {
              backgroundColor: config.background,
            },
          ]}
        >
          <Ionicons
            name={config.icon}
            size={18}
            color={config.color}
          />
        </View>

        {!isLast && (
          <View style={styles.timelineLine} />
        )}
      </View>

      <View
        style={[
          styles.historyContent,
          !isLast && styles.historyBorder,
        ]}
      >
        <View style={styles.historyTop}>
          <View style={styles.dateContent}>
            <Text style={styles.historyDate}>
              {formatDate(
                attendance.attendance_date
              )}
            </Text>

            <Text style={styles.historyDay}>
              {formatDay(
                attendance.attendance_date
              )}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  config.background,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: config.color },
              ]}
            >
              {config.label}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons
              name="business-outline"
              size={14}
              color={Colors.textSecondary}
            />

            <Text style={styles.detailText}>
              {attendance.site_name ??
                "No site assigned"}
            </Text>
          </View>

          {attendance.amount > 0 && (
            <Text style={styles.dailyAmount}>
              +₹
              {formatAmount(attendance.amount)}
            </Text>
          )}
        </View>

        {attendance.note && (
          <View style={styles.noteContainer}>
            <Ionicons
              name="document-text-outline"
              size={14}
              color={Colors.textSecondary}
            />

            <Text style={styles.noteText}>
              {attendance.note}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function getAttendanceConfig(status: string) {
  switch (status) {
    case "present":
      return {
        label: "Present",
        icon: "checkmark" as const,
        color: "#16A34A",
        background: "#F0FDF4",
      };

    case "absent":
      return {
        label: "Absent",
        icon: "close" as const,
        color: "#DC2626",
        background: "#FEF2F2",
      };

    case "half_day":
      return {
        label: "Half Day",
        icon: "time-outline" as const,
        color: "#D97706",
        background: "#FFFBEB",
      };

    case "leave":
      return {
        label: "Leave",
        icon: "calendar-outline" as const,
        color: "#7C3AED",
        background: "#FAF5FF",
      };

    default:
      return {
        label: status,
        icon: "help-outline" as const,
        color: Colors.textSecondary,
        background: "#F1F5F9",
      };
  }
}

function getCurrentMonth() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((value) => value.charAt(0))
    .join("")
    .toUpperCase();
}

function formatAmount(amount: number) {
  return Number(amount ?? 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );
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

function formatDay(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-IN", {
    weekday: "long",
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  headerButton: {
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
    fontSize: 10,
    color: Colors.textSecondary,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 50,
  },

  workerCard: {
    marginTop: 5,
    padding: 20,
    borderRadius: 23,
    backgroundColor: Colors.primary,
  },

  workerTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.white,
  },

  workerInfo: {
    flex: 1,
    marginLeft: 13,
  },

  workerName: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.white,
  },

  workerMonth: {
    marginTop: 4,
    fontSize: 9,
    color: "#BFDBFE",
  },

  totalDaysBadge: {
    minWidth: 54,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
  },

  totalDaysValue: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.white,
  },

  totalDaysLabel: {
    marginTop: 2,
    fontSize: 8,
    color: "#DBEAFE",
  },

  workerDivider: {
    marginVertical: 18,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  earningLabel: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#BFDBFE",
  },

  earningAmount: {
    marginTop: 6,
    fontSize: 27,
    fontWeight: "800",
    color: Colors.white,
  },

  earningMonth: {
    marginTop: 4,
    fontSize: 9,
    color: "#DBEAFE",
  },

  sectionTitle: {
    marginTop: 25,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  summaryGrid: {
    flexDirection: "row",
    gap: 8,
  },

  summaryCard: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 17,
    backgroundColor: Colors.white,
    alignItems: "center",
  },

  summaryIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryValue: {
    marginTop: 7,
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  summaryLabel: {
    marginTop: 2,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  historyHeader: {
    marginTop: 25,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  recordCount: {
    fontSize: 9,
    color: Colors.textSecondary,
  },

  historyItem: {
    flexDirection: "row",
    backgroundColor: Colors.white,
  },

  timeline: {
    width: 57,
    alignItems: "center",
  },

  timelineIcon: {
    marginTop: 15,
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: Colors.border,
  },

  historyContent: {
    flex: 1,
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 15,
  },

  historyBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  historyTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dateContent: {
    flex: 1,
  },

  historyDate: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  historyDay: {
    marginTop: 3,
    fontSize: 9,
    color: Colors.textSecondary,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
  },

  statusText: {
    fontSize: 8,
    fontWeight: "800",
  },

  detailRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  detailText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 9,
    color: Colors.textSecondary,
  },

  dailyAmount: {
    fontSize: 12,
    fontWeight: "800",
    color: "#16A34A",
  },

  noteContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 11,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  noteText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 9,
    lineHeight: 14,
    color: Colors.textSecondary,
  },

  empty: {
    paddingVertical: 60,
    alignItems: "center",
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  emptySubtitle: {
    marginTop: 6,
    maxWidth: 250,
    textAlign: "center",
    fontSize: 10,
    color: Colors.textSecondary,
  },
});