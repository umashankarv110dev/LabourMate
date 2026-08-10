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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

import {
  getSiteLabourCostReport,
  getSiteLabourCostSummary,
} from "@/src/repositories/reportRepository";

import {
  SiteLabourCostItem,
  SiteLabourCostSummary,
} from "@/src/types/report";

const initialSummary: SiteLabourCostSummary = {
  total_cost: 0,
  total_sites: 0,
  total_workers: 0,
  attendance_count: 0,
  average_cost_per_site: 0,
};

export default function SiteCostReportScreen() {
  const db = useSQLiteContext();

  const params = useLocalSearchParams<{
    month?: string;
  }>();

  const month =
    params.month ?? getCurrentMonth();

  const [summary, setSummary] =
    useState(initialSummary);

  const [sites, setSites] = useState<
    SiteLabourCostItem[]
  >([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);

      const [summaryData, siteData] =
        await Promise.all([
          getSiteLabourCostSummary(db, month),
          getSiteLabourCostReport(db, month),
        ]);

      setSummary(summaryData);
      setSites(siteData);
    } catch (error) {
      console.error(
        "LOAD SITE COST REPORT ERROR:",
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

  const filteredSites = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return sites;
    }

    return sites.filter((site) => {
      return (
        site.site_name
          .toLowerCase()
          .includes(value) ||
        site.site_address
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [sites, search]);

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
            Site Labour Cost
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
          <Text style={styles.heroLabel}>
            TOTAL LABOUR COST
          </Text>

          <Text style={styles.heroAmount}>
            ₹{formatAmount(summary.total_cost)}
          </Text>

          <Text style={styles.heroMonth}>
            {formatMonth(month)}
          </Text>

          <View style={styles.heroDivider} />

          <View style={styles.heroStats}>
            <HeroStat
              value={summary.total_sites}
              label="Sites"
            />

            <View style={styles.verticalLine} />

            <HeroStat
              value={summary.total_workers}
              label="Workers"
            />

            <View style={styles.verticalLine} />

            <HeroStat
              value={summary.attendance_count}
              label="Attendance"
            />
          </View>
        </View>

        <View style={styles.averageCard}>
          <View style={styles.averageIcon}>
            <Ionicons
              name="analytics-outline"
              size={21}
              color="#7C3AED"
            />
          </View>

          <View style={styles.averageContent}>
            <Text style={styles.averageLabel}>
              Average Cost / Site
            </Text>

            <Text style={styles.averageAmount}>
              ₹
              {formatAmount(
                summary.average_cost_per_site
              )}
            </Text>
          </View>

          <Ionicons
            name="trending-up-outline"
            size={22}
            color="#16A34A"
          />
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
            placeholder="Search site or address"
            placeholderTextColor={Colors.textLight}
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Site Cost Ranking
          </Text>

          <Text style={styles.sectionCount}>
            {filteredSites.length} sites
          </Text>
        </View>

        {filteredSites.map((site, index) => (
          <SiteCostCard
            key={site.site_id}
            site={site}
            rank={index + 1}
            month={month}
          />
        ))}

        {filteredSites.length === 0 && (
          <View style={styles.empty}>
            <Ionicons
              name="business-outline"
              size={30}
              color={Colors.textLight}
            />

            <Text style={styles.emptyTitle}>
              No Site Cost Found
            </Text>

            <Text style={styles.emptySubtitle}>
              No labour cost data found for this month
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SiteCostCard({
  site,
  rank,
  month,
}: {
  site: SiteLabourCostItem;
  rank: number;
  month: string;
}) {
  return (
    <TouchableOpacity
      style={styles.siteCard}
      activeOpacity={0.75}
      onPress={() => {
        console.log(
          "OPEN SITE:",
          site.site_id,
          site.site_name,
          month
        );

        router.push({
          pathname: "/report/site-cost-detail",
          params: {
            siteId: String(site.site_id),
            siteName: String(site.site_name),
            month: String(month),
          },
        });
      }}
    >
      <View style={styles.siteHeader}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>
            #{rank}
          </Text>
        </View>

        <View style={styles.siteInfo}>
          <Text style={styles.siteName}>
            {site.site_name}
          </Text>

          {site.site_address && (
            <Text
              style={styles.siteAddress}
              numberOfLines={1}
            >
              {site.site_address}
            </Text>
          )}
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={Colors.textLight}
        />
      </View>

      <View style={styles.siteDivider} />

      <View style={styles.costRow}>
        <View>
          <Text style={styles.costLabel}>
            Labour Cost
          </Text>

          <Text style={styles.costAmount}>
            ₹{formatAmount(site.labour_cost)}
          </Text>
        </View>

        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>
            {site.cost_percentage.toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(
                site.cost_percentage,
                100
              )}%`,
            },
          ]}
        />
      </View>

      <View style={styles.siteStats}>
        <SiteStat
          label="Workers"
          value={site.worker_count}
        />

        <SiteStat
          label="Present"
          value={site.present_count}
        />

        <SiteStat
          label="Half Day"
          value={site.half_day_count}
        />

        <SiteStat
          label="Advance"
          value={`₹${formatCompactAmount(
            site.advance_amount
          )}`}
        />
      </View>
    </TouchableOpacity>
  );
}

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

function SiteStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.siteStat}>
      <Text style={styles.siteStatValue}>
        {value}
      </Text>

      <Text style={styles.siteStatLabel}>
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
    padding: 21,
    borderRadius: 23,
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
    fontSize: 31,
    fontWeight: "800",
    color: Colors.white,
  },

  heroMonth: {
    marginTop: 4,
    fontSize: 9,
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
    fontSize: 17,
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

  averageCard: {
    marginTop: 15,
    padding: 15,
    borderRadius: 19,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },

  averageIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FAF5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  averageContent: {
    flex: 1,
    marginLeft: 12,
  },

  averageLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
  },

  averageAmount: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  searchContainer: {
    marginTop: 20,
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

  sectionHeader: {
    marginTop: 25,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  sectionCount: {
    fontSize: 9,
    color: Colors.textSecondary,
  },

  siteCard: {
    marginBottom: 11,
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  siteHeader: {
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
    fontSize: 12,
    fontWeight: "800",
    color: "#7C3AED",
  },

  siteInfo: {
    flex: 1,
    marginLeft: 11,
  },

  siteName: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  siteAddress: {
    marginTop: 4,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  siteDivider: {
    marginVertical: 14,
    height: 1,
    backgroundColor: Colors.border,
  },

  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  costLabel: {
    fontSize: 8,
    color: Colors.textSecondary,
  },

  costAmount: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  percentageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "#FAF5FF",
  },

  percentageText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#7C3AED",
  },

  progressTrack: {
    marginTop: 13,
    height: 6,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: "#7C3AED",
  },

  siteStats: {
    marginTop: 16,
    flexDirection: "row",
  },

  siteStat: {
    flex: 1,
    alignItems: "center",
  },

  siteStatValue: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  siteStatLabel: {
    marginTop: 4,
    fontSize: 7,
    color: Colors.textSecondary,
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
    fontSize: 9,
    color: Colors.textSecondary,
  },
});