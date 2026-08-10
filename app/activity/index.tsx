import { Ionicons } from "@expo/vector-icons";

import {
  router,
  useFocusEffect,
} from "expo-router";

import { useSQLiteContext } from "expo-sqlite";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

import { getDashboardActivities } from "@/src/repositories/dashboardRepository";

import { DashboardActivity } from "@/src/types/dashboard";

type ActivitySection = {
  title: string;
  data: DashboardActivity[];
};

export default function RecentActivityScreen() {
  const db = useSQLiteContext();

  const [activities, setActivities] = useState<
    DashboardActivity[]
  >([]);

  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    try {
      setLoading(true);

      const data =
        await getDashboardActivities(db);

      setActivities(data);
    } catch (error) {
      console.error(
        "LOAD ACTIVITIES ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadActivities();
    }, [])
  );

  const sections = useMemo(() => {
    return groupActivitiesByDate(activities);
  }, [activities]);

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
          style={styles.backButton}
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
            Recent Activity
          </Text>

          <Text style={styles.subtitle}>
            {activities.length} activities
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="time-outline"
            size={22}
            color={Colors.primary}
          />
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) =>
          `${item.type}-${item.id}`
        }
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {section.title}
            </Text>

            <View style={styles.sectionLine} />
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <ActivityCard
            activity={item}
            isLast={
              index === section.data.length - 1
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="time-outline"
                size={30}
                color={Colors.textSecondary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No Activity Yet
            </Text>

            <Text style={styles.emptySubtitle}>
              Attendance, advances and payments
              will appear here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function ActivityCard({
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
    <View style={styles.activityCard}>
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
            size={20}
            color={item.color}
          />
        </View>

        {!isLast && (
          <View style={styles.timelineLine} />
        )}
      </View>

      <View style={styles.activityContent}>
        <View style={styles.activityTop}>
          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>
              {activity.title}
            </Text>

            <Text
              style={styles.activityDescription}
            >
              {activity.description}
            </Text>
          </View>

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

        <Text style={styles.activityTime}>
          {formatActivityTime(
            activity.created_at
          )}
        </Text>
      </View>
    </View>
  );
}

function groupActivitiesByDate(
  activities: DashboardActivity[]
): ActivitySection[] {
  const grouped = activities.reduce<
    Record<string, DashboardActivity[]>
  >((result, activity) => {
    const key = activity.date;

    if (!result[key]) {
      result[key] = [];
    }

    result[key].push(activity);

    return result;
  }, {});

  return Object.entries(grouped)
    .sort(
      ([dateA], [dateB]) =>
        new Date(dateB).getTime() -
        new Date(dateA).getTime()
    )
    .map(([date, data]) => ({
      title: getDateTitle(date),
      data,
    }));
}

function getDateTitle(date: string) {
  const today = getLocalDate(new Date());

  const yesterdayDate = new Date();

  yesterdayDate.setDate(
    yesterdayDate.getDate() - 1
  );

  const yesterday =
    getLocalDate(yesterdayDate);

  if (date === today) {
    return "Today";
  }

  if (date === yesterday) {
    return "Yesterday";
  }

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function formatActivityTime(date: string) {
  return new Date(date).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function formatAmount(amount: number) {
  return amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
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

  backButton: {
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

  list: {
    paddingHorizontal: 18,
    paddingBottom: 50,
    flexGrow: 1,
  },

  sectionHeader: {
    marginTop: 18,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  sectionLine: {
    flex: 1,
    height: 1,
    marginLeft: 12,
    backgroundColor: Colors.border,
  },

  activityCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
  },

  timeline: {
    width: 60,
    alignItems: "center",
  },

  activityIcon: {
    marginTop: 15,
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: Colors.border,
  },

  activityContent: {
    flex: 1,
    paddingVertical: 15,
    paddingRight: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  activityTop: {
    flexDirection: "row",
  },

  activityInfo: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  activityDescription: {
    marginTop: 4,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  activityAmount: {
    marginLeft: 10,
    fontSize: 13,
    fontWeight: "800",
  },

  activityTime: {
    marginTop: 6,
    fontSize: 9,
    color: Colors.textLight,
  },

  empty: {
    paddingTop: 100,
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
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  emptySubtitle: {
    marginTop: 6,
    maxWidth: 250,
    textAlign: "center",
    fontSize: 11,
    color: Colors.textSecondary,
  },
});