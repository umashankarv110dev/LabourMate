import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

import { getSites } from "@/src/repositories/siteRepository";

import { Site } from "@/src/types/site";

export default function SitesScreen() {
  const db = useSQLiteContext();

  const [sites, setSites] = useState<Site[]>([]);

  const loadSites = async () => {
    try {
      const data = await getSites(db);

      setSites(data);
    } catch (error) {
      console.error("LOAD SITES ERROR:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSites();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Sites</Text>

          <Text style={styles.subtitle}>
            {sites.length} work locations
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/site/create")}
        >
          <Ionicons
            name="add"
            size={25}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push(`/site/${item.id}`)
            }
          >
            <View style={styles.siteIcon}>
              <Ionicons
                name="business-outline"
                size={25}
                color={Colors.primary}
              />
            </View>

            <View style={styles.content}>
              <Text style={styles.siteName}>
                {item.name}
              </Text>

              <Text style={styles.client}>
                {item.client_name || "No client"}
              </Text>

              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={Colors.textSecondary}
                />

                <Text style={styles.location}>
                  {item.address || "No address"}
                </Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.status}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="business-outline"
              size={55}
              color={Colors.textLight}
            />

            <Text style={styles.emptyTitle}>
              No Sites Yet
            </Text>

            <Text style={styles.emptySubtitle}>
              Create your first work site
            </Text>
          </View>
        }
      />
    </SafeAreaView>
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

  iconButton: {
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
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  addButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexGrow: 1,
  },

  card: {
    marginBottom: 13,
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.white,
    flexDirection: "row",
  },

  siteIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    marginLeft: 13,
  },

  siteName: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  client: {
    marginTop: 3,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  locationRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  location: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  badge: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.success,
    textTransform: "capitalize",
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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