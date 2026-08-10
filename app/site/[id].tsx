import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppCard from "@/src/components/AppCard";
import WorkerCard from "@/src/components/WorkerCard";
import { Colors } from "@/src/constants/colors";
import { getSiteById } from "@/src/repositories/siteRepository";
import { getWorkersBySiteId } from "@/src/repositories/workerRepository";
import { Site } from "@/src/types/site";
import { WorkerWithSite } from "@/src/types/worker";

export default function SiteDetailsScreen() {
  const db = useSQLiteContext();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [site, setSite] = useState<Site | null>(null);

  const [workers, setWorkers] = useState<
    WorkerWithSite[]
  >([]);

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const siteData = await getSiteById(db, id);

      const workerData = await getWorkersBySiteId(
        db,
        id
      );

      setSite(siteData);
      setWorkers(workerData);
    } catch (error) {
      console.error(
        "LOAD SITE DETAILS ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

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

  if (!site) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <Ionicons
            name="business-outline"
            size={55}
            color={Colors.textLight}
          />

          <Text style={styles.notFound}>
            Site not found
          </Text>

          <TouchableOpacity
            style={styles.backTextButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              Go Back
            </Text>
          </TouchableOpacity>
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

        <Text style={styles.title}>
          Site Details
        </Text>

        <View style={styles.space} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.icon}>
            <Ionicons
              name="business"
              size={32}
              color={Colors.primary}
            />
          </View>

          <Text style={styles.siteName}>
            {site.name}
          </Text>

          <Text style={styles.client}>
            {site.client_name || "No Client"}
          </Text>
        </View>

        <View style={styles.stats}>
          <Stat
            value={workers.length}
            label="Workers"
          />

          <Stat
            value={workers.filter(
              (item) => item.status === "active"
            ).length}
            label="Active"
          />

          <Stat
            value={workers.filter(
              (item) => item.status === "inactive"
            ).length}
            label="Inactive"
          />
        </View>

        <Text style={styles.sectionTitle}>
          Site Information
        </Text>

        <AppCard>
          <Info
            icon="location-outline"
            label="Location"
            value={site.address || "No address"}
          />

          <Info
            icon="calendar-outline"
            label="Start Date"
            value={site.start_date || "Not selected"}
          />

          <Info
            icon="calendar-number-outline"
            label="Expected End Date"
            value={
              site.expected_end_date ||
              "Not selected"
            }
          />

          <Info
            icon="pulse-outline"
            label="Status"
            value={site.status}
          />
        </AppCard>

        <View style={styles.workerHeader}>
          <Text style={styles.sectionTitle}>
            Workers
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push("/worker/create")
            }
          >
            <Text style={styles.addWorker}>
              + Add Worker
            </Text>
          </TouchableOpacity>
        </View>

        {workers.length === 0 ? (
          <View style={styles.emptyWorkers}>
            <Ionicons
              name="people-outline"
              size={45}
              color={Colors.textLight}
            />

            <Text style={styles.emptyTitle}>
              No Workers
            </Text>

            <Text style={styles.emptySubtitle}>
              No worker assigned to this site
            </Text>
          </View>
        ) : (
          workers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onPress={() =>
                router.push(`/worker/${worker.id}`)
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.info}>
      <Ionicons
        name={icon}
        size={21}
        color={Colors.primary}
      />

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    height: 65,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  space: {
    width: 44,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  notFound: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  backTextButton: {
    marginTop: 15,
  },

  backText: {
    fontWeight: "700",
    color: Colors.primary,
  },

  hero: {
    alignItems: "center",
  },

  icon: {
    width: 85,
    height: 85,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  siteName: {
    marginTop: 14,
    fontSize: 23,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  client: {
    marginTop: 4,
    color: Colors.textSecondary,
  },

  stats: {
    marginTop: 25,
    flexDirection: "row",
    gap: 10,
  },

  stat: {
    flex: 1,
    padding: 15,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: "center",
  },

  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  sectionTitle: {
    marginTop: 27,
    marginBottom: 13,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  info: {
    marginVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  infoValue: {
    marginTop: 3,
    fontWeight: "700",
    color: Colors.textPrimary,
    textTransform: "capitalize",
  },

  workerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  addWorker: {
    marginTop: 14,
    fontWeight: "700",
    color: Colors.primary,
  },

  emptyWorkers: {
    paddingVertical: 35,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  emptySubtitle: {
    marginTop: 5,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});