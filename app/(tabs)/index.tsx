import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  useCallback,
  useState,
} from "react";

import { useCompany } from "@/src/contexts/CompanyContext";

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
  getDashboardActivities,
  getDashboardActivityCount,
  getDashboardSummary,
} from "@/src/repositories/dashboardRepository";

import {
  DashboardActivity,
  DashboardSummary,
} from "@/src/types/dashboard";
import QuickAction from "@/src/components/QuickAction";

const initialSummary: DashboardSummary = {
  totalWorkers: 0,
  activeWorkers: 0,
  activeSites: 0,
  todayPresent: 0,
  todayAbsent: 0,
  todayHalfDay: 0,
  todayLeave: 0,
  monthlyPayable: 0,
  monthlyPaid: 0,
  monthlyPending: 0,
};

function getTodayDate() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function getCurrentMonth() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

export default function DashboardScreen() {
  const db = useSQLiteContext();

  const { company } = useCompany();
  const [summary, setSummary] =
    useState<DashboardSummary>(initialSummary);

  const [activities, setActivities] =
    useState<DashboardActivity[]>([]);

  const [activityCount, setActivityCount] =
    useState<number>(0);

  const [loading, setLoading] =
    useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        summaryData,
        activityData,
        totalActivityCount,
      ] = await Promise.all([
        getDashboardSummary(
          db,
          getTodayDate(),
          getCurrentMonth()
        ),

        getDashboardActivities(db, 3),

        getDashboardActivityCount(db),
      ]);

      setSummary(summaryData);

      setActivities(activityData);

      setActivityCount(totalActivityCount);
    } catch (error) {
      console.error(
        "LOAD DASHBOARD ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const attendanceMarked =
    summary.todayPresent +
    summary.todayAbsent +
    summary.todayHalfDay +
    summary.todayLeave;

  const attendanceProgress =
    summary.activeWorkers > 0
      ? Math.min(
          attendanceMarked /
            summary.activeWorkers,
          1
        )
      : 0;

  const paymentProgress =
    summary.monthlyPayable > 0
      ? Math.min(
          summary.monthlyPaid /
            summary.monthlyPayable,
          1
        )
      : 0;

  // IMPORTANT:
  // ALL HOOKS MUST BE ABOVE THIS

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            {/* <Text style={styles.welcome}>
              GOOD {getGreeting()}
            </Text> */}

            {/* <Text style={styles.appName}>
              LabourMate
            </Text> */}

            <Text style={styles.appName}>
              {company?.name ?? "LabourMate"}
            </Text>

            <Text style={styles.ownerName}>
              {company?.owner_name
                ? `Welcome, ${company.owner_name}`
                : "Manage your workforce efficiently"}
            </Text>

            <Text style={styles.date}>
              {formatFullDate(getTodayDate())}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
          >
            <View style={styles.profileAvatar}>
              <Ionicons
                name="person"
                size={20}
                color={Colors.primary}
              />
            </View>

            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
        

        {/* HERO OVERVIEW */}

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>
                WORKFORCE OVERVIEW
              </Text>

              <View style={styles.workerCountRow}>
                <Text style={styles.heroCount}>
                  {summary.activeWorkers}
                </Text>

                <Text style={styles.heroWorkerText}>
                  active workers
                </Text>
              </View>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons
                name="people"
                size={28}
                color={Colors.white}
              />
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroStats}>
            <HeroStat
              value={summary.totalWorkers}
              label="Total Workers"
            />

            <View style={styles.verticalDivider} />

            <HeroStat
              value={summary.activeSites}
              label="Active Sites"
            />

            <View style={styles.verticalDivider} />

            <HeroStat
              value={attendanceMarked}
              label="Marked Today"
            />
          </View>
        </View>


        {/* QUICK ACTIONS */}

        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.quickGrid}>
          <View style={styles.quickRow}>
            <QuickAction
              icon="calendar"
              title="Attendance"
              subtitle="Mark daily"
              color="#2563EB"
              background="#EFF6FF"
              onPress={() => router.push("/attendance")}
            />

            <QuickAction
              icon="person-add"
              title="New Worker"
              subtitle="Add labour"
              color="#16A34A"
              background="#F0FDF4"
              onPress={() => router.push("/worker/create")}
            />
          </View>

          <View style={styles.quickRow}>
            <QuickAction
              icon="business"
              title="New Site"
              subtitle="Add project"
              color="#7C3AED"
              background="#FAF5FF"
              onPress={() => router.push("/site/create")}
            />

            <QuickAction
              icon="wallet"
              title="Payments"
              subtitle="Manage salary"
              color="#D97706"
              background="#FFFBEB"
              onPress={() => router.push("/payments")}
            />
          </View>

          <View style={styles.quickRow}>
            <QuickAction
              icon="bar-chart"
              title="Reports"
              subtitle="Analytics"
              color="#0891B2"
              background="#ECFEFF"
              onPress={() => router.push("/report")}
            />

            <QuickAction
              icon="document-text-outline"
              title="Quotation"
              subtitle="Bills & Quotes"
              color="#DC2626"
              background="#FEF2F2"
              onPress={() =>
                router.push("/quotation/quotationbilling")
              }
            />
          </View>
        </View>

        {/* ATTENDANCE */}
        <SectionHeader
          title="Today's Attendance"
          action="View all"
          onPress={() =>
            router.push("/attendance")
          }
        />

        <View style={styles.attendanceCard}>
          <View style={styles.attendanceTop}>
            <View>
              <Text style={styles.attendanceTitle}>
                Attendance Progress
              </Text>

              <Text style={styles.attendanceSubtitle}>
                {attendanceMarked} of{" "}
                {summary.activeWorkers} workers marked
              </Text>
            </View>

            <Text style={styles.progressPercent}>
              {Math.round(
                attendanceProgress * 100
              )}
              %
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    attendanceProgress * 100
                  }%`,
                },
              ]}
            />
          </View>

          <View style={styles.attendanceStats}>
            <AttendanceStat
              icon="checkmark"
              value={summary.todayPresent}
              label="Present"
              color="#16A34A"
              background="#DCFCE7"
            />

            <AttendanceStat
              icon="close"
              value={summary.todayAbsent}
              label="Absent"
              color="#DC2626"
              background="#FEE2E2"
            />

            <AttendanceStat
              icon="time-outline"
              value={summary.todayHalfDay}
              label="Half Day"
              color="#D97706"
              background="#FEF3C7"
            />

            <AttendanceStat
              icon="calendar-outline"
              value={summary.todayLeave}
              label="Leave"
              color="#7C3AED"
              background="#F3E8FF"
            />
          </View>
        </View>

        

        {/* PAYROLL */}

        <SectionHeader
          title="Payroll Overview"
          action={formatMonth(getCurrentMonth())}
        />

        <View style={styles.payrollCard}>
          <View style={styles.payrollHeader}>
            <View>
              <Text style={styles.pendingLabel}>
                TOTAL PENDING
              </Text>

              <Text style={styles.pendingAmount}>
                ₹
                {formatAmount(
                  summary.monthlyPending
                )}
              </Text>
            </View>

            <View style={styles.walletIcon}>
              <Ionicons
                name="wallet-outline"
                size={23}
                color={Colors.primary}
              />
            </View>
          </View>

          <View style={styles.payrollProgressTrack}>
            <View
              style={[
                styles.payrollProgressFill,
                {
                  width: `${
                    paymentProgress * 100
                  }%`,
                },
              ]}
            />
          </View>

          <View style={styles.payrollPercentRow}>
            <Text style={styles.payrollProgressText}>
              {Math.round(paymentProgress * 100)}%
              paid
            </Text>

            <Text style={styles.payrollProgressText}>
              {formatMonth(getCurrentMonth())}
            </Text>
          </View>

          <View style={styles.payrollDivider} />

          <View style={styles.payrollStats}>
            <PayrollStat
              label="Total Payable"
              amount={summary.monthlyPayable}
              color={Colors.textPrimary}
            />

            <PayrollStat
              label="Amount Paid"
              amount={summary.monthlyPaid}
              color="#16A34A"
              right
            />
          </View>
        </View>

        {/* RECENT ACTIVITY */}

        <SectionHeader
          title="Recent Activity"
          action={
            activityCount > 5
              ? "View all"
              : undefined
          }
          onPress={
            activityCount > 5
              ? () => router.push("/activity")
              : undefined
          }
        />

        <View style={styles.activityContainer}>
          {activities.map((activity, index) => (
            <ActivityItem
              key={`${activity.type}-${activity.id}`}
              activity={activity}
              isLast={
                index === activities.length - 1
              }
            />
          ))}

          {activities.length === 0 && (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="time-outline"
                  size={28}
                  color={Colors.textSecondary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No recent activity
              </Text>

              <Text style={styles.emptySubtitle}>
                Your latest workforce activities
                will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* COMPONENTS */

function HeroStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue}>
        {value}
      </Text>

      <Text style={styles.heroStatLabel}>
        {label}
      </Text>
    </View>
  );
}

function SectionHeader({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {action && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.sectionAction}>
            {action}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function AttendanceStat({
  icon,
  value,
  label,
  color,
  background,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.attendanceStat}>
      <View
        style={[
          styles.attendanceIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name={icon}
          size={17}
          color={color}
        />
      </View>

      <Text style={styles.attendanceValue}>
        {value}
      </Text>

      <Text style={styles.attendanceLabel}>
        {label}
      </Text>
    </View>
  );
}

// function QuickAction({
//   icon,
//   title,
//   subtitle,
//   color,
//   background,
//   onPress,
// }: {
//   icon: keyof typeof Ionicons.glyphMap;
//   title: string;
//   subtitle: string;
//   color: string;
//   background: string;
//   onPress: () => void;
// }) {
//   return (
//     <TouchableOpacity
//       style={styles.quickAction}
//       onPress={onPress}
//       activeOpacity={0.75}
//     >
//       <View
//         style={[
//           styles.quickIcon,
//           { backgroundColor: background },
//         ]}
//       >
//         <Ionicons
//           name={icon}
//           size={22}
//           color={color}
//         />
//       </View>

//       <View style={styles.quickContent}>
//         <Text style={styles.quickTitle}>
//           {title}
//         </Text>

//         <Text style={styles.quickSubtitle}>
//           {subtitle}
//         </Text>
//       </View>

//       <Ionicons
//         name="chevron-forward"
//         size={16}
//         color={Colors.textLight}
//       />
//     </TouchableOpacity>
//   );
// }

function PayrollStat({
  label,
  amount,
  color,
  right,
}: {
  label: string;
  amount: number;
  color: string;
  right?: boolean;
}) {
  return (
    <View
      style={[
        styles.payrollStat,
        right && styles.payrollStatRight,
      ]}
    >
      <Text style={styles.payrollStatLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.payrollStatAmount,
          { color },
        ]}
      >
        ₹{formatAmount(amount)}
      </Text>
    </View>
  );
}

function ActivityItem({
  activity,
  isLast,
}: {
  activity: DashboardActivity;
  isLast: boolean;
}) {
  const config = {
    attendance: {
      icon: "calendar-outline" as const,
      color: "#2563EB",
      background: "#EFF6FF",
    },

    advance: {
      icon: "cash-outline" as const,
      color: "#D97706",
      background: "#FFFBEB",
    },

    payment: {
      icon: "wallet-outline" as const,
      color: "#16A34A",
      background: "#F0FDF4",
    },
  };

  const item = config[activity.type];

  return (
    <View style={styles.activityRow}>
      <View style={styles.timeline}>
        <View
          style={[
            styles.activityIcon,
            {
              backgroundColor: item.background,
            },
          ]}
        >
          <Ionicons
            name={item.icon}
            size={19}
            color={item.color}
          />
        </View>

        {!isLast && (
          <View style={styles.timelineLine} />
        )}
      </View>

      <View
        style={[
          styles.activityContent,
          !isLast && styles.activityBorder,
        ]}
      >
        <View style={styles.activityTop}>
          <Text style={styles.activityTitle}>
            {activity.title}
          </Text>

          {activity.amount > 0 && (
            <Text
              style={[
                styles.activityAmount,
                {
                  color:
                    activity.type === "advance"
                      ? "#DC2626"
                      : "#16A34A",
                },
              ]}
            >
              {activity.type === "advance"
                ? "-"
                : "+"}
              ₹{formatAmount(activity.amount)}
            </Text>
          )}
        </View>

        <Text style={styles.activityDescription}>
          {activity.description}
        </Text>

        <Text style={styles.activityDate}>
          {formatDate(activity.date)}
        </Text>
      </View>
    </View>
  );
}

/* HELPERS */

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "MORNING";
  if (hour < 17) return "AFTERNOON";
  return "EVENING";
}

function formatAmount(amount: number) {
  return amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
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

function formatFullDate(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatMonth(month: string) {
  return new Date(
    `${month}-01T00:00:00`
  ).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

/* STYLES */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 50,
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    marginBottom: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  welcome: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: Colors.textSecondary,
  },

  appName: {
    marginTop: 4,
    fontSize: 27,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  ownerName: {
    marginTop: 4,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  date: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  profileButton: {
    position: "relative",
  },

  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationDot: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#F6F8FC",
  },

  heroCard: {
    padding: 21,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    marginBottom: 20,
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  heroLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#BFDBFE",
  },

  workerCountRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "baseline",
  },

  heroCount: {
    fontSize: 38,
    fontWeight: "800",
    color: Colors.white,
  },

  heroWorkerText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#DBEAFE",
  },

  heroIcon: {
    width: 57,
    height: 57,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroDivider: {
    marginVertical: 18,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  heroStats: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroStat: {
    flex: 1,
    alignItems: "center",
  },

  heroStatValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.white,
  },

  heroStatLabel: {
    marginTop: 4,
    fontSize: 9,
    color: "#BFDBFE",
  },

  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  sectionAction: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primary,
  },

  attendanceCard: {
    padding: 18,
    borderRadius: 21,
    backgroundColor: Colors.white,
  },

  attendanceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  attendanceTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  attendanceSubtitle: {
    marginTop: 4,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  progressPercent: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.primary,
  },

  progressTrack: {
    marginTop: 15,
    height: 7,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },

  attendanceStats: {
    marginTop: 19,
    flexDirection: "row",
  },

  attendanceStat: {
    flex: 1,
    alignItems: "center",
  },

  attendanceIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  attendanceValue: {
    marginTop: 7,
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  attendanceLabel: {
    marginTop: 2,
    fontSize: 8,
    color: Colors.textSecondary,
  },

quickGrid: {
  marginTop: 20,
},

quickRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "stretch",
  marginBottom: 16,
},

  quickAction: {
    minHeight: 70,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  quickContent: {
    flex: 1,
    marginLeft: 12,
  },

  quickTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  quickSubtitle: {
    marginTop: 3,
    fontSize: 9,
    color: Colors.textSecondary,
  },

  payrollCard: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: Colors.white,
  },

  payrollHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pendingLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: Colors.textSecondary,
  },

  pendingAmount: {
    marginTop: 6,
    fontSize: 27,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  payrollProgressTrack: {
    marginTop: 18,
    height: 7,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  payrollProgressFill: {
    height: "100%",
    backgroundColor: "#16A34A",
  },

  payrollPercentRow: {
    marginTop: 7,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  payrollProgressText: {
    fontSize: 9,
    color: Colors.textSecondary,
  },

  payrollDivider: {
    marginVertical: 17,
    height: 1,
    backgroundColor: Colors.border,
  },

  payrollStats: {
    flexDirection: "row",
  },

  payrollStat: {
    flex: 1,
  },

  payrollStatRight: {
    alignItems: "flex-end",
  },

  payrollStatLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
  },

  payrollStatAmount: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "800",
  },

  activityContainer: {
    borderRadius: 20,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginBottom: -50,
  },

  activityRow: {
    flexDirection: "row",
  },

  timeline: {
    width: 46,
    alignItems: "center",
  },

  activityIcon: {
    marginTop: 15,
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },

  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: Colors.border,
  },

  activityContent: {
    flex: 1,
    paddingVertical: 15,
    marginLeft: 8,
  },

  activityBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  activityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  activityTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  activityAmount: {
    fontSize: 12,
    fontWeight: "800",
  },

  activityDescription: {
    marginTop: 4,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  activityDate: {
    marginTop: 5,
    fontSize: 8,
    color: Colors.textLight,
  },

  empty: {
    paddingVertical: 40,
    alignItems: "center",
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 13,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  emptySubtitle: {
    marginTop: 5,
    maxWidth: 230,
    textAlign: "center",
    fontSize: 10,
    color: Colors.textSecondary,
  },
});