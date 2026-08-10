import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/src/constants/colors";

export default function AboutScreen() {
  const version =
    Constants.expoConfig?.version ?? "1.0.0";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.title}>
            About LabourMate
          </Text>

          <Text style={styles.subtitle}>
            Smart Labour Management
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.appCard}>
          <View style={styles.logo}>
            <Ionicons
              name="people"
              size={45}
              color={Colors.white}
            />
          </View>

          <Text style={styles.appName}>
            LabourMate
          </Text>

          <Text style={styles.tagline}>
            Smart Labour Management
          </Text>

          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>
              Version {version}
            </Text>
          </View>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>
            Manage your workforce smarter
          </Text>

          <Text style={styles.description}>
            LabourMate is designed for contractors,
            construction businesses and labour
            managers to simplify daily workforce
            management.
          </Text>

          <Text style={styles.description}>
            Manage workers, construction sites,
            attendance, advances, payments and
            detailed reports from one simple
            application.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          WHAT YOU CAN MANAGE
        </Text>

        <View style={styles.featureGrid}>
          <FeatureCard
            icon="people-outline"
            title="Workers"
            subtitle="Manage workforce"
          />

          <FeatureCard
            icon="construct-outline"
            title="Sites"
            subtitle="Track projects"
          />

          <FeatureCard
            icon="calendar-outline"
            title="Attendance"
            subtitle="Daily records"
          />

          <FeatureCard
            icon="wallet-outline"
            title="Payments"
            subtitle="Track wages"
          />

          <FeatureCard
            icon="cash-outline"
            title="Advances"
            subtitle="Worker advances"
          />

          <FeatureCard
            icon="bar-chart-outline"
            title="Reports"
            subtitle="Business insights"
          />
        </View>

        <Text style={styles.sectionTitle}>
          SUPPORT & INFORMATION
        </Text>

        <View style={styles.menuCard}>
          <AboutItem
            icon="mail-outline"
            title="Contact Support"
            subtitle="Get help with LabourMate"
            onPress={() =>
              Alert.alert(
                "Contact Support",
                "Support contact will be configured before production release."
              )
            }
          />

          <Divider />

          <AboutItem
            icon="document-text-outline"
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={() =>
              Alert.alert(
                "Terms of Service",
                "Terms of Service page will be added before production release."
              )
            }
          />

          <Divider />

          <AboutItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            subtitle="Learn how your data is protected"
            onPress={() =>
              Alert.alert(
                "Privacy Policy",
                "Privacy Policy page will be added before production release."
              )
            }
          />
        </View>

        <View style={styles.localDataCard}>
          <View style={styles.localDataIcon}>
            <Ionicons
              name="phone-portrait-outline"
              size={23}
              color="#16A34A"
            />
          </View>

          <View style={styles.localDataContent}>
            <Text style={styles.localDataTitle}>
              Your data stays with you
            </Text>

            <Text style={styles.localDataText}>
              LabourMate currently stores your
              workforce data locally on your device
              using SQLite.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.madeText}>
            Built for Indian contractors & labour
            managers
          </Text>

          <Text style={styles.copyright}>
            © {new Date().getFullYear()} LabourMate
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureCard({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIcon}>
        <Ionicons
          name={icon}
          size={22}
          color={Colors.primary}
        />
      </View>

      <Text style={styles.featureTitle}>
        {title}
      </Text>

      <Text style={styles.featureSubtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

function AboutItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.menuIcon}>
        <Ionicons
          name={icon}
          size={21}
          color={Colors.primary}
        />
      </View>

      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>
          {title}
        </Text>

        <Text style={styles.menuSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={17}
        color={Colors.textLight}
      />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
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

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 9,
    color: Colors.textSecondary,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },

  appCard: {
    paddingVertical: 30,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },

  logo: {
    width: 82,
    height: 82,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  appName: {
    marginTop: 15,
    fontSize: 24,
    fontWeight: "900",
    color: Colors.white,
  },

  tagline: {
    marginTop: 5,
    fontSize: 10,
    color: "#DBEAFE",
  },

  versionBadge: {
    marginTop: 13,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  versionText: {
    fontSize: 8,
    fontWeight: "700",
    color: Colors.white,
  },

  descriptionCard: {
    marginTop: 15,
    padding: 18,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  descriptionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  description: {
    marginTop: 10,
    fontSize: 9,
    lineHeight: 16,
    color: Colors.textSecondary,
  },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 9,
    marginLeft: 4,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: Colors.textSecondary,
  },

  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },

  featureCard: {
    width: "31%",
    minHeight: 115,
    padding: 12,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  featureIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  featureTitle: {
    marginTop: 9,
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  featureSubtitle: {
    marginTop: 3,
    fontSize: 7,
    textAlign: "center",
    color: Colors.textSecondary,
  },

  menuCard: {
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },

  menuItem: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
  },

  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  menuContent: {
    flex: 1,
    marginLeft: 12,
  },

  menuTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  menuSubtitle: {
    marginTop: 4,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  divider: {
    height: 1,
    marginLeft: 56,
    backgroundColor: Colors.border,
  },

  localDataCard: {
    marginTop: 18,
    padding: 15,
    borderRadius: 18,
    backgroundColor: "#F0FDF4",
    flexDirection: "row",
    alignItems: "center",
  },

  localDataIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  localDataContent: {
    flex: 1,
    marginLeft: 12,
  },

  localDataTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  localDataText: {
    marginTop: 4,
    fontSize: 8,
    lineHeight: 13,
    color: Colors.textSecondary,
  },

  footer: {
    paddingTop: 30,
    alignItems: "center",
  },

  madeText: {
    fontSize: 8,
    color: Colors.textSecondary,
  },

  copyright: {
    marginTop: 6,
    fontSize: 8,
    color: Colors.textLight,
  },
});