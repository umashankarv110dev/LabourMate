import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

import { Colors } from "@/src/constants/colors";

import {
  calculateAttendanceAmount,
  getAttendanceWorkers,
  saveAttendance,
} from "@/src/repositories/attendanceRepository";

import {
  getActiveSites,
} from "@/src/repositories/siteRepository";

import {
  AttendanceStatus,
  AttendanceWorker,
} from "@/src/types/attendance";

import { Site } from "@/src/types/site";

type AttendanceMap = Record<
  string,
  AttendanceStatus | undefined
>;

const attendanceOptions: {
  status: AttendanceStatus;
  short: string;
  label: string;
  color: string;
  background: string;
}[] = [
  {
    status: "present",
    short: "P",
    label: "Present",
    color: Colors.success,
    background: "#DCFCE7",
  },
  {
    status: "absent",
    short: "A",
    label: "Absent",
    color: Colors.danger,
    background: "#FEE2E2",
  },
  {
    status: "half_day",
    short: "HD",
    label: "Half Day",
    color: Colors.warning,
    background: "#FEF3C7",
  },
  {
    status: "leave",
    short: "L",
    label: "Leave",
    color: "#9333EA",
    background: "#F3E8FF",
  },
];

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

export default function AttendanceScreen() {
  const db = useSQLiteContext();

  const [date, setDate] = useState(
    getTodayDate()
  );

  const [sites, setSites] = useState<Site[]>(
    []
  );

  const [siteId, setSiteId] = useState<
    string | undefined
  >();

  const [workers, setWorkers] = useState<
    AttendanceWorker[]
  >([]);

  const [attendance, setAttendance] =
    useState<AttendanceMap>({});

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const loadSites = async () => {
    try {
      const data = await getActiveSites(db);

      setSites(data);
    } catch (error) {
      console.error(
        "LOAD ATTENDANCE SITES ERROR:",
        error
      );
    }
  };

  const loadWorkers = async () => {
    try {
      setLoading(true);

      const data = await getAttendanceWorkers(
        db,
        date,
        siteId
      );

      setWorkers(data);

      const attendanceData: AttendanceMap = {};

      data.forEach((worker) => {
        if (worker.attendance_status) {
          attendanceData[worker.id] =
            worker.attendance_status;
        }
      });

      setAttendance(attendanceData);
    } catch (error) {
      console.error(
        "LOAD ATTENDANCE WORKERS ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSites();
    }, [])
  );

  useEffect(() => {
    loadWorkers();
  }, [date, siteId]);

  const markAttendance = (
    workerId: string,
    status: AttendanceStatus
  ) => {
    setAttendance((previous) => ({
      ...previous,
      [workerId]: status,
    }));
  };

  const markAllPresent = () => {
    const updated: AttendanceMap = {};

    workers.forEach((worker) => {
      updated[worker.id] = "present";
    });

    setAttendance(updated);
  };

  const clearAttendance = () => {
    setAttendance({});
  };

  const summary = useMemo(() => {
    return {
      present: Object.values(attendance).filter(
        (item) => item === "present"
      ).length,

      absent: Object.values(attendance).filter(
        (item) => item === "absent"
      ).length,

      halfDay: Object.values(attendance).filter(
        (item) => item === "half_day"
      ).length,

      leave: Object.values(attendance).filter(
        (item) => item === "leave"
      ).length,
    };
  }, [attendance]);

  const totalWage = useMemo(() => {
    return workers.reduce((total, worker) => {
      const status = attendance[worker.id];

      if (!status) {
        return total;
      }

      return (
        total +
        calculateAttendanceAmount(
          worker.payment_type,
          worker.wage,
          status
        )
      );
    }, 0);
  }, [workers, attendance]);

  const handleSave = async () => {
    const markedWorkers = workers.filter(
      (worker) => attendance[worker.id]
    );

    if (workers.length === 0) {
      Alert.alert(
        "No Workers",
        "No active workers available"
      );

      return;
    }

    if (markedWorkers.length !== workers.length) {
      Alert.alert(
        "Attendance Pending",
        `Please mark attendance for all workers. ${
          workers.length - markedWorkers.length
        } worker(s) pending.`
      );

      return;
    }

    try {
      setSaving(true);

      await db.withTransactionAsync(async () => {
        for (const worker of workers) {
          const status = attendance[worker.id];

          if (!status) {
            continue;
          }

          const amount =
            calculateAttendanceAmount(
              worker.payment_type,
              worker.wage,
              status
            );

          await saveAttendance(db, {
            workerId: worker.id,
            siteId: worker.site_id,
            date,
            status,
            amount,
          });
        }
      });

      Alert.alert(
        "Attendance Saved",
        `Attendance saved for ${workers.length} workers`
      );

      await loadWorkers();
    } catch (error) {
      console.error(
        "SAVE ATTENDANCE ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to save attendance"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Attendance
          </Text>

          <Text style={styles.subtitle}>
            Mark daily worker attendance
          </Text>
        </View>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() =>
            router.push("/attendance/history")
          }
        >
          <Ionicons
            name="time-outline"
            size={22}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.dateCard}>
          <View style={styles.dateIcon}>
            <Ionicons
              name="calendar-outline"
              size={22}
              color={Colors.primary}
            />
          </View>

          <View style={styles.dateContent}>
            <Text style={styles.dateLabel}>
              Attendance Date
            </Text>

            <Text style={styles.dateText}>
              {date}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setDate(getTodayDate())}
          >
            <Text style={styles.todayText}>
              Today
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>
          Select Site
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.siteList}
        >
          <TouchableOpacity
            style={[
              styles.siteButton,
              !siteId && styles.selectedSite,
            ]}
            onPress={() => setSiteId(undefined)}
          >
            <Text
              style={[
                styles.siteText,
                !siteId &&
                  styles.selectedSiteText,
              ]}
            >
              All Workers
            </Text>
          </TouchableOpacity>

          {sites.map((site) => {
            const selected = siteId === site.id;

            return (
              <TouchableOpacity
                key={site.id}
                style={[
                  styles.siteButton,
                  selected && styles.selectedSite,
                ]}
                onPress={() => setSiteId(site.id)}
              >
                <Text
                  style={[
                    styles.siteText,
                    selected &&
                      styles.selectedSiteText,
                  ]}
                >
                  {site.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.summaryRow}>
          <SummaryCard
            value={summary.present}
            label="Present"
            color={Colors.success}
          />

          <SummaryCard
            value={summary.absent}
            label="Absent"
            color={Colors.danger}
          />

          <SummaryCard
            value={summary.halfDay}
            label="Half Day"
            color={Colors.warning}
          />

          <SummaryCard
            value={summary.leave}
            label="Leave"
            color="#9333EA"
          />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllPresent}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={18}
              color={Colors.primary}
            />

            <Text style={styles.markAllText}>
              Mark All Present
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={clearAttendance}
          >
            <Text style={styles.clearText}>
              Clear
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator
              size="large"
              color={Colors.primary}
            />
          </View>
        ) : workers.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="people-outline"
              size={50}
              color={Colors.textLight}
            />

            <Text style={styles.emptyTitle}>
              No Active Workers
            </Text>

            <Text style={styles.emptySubtitle}>
              No workers found for selected site
            </Text>
          </View>
        ) : (
          workers.map((worker) => (
            <AttendanceCard
              key={worker.id}
              worker={worker}
              selectedStatus={
                attendance[worker.id]
              }
              onSelect={(status) =>
                markAttendance(worker.id, status)
              }
            />
          ))
        )}

        {workers.length > 0 && (
          <>
            <View style={styles.wageCard}>
              <View>
                <Text style={styles.wageLabel}>
                  Today's Daily Wage
                </Text>

                <Text style={styles.wageNote}>
                  Monthly workers excluded
                </Text>
              </View>

              <Text style={styles.wageAmount}>
                ₹{totalWage.toLocaleString()}
              </Text>
            </View>

            <AppButton
              title="Save Attendance"
              icon="checkmark-circle-outline"
              loading={saving}
              onPress={handleSave}
              style={styles.saveButton}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AttendanceCard({
  worker,
  selectedStatus,
  onSelect,
}: {
  worker: AttendanceWorker;
  selectedStatus?: AttendanceStatus;
  onSelect: (status: AttendanceStatus) => void;
}) {
  const initials = worker.name
    .split(" ")
    .map((item) => item[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <View style={styles.workerCard}>
      <View style={styles.workerHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials}
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

          <Text style={styles.workerWage}>
            ₹{worker.wage.toLocaleString()} /{" "}
            {worker.payment_type === "daily"
              ? "Day"
              : "Month"}
          </Text>
        </View>
      </View>

      <View style={styles.attendanceOptions}>
        {attendanceOptions.map((option) => {
          const selected =
            selectedStatus === option.status;

          return (
            <TouchableOpacity
              key={option.status}
              style={[
                styles.attendanceButton,
                selected && {
                  backgroundColor:
                    option.background,
                  borderColor: option.color,
                },
              ]}
              onPress={() =>
                onSelect(option.status)
              }
            >
              <Text
                style={[
                  styles.attendanceShort,
                  selected && {
                    color: option.color,
                  },
                ]}
              >
                {option.short}
              </Text>

              <Text
                style={[
                  styles.attendanceLabel,
                  selected && {
                    color: option.color,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  subtitle: {
    marginTop: 4,
    color: Colors.textSecondary,
  },

  historyButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  dateCard: {
    padding: 15,
    borderRadius: 18,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  dateIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  dateContent: {
    flex: 1,
    marginLeft: 12,
  },

  dateLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  dateText: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  todayText: {
    fontWeight: "800",
    color: Colors.primary,
  },

  sectionLabel: {
    marginTop: 24,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  siteList: {
    marginBottom: 20,
  },

  siteButton: {
    marginRight: 9,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },

  selectedSite: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },

  siteText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
  },

  selectedSiteText: {
    color: Colors.white,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 7,
  },

  summaryCard: {
    flex: 1,
    paddingVertical: 13,
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
    fontSize: 9,
    color: Colors.textSecondary,
  },

  actionRow: {
    marginTop: 20,
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  markAllText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.primary,
  },

  clearText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.danger,
  },

  loader: {
    paddingVertical: 60,
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

  workerCard: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 19,
    backgroundColor: Colors.white,
  },

  workerHeader: {
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
    fontSize: 16,
    fontWeight: "800",
    color: Colors.primary,
  },

  workerContent: {
    flex: 1,
    marginLeft: 12,
  },

  workerName: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  workerInfo: {
    marginTop: 3,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  workerWage: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "700",
    color: Colors.success,
  },

  attendanceOptions: {
    marginTop: 15,
    flexDirection: "row",
    gap: 6,
  },

  attendanceButton: {
    flex: 1,
    minHeight: 55,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  attendanceShort: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textSecondary,
  },

  attendanceLabel: {
    marginTop: 3,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  wageCard: {
    marginTop: 10,
    padding: 18,
    borderRadius: 18,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  wageLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  wageNote: {
    marginTop: 4,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  wageAmount: {
    fontSize: 21,
    fontWeight: "800",
    color: Colors.success,
  },

  saveButton: {
    marginTop: 18,
  },
});