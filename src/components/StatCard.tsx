import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "@/src/constants/colors";

type Props = {
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
  subtitle?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  color,
  backgroundColor,
  subtitle,
}: Props) {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.accent,
          { backgroundColor: color },
        ]}
      />

      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor },
          ]}
        >
          <Ionicons
            name={icon}
            size={21}
            color={color}
          />
        </View>

        
        <Text style={styles.title}>
          {title}
        </Text>
      </View>

      <View style={styles.content}>
        <Text
          style={styles.value}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>


        {subtitle && (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 155,

    backgroundColor: Colors.white,
    borderRadius: 20,

    paddingHorizontal: 17,
    paddingVertical: 16,

    borderWidth: 1,
    borderColor: "#EEF2F7",

    overflow: "hidden",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,

    elevation: 3,
  },

  accent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 4,
    height: "100%",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    opacity: 0.8,
  },

  content: {
    marginTop: 17,
  },

  value: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  },

  title: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "500",
    color: Colors.textLight,
  },
});