import React from "react";

import {
  Text,
  StyleSheet,
} from "react-native";
import { Colors } from "@/src/constants/colors";

interface Props {
  title: string;
}

export default function SectionHeader({
  title,
}: Props) {
  return (
    <Text style={styles.title}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,

    fontWeight: "700",

    color: Colors.black,

    marginTop: 20,

    marginBottom: 10,
  },
});