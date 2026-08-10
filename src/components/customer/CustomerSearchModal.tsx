import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Customer } from "../../types/customer";
import { getCustomers } from "../../services/customerStorage";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

export default function CustomerSearchModal({
  visible,
  onClose,
  onSelect,
}: Props) {

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (visible) {
      loadCustomers();
      setSearch("");
    }
  }, [visible]);

  const loadCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data);
  };

  const filteredCustomers = useMemo(() => {

    if (!search.trim()) return customers;

    return customers.filter((item) =>
      item.customerName
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  }, [search, customers]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >

      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        style={styles.overlay}
      >

        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.container}>

          <Text style={styles.title}>
            Select Customer
          </Text>

          <TextInput
            placeholder="Search Customer..."
            value={search}
            onChangeText={setSearch}
            style={styles.search}
          />

                    <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        No customer available
                    </Text>

                    <Text
                        style={{
                            color:"#888",
                            marginTop:8,
                            textAlign:"center"
                        }}
                    >
                        Create your first quotation.
                        Customer will be added automatically.
                    </Text>
                </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.customerCard}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <View style={{ flex: 1 }}>

                  <Text style={styles.customerName}>
                    {item.customerName}
                  </Text>

                  <Text style={styles.siteCount}>
                    {item.sites.length} Site
                    {item.sites.length > 1 ? "s" : ""}
                  </Text>

                  {item.sites.length > 0 && (
                    <Text
                      numberOfLines={1}
                      style={styles.sitePreview}
                    >
                      {item.sites.join(", ")}
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
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 15,
    textAlign: "center",
  },

  search: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#FAFAFA",
  },

  customerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,

    borderWidth: 1,
    borderColor: "#ECECEC",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,

    elevation: 2,
  },

  customerName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222",
  },

  siteCount: {
    marginTop: 4,
    fontSize: 13,
    color: "#1565C0",
    fontWeight: "600",
  },

  sitePreview: {
    marginTop: 3,
    fontSize: 13,
    color: "#777",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 15,
    color: "#999",
  },

});