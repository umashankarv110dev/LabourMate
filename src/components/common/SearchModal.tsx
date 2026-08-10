import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  data?: any;
}

interface Props {
  visible: boolean;
  title: string;
  placeholder?: string;
  data: SearchItem[];
  onClose: () => void;
  onSelect: (item: SearchItem) => void;
}

export default function SearchModal({
  visible,
  title,
  placeholder = "Search...",
  data,
  onClose,
  onSelect,
}: Props) {

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    if (visible) {
      setSearch("");
    }
  }, [visible]);

  const filteredData = useMemo(() => {

    if (!search.trim())
      return data;

    return data.filter(item =>
      item.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  }, [search, data]);

  return (

    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >

      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={styles.container}>

          <Text style={styles.title}>
            {title}
          </Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={placeholder}
            style={styles.searchInput}
            placeholderTextColor="#999"
          />

                    <FlatList
            data={filteredData}
            keyExtractor={(item, index) =>
               item.id?.toString() || index.toString()
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>
                  No Results Found
                </Text>

                <Text style={styles.emptySubTitle}>
                  Try another keyword.
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.card}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {item.title}
                  </Text>

                  {!!item.subtitle && (
                    <Text style={styles.cardSubtitle}>
                      {item.subtitle}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />

        </View>

      </KeyboardAvoidingView>

    </Modal>

  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  container: {
    width: "100%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,

    elevation: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 15,
    textAlign: "center",
  },

  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,

    elevation: 2,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  cardSubtitle: {
    marginTop: 4,
    color: "#666",
    fontSize: 13,
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#777",
  },

  emptySubTitle: {
    marginTop: 5,
    color: "#999",
    fontSize: 13,
  },
});