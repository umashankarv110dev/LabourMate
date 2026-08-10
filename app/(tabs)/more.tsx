import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCompany } from "@/src/contexts/CompanyContext";
import { Colors } from "@/src/constants/colors";
import { useAuth } from "@/src/contexts/AuthContext";

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  background: string;
  onPress: () => void;
  danger?: boolean;
};

export default function MoreScreen() {
  const { user, logout } = useAuth();
  
  const { company } = useCompany();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout from LabourMate?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();

              router.replace("/(auth)/login");
            } catch (error) {
              console.error("LOGOUT ERROR:", error);

              Alert.alert(
                "Logout Failed",
                "Unable to logout. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F6F8FC"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>More</Text>

            <Text style={styles.subtitle}>
              Manage your LabourMate workspace
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="grid-outline"
              size={21}
              color={Colors.primary}
            />
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {company?.logo ? (
              <Image
                source={{
                  uri: company.logo,
                }}
                style={styles.companyLogo}
              />
            ) : (
              <Text style={styles.avatarText}>
                {getInitials(
                  company?.name ?? user?.name
                )}
              </Text>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text
              style={styles.profileName}
              numberOfLines={1}
            >
              {user?.name ?? "LabourMate User"}
            </Text>

            <Text
              style={styles.companyName}
              numberOfLines={1}
            >
              {company?.name ??
                "Company not configured"}
            </Text>

            <Text style={styles.profilePhone}>
              +91 {formatPhone(user?.phone ?? "")}
            </Text>

            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />

              <Text style={styles.activeText}>
                Active Account
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.8}
            onPress={() =>
              router.push("/settings/profile")
            }
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        <SectionTitle title="Workspace" />

        <View style={styles.menuCard}>
          <MenuItem
            icon="business-outline"
            title="Company Profile"
            subtitle="Business details and company settings"
            color="#2563EB"
            background="#EFF6FF"
            onPress={() =>
              router.push("/settings/company")
            }
          />

          <MenuDivider />

          <MenuItem
            icon="people-outline"
            title="Manage Workers"
            subtitle="View and manage your workforce"
            color="#16A34A"
            background="#F0FDF4"
            onPress={() => router.push("/workers")}
          />

          <MenuDivider />

          <MenuItem
            icon="construct-outline"
            title="Manage Sites"
            subtitle="Construction sites and assignments"
            color="#D97706"
            background="#FFFBEB"
            onPress={() => router.push("/site")}
          />

          <MenuItem
            icon="document-text-outline"
            title="Quotation & Billing"
            subtitle="Construction sites and assignments"
            color="#D97706"
            background="#FFFBEB"
            onPress={() => router.push("/quotation/quotationbilling")}
          />
        </View>

        <SectionTitle title="Insights & Data" />

        <View style={styles.menuCard}>
          <MenuItem
            icon="bar-chart-outline"
            title="Reports & Analytics"
            subtitle="Attendance, wages and cost reports"
            color="#7C3AED"
            background="#FAF5FF"
            onPress={() => router.push("/report")}
          />

          <MenuDivider />

          <MenuItem
            icon="cloud-upload-outline"
            title="Backup & Restore"
            subtitle="Protect and restore your LabourMate data"
            color="#0891B2"
            background="#ECFEFF"
            onPress={() =>
              router.push("/settings/backup")
            }
          />

          <MenuDivider />

          <MenuItem
            icon="download-outline"
            title="Export Data"
            subtitle="Export worker and payment records"
            color="#0F766E"
            background="#F0FDFA"
            onPress={() =>
              router.push("/settings/export")
            }
          />
        </View>

        <SectionTitle title="Application" />

        <View style={styles.menuCard}>
          <MenuItem
            icon="settings-outline"
            title="App Settings"
            subtitle="Preferences and application settings"
            color="#475569"
            background="#F1F5F9"
            onPress={() =>
              router.push("/settings/appsetting")
            }
          />

          <MenuDivider />

          <MenuItem
            icon="information-circle-outline"
            title="About LabourMate"
            subtitle="App information and support"
            color="#2563EB"
            background="#EFF6FF"
            onPress={() =>
              router.push("/settings/about")
            }
          />
        </View>

        <SectionTitle title="Account" />

        <View style={styles.menuCard}>
          <MenuItem
            icon="log-out-outline"
            title="Logout"
            subtitle="Sign out from your LabourMate account"
            color="#DC2626"
            background="#FEF2F2"
            danger
            onPress={handleLogout}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <Ionicons
              name="people"
              size={17}
              color={Colors.white}
            />
          </View>

          <Text style={styles.footerAppName}>
            LabourMate
          </Text>

          <Text style={styles.version}>
            Version {getAppVersion()}
          </Text>

          <Text style={styles.footerText}>
            Smart Labour Management
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  title,
  subtitle,
  color,
  background,
  onPress,
  danger,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View
        style={[
          styles.menuIcon,
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

      <View style={styles.menuContent}>
        <Text
          style={[
            styles.menuTitle,
            danger && styles.dangerText,
          ]}
        >
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

function MenuDivider() {
  return <View style={styles.menuDivider} />;
}

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <Text style={styles.sectionTitle}>
      {title.toUpperCase()}
    </Text>
  );
}

function getInitials(name?: string) {
  if (!name) {
    return "LM";
  }

  return name
    .split(" ")
    .slice(0, 2)
    .map((item) => item.charAt(0))
    .join("")
    .toUpperCase();
}

function formatPhone(phone: string) {
  if (phone.length !== 10) {
    return phone;
  }

  return `${phone.slice(0, 5)} ${phone.slice(5)}`;
}

function getAppVersion() {
  return (
    Constants.expoConfig?.version ??
    "1.0.0"
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 120,
  },

  header: {
    paddingTop: 12,
    paddingBottom: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 27,
    fontWeight: "900",
    color: Colors.textPrimary,
    letterSpacing: -0.7,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 10,
    color: Colors.textSecondary,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

profileCard: {
  padding: 17,
  borderRadius: 22,
  backgroundColor: Colors.primary,
  flexDirection: "row",
  alignItems: "center",
},

avatar: {
  width: 59,
  height: 59,
  borderRadius: 20,
  backgroundColor: "rgba(255,255,255,0.18)",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
},

companyLogo: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},

avatarText: {
  fontSize: 20,
  fontWeight: "900",
  color: Colors.white,
},

profileInfo: {
  flex: 1,
  marginLeft: 13,
  marginRight: 10,
},

profileName: {
  fontSize: 15,
  fontWeight: "800",
  color: Colors.white,
},

companyName: {
  marginTop: 3,
  fontSize: 9,
  fontWeight: "700",
  color: "#DBEAFE",
},

profilePhone: {
  marginTop: 4,
  fontSize: 9,
  color: "#BFDBFE",
},

activeBadge: {
  marginTop: 8,
  alignSelf: "flex-start",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  backgroundColor: "rgba(255,255,255,0.14)",
  flexDirection: "row",
  alignItems: "center",
},

activeDot: {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: "#86EFAC",
},

activeText: {
  marginLeft: 5,
  fontSize: 7,
  fontWeight: "700",
  color: Colors.white,
},

editButton: {
  width: 40,
  height: 40,
  borderRadius: 13,
  backgroundColor: Colors.white,
  alignItems: "center",
  justifyContent: "center",
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

  dangerText: {
    color: "#DC2626",
  },

  menuSubtitle: {
    marginTop: 4,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  menuDivider: {
    height: 1,
    marginLeft: 56,
    backgroundColor: Colors.border,
  },

  footer: {
    paddingTop: 35,
    paddingBottom: 15,
    alignItems: "center",
  },

  footerLogo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  footerAppName: {
    marginTop: 9,
    fontSize: 13,
    fontWeight: "900",
    color: Colors.textPrimary,
  },

  version: {
    marginTop: 4,
    fontSize: 8,
    color: Colors.textSecondary,
  },

  footerText: {
    marginTop: 3,
    fontSize: 8,
    color: Colors.textLight,
  },
});