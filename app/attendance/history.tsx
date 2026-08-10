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
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

import {
  AttendanceDailySummary,
  getAttendanceDailySummary,
} from "@/src/repositories/attendanceRepository";

import {
  getActiveSites,
} from "@/src/repositories/siteRepository";

import { Site } from "@/src/types/site";

export default function AttendanceHistoryScreen() {
  const db = useSQLiteContext();

  const [sites, setSites] = useState<Site[]>([]);

  const [siteId, setSiteId] = useState<
    string | undefined
  >();

  const [history, setHistory] = useState<
    AttendanceDailySummary[]
  >([]);

  const [loading, setLoading] = useState(true);

  const loadSites = async () => {
    try {
      const data = await getActiveSites(db);

      setSites(data);
    } catch (error) {
      console.error(
        "LOAD HISTORY SITES ERROR:",
        error
      );
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);

      const data =
        await getAttendanceDailySummary(
          db,
          siteId
        );

      setHistory(data);
    } catch (error) {
      console.error(
        "LOAD ATTENDANCE HISTORY ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSites();
      loadHistory();
    }, [siteId])
  );

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
            Attendance History
          </Text>

          <Text style={styles.subtitle}>
            Daily attendance records
          </Text>
        </View>

        <View style={styles.space} />
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.siteList}
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
              All Sites
            </Text>
          </TouchableOpacity>

          {sites.map((site) => {
            const selected = siteId === site.id;

            return (
              <TouchableOpacity
                key={site.id}
                style={[
                  styles.siteButton,
                  selected &&
                    styles.selectedSite,
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
          data={history}
          keyExtractor={(item) =>
            item.attendance_date
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname:
                    "/attendance/[date]",
                  params: {
                    date: item.attendance_date,
                    siteId: siteId || "",
                  },
                })
              }
            >
              <View style={styles.dateRow}>
                <View style={styles.dateIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={22}
                    color={Colors.primary}
                  />
                </View>

                <View style={styles.dateContent}>
                  <Text style={styles.date}>
                    {formatDate(
                      item.attendance_date
                    )}
                  </Text>

                  <Text style={styles.workerCount}>
                    {item.total_workers} workers
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.textLight}
                />
              </View>

              <View style={styles.summary}>
                <Status
                  value={item.present_count}
                  label="Present"
                  color={Colors.success}
                />

                <Status
                  value={item.absent_count}
                  label="Absent"
                  color={Colors.danger}
                />

                <Status
                  value={item.half_day_count}
                  label="Half Day"
                  color={Colors.warning}
                />

                <Status
                  value={item.leave_count}
                  label="Leave"
                  color="#9333EA"
                />
              </View>

              <View style={styles.wageRow}>
                <Text style={styles.wageLabel}>
                  Daily Wages
                </Text>

                <Text style={styles.wage}>
                  ₹
                  {item.total_amount.toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="calendar-outline"
                size={55}
                color={Colors.textLight}
              />

              <Text style={styles.emptyTitle}>
                No Attendance History
              </Text>

              <Text style={styles.emptySubtitle}>
                Saved attendance will appear here
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function Status({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.status}>
      <Text
        style={[
          styles.statusValue,
          { color },
        ]}
      >
        {value}
      </Text>

      <Text style={styles.statusLabel}>
        {label}
      </Text>
    </View>
  );
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
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

  siteList: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  siteButton: {
    marginRight: 9,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },

  selectedSite: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  siteText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
  },

  selectedSiteText: {
    color: Colors.white,
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },

  card: {
    marginBottom: 13,
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  dateIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  dateContent: {
    flex: 1,
    marginLeft: 12,
  },

  date: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  workerCount: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  summary: {
    marginTop: 17,
    flexDirection: "row",
    gap: 7,
  },

  status: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor: Colors.background,
    alignItems: "center",
  },

  statusValue: {
    fontSize: 16,
    fontWeight: "800",
  },

  statusLabel: {
    marginTop: 3,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  wageRow: {
    marginTop: 15,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  wageLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  wage: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.success,
  },

  empty: {
    flex: 1,
    paddingTop: 100,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  emptySubtitle: {
    marginTop: 5,
    color: Colors.textSecondary,
  },
});