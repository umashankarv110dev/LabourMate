import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/colors";
import AppCard from "../common/AppCard";

import { Item } from "../../types/item";
import AppInput from "../common/AppInput";

interface Props {
  index: number;
  item: Item;
  onUpdate: (
    id: string,
    field: keyof Item,
    value: string | boolean
  ) => void;
  onDelete: (id: string) => void;
}

export default function ItemCard({
  index,
  item,
  onUpdate,
  onDelete,
}: Props) {
  const total =
    item.showSize &&
    item.showQty &&
    item.showRate
      ? (
          Number(item.size || 0) *
          Number(item.qty || 0) *
          Number(item.rate || 0)
        ).toString()
      : item.total;

  return (
    <AppCard>

      <Text style={styles.title}>
        Item {index + 1}
      </Text>

      <AppInput
        placeholder="Description"
        value={item.description}
        onChangeText={(text) =>
          onUpdate(item.id, "description", text)
        }
        leftIcon="document-text-outline"
        clearIcon="close-circle"
        onClearIconPress={() =>
          onUpdate(item.id, "description", "")
        }
      />

      {/* Toggle Buttons */}

      <View style={styles.row}>
        <Chip
          title="Size"
          selected={item.showSize}
          onPress={() =>
            onUpdate(
              item.id,
              "showSize",
              !item.showSize
            )
          }
        />

        <Chip
          title="Qty"
          selected={item.showQty}
          onPress={() =>
            onUpdate(
              item.id,
              "showQty",
              !item.showQty
            )
          }
        />

        <Chip
          title="Rate"
          selected={item.showRate}
          onPress={() =>
            onUpdate(
              item.id,
              "showRate",
              !item.showRate
            )
          }
        />
      </View>

      {item.showSize && (
        <AppInput
          placeholder="Size"
          keyboardType="numbers-and-punctuation"
          value={item.size}
          onChangeText={(text) =>
            onUpdate(item.id, "size", text)
          }
          leftIcon="resize-outline"
          clearIcon="close-circle"
          onClearIconPress={() =>
            onUpdate(item.id, "size", "")
          }
        />
      )}

      {item.showQty && (
        <AppInput
          placeholder="Quantity"
          keyboardType="numeric"
          value={item.qty}
          onChangeText={(text) =>
            onUpdate(item.id, "qty", text)
          }
          leftIcon="cube-outline"
          clearIcon="close-circle"
          onClearIconPress={() =>
            onUpdate(item.id, "qty", "")
          }
        />
      )}

      {item.showRate && (
        <AppInput
          placeholder="Rate"
          keyboardType="numeric"
          value={item.rate}
          onChangeText={(text) =>
            onUpdate(item.id, "rate", text)
          }
          leftIcon="cash-outline"
          clearIcon="close-circle"
          onClearIconPress={() =>
            onUpdate(item.id, "rate", "")
          }
        />
      )}

      <AppInput
        editable={
          !(
            item.showSize &&
            item.showQty &&
            item.showRate
          )
        }
        placeholder="Total Amount"
        keyboardType="numeric"
        value={total}
        onChangeText={(text) =>
          onUpdate(item.id, "total", text)
        }
        leftIcon="wallet-outline"
        clearIcon="close-circle"
        onClearIconPress={() =>
          onUpdate(item.id, "total", "")
        }
      />

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item.id)}
      >
        <Ionicons
          name="trash"
          size={18}
          color="#fff"
        />

        <Text style={styles.deleteText}>
          Delete Item
        </Text>
      </TouchableOpacity>

    </AppCard>
  );
}

function Chip({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        selected && styles.selectedChip,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          selected &&
            styles.selectedChipText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    marginBottom: 15,
  },

  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    backgroundColor: "#ECEFF1",
    marginRight: 10,
  },

  selectedChip: {
    backgroundColor: Colors.primary,
  },

  chipText: {
    color: "#444",
    fontWeight: "600",
  },

  selectedChipText: {
    color: "#fff",
  },

  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  deleteButton: {
    backgroundColor: Colors.danger,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  deleteText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
  },
});