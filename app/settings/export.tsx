import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

export default function ExportScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F6F8FC"
      />

      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            Export Data
          </Text>

          <Text style={styles.headerSubtitle}>
            Export your LabourMate records
          </Text>
        </View>
      </View>

      {/* CONTENT */}

      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <View style={styles.largeCircle}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="download-outline"
                size={48}
                color={Colors.primary}
              />
            </View>
          </View>

          <View style={styles.fileBadge}>
            <Ionicons
              name="document-text"
              size={22}
              color="#16A34A"
            />
          </View>
        </View>

        <View style={styles.badge}>
          <Ionicons
            name="sparkles"
            size={13}
            color="#7C3AED"
          />

          <Text style={styles.badgeText}>
            COMING SOON
          </Text>
        </View>

        <Text style={styles.title}>
          Export Your Data
        </Text>

        <Text style={styles.description}>
          Soon you'll be able to export your workers,
          attendance, payments and reports in multiple
          file formats.
        </Text>

        <View style={styles.formatContainer}>
          <FormatItem
            icon="document-text-outline"
            title="PDF"
          />

          <FormatItem
            icon="grid-outline"
            title="Excel"
          />

          <FormatItem
            icon="document-outline"
            title="CSV"
          />
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="notifications-outline"
              size={21}
              color={Colors.primary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Feature in Development
            </Text>

            <Text style={styles.infoText}>
              We're working on a powerful export system
              to help you manage and share your labour
              records easily.
            </Text>
          </View>
        </View>
      </View>

      {/* FOOTER */}

      <View style={styles.footer}>
        <Ionicons
          name="shield-checkmark-outline"
          size={15}
          color={Colors.textSecondary}
        />

        <Text style={styles.footerText}>
          Your LabourMate data remains securely stored
          on your device.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function FormatItem({
  icon,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}) {
  return (
    <View style={styles.formatItem}>
      <View style={styles.formatIcon}>
        <Ionicons
          name={icon}
          size={22}
          color={Colors.primary}
        />
      </View>

      <Text style={styles.formatText}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },

  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  headerContent: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 9,
    color: Colors.textSecondary,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  largeCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    width: 105,
    height: 105,
    borderRadius: 35,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 7,
  },

  fileBadge: {
    position: "absolute",
    right: -5,
    bottom: 25,
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  badge: {
    marginTop: 30,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#FAF5FF",
    flexDirection: "row",
    alignItems: "center",
  },

  badgeText: {
    marginLeft: 6,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#7C3AED",
  },

  title: {
    marginTop: 18,
    fontSize: 27,
    fontWeight: "900",
    color: Colors.textPrimary,
    letterSpacing: -0.6,
  },

  description: {
    marginTop: 11,
    maxWidth: 330,
    fontSize: 11,
    lineHeight: 19,
    textAlign: "center",
    color: Colors.textSecondary,
  },

  formatContainer: {
    marginTop: 25,
    flexDirection: "row",
    gap: 12,
  },

  formatItem: {
    width: 82,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: "center",
  },

  formatIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  formatText: {
    marginTop: 7,
    fontSize: 9,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  infoCard: {
    marginTop: 28,
    width: "100%",
    padding: 15,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 11,
  },

  infoTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  infoText: {
    marginTop: 4,
    fontSize: 8,
    lineHeight: 13,
    color: Colors.textSecondary,
  },

  footer: {
    paddingHorizontal: 30,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  footerText: {
    marginLeft: 7,
    fontSize: 8,
    color: Colors.textSecondary,
  },
});