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

import { getReportSummary } from "@/src/repositories/reportRepository";

import { ReportSummary } from "@/src/types/report";

const initialSummary: ReportSummary = {
  totalWorkers: 0,
  totalSites: 0,

  presentCount: 0,
  absentCount: 0,
  halfDayCount: 0,
  leaveCount: 0,

  workingAmount: 0,
  advanceAmount: 0,
  payableAmount: 0,
  paidAmount: 0,
  pendingAmount: 0,
};

function getCurrentMonth() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

export default function ReportsScreen() {
  const db = useSQLiteContext();

  const [month, setMonth] = useState(
    getCurrentMonth()
  );

  const [summary, setSummary] =
    useState<ReportSummary>(initialSummary);

  const [loading, setLoading] =
    useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);

      const data = await getReportSummary(
        db,
        month
      );

      setSummary(data);
    } catch (error) {
      console.error(
        "LOAD REPORT ERROR:",
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

  const changeMonth = (value: number) => {
    const [year, monthValue] = month
      .split("-")
      .map(Number);

    const date = new Date(
      year,
      monthValue - 1 + value,
      1
    );

    setMonth(
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`
    );
  };

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
            Reports
          </Text>

          <Text style={styles.subtitle}>
            Workforce analytics & insights
          </Text>
        </View>

        <View style={styles.reportIcon}>
          <Ionicons
            name="bar-chart-outline"
            size={22}
            color={Colors.primary}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.monthSelector}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => changeMonth(-1)}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>

          <View style={styles.monthContent}>
            <Text style={styles.monthLabel}>
              REPORT MONTH
            </Text>

            <Text style={styles.monthText}>
              {formatMonth(month)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => changeMonth(1)}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator
              size="large"
              color={Colors.primary}
            />
          </View>
        ) : (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>
                TOTAL LABOUR COST
              </Text>

              <Text style={styles.heroAmount}>
                ₹{formatAmount(
                  summary.workingAmount
                )}
              </Text>

              <Text style={styles.heroMonth}>
                {formatMonth(month)}
              </Text>

              <View style={styles.heroDivider} />

              <View style={styles.heroStats}>
                <HeroStat
                  label="Workers"
                  value={summary.totalWorkers}
                />

                <View style={styles.verticalLine} />

                <HeroStat
                  label="Sites"
                  value={summary.totalSites}
                />

                <View style={styles.verticalLine} />

                <HeroStat
                  label="Present"
                  value={summary.presentCount}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Payment Overview
            </Text>

            <View style={styles.paymentCard}>
              <PaymentRow
                label="Total Payable"
                amount={summary.payableAmount}
                color={Colors.textPrimary}
              />

              <PaymentRow
                label="Amount Paid"
                amount={summary.paidAmount}
                color="#16A34A"
              />

              <View style={styles.divider} />

              <PaymentRow
                label="Pending Payment"
                amount={summary.pendingAmount}
                color="#DC2626"
                large
              />
            </View>

            <Text style={styles.sectionTitle}>
              Attendance Overview
            </Text>

            <View style={styles.attendanceGrid}>
              <AttendanceCard
                label="Present"
                value={summary.presentCount}
                icon="checkmark"
                color="#16A34A"
                background="#F0FDF4"
              />

              <AttendanceCard
                label="Absent"
                value={summary.absentCount}
                icon="close"
                color="#DC2626"
                background="#FEF2F2"
              />

              <AttendanceCard
                label="Half Day"
                value={summary.halfDayCount}
                icon="time-outline"
                color="#D97706"
                background="#FFFBEB"
              />

              <AttendanceCard
                label="Leave"
                value={summary.leaveCount}
                icon="calendar-outline"
                color="#7C3AED"
                background="#FAF5FF"
              />
            </View>

            <Text style={styles.sectionTitle}>
              Detailed Reports
            </Text>

            <View style={styles.reportList}>
              <ReportItem
                title="Attendance Report"
                subtitle="Monthly worker attendance"
                icon="calendar-outline"
                color="#2563EB"
                background="#EFF6FF"
                onPress={() =>
                  router.push({
                    pathname: "/report/attendance",
                    params: { month },
                  })
                }
              />

              <ReportItem
                title="Worker Wage Report"
                subtitle="Earnings and salary summary"
                icon="people-outline"
                color="#16A34A"
                background="#F0FDF4"
                onPress={() =>
                  router.push({
                    pathname: "/report/worker",
                    params: { month },
                  })
                }
              />

              <ReportItem
                title="Advance Report"
                subtitle={`₹${formatAmount(
                  summary.advanceAmount
                )} advances given`}
                icon="cash-outline"
                color="#D97706"
                background="#FFFBEB"
                onPress={() =>
                  router.push({
                    pathname: "/report/advance",
                    params: { month },
                  })
                }
              />

              <ReportItem
                title="Payment Report"
                subtitle="Paid and pending salary"
                icon="wallet-outline"
                color="#0891B2"
                background="#ECFEFF"
                onPress={() =>
                  router.push({
                    pathname: "/report/payment",
                    params: { month },
                  })
                }
              />

              <ReportItem
                title="Site Labour Cost"
                subtitle="Project-wise workforce cost"
                icon="business-outline"
                color="#7C3AED"
                background="#FAF5FF"
                onPress={() =>
                  router.push({
                    pathname: "/report/site-cost",
                    params: { month },
                  })
                }
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroStat({
  label,
  value,
}: {
  label: string;
  value: number;
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

function PaymentRow({
  label,
  amount,
  color,
  large,
}: {
  label: string;
  amount: number;
  color: string;
  large?: boolean;
}) {
  return (
    <View style={styles.paymentRow}>
      <Text
        style={[
          styles.paymentLabel,
          large && styles.largePaymentLabel,
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.paymentAmount,
          { color },
          large && styles.largePaymentAmount,
        ]}
      >
        ₹{formatAmount(amount)}
      </Text>
    </View>
  );
}

function AttendanceCard({
  label,
  value,
  icon,
  color,
  background,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.attendanceCard}>
      <View
        style={[
          styles.attendanceIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
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

function ReportItem({
  title,
  subtitle,
  icon,
  color,
  background,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.reportItem}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.reportItemIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={color}
        />
      </View>

      <View style={styles.reportItemContent}>
        <Text style={styles.reportItemTitle}>
          {title}
        </Text>

        <Text style={styles.reportItemSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={Colors.textLight}
      />
    </TouchableOpacity>
  );
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
    fontSize: 21,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  reportIcon: {
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

  loader: {
    paddingTop: 100,
  },

  monthSelector: {
    marginTop: 5,
    padding: 12,
    borderRadius: 18,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  monthButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  monthContent: {
    flex: 1,
    alignItems: "center",
  },

  monthLabel: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
    color: Colors.textSecondary,
  },

  monthText: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  heroCard: {
    marginTop: 15,
    padding: 22,
    borderRadius: 24,
    backgroundColor: Colors.primary,
  },

  heroLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#BFDBFE",
  },

  heroAmount: {
    marginTop: 7,
    fontSize: 32,
    fontWeight: "800",
    color: Colors.white,
  },

  heroMonth: {
    marginTop: 4,
    fontSize: 10,
    color: "#DBEAFE",
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

  verticalLine: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  sectionTitle: {
    marginTop: 27,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  paymentCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  paymentRow: {
    paddingVertical: 7,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  paymentLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  paymentAmount: {
    fontSize: 13,
    fontWeight: "800",
  },

  largePaymentLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  largePaymentAmount: {
    fontSize: 18,
  },

  divider: {
    marginVertical: 8,
    height: 1,
    backgroundColor: Colors.border,
  },

  attendanceGrid: {
    flexDirection: "row",
    gap: 8,
  },

  attendanceCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 17,
    backgroundColor: Colors.white,
    alignItems: "center",
  },

  attendanceIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  attendanceValue: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  attendanceLabel: {
    marginTop: 2,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  reportList: {
    borderRadius: 20,
    backgroundColor: Colors.white,
    overflow: "hidden",
  },

  reportItem: {
    minHeight: 76,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  reportItemIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  reportItemContent: {
    flex: 1,
    marginLeft: 12,
  },

  reportItemTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  reportItemSubtitle: {
    marginTop: 4,
    fontSize: 9,
    color: Colors.textSecondary,
  },
});