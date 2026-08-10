import React from "react";

import {
  View,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Colors } from "@/src/constants/colors";

interface Props {
  children: React.ReactNode;

  style?: ViewStyle;
}

export default function AppCard({
  children,
  style,
}: Props) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,

    borderRadius: 16,

    padding: 16,

    marginVertical: 8,

    elevation: 3,

    shadowColor: "#000",

    shadowOpacity: 0.08,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
});