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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

import { getAttendanceReport } from "@/src/repositories/reportRepository";

import { AttendanceReportItem } from "@/src/types/report";

export default function AttendanceReportScreen() {
  const db = useSQLiteContext();

  const params = useLocalSearchParams<{
    month?: string;
  }>();

  const month =
    params.month ?? getCurrentMonth();

  const [reports, setReports] = useState<
    AttendanceReportItem[]
  >([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);

      const data = await getAttendanceReport(
        db,
        month
      );

      setReports(data);
    } catch (error) {
      console.error(
        "LOAD ATTENDANCE REPORT ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReport();
    }, [month])
  );

  const filteredReports = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return reports;
    }

    return reports.filter((worker) => {
      return (
        worker.worker_name
          .toLowerCase()
          .includes(value) ||
        worker.worker_type
          .toLowerCase()
          .includes(value) ||
        worker.site_name
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [reports, search]);

  const summary = useMemo(() => {
    return reports.reduce(
      (result, worker) => {
        result.present += worker.present_count;
        result.absent += worker.absent_count;
        result.halfDay += worker.half_day_count;
        result.leave += worker.leave_count;

        return result;
      },
      {
        present: 0,
        absent: 0,
        halfDay: 0,
        leave: 0,
      }
    );
  }, [reports]);

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
            Attendance Report
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

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color={Colors.primary}
          />
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.worker_id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>
                  MONTHLY ATTENDANCE
                </Text>

                <Text style={styles.summaryMonth}>
                  {formatMonth(month)}
                </Text>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryStats}>
                  <SummaryStat
                    value={summary.present}
                    label="Present"
                    color="#16A34A"
                  />

                  <SummaryStat
                    value={summary.absent}
                    label="Absent"
                    color="#DC2626"
                  />

                  <SummaryStat
                    value={summary.halfDay}
                    label="Half Day"
                    color="#D97706"
                  />

                  <SummaryStat
                    value={summary.leave}
                    label="Leave"
                    color="#7C3AED"
                  />
                </View>
              </View>

              <View style={styles.searchContainer}>
                <Ionicons
                  name="search-outline"
                  size={20}
                  color={Colors.textSecondary}
                />

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search worker, type or site"
                  placeholderTextColor={
                    Colors.textLight
                  }
                  style={styles.searchInput}
                />

                {search.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearch("")}
                  >
                    <Ionicons
                      name="close-circle"
                      size={19}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>
                  Worker Attendance
                </Text>

                <Text style={styles.workerCount}>
                  {filteredReports.length} workers
                </Text>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <WorkerAttendanceCard
              worker={item}
              month={month}
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
                No worker attendance found for
                this month
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function WorkerAttendanceCard({
  worker,
  month,
}: {
  worker: AttendanceReportItem;
  month: string;
}) {
  return (
    <TouchableOpacity
      style={styles.workerCard}
      activeOpacity={0.75}
      onPress={() =>
        router.push({
          pathname: "/report/attendance-detail",
          params: {
            workerId: worker.worker_id,
            workerName: worker.worker_name,
            month,
          },
        })
      }
    >
      <View style={styles.workerHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(worker.worker_name)}
          </Text>
        </View>

        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>
            {worker.worker_name}
          </Text>

          <Text style={styles.workerMeta}>
            {worker.worker_type}

            {worker.site_name
              ? ` • ${worker.site_name}`
              : ""}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={Colors.textLight}
        />
      </View>

      <View style={styles.workerDivider} />

      <View style={styles.attendanceRow}>
        <AttendanceValue
          label="P"
          value={worker.present_count}
          color="#16A34A"
          background="#F0FDF4"
        />

        <AttendanceValue
          label="A"
          value={worker.absent_count}
          color="#DC2626"
          background="#FEF2F2"
        />

        <AttendanceValue
          label="HD"
          value={worker.half_day_count}
          color="#D97706"
          background="#FFFBEB"
        />

        <AttendanceValue
          label="L"
          value={worker.leave_count}
          color="#7C3AED"
          background="#FAF5FF"
        />

        <View style={styles.earningContent}>
          <Text style={styles.earningLabel}>
            Earning
          </Text>

          <Text style={styles.earningAmount}>
            ₹{formatAmount(worker.working_amount)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SummaryStat({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.summaryStat}>
      <Text
        style={[
          styles.summaryStatValue,
          { color },
        ]}
      >
        {value}
      </Text>

      <Text style={styles.summaryStatLabel}>
        {label}
      </Text>
    </View>
  );
}

function AttendanceValue({
  label,
  value,
  color,
  background,
}: {
  label: string;
  value: number;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.attendanceValue}>
      <View
        style={[
          styles.attendanceBadge,
          { backgroundColor: background },
        ]}
      >
        <Text
          style={[
            styles.attendanceBadgeText,
            { color },
          ]}
        >
          {label}
        </Text>
      </View>

      <Text style={styles.attendanceCount}>
        {value}
      </Text>
    </View>
  );
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
  return amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
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

  summaryCard: {
    marginTop: 5,
    padding: 20,
    borderRadius: 23,
    backgroundColor: Colors.primary,
  },

  summaryLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#BFDBFE",
  },

  summaryMonth: {
    marginTop: 5,
    fontSize: 22,
    fontWeight: "800",
    color: Colors.white,
  },

  summaryDivider: {
    marginVertical: 17,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  summaryStats: {
    flexDirection: "row",
  },

  summaryStat: {
    flex: 1,
    alignItems: "center",
  },

  summaryStatValue: {
    fontSize: 19,
    fontWeight: "800",
  },

  summaryStatLabel: {
    marginTop: 4,
    fontSize: 8,
    color: "#DBEAFE",
  },

  searchContainer: {
    marginTop: 18,
    height: 52,
    paddingHorizontal: 15,
    borderRadius: 17,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    color: Colors.textPrimary,
  },

  listHeader: {
    marginTop: 25,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  listTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  workerCount: {
    fontSize: 10,
    color: Colors.textSecondary,
  },

  workerCard: {
    marginBottom: 11,
    padding: 15,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  workerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.primary,
  },

  workerInfo: {
    flex: 1,
    marginLeft: 11,
  },

  workerName: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  workerMeta: {
    marginTop: 4,
    fontSize: 9,
    color: Colors.textSecondary,
  },

  workerDivider: {
    marginVertical: 13,
    height: 1,
    backgroundColor: Colors.border,
  },

  attendanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  attendanceValue: {
    marginRight: 13,
    alignItems: "center",
  },

  attendanceBadge: {
    minWidth: 27,
    height: 27,
    paddingHorizontal: 5,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  attendanceBadgeText: {
    fontSize: 8,
    fontWeight: "800",
  },

  attendanceCount: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  earningContent: {
    flex: 1,
    alignItems: "flex-end",
  },

  earningLabel: {
    fontSize: 8,
    color: Colors.textSecondary,
  },

  earningAmount: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "800",
    color: "#16A34A",
  },

  empty: {
    paddingTop: 60,
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
    fontSize: 10,
    color: Colors.textSecondary,
  },
});