import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ItemCard from "./ItemCard";
import AppButton from "../common/AppButton";
import { Colors } from "@/src/constants/colors";

import { Item } from "../../types/item";
import { calculateGrandTotal } from "../../utils/calculation";

interface Props {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}

export default function ItemList({
  items,
  setItems,
}: Props) {

  const addItem = () => {
    const newItem: Item = {
      id: Date.now().toString(),
      description: "",
      unit: "Nos",
      showSize: false,
      showQty: false,
      showRate: false,
      size: "",
      qty: "",
      rate: "",
      total: "",
      remarks: "",
    };

    setItems((prev) => [...prev, newItem]);
  };

  const deleteItem = (id: string) => {
    setItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const updateItem = (
    id: string,
    field: keyof Item,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const grandTotal = calculateGrandTotal(items);

  return (
    <View style={{ margin: 18 }}>

      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          index={index}
          item={item}
          onUpdate={updateItem}
          onDelete={deleteItem}
        />
      ))}

      <AppButton
        title="+ Add Item"
        onPress={addItem}
      />

      <View style={styles.totalCard}>
        <Text style={styles.totalText}>
          Grand Total
        </Text>

        <Text style={styles.amount}>
          ₹ {grandTotal}
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  totalCard:{
    backgroundColor:"#fff",
    borderRadius:15,
    padding:20,
    marginTop:20,
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    elevation:2
  },

  totalText:{
    fontSize:18,
    fontWeight:"700"
  },

  amount:{
    fontSize:22,
    color:Colors.primary,
    fontWeight:"700"
  }

});