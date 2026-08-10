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

export default function BackupScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F6F8FC"
      />

      {/* Header */}
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
            Backup & Restore
          </Text>

          <Text style={styles.headerSubtitle}>
            Protect your LabourMate data
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <View style={styles.largeCircle}>
            <View style={styles.middleCircle}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={48}
                  color={Colors.primary}
                />
              </View>
            </View>
          </View>

          <View style={styles.shieldBadge}>
            <Ionicons
              name="shield-checkmark"
              size={23}
              color="#16A34A"
            />
          </View>

          <View style={styles.databaseBadge}>
            <Ionicons
              name="server-outline"
              size={20}
              color="#7C3AED"
            />
          </View>
        </View>

        <View style={styles.comingSoonBadge}>
          <Ionicons
            name="sparkles"
            size={13}
            color="#D97706"
          />

          <Text style={styles.comingSoonText}>
            COMING SOON
          </Text>
        </View>

        <Text style={styles.title}>
          Your Data, Always Safe
        </Text>

        <Text style={styles.description}>
          We're building a secure backup and restore
          experience to help you protect your workers,
          attendance, advances and payment records.
        </Text>

        <View style={styles.featureCard}>
          <FeatureItem
            icon="cloud-upload-outline"
            title="Secure Data Backup"
            description="Create a complete backup of your LabourMate workspace."
            color="#2563EB"
            background="#EFF6FF"
          />

          <View style={styles.divider} />

          <FeatureItem
            icon="refresh-outline"
            title="Easy Data Restore"
            description="Restore your workforce records whenever you need them."
            color="#16A34A"
            background="#F0FDF4"
          />

          <View style={styles.divider} />

          <FeatureItem
            icon="share-social-outline"
            title="Export & Share"
            description="Keep a copy of your backup in a safe location."
            color="#7C3AED"
            background="#FAF5FF"
          />
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={Colors.primary}
          />

          <Text style={styles.infoText}>
            This feature is currently under development
            and will be available in a future LabourMate
            update.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backHomeButton}
          activeOpacity={0.85}
          onPress={() => router.back()}
        >
          <Text style={styles.backHomeText}>
            Back to More
          </Text>

          <View style={styles.buttonIcon}>
            <Ionicons
              name="arrow-back"
              size={19}
              color={Colors.primary}
            />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
  color,
  background,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View
        style={[
          styles.featureIcon,
          {
            backgroundColor: background,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={color}
        />
      </View>

      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>
          {title}
        </Text>

        <Text style={styles.featureDescription}>
          {description}
        </Text>
      </View>

      <Ionicons
        name="lock-closed-outline"
        size={15}
        color={Colors.textLight}
      />
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
    paddingHorizontal: 18,
    alignItems: "center",
  },

  illustrationContainer: {
    width: "100%",
    height: 220,
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

  middleCircle: {
    width: 145,
    height: 145,
    borderRadius: 73,
    borderWidth: 2,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },

  shieldBadge: {
    position: "absolute",
    right: "25%",
    top: 42,
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  databaseBadge: {
    position: "absolute",
    left: "25%",
    bottom: 35,
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FAF5FF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  comingSoonBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#FFFBEB",
    flexDirection: "row",
    alignItems: "center",
  },

  comingSoonText: {
    marginLeft: 6,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#D97706",
  },

  title: {
    marginTop: 16,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
    color: Colors.textPrimary,
    letterSpacing: -0.6,
  },

  description: {
    marginTop: 10,
    maxWidth: 340,
    fontSize: 10,
    lineHeight: 17,
    textAlign: "center",
    color: Colors.textSecondary,
  },

  featureCard: {
    width: "100%",
    marginTop: 22,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  featureItem: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
  },

  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  featureContent: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  featureTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  featureDescription: {
    marginTop: 3,
    fontSize: 7,
    lineHeight: 12,
    color: Colors.textSecondary,
  },

  divider: {
    height: 1,
    marginLeft: 53,
    backgroundColor: Colors.border,
  },

  infoCard: {
    width: "100%",
    marginTop: 15,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 8,
    lineHeight: 14,
    color: Colors.textSecondary,
  },

  footer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },

  backHomeButton: {
    height: 58,
    paddingLeft: 22,
    paddingRight: 8,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 6,
  },

  backHomeText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.white,
  },

  buttonIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});