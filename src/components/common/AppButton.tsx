import { Colors } from "@/src/constants/colors";
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

interface Props {
  title: string;

  onPress: () => void;

  loading?: boolean;

  color?: string;

  disabled?: boolean;
}

export default function AppButton({
  title,
  onPress,
  loading = false,
  color = Colors.primary,
  disabled = false,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: color,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,

    justifyContent: "center",

    alignItems: "center",

    borderRadius: 12,

    marginVertical: 8,
  },

  text: {
    color: "#fff",

    fontSize: 16,

    fontWeight: "700",
  },
});