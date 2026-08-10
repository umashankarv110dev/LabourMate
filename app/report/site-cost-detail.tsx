import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";

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
import { getSiteWorkerCostReport } from "@/src/repositories/reportRepository";
import { SiteWorkerCostItem } from "@/src/types/report";

export default function SiteCostDetailScreen() {
  const db = useSQLiteContext();

  const params = useLocalSearchParams<{
    siteId?: string;
    siteName?: string;
    month?: string;
  }>();

  const siteId = params.siteId ?? "";
  const siteName = params.siteName ?? "Site";
  const month = params.month ?? getCurrentMonth();

  const [workers, setWorkers] = useState<
    SiteWorkerCostItem[]
  >([]);

  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);

      if (!siteId) return;

      const data = await getSiteWorkerCostReport(
        db,
        siteId,
        month
      );

      setWorkers(data);
    } catch (error) {
      console.error(
        "LOAD SITE COST DETAIL ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReport();
    }, [siteId, month])
  );

  const summary = useMemo(() => {
    return workers.reduce(
      (result, worker) => {
        result.cost += Number(
          worker.working_amount ?? 0
        );

        result.advance += Number(
          worker.advance_amount ?? 0
        );

        result.present += Number(
          worker.present_count ?? 0
        );

        result.halfDay += Number(
          worker.half_day_count ?? 0
        );

        return result;
      },
      {
        cost: 0,
        advance: 0,
        present: 0,
        halfDay: 0,
      }
    );
  }, [workers]);

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
          <Text
            style={styles.title}
            numberOfLines={1}
          >
            Site Cost Details
          </Text>

          <Text style={styles.subtitle}>
            {formatMonth(month)}
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="business-outline"
            size={22}
            color="#7C3AED"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroCard}>
          <View style={styles.siteRow}>
            <View style={styles.siteIcon}>
              <Ionicons
                name="business"
                size={23}
                color={Colors.white}
              />
            </View>

            <View style={styles.siteInfo}>
              <Text style={styles.siteLabel}>
                SITE
              </Text>

              <Text style={styles.siteName}>
                {siteName}
              </Text>
            </View>

            <View style={styles.workerBadge}>
              <Text style={styles.workerBadgeValue}>
                {workers.length}
              </Text>

              <Text style={styles.workerBadgeLabel}>
                Workers
              </Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <Text style={styles.heroLabel}>
            TOTAL LABOUR COST
          </Text>

          <Text style={styles.heroAmount}>
            ₹{formatAmount(summary.cost)}
          </Text>

          <View style={styles.heroStats}>
            <HeroStat
              label="Advance"
              value={`₹${formatCompactAmount(
                summary.advance
              )}`}
            />

            <View style={styles.verticalLine} />

            <HeroStat
              label="Present"
              value={summary.present}
            />

            <View style={styles.verticalLine} />

            <HeroStat
              label="Half Day"
              value={summary.halfDay}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Cost Overview
        </Text>

        <View style={styles.overviewGrid}>
          <OverviewCard
            icon="people-outline"
            label="Workers"
            value={workers.length}
            color="#2563EB"
            background="#EFF6FF"
          />

          <OverviewCard
            icon="calendar-outline"
            label="Attendance"
            value={
              summary.present + summary.halfDay
            }
            color="#16A34A"
            background="#F0FDF4"
          />

          <OverviewCard
            icon="cash-outline"
            label="Advance"
            value={`₹${formatCompactAmount(
              summary.advance
            )}`}
            color="#D97706"
            background="#FFFBEB"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleNoMargin}>
            Worker Cost Ranking
          </Text>

          <Text style={styles.sectionCount}>
            {workers.length} workers
          </Text>
        </View>

        {workers.map((worker, index) => (
          <WorkerCostCard
            key={worker.worker_id}
            worker={worker}
            rank={index + 1}
            month={month}
            totalCost={summary.cost}
          />
        ))}

        {workers.length === 0 && (
          <View style={styles.empty}>
            <Ionicons
              name="people-outline"
              size={31}
              color={Colors.textLight}
            />

            <Text style={styles.emptyTitle}>
              No Worker Cost Found
            </Text>

            <Text style={styles.emptySubtitle}>
              No labour attendance found for this
              site and month
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function WorkerCostCard({
  worker,
  rank,
  month,
  totalCost,
}: {
  worker: SiteWorkerCostItem;
  rank: number;
  month: string;
  totalCost: number;
}) {
  const percentage =
    totalCost > 0
      ? (Number(worker.working_amount) /
          totalCost) *
        100
      : 0;

  return (
    <TouchableOpacity
      style={styles.workerCard}
      activeOpacity={0.75}
      onPress={() =>
        router.push({
          pathname: "/report/worker-detail",
          params: {
            workerId: worker.worker_id,
            workerName: worker.worker_name,
            month,
          },
        })
      }
    >
      <View style={styles.workerHeader}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>
            #{rank}
          </Text>
        </View>

        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>
            {worker.worker_name}
          </Text>

          <Text style={styles.workerType}>
            {worker.worker_type}
          </Text>
        </View>

        <View style={styles.costContent}>
          <Text style={styles.workerCost}>
            ₹
            {formatAmount(
              worker.working_amount
            )}
          </Text>

          <Text style={styles.costPercentage}>
            {percentage.toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(
                percentage,
                100
              )}%`,
            },
          ]}
        />
      </View>

      <View style={styles.workerStats}>
        <WorkerStat
          label="Present"
          value={worker.present_count}
          color="#16A34A"
        />

        <WorkerStat
          label="Half Day"
          value={worker.half_day_count}
          color="#D97706"
        />

        <WorkerStat
          label="Advance"
          value={`₹${formatCompactAmount(
            worker.advance_amount
          )}`}
          color="#DC2626"
        />

        <View style={styles.chevronContent}>
          <Ionicons
            name="chevron-forward"
            size={17}
            color={Colors.textLight}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function HeroStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
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

function OverviewCard({
  icon,
  label,
  value,
  color,
  background,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.overviewCard}>
      <View
        style={[
          styles.overviewIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={color}
        />
      </View>

      <Text style={styles.overviewValue}>
        {value}
      </Text>

      <Text style={styles.overviewLabel}>
        {label}
      </Text>
    </View>
  );
}

function WorkerStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View style={styles.workerStat}>
      <Text
        style={[
          styles.workerStatValue,
          { color },
        ]}
      >
        {value}
      </Text>

      <Text style={styles.workerStatLabel}>
        {label}
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

function formatAmount(amount: number) {
  return Number(amount ?? 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );
}

function formatCompactAmount(amount: number) {
  const value = Number(amount ?? 0);

  if (value >= 100000) {
    return `${(value / 100000).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return formatAmount(value);
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
    backgroundColor: "#FAF5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 50,
  },

  heroCard: {
    marginTop: 5,
    padding: 20,
    borderRadius: 23,
    backgroundColor: Colors.primary,
  },

  siteRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  siteIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  siteInfo: {
    flex: 1,
    marginLeft: 12,
  },

  siteLabel: {
    fontSize: 7,
    fontWeight: "700",
    color: "#BFDBFE",
    letterSpacing: 1,
  },

  siteName: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "800",
    color: Colors.white,
  },

  workerBadge: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  workerBadgeValue: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
  },

  workerBadgeLabel: {
    marginTop: 2,
    fontSize: 7,
    color: "#BFDBFE",
  },

  heroDivider: {
    marginVertical: 18,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  heroLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#BFDBFE",
    letterSpacing: 1,
  },

  heroAmount: {
    marginTop: 6,
    fontSize: 30,
    fontWeight: "800",
    color: Colors.white,
  },

  heroStats: {
    marginTop: 19,
    flexDirection: "row",
    alignItems: "center",
  },

  heroStat: {
    flex: 1,
    alignItems: "center",
  },

  heroStatValue: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
  },

  heroStatLabel: {
    marginTop: 4,
    fontSize: 8,
    color: "#BFDBFE",
  },

  verticalLine: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  sectionTitle: {
    marginTop: 25,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  overviewGrid: {
    flexDirection: "row",
    gap: 9,
  },

  overviewCard: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: "center",
  },

  overviewIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  overviewValue: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  overviewLabel: {
    marginTop: 3,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  sectionHeader: {
    marginTop: 25,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitleNoMargin: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  sectionCount: {
    fontSize: 9,
    color: Colors.textSecondary,
  },

  workerCard: {
    marginBottom: 11,
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  workerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  rankBadge: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FAF5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  rankText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7C3AED",
  },

  workerInfo: {
    flex: 1,
    marginLeft: 11,
  },

  workerName: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  workerType: {
    marginTop: 4,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  costContent: {
    alignItems: "flex-end",
  },

  workerCost: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  costPercentage: {
    marginTop: 4,
    fontSize: 8,
    color: "#7C3AED",
  },

  progressTrack: {
    marginTop: 14,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#7C3AED",
  },

  workerStats: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  workerStat: {
    flex: 1,
  },

  workerStatValue: {
    fontSize: 10,
    fontWeight: "800",
  },

  workerStatLabel: {
    marginTop: 4,
    fontSize: 7,
    color: Colors.textSecondary,
  },

  chevronContent: {
    width: 25,
    alignItems: "flex-end",
  },

  empty: {
    paddingVertical: 50,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  emptySubtitle: {
    marginTop: 5,
    maxWidth: 250,
    textAlign: "center",
    fontSize: 9,
    color: Colors.textSecondary,
  },
});