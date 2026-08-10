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
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import WorkerCard from "@/src/components/WorkerCard";

import { Colors } from "@/src/constants/colors";

import {
  getWorkers,
} from "@/src/repositories/workerRepository";

import { WorkerWithSite } from "@/src/types/worker";

export default function WorkersScreen() {
  const db = useSQLiteContext();

  const [workers, setWorkers] = useState<
    WorkerWithSite[]
  >([]);

  const [search, setSearch] = useState("");

  const loadWorkers = async () => {
    try {
      const data = await getWorkers(db);

      setWorkers(data);
    } catch (error) {
      console.error(
        "LOAD WORKERS ERROR:",
        error
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWorkers();
    }, [])
  );

  const filteredWorkers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return workers;
    }

    return workers.filter((worker) => {
      return (
        worker.name.toLowerCase().includes(query) ||
        worker.worker_type
          .toLowerCase()
          .includes(query) ||
        worker.site_name
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [workers, search]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Workers</Text>

          <Text style={styles.subtitle}>
            {workers.length} total workers
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push("/worker/create")
          }
        >
          <Ionicons
            name="add"
            size={25}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.search}>
        <Ionicons
          name="search"
          size={20}
          color={Colors.textSecondary}
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, type or site..."
          placeholderTextColor={Colors.textLight}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredWorkers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.workerList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <WorkerCard
            worker={item}
            onPress={() =>
              router.push(`/worker/${item.id}`)
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="people-outline"
              size={55}
              color={Colors.textLight}
            />

            <Text style={styles.emptyTitle}>
              No Workers Found
            </Text>

            <Text style={styles.emptySubtitle}>
              Add your first worker
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
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  search: {
    marginHorizontal: 20,
    marginTop: 22,
    height: 54,
    paddingHorizontal: 15,
    borderRadius: 16,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },

  workerList: {
    padding: 20,
    paddingBottom: 30,
    flexGrow: 1,
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