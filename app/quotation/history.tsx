import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import SearchBar from "../../src/components/quotation/SearchBar";
import HistoryCard from "../../src/components/quotation/HistoryCard";
import EmptyState from "../../src/components/quotation/EmptyState";

import { generateQuotationNo } from "@/src/utils/generator";
import { Quotation } from "@/src/types/quotation";
import { Colors } from "@/src/constants/colors";

import {
  deleteQuotation,
  getQuotations,
} from "@/src/services/quotationStorage";
import { LinearGradient } from "expo-linear-gradient";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();

  const [list, setList] = useState<Quotation[]>(
    []
  );

  const [search, setSearch] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  /* ================================================= */
  /* LOAD DATA */
  /* ================================================= */

  const loadData = useCallback(
    async () => {
      try {
        const data =
          await getQuotations();

        setList(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.log(
          "History Load Error:",
          error
        );

        setList([]);
      }
    },
    []
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ================================================= */
  /* REFRESH */
  /* ================================================= */

  const onRefresh = async () => {
    setRefreshing(true);

    await loadData();

    setRefreshing(false);
  };

  /* ================================================= */
  /* SEARCH */
  /* ================================================= */

  const filtered = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return list;
    }

    return list.filter((item) => {
      const customer =
        item.customerName
          ?.toLowerCase() ?? "";

      const number =
        item.quotationNo
          ?.toLowerCase() ?? "";

      const title =
        item.quotationTitle
          ?.toLowerCase() ?? "";

      const site =
        item.siteName
          ?.toLowerCase() ?? "";

      return (
        customer.includes(query) ||
        number.includes(query) ||
        title.includes(query) ||
        site.includes(query)
      );
    });
  }, [list, search]);

  /* ================================================= */
  /* DELETE */
  /* ================================================= */

  const removeItem = (
    id: string
  ) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this quotation?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteQuotation(id);

              await loadData();
            } catch (error) {
              Alert.alert(
                "Error",
                "Unable to delete the document."
              );
            }
          },
        },
      ]
    );
  };

  /* ================================================= */
  /* DUPLICATE */
  /* ================================================= */

  const duplicateQuotation = (
    item: Quotation
  ) => {
    const duplicate: Quotation = {
      ...item,

      id: Date.now().toString(),

      quotationNo:
        generateQuotationNo(),

      status: "Draft",

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    };

    router.push({
      pathname: "/quotation/edit",
      params: {
        quotation:
          JSON.stringify(
            duplicate
          ),
        duplicate: "true",
      },
    });
  };

  /* ================================================= */
  /* STATISTICS */
  /* ================================================= */

  const totalDocuments =
    list.length;

  const draftDocuments =
    list.filter(
      (item) =>
        item.status === "Draft"
    ).length;

  const savedDocuments =
    list.filter(
      (item) =>
        item.status !== "Draft"
    ).length;

  /* ================================================= */
  /* EMPTY SEARCH */
  /* ================================================= */

  const renderEmpty = () => {
    if (search.trim()) {
      return (
        <View
          style={
            styles.searchEmpty
          }
        >
          <View
            style={
              styles.searchEmptyIcon
            }
          >
            <Ionicons
              name="search-outline"
              size={34}
              color={Colors.primary}
            />
          </View>

          <Text
            style={
              styles.searchEmptyTitle
            }
          >
            No documents found
          </Text>

          <Text
            style={
              styles.searchEmptyText
            }
          >
            Try searching with a
            different customer name,
            document number or title.
          </Text>
        </View>
      );
    }

    return <EmptyState />;
  };

  /* ================================================= */
  /* RENDER ITEM */
  /* ================================================= */

  const renderItem = ({
    item,
  }: {
    item: Quotation;
  }) => (
    <HistoryCard
      item={item}

      onView={() =>
        router.push({
          pathname:
            "/quotation/preview",
          params: {
            quotation:
              JSON.stringify(item),
          },
        })
      }

      onEdit={() =>
        router.push({
          pathname:
            "/quotation/edit",
          params: {
            quotation:
              JSON.stringify(item),
          },
        })
      }

      onDuplicate={() =>
        duplicateQuotation(item)
      }

      onShare={() => {}}

      onDelete={() =>
        removeItem(item.id)
      }

      onConvert={() => {
        router.push({
          pathname:
            "/quotation/create",
          params: {
            quotation:
              JSON.stringify(item),
          },
        });
      }}
    />
  );

  /* ================================================= */
  /* SCREEN */
  /* ================================================= */

  return (
  <View style={styles.container}>

    <StatusBar barStyle="light-content" />


    {/* ================================================= */}
    {/* MAIN LIST */}
    {/* ================================================= */}

    <FlatList
      data={filtered}

      keyExtractor={(item) =>
        item.id
      }

      renderItem={renderItem}

      showsVerticalScrollIndicator={false}

      keyboardShouldPersistTaps="handled"

      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }


      /* ================================================= */
      /* HEADER CONTENT */
      /* ================================================= */

      ListHeaderComponent={
        <View>
          {/* ============================================= */}
          {/* GRADIENT HEADER */}
          {/* ============================================= */}

          <LinearGradient
            colors={[ "#2563EB", "#3B82F6", "#60A5FA",]}
            style={styles.header}>

            <View style={styles.headerTop} >
              {/* HEADER ICON */}
              <View style={styles.headerIcon}>
                <Ionicons
                  name="folder-open-outline"
                  size={28}
                  color="#FFFFFF"
                />
              </View>


              {/* HEADER TEXT */}

              <View
                style={styles.headerContent}
              >

                <Text
                  style={styles.headerEyebrow}
                >
                  DOCUMENT MANAGEMENT
                </Text>


                <Text
                  style={styles.headerTitle}
                >
                  History
                </Text>


                <Text
                  style={
                    styles.headerSubtitle
                  }
                >
                  Manage your quotations
                  and bills
                </Text>

              </View>

            </View>


            {/* =========================================== */}
            {/* STATS */}
            {/* =========================================== */}

            <View
              style={
                styles.statsContainer
              }
            >

              {/* TOTAL */}

              <View
                style={styles.statItem}
              >

                <View
                  style={styles.statIcon}
                >
                  <Ionicons
                    name="documents-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                </View>


                <View>

                  <Text
                    style={
                      styles.statNumber
                    }
                  >
                    {totalDocuments}
                  </Text>

                  <Text
                    style={
                      styles.statLabel
                    }
                  >
                    Total
                  </Text>

                </View>

              </View>


              <View
                style={styles.statDivider}
              />


              {/* DRAFT */}

              <View
                style={styles.statItem}
              >

                <View
                  style={[
                    styles.statIcon,
                    styles.draftIcon,
                  ]}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                </View>


                <View>

                  <Text
                    style={
                      styles.statNumber
                    }
                  >
                    {draftDocuments}
                  </Text>

                  <Text
                    style={
                      styles.statLabel
                    }
                  >
                    Draft
                  </Text>

                </View>

              </View>


              <View
                style={styles.statDivider}
              />


              {/* SAVED */}

              <View
                style={styles.statItem}
              >

                <View
                  style={[
                    styles.statIcon,
                    styles.savedIcon,
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                </View>


                <View>

                  <Text
                    style={
                      styles.statNumber
                    }
                  >
                    {savedDocuments}
                  </Text>

                  <Text
                    style={
                      styles.statLabel
                    }
                  >
                    Saved
                  </Text>

                </View>

              </View>

            </View>

          </LinearGradient>


          {/* ============================================= */}
          {/* SEARCH SECTION */}
          {/* ============================================= */}

          <View
            style={
              styles.searchContainer
            }
          >

            <View
              style={
                styles.searchHeader
              }
            >

              <View>

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Your Documents
                </Text>


                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  {filtered.length} document
                  {filtered.length !== 1
                    ? "s"
                    : ""}
                </Text>

              </View>


              {/* CLEAR SEARCH */}

              {search.length > 0 && (

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setSearch("")
                  }
                  style={
                    styles.clearSearch
                  }
                >

                  <Ionicons
                    name="close"
                    size={18}
                    color={
                      Colors.textSecondary
                    }
                  />

                </TouchableOpacity>

              )}

            </View>


            {/* SEARCH BAR */}

            <SearchBar
              value={search}
              onChange={setSearch}
            />

          </View>

        </View>
      }


      /* ================================================= */
      /* EMPTY STATE */
      /* ================================================= */

      ListEmptyComponent={
        renderEmpty
      }


      /* ================================================= */
      /* LIST PADDING */
      /* ================================================= */

      contentContainerStyle={[
        styles.listContent,
        {
          paddingBottom:
            105 + insets.bottom,
        },
      ]}

    />


    {/* ================================================= */}
    {/* FLOATING ACTION BUTTON */}
    {/* ================================================= */}

    <TouchableOpacity
      activeOpacity={0.85}

      style={[
        styles.fab,
        {
          bottom:
            Math.max(
              insets.bottom + 18,
              22
            ),
        },
      ]}

      onPress={() =>
        router.push(
          "/quotation/create"
        )
      }
    >

      <Ionicons
        name="add"
        size={30}
        color="#FFFFFF"
      />

      <Text
        style={styles.fabText}
      >
        New
      </Text>

    </TouchableOpacity>

  </View>
);
}

const styles = StyleSheet.create({

  /* ================================================= */
  /* HEADER */
  /* ================================================= */
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },


  header: {
    paddingTop: 50,
    paddingHorizontal: 22,
    paddingBottom: 34,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,

    backgroundColor:
      "rgba(255,255,255,0.16)",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.20)",

    marginRight: 14,
  },

  headerContent: {
    flex: 1,
    justifyContent: "center",
  },

  headerEyebrow: {
    color: "#BFDBFE",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "800",
    marginTop: 3,
  },

  headerSubtitle: {
    color: "#DBEAFE",
    fontSize: 13,
    marginTop: 4,
  },

  /* ================================================= */
  /* STATS */
  /* ================================================= */

  statsContainer: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 20,

    paddingVertical: 13,
    paddingHorizontal: 12,

    borderRadius: 17,

    backgroundColor:
      "rgba(255,255,255,0.12)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.16)",
  },

  statItem: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,

    backgroundColor:
      "rgba(255,255,255,0.18)",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 8,
  },

  draftIcon: {
    backgroundColor:
      "rgba(245,158,11,0.30)",
  },

  savedIcon: {
    backgroundColor:
      "rgba(22,163,74,0.30)",
  },

  statNumber: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  statLabel: {
    color: "#DBEAFE",
    fontSize: 10,
    marginTop: 1,
  },

  statDivider: {
    width: 1,
    height: 32,
    backgroundColor:
      "rgba(255,255,255,0.18)",
  },

  /* ================================================= */
  /* SEARCH */
  /* ================================================= */

  searchContainer: {
    marginTop: 18,
  },

  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  clearSearch: {
    width: 34,
    height: 34,
    borderRadius: 12,

    backgroundColor:
      Colors.white,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor:
      Colors.border,
  },

  /* ================================================= */
  /* LIST */
  /* ================================================= */

  listContent: {
    paddingTop: 4,
    paddingHorizontal: 18,
  },

  /* ================================================= */
  /* EMPTY SEARCH */
  /* ================================================= */

  searchEmpty: {
    alignItems: "center",

    paddingHorizontal: 30,
    paddingTop: 55,
  },

  searchEmptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,

    backgroundColor:
      Colors.primaryLight,

    justifyContent: "center",
    alignItems: "center",
  },

  searchEmptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginTop: 18,
  },

  searchEmptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 7,
  },

  /* ================================================= */
  /* FAB */
  /* ================================================= */

  fab: {
    position: "absolute",

    right: 20,

    minWidth: 66,
    height: 58,

    paddingHorizontal: 18,

    borderRadius: 20,

    backgroundColor:
      Colors.primary,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    shadowColor:
      Colors.primary,

    shadowOpacity: 0.30,
    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 10,
  },

  fabText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 5,
  },
});
