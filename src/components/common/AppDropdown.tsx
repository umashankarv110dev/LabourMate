import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface Props {
  value: string;
  items: string[];
  onChange: (value: string) => void;
}

export default function AppDropdown({
  value,
  items,
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      <Picker
        selectedValue={value}
        onValueChange={onChange}
      >
        {items.map((item) => (
          <Picker.Item
            key={item}
            label={item}
            value={item}
          />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
});